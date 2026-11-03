import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AlertCircle, ChevronRight, Compass, ExternalLink, MapPin } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import {
  BotonGuardarRuta,
  BusinessCard,
  CategoryChip,
  EmptyState,
  FilterGroup,
  FilterSheet,
} from "@/components/patterns";
import { Surface, Text } from "@/components/ui";
import type { ZonaId } from "@/data";
import { CATEGORIAS, ZONAS, negociosDeZona } from "@/data";
import { enlaceRuta, hora, nombreDia } from "@/lib/formato";
import type { Itinerario, RazonSuelta } from "@/lib/itinerario";
import { cuantasParadas, enHHMM, planear, todasLasParadas } from "@/lib/itinerario";
import { ahoraEnPanama } from "@/lib/reloj";

import { resumir } from "../../../_resumen";
import { Esquema } from "./_esquema";
import type { ParamsRuta } from "./_pedido";
import {
  HORAS_INICIO,
  alternarInteres,
  enlaceCon,
  leerPedido,
  normalizar,
} from "./_pedido";

/**
 * El planificador de una zona.
 *
 * El directorio dice qué hay. Esto dice qué cabe en el tiempo que tienes, en
 * qué orden, y qué va a estar abierto cuando pases — que es la pregunta que
 * queda cuando ya encontraste los negocios.
 *
 * Todo el estado vive en la URL, como en `/buscar`: los filtros son enlaces, los
 * dos selectores son un `<form method="get">` nativo, y no hay un kilobyte de
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
  searchParams: Promise<ParamsRuta>;
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
  searchParams: Promise<ParamsRuta>;
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
  const it: Itinerario = planear(pedido, negocios, ahora);

  const paradas = todasLasParadas(it);
  const cuantas = cuantasParadas(it);
  const hospedajes = negocios.filter((n) => n.categoria === "hospedaje");
  const activos =
    pedido.intereses.length + (pedido.dias > 1 ? 1 : 0) + (pedido.ritmo !== "normal" ? 1 : 0);

  const soloHospedaje =
    pedido.intereses.length === 1 && pedido.intereses[0] === "hospedaje";

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
          : "Ajusta y vuelve a ver"
      }
      abiertoPorDefecto={activos === 0}
      riel
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

      <FilterGroup etiqueta="Qué te interesa">
        {CATEGORIAS.map((c) => (
          <CategoryChip
            key={c.id}
            href={enlaceCon(zonaId, p, { intereses: alternarInteres(p.intereses, c.id) })}
            activo={pedido.intereses.includes(c.id)}
          >
            {c.nombre.es}
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
        Los dos selectores comparten un formulario GET nativo. Los filtros de
        chip viajan como campos ocultos, si no se perderían al enviar — el mismo
        truco que usa el buscador.
      */}
      <form action={`/zona/${zonaId}/ruta`} method="get">
        {p.dias ? <input type="hidden" name="dias" value={p.dias} /> : null}
        {p.intereses ? <input type="hidden" name="intereses" value={p.intereses} /> : null}
        {p.ritmo ? <input type="hidden" name="ritmo" value={p.ritmo} /> : null}
        {p.dia ? <input type="hidden" name="dia" value={p.dia} /> : null}

        <Stack gap="default">
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
            className="inline-flex h-control-md items-center justify-center rounded-control border border-border-default bg-action-secondary px-inset-lg text-body-md font-semibold text-action-secondary-content"
          >
            Aplicar
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
          <Link href="/" className="text-body-sm text-content-tertiary">
            Descubrir
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
        ) : soloHospedaje ? (
          <div className={CENTRO}>
            <EmptyState
              icono={MapPin}
              titulo="Un hospedaje no es una parada"
              descripcion={`Es donde duermes, y de ahí sale la ruta. Elige uno abajo en «Dónde duermes» y marca qué más te interesa: hay ${hospedajes.length} en ${z.nombre}.`}
              accion={
                <Link
                  href={enlaceCon(zonaId, {}, {})}
                  className="inline-flex h-control-md items-center rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content"
                >
                  Ver todo lo que hay en {z.nombre}
                </Link>
              }
            />
          </div>
        ) : it.sinPunto > 0 && paradas.length === 0 ? (
          <div className={CENTRO}>
            <EmptyState
              icono={MapPin}
              titulo={`Todavía nadie en ${z.nombre} ha puesto su punto en el mapa`}
              descripcion="Sin puntos no se puede ordenar un recorrido. Los negocios siguen aquí abajo, con su horario y su teléfono."
              accion={
                <Link
                  href={`/zona/${zonaId}`}
                  className="inline-flex h-control-md items-center rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content"
                >
                  Ver los {negocios.length} negocios de {z.nombre}
                </Link>
              }
            />
          </div>
        ) : (
          <div className={CENTRO}>
            <EmptyState
              icono={Compass}
              titulo="Con esos filtros no sale una ruta"
              descripcion={`Prueba con más días, con otro ritmo, o quitando algún interés. En ${z.nombre} hay ${negocios.length} negocios en total.`}
              accion={
                <Link
                  href={`/zona/${zonaId}/ruta`}
                  className="inline-flex h-control-md items-center rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content"
                >
                  Empezar de nuevo
                </Link>
              }
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
