import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AlertCircle, ChevronRight, Compass, ExternalLink, MapPin, Ruta } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import {
  BotonGuardarRuta,
  BusinessCard,
  CategoryChip,
  EmptyState,
  FilterGroup,
  FilterSheet,
} from "@/components/patterns";
import { ButtonLink, Surface, Text } from "@/components/ui";
import type { ZonaId } from "@/data";
import { CATEGORIAS, ZONAS, negociosDeZona } from "@/data";
import { enlaceRuta, hora, nombreDia, textoDia } from "@/lib/formato";
import type { Itinerario, RazonSuelta } from "@/lib/itinerario";
import { cuantasParadas, enHHMM, planear, todasLasParadas } from "@/lib/itinerario";
import { ahoraEnPanama } from "@/lib/reloj";

import { resumir } from "../../../_resumen";
import { Esquema } from "./_esquema";
import type { ParamsCrudos } from "./_pedido";
import { HORAS_INICIO, enlaceCon, leerPedido, normalizar } from "./_pedido";

/**
 * El planificador de una zona.
 *
 * El directorio dice qué hay. Esto dice qué cabe en el tiempo que tienes, en
 * qué orden, y qué va a estar abierto cuando pases — que es la pregunta que
 * queda cuando ya encontraste los negocios.
 *
 * El visitante **elige** a dónde quiere ir —una casilla por negocio— y el
 * planificador solo ordena lo elegido. Antes metía todos los de la zona, y eso
 * era decidir por él.
 *
 * Todo el estado vive en la URL, como en `/buscar`: los filtros son enlaces, las
 * casillas y los dos selectores son `<form method="get">` nativos, y no hay un kilobyte de
 * JavaScript en la pantalla salvo el botón de guardar. A cambio, la ruta se
 * renderiza por petición — es la segunda del portal que lo hace, y está anotado.
 */

function buscarZona(id: string) {
  return ZONAS.find((z) => z.id === id);
}

const CUANTOS_DIAS = ["", "Un día", "Dos días", "Tres días"] as const;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ParamsCrudos>;
}): Promise<Metadata> {
  const { id } = await params;
  const z = buscarZona(id);
  if (!z) return {};
  const p = await searchParams;
  const dias = p.dias === "2" ? 2 : p.dias === "3" ? 3 : 1;
  return {
    title: `${CUANTOS_DIAS[dias]} en ${z.nombre}`,
    description: `Una ruta por ${z.nombre}, ${z.provincia}: qué visitar, en qué orden y a qué hora está abierto.`,
  };
}

function km(n: number): string {
  return n < 10 ? n.toFixed(1).replace(".", ",") : String(Math.round(n));
}

const TEXTO_RAZON: Record<RazonSuelta, string> = {
  "sin-punto":
    "Todavía no han puesto su punto en el mapa. Están aquí igual, con su horario y su teléfono.",
  "cierra-ese-dia": "Ese día no abren.",
  "cerrado-a-esa-hora": "Cierran justo cuando te tocaría pasar.",
  "no-cupo": "No cupieron en el tiempo que pusiste.",
};

const ORDEN_RAZONES: readonly RazonSuelta[] = [
  "cerrado-a-esa-hora",
  "cierra-ese-dia",
  "no-cupo",
  "sin-punto",
];

const CLASES_SELECT =
  "h-control-md w-full rounded-control border border-border-default bg-surface px-inset-md text-body-md text-content-primary";

/** La columna central. Se repite en cada hijo de la rejilla de escritorio. */
const CENTRO = "lg:col-start-2 lg:col-span-2";

export default async function RutaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ParamsCrudos>;
}) {
  const { id } = await params;
  const z = buscarZona(id);
  if (!z) notFound();

  const zonaId = z.id as ZonaId;
  const crudos = await searchParams;
  const ahora = ahoraEnPanama();
  const negocios = negociosDeZona(zonaId);

  const pedido = leerPedido(zonaId, crudos, negocios, ahora);
  // Los params limpios, no los crudos: así un enlace con basura se corrige solo
  // en cuanto se toca cualquier filtro, en vez de arrastrar la basura.
  const p = normalizar(pedido);

  // El formulario de casillas manda `paradas` repetida (`?paradas=a&paradas=b`),
  // y los enlaces de antes traen `intereses`. No se redirige a la forma
  // canónica: con `loading.tsx` la redirección sale como un `meta refresh` de
  // un segundo, un viaje más en 3G. Las dos formas dan el mismo plan, y lo que
  // se guarda y se comparte desde esta pantalla ya sale de `p`, canónico.

  const it: Itinerario = planear(pedido, negocios, ahora);
  const elegidos = new Set(pedido.paradas);
  const hayEleccion = pedido.paradas.length > 0;

  const paradas = todasLasParadas(it);
  const cuantas = cuantasParadas(it);
  const hospedajes = negocios.filter((n) => n.categoria === "hospedaje");
  const activos = (pedido.dias > 1 ? 1 : 0) + (pedido.ritmo !== "normal" ? 1 : 0);

  // Lo que se puede elegir, agrupado por categoría en el orden de siempre. El
  // hospedaje no: es la base, y se elige en «Dónde duermes».
  const grupos = CATEGORIAS.filter((c) => c.id !== "hospedaje")
    .map((c) => ({ categoria: c, lista: negocios.filter((n) => n.categoria === c.id) }))
    .filter((g) => g.lista.length > 0);
  const seleccionables = grupos.flatMap((g) => g.lista);

  const puntosDeRuta = [
    ...(it.base?.coordenadas ? [it.base.coordenadas] : []),
    ...paradas.map((x) => x.negocio.coordenadas!),
  ];

  const filtros = (
    <FilterSheet
      activos={activos}
      resumen={
        cuantas > 0
          ? `${cuantas} ${cuantas === 1 ? "parada" : "paradas"} · ${km(it.kmTotal)} km`
          : hayEleccion
            ? "Ajusta y vuelve a ver"
            : "Antes, elige a dónde ir"
      }
      abiertoPorDefecto={!hayEleccion}
      riel
      pegado={false}
      className={`-mx-gutter sm:mx-0 lg:col-start-1 lg:row-start-1 lg:row-span-6`}
    >
      <FilterGroup etiqueta="Cuánto tiempo tienes">
        {([1, 2, 3] as const).map((d) => (
          <CategoryChip
            key={d}
            href={enlaceCon(zonaId, p, { dias: d === 1 ? undefined : String(d) })}
            activo={pedido.dias === d}
          >
            {CUANTOS_DIAS[d]}
          </CategoryChip>
        ))}
      </FilterGroup>

      <FilterGroup etiqueta="A qué ritmo">
        {(
          [
            ["suave", "Con calma"],
            ["normal", "Normal"],
            ["intenso", "Aprovechar el día"],
          ] as const
        ).map(([valor, texto]) => (
          <CategoryChip
            key={valor}
            href={enlaceCon(zonaId, p, { ritmo: valor === "normal" ? undefined : valor })}
            activo={pedido.ritmo === valor}
          >
            {texto}
          </CategoryChip>
        ))}
      </FilterGroup>

      {/*
        Las casillas y los dos selectores comparten un formulario GET nativo.
        Los filtros de chip viajan como campos ocultos, si no se perderían al
        enviar — el mismo truco que usa el buscador. Las casillas van aquí, al
        lado de los filtros, porque elegir a dónde ir es el primer filtro: en el
        teléfono el panel arranca abierto mientras no haya nada marcado, y en
        escritorio son el riel.
      */}
      <form action={`/zona/${zonaId}/ruta`} method="get">
        {p.dias ? <input type="hidden" name="dias" value={p.dias} /> : null}
        {p.ritmo ? <input type="hidden" name="ritmo" value={p.ritmo} /> : null}
        {p.dia ? <input type="hidden" name="dia" value={p.dia} /> : null}

        <Stack gap="default">
          {seleccionables.length > 0 ? (
            <fieldset className="flex flex-col gap-inset-md">
              <legend className="mb-inset-sm text-label font-medium text-content-primary">
                A dónde quieres ir
              </legend>
              <Inline gap="sm" justify="between" align="baseline">
                <Text size="caption" tone="tertiary">
                  Horario del {nombreDia(pedido.diaInicio).toLowerCase()}, el día en que empieza.
                </Text>
                <Link
                  href={enlaceCon(zonaId, p, {
                    paradas:
                      elegidos.size === seleccionables.length
                        ? undefined
                        : seleccionables.map((n) => n.slug).join(","),
                  })}
                  className="inline-flex min-h-touch-min items-center text-body-sm font-medium text-brand underline"
                >
                  {elegidos.size === seleccionables.length
                    ? "Quitar todos"
                    : `Marcar los ${seleccionables.length}`}
                </Link>
              </Inline>

              {grupos.map((g) => (
                <div key={g.categoria.id} role="group" aria-labelledby={`grupo-${g.categoria.id}`} className="flex flex-col gap-inset-sm">
                  <span
                    id={`grupo-${g.categoria.id}`}
                    className="text-overline uppercase text-content-tertiary"
                  >
                    {g.categoria.nombre.es}
                  </span>
                  {g.lista.map((n) => (
                    <label
                      key={n.slug}
                      className="flex min-h-touch-min cursor-pointer items-start gap-inset-sm rounded-control border border-border-default bg-surface p-inset-sm has-checked:border-brand has-checked:bg-brand-surface"
                    >
                      <input
                        type="checkbox"
                        name="paradas"
                        value={n.slug}
                        defaultChecked={elegidos.has(n.slug)}
                        className="mt-inset-xs size-icon-md shrink-0 accent-brand"
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-body-md font-medium text-content-primary">
                          {n.nombre}
                        </span>
                        <span className="text-body-sm text-content-secondary">
                          {n.persona.nombre} · {textoDia(n.horario[pedido.diaInicio]).toLowerCase()}
                        </span>
                        {!n.coordenadas ? (
                          <span className="text-caption text-content-tertiary">
                            Sin punto en el mapa: sale en la lista, pero no en el orden.
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </fieldset>
          ) : null}

          <Stack gap="tight">
            <Text as="label" htmlFor="desde" size="label" weight="medium">
              Empiezas a las
            </Text>
            <select id="desde" name="desde" defaultValue={pedido.desde} className={CLASES_SELECT}>
              {HORAS_INICIO.map((h) => (
                <option key={h} value={h}>
                  {hora(h)}
                </option>
              ))}
            </select>
          </Stack>

          {hospedajes.length > 0 ? (
            <Stack gap="tight">
              <Text as="label" htmlFor="base" size="label" weight="medium">
                Dónde duermes
              </Text>
              <select id="base" name="base" defaultValue={pedido.base ?? ""} className={CLASES_SELECT}>
                <option value="">No lo sé todavía</option>
                {hospedajes.map((h) => (
                  <option key={h.slug} value={h.slug}>
                    {h.nombre}
                  </option>
                ))}
              </select>
              <Text size="caption" tone="tertiary">
                Si lo eliges, la ruta sale de ahí por la mañana y vuelve por la tarde.
              </Text>
            </Stack>
          ) : null}

          <button
            type="submit"
            className={
              hayEleccion
                ? "inline-flex h-control-md items-center justify-center rounded-control border border-border-default bg-action-secondary px-inset-lg text-body-md font-semibold text-action-secondary-content hover:bg-action-secondary-hover active:bg-action-secondary-active"
                : "inline-flex h-control-md items-center justify-center rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content hover:bg-action-primary-hover active:bg-action-primary-active"
            }
          >
            {hayEleccion ? "Volver a armar la ruta" : "Armar mi ruta"}
          </button>
        </Stack>
      </form>
    </FilterSheet>
  );

  const sueltosOrdenados = ORDEN_RAZONES.map((razon) => ({
    razon,
    lista: it.sueltos.filter((s) => s.razon === razon),
  })).filter((g) => g.lista.length > 0);

  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      <Stack gap="loose" className="py-stack lg:grid lg:grid-cols-4 lg:items-start">
        <nav aria-label="Migas de pan" className={`hidden items-center gap-inset-xs lg:flex ${CENTRO}`}>
          <Link href="/negocios" className="text-body-sm text-content-tertiary">
            Negocios
          </Link>
          <ChevronRight className="size-icon-sm text-content-tertiary" aria-hidden />
          <Link href={`/zona/${zonaId}`} className="text-body-sm text-content-tertiary">
            {z.nombre}
          </Link>
          <ChevronRight className="size-icon-sm text-content-tertiary" aria-hidden />
          <Text as="span" size="body-sm">
            Una ruta
          </Text>
        </nav>

        <Stack gap="tight" className={CENTRO}>
          {/* El h1 dice lo que se está viendo, no la función de la pantalla. */}
          <Text as="h1" size="heading-lg" serif weight="semibold">
            {CUANTOS_DIAS[pedido.dias]} en {z.nombre}
          </Text>
          {cuantas > 0 ? (
            <Text size="body-md" tone="secondary">
              {cuantas} {cuantas === 1 ? "parada" : "paradas"} · {km(it.kmTotal)} km aproximados, en
              línea recta
              {it.base ? ` · saliendo de ${it.base.nombre}` : ""}
              {/* Pedir tres días y que todo quepa en uno no es un error, pero
                  callarlo sí: la pantalla enseñaría un solo día bajo un título
                  que promete tres. */}
              {it.dias.length < pedido.dias
                ? ` · te sobra tiempo, todo cabe en ${it.dias.length === 1 ? "un día" : `${it.dias.length} días`}`
                : ""}
            </Text>
          ) : !hayEleccion ? (
            <Text size="body-md" tone="secondary" className="lg:hidden">
              Marca los sitios a los que quieres ir y te los ponemos en orden, con la hora a la que
              llegas a cada uno.
            </Text>
          ) : null}
        </Stack>

        {filtros}

        {paradas.length >= 3 ? (
          <Esquema
            paradas={paradas}
            className="hidden lg:col-start-4 lg:row-start-3 lg:block lg:sticky lg:top-control-md"
          />
        ) : null}

        {/* --------------------------------------------------- el itinerario */}
        {it.dias.length > 0 ? (
          <Stack gap="loose" className={CENTRO}>
            {it.dias.map((d) => (
              <Stack key={d.indice} gap="default" as="section">
                <Inline gap="md" justify="between" align="baseline">
                  <Text as="h2" size="heading-sm" weight="semibold">
                    {/* Se numera por los días que de verdad hay, no por los que
                        se pidieron: un «Día 1» solitario no numera nada. */}
                    {it.dias.length > 1 ? `Día ${d.indice + 1} · ` : ""}
                    {nombreDia(d.dia)}
                  </Text>
                  <Text size="body-sm" tone="tertiary">
                    {hora(enHHMM(d.arranca))} – {hora(enHHMM(d.termina))}
                  </Text>
                </Inline>

                <ol className="flex flex-col gap-stack">
                  {d.paradas.map((parada, i) => (
                    <li key={parada.negocio.slug}>
                      {/* El tramo entre paradas: una línea y un texto. Sin icono
                          — un conector es geometría, no vocabulario. */}
                      {i > 0 ? (
                        <div className="ml-inset-sm border-l border-border-subtle py-inset-sm pl-inset-lg sm:ml-avatar-xl">
                          <Text size="caption" tone="tertiary">
                            {parada.minutosDeViaje} min · {km(parada.desdeAnterior)} km
                          </Text>
                        </div>
                      ) : null}

                      {/*
                        En el teléfono la hora va encima de la tarjeta: una
                        columna de 80 px para «10:37 a.m.» se come un cuarto de
                        una pantalla de 375. Desde `sm` hay sitio y se va al
                        lado. Es el mismo marcado girando, no una segunda vista.
                      */}
                      <div className="flex flex-col gap-inset-xs sm:flex-row sm:items-start sm:gap-inset-md">
                        <Text
                          as="span"
                          size="body-sm"
                          tone="tertiary"
                          className="shrink-0 tabular-nums sm:w-avatar-xl sm:pt-inset-xs"
                        >
                          {hora(enHHMM(parada.llegada))}
                        </Text>
                        <Stack gap="tight" className="min-w-0 flex-1">
                          <BusinessCard
                            negocio={resumir(parada.negocio, { conZona: false })}
                            orientacion="auto"
                          />
                          {parada.apertura.estado === "sinConfirmar" ? (
                            <Inline gap="icon" align="start" wrap={false}>
                              <AlertCircle
                                className="size-icon-sm shrink-0 text-warning-content"
                                aria-hidden
                              />
                              <Text size="caption" tone="warning">
                                El horario de ese día está sin confirmar. Llámale antes de ir.
                              </Text>
                            </Inline>
                          ) : null}
                        </Stack>
                      </div>
                    </li>
                  ))}
                </ol>
              </Stack>
            ))}
          </Stack>
        ) : !hayEleccion ? (
          /*
            El vacío de quien acaba de llegar. No es un error ni un plan
            fallido: es el sitio donde va a aparecer su ruta. Dice dónde se
            elige sin decir «a la izquierda» ni «arriba», porque la lista está
            en un sitio distinto según el ancho. Y ofrece la salida de antes
            —todos los de la zona— como secundaria: el botón principal es el de
            la lista, y no debe haber dos.
          */
          <div className={CENTRO}>
            <EmptyState
              icono={Ruta}
              titulo="Aquí va a salir tu ruta"
              descripcion={`Todavía no has marcado ningún sitio. Elige en «A dónde quieres ir» los que quieras visitar —uno solo también vale— y te decimos en qué orden ir y a qué hora llegas a cada uno.`}
              accion={
                seleccionables.length >= 2 ? (
                  <ButtonLink
                    variante="secondary"
                    href={enlaceCon(zonaId, p, {
                      paradas: seleccionables.map((n) => n.slug).join(","),
                    })}
                  >
                    Ver la ruta con los {seleccionables.length}
                  </ButtonLink>
                ) : undefined
              }
            />
          </div>
        ) : it.sinPunto > 0 && paradas.length === 0 ? (
          <div className={CENTRO}>
            <EmptyState
              icono={MapPin}
              titulo={
                pedido.paradas.length === 1
                  ? "Ese sitio todavía no ha puesto su punto en el mapa"
                  : "Los que elegiste todavía no han puesto su punto en el mapa"
              }
              descripcion="Sin puntos no se puede ordenar un recorrido. Marca algún otro en la lista de sitios para armar la ruta."
            />
          </div>
        ) : (
          <div className={CENTRO}>
            <EmptyState
              icono={Compass}
              titulo="Con lo que elegiste no sale una ruta"
              descripcion="Ninguno abre a la hora en que te tocaría pasar. Prueba con más días, con otro ritmo o empezando a otra hora, o marca otros sitios en la lista."
            />
          </div>
        )}

        {/* El esquema, en el teléfono, va después del itinerario */}
        {paradas.length >= 3 ? <Esquema paradas={paradas} className={`lg:hidden ${CENTRO}`} /> : null}

        {/* ------------------------------------------- lo que quedó fuera */}
        {sueltosOrdenados.length > 0 ? (
          <Surface nivel="sunken" relleno="lg" as="section" className={CENTRO}>
            <Stack gap="default">
              <Text as="h2" size="heading-sm" weight="semibold">
                No entraron en el orden
              </Text>
              {sueltosOrdenados.map((g) => (
                <Stack key={g.razon} gap="tight">
                  <Text size="body-sm" tone="secondary">
                    {TEXTO_RAZON[g.razon]}
                    {g.razon === "no-cupo" && pedido.dias < 3 ? (
                      <>
                        {" "}
                        <Link
                          href={enlaceCon(zonaId, p, { dias: String(pedido.dias + 1) })}
                          className="font-medium text-brand underline"
                        >
                          Prueba con {CUANTOS_DIAS[pedido.dias + 1].toLowerCase()}
                        </Link>
                        .
                      </>
                    ) : null}
                  </Text>
                  <Stack gap="tight" as="ul">
                    {g.lista.map((s) => (
                      <li key={s.negocio.slug}>
                        <BusinessCard
                          negocio={resumir(s.negocio, { conZona: false })}
                          orientacion="horizontal"
                        />
                      </li>
                    ))}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Surface>
        ) : null}

        {/* ------------------------------------------------------ acciones */}
        {cuantas > 0 ? (
          <Stack gap="default" className={CENTRO}>
            {/*
              Se guarda la URL con el día YA congelado. Sin `dia`, la dirección
              significa «hoy, sea lo que sea hoy», y un plan que cambia de
              contenido mientras subes la montaña no es un plan guardado.
            */}
            <BotonGuardarRuta
              ruta={{
                href: enlaceCon(zonaId, p, { dia: pedido.diaInicio }),
                zona: z.nombre,
                titulo: `${CUANTOS_DIAS[pedido.dias]} en ${z.nombre}`,
                paradas: cuantas,
                guardadaEl: ahora.toISOString(),
              }}
              urls={[
                enlaceCon(zonaId, p, { dia: pedido.diaInicio }),
                `/zona/${zonaId}`,
                ...paradas.map((x) => `/negocio/${x.negocio.slug}`),
              ]}
            />
            <a
              href={enlaceRuta(puntosDeRuta)}
              rel="noopener noreferrer"
              className="inline-flex min-h-control-md w-fit items-center gap-icon-gap text-body-md font-medium text-brand"
            >
              Abrir el recorrido en la app de mapas
              <ExternalLink className="size-icon-sm" aria-hidden />
            </a>
            <Text size="caption" tone="tertiary">
              Esta ruta vive en la dirección de arriba. Cópiala o guárdala en favoritos y te lleva
              exactamente a lo mismo.
            </Text>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
}
