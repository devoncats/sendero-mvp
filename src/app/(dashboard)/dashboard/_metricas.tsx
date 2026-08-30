import Link from "next/link";

import { Metricas as IconoMetricas } from "@/components/icons";
import { Inline, Stack } from "@/components/layout";
import { Surface, Text } from "@/components/ui";
import { METRICAS_EXPERTAS, negocioDelDueno, total } from "@/data/panel";
import type { Origen, SerieDiaria } from "@/data/panel";
import { cn } from "@/lib/cn";
import { precio } from "@/lib/formato";

import { AvisoMvp } from "../_aviso-mvp";
import { Barras, MapaHoras, Sparkline } from "../_graficas";

/**
 * La portada del modo experto.
 *
 * Es lo contrario del panel guiado a propósito: ahí hay una sola cosa que hacer
 * y las cifras van en una frase; aquí están las cuatro cifras, la serie diaria,
 * de dónde llegan y a qué hora. Quien enciende este modo pidió exactamente eso.
 *
 * Server Component entero. Las gráficas son SVG, las tablas son tablas, y no
 * hay un solo kilobyte de JavaScript en esta pantalla.
 */

/** Los dos periodos que los datos de muestra pueden sostener de verdad. */
const PERIODOS = [7, 30] as const;
type Periodo = (typeof PERIODOS)[number];

function esPeriodo(v: string | undefined): v is `${Periodo}` {
  return v === "7" || v === "30";
}

const TH = "border-b border-border-subtle px-inset-sm py-inset-sm text-left text-overline uppercase text-content-tertiary font-semibold";
const TD = "border-b border-border-subtle px-inset-sm py-inset-sm text-body-md";
const NUM = "text-right tabular-nums";

/**
 * Una cifra con su delta.
 *
 * El delta se dice en por ciento cuando el número anterior es grande y en
 * unidades cuando es pequeño: «+23 %» sobre 120 visitas informa, «+50 %» sobre
 * 8 contactos exagera.
 *
 * Bajar no es rojo. Que te llamen una vez menos no es un error, y pintarlo de
 * alarma le enseña al dueño a tenerle miedo a su propio panel.
 */
function Cifra({
  etiqueta,
  valor,
  anterior,
  serie,
  nota,
}: {
  etiqueta: string;
  valor: number;
  anterior: number;
  serie?: SerieDiaria;
  nota: string;
}) {
  const diferencia = valor - anterior;
  const enPorCiento = anterior >= 20;
  const texto =
    diferencia === 0
      ? "igual"
      : `${diferencia > 0 ? "+" : "−"}${
          enPorCiento
            ? `${Math.abs(Math.round((diferencia / anterior) * 100))} %`
            : Math.abs(diferencia)
        }`;

  return (
    <Surface relleno="md" as="li">
      <Text size="overline" tone="tertiary">
        {etiqueta}
      </Text>
      <Inline gap="sm" align="baseline" wrap={false} className="mt-inset-xs">
        <Text as="span" size="heading-lg" weight="semibold" className="tabular-nums">
          {valor}
        </Text>
        <Text
          as="span"
          size="caption"
          weight="semibold"
          tone={diferencia === 0 ? "tertiary" : diferencia > 0 ? "success" : "warning"}
          className="tabular-nums"
        >
          {texto}
        </Text>
      </Inline>
      {serie ? <Sparkline serie={serie} /> : null}
      <Text size="caption" tone="tertiary" className="mt-inset-xs">
        {nota}
      </Text>
    </Surface>
  );
}

/**
 * De dónde llegaron las visitas.
 *
 * Esta no es SVG y las otras sí, a propósito. Es una lista con una barra al
 * lado, y su texto es texto: dentro de un `viewBox` la letra escala con el
 * ancho de la tarjeta —enorme en un monitor, ilegible en un teléfono— y deja de
 * obedecer a la escala tipográfica. Las barras sí son geometría, y esas se
 * pintan con el ancho en porcentaje, que es el dato.
 */
function Origenes({ origenes, visitas }: { origenes: readonly Origen[]; visitas: number }) {
  return (
    <ul className="grid gap-inset-md">
      {origenes.map((o) => {
        const pct = Math.round((o.visitas / visitas) * 100);
        return (
          <li key={o.etiqueta}>
            <Inline justify="between" align="baseline" gap="sm" wrap={false}>
              <Text as="span" size="body-md" truncate>
                {o.etiqueta}
              </Text>
              <Text
                as="span"
                size="body-md"
                weight="semibold"
                tone="secondary"
                className="shrink-0 tabular-nums"
              >
                {o.visitas} · {pct} %
              </Text>
            </Inline>
            <div className="mt-inset-xs h-1.5 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Tarjeta({
  titulo,
  apunte,
  children,
}: {
  titulo: string;
  apunte?: string;
  children: React.ReactNode;
}) {
  return (
    <Surface relleno="md" as="section">
      <Inline justify="between" align="baseline" gap="sm" className="mb-inset-md">
        <Text as="h2" size="body-md" weight="semibold">
          {titulo}
        </Text>
        {apunte ? (
          <Text as="span" size="caption" tone="tertiary">
            {apunte}
          </Text>
        ) : null}
      </Inline>
      {children}
    </Surface>
  );
}

export async function PantallaMetricas({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const { dias } = await searchParams;
  const periodo: Periodo = esPeriodo(dias) ? (Number(dias) as Periodo) : 30;

  const m = METRICAS_EXPERTAS;
  const negocio = negocioDelDueno();

  // Un corte de la serie, no otra serie. Los siete días son los siete últimos,
  // y su comparación son los siete anteriores — que están en el mismo arreglo.
  const corte = (serie: SerieDiaria) => serie.slice(serie.length - periodo);
  const previo = (serie: SerieDiaria, anteriorMes: number) =>
    periodo === 30
      ? anteriorMes
      : total(serie.slice(serie.length - periodo * 2, serie.length - periodo));

  const visitas = corte(m.visitas);
  const contactos = corte(m.contactos);
  const llamadas = corte(m.llamadas);

  const totalVisitas = total(visitas);
  const totalContactos = total(contactos);
  const visitasAntes = previo(m.visitas, m.anterior.visitas);
  const contactosAntes = previo(m.contactos, m.anterior.contactos);

  const tasa = totalVisitas === 0 ? 0 : Math.round((totalContactos / totalVisitas) * 100);
  const tasaAntes = visitasAntes === 0 ? 0 : Math.round((contactosAntes / visitasAntes) * 100);

  const precioDe = (nombre: string) => negocio.productos.find((p) => p.nombre === nombre);

  return (
    <main className="p-gutter">
      <Stack gap="default">
        <Inline justify="between" align="end" gap="md">
          <Stack gap="tight">
            <Text as="h1" size="heading-md" weight="semibold">
              Métricas
            </Text>
            <Text size="caption" tone="tertiary">
              {periodo === 30 ? m.periodo : "Los últimos 7 días"} · {negocio.nombre}
            </Text>
          </Stack>

          {/*
            Enlaces, no botones con estado. El servidor ya sabe qué periodo
            pediste y devuelve la pantalla hecha: cero JavaScript, y el periodo
            queda en la URL, que se puede guardar y compartir.

            Solo dos opciones porque solo hay treinta días de datos. Un «90
            días» que enseñara los mismos treinta sería una mentira pequeña, y
            un panel se sostiene sobre no decir ninguna.
          */}
          <Inline gap="none" wrap={false} className="rounded-control border border-border-subtle bg-surface-sunken p-inset-xs">
            {PERIODOS.map((p) => {
              const activo = p === periodo;
              return (
                <Link
                  key={p}
                  href={p === 30 ? "/dashboard" : `/dashboard?dias=${p}`}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    "flex min-h-control-sm items-center rounded-control px-inset-md text-body-md",
                    activo
                      ? "bg-surface font-semibold text-content-primary shadow-raised"
                      : "text-content-secondary",
                  )}
                >
                  {p} días
                </Link>
              );
            })}
          </Inline>
        </Inline>

        <AvisoMvp>
          Las cifras de esta pantalla son de muestra: todavía no hay medición real detrás. Están
          cuadradas entre sí para que se vea cómo se leerán cuando la haya.
        </AvisoMvp>

        {/* Rejilla, no Stack: Stack es flujo vertical y aquí las cuatro cifras
            van en rejilla. Pasarle una clase `grid` a un `flex` sería pelear
            dos utilidades por el mismo elemento. */}
        <ul className="grid grid-cols-2 gap-inset-md lg:grid-cols-4">
          <Cifra
            etiqueta="Vieron tu ficha"
            valor={totalVisitas}
            anterior={visitasAntes}
            serie={visitas}
            nota={`${visitasAntes} en los ${periodo} días anteriores`}
          />
          <Cifra
            etiqueta="Te escribieron"
            valor={totalContactos}
            anterior={contactosAntes}
            serie={contactos}
            nota={`${contactosAntes} en los ${periodo} días anteriores`}
          />
          <Cifra
            etiqueta="Te llamaron"
            valor={total(llamadas)}
            anterior={previo(m.llamadas, m.anterior.llamadas)}
            serie={llamadas}
            nota="Casi nadie llama. Escriben."
          />
          <Cifra
            etiqueta="De cada 100 que te ven"
            valor={tasa}
            anterior={tasaAntes}
            nota="te escriben por WhatsApp"
          />
        </ul>

        <div className="grid gap-inset-md lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tarjeta titulo="Visitas por día" apunte={periodo === 30 ? "agosto" : undefined}>
              <Barras
                serie={visitas}
                etiqueta={`Visitas por día en los últimos ${periodo} días: entre ${Math.min(
                  ...visitas,
                )} y ${Math.max(...visitas)}.`}
              />
              {/* La frase del sábado es una afirmación sobre el mes entero —la
                  sostiene el mapa de horas—, y en siete días no se puede
                  comprobar. Ahí se dice solo lo que se ve. */}
              <Text size="caption" tone="secondary" className="mt-inset-sm">
                {periodo === 30
                  ? "El día más alto fue un sábado. Los sábados son siempre tu mejor día."
                  : `El mejor día de la semana tuvo ${Math.max(...visitas)} visitas.`}
              </Text>
            </Tarjeta>
          </div>

          <Tarjeta titulo="Cómo te encontraron" apunte="del mes">
            <Origenes origenes={m.origenes} visitas={total(m.visitas)} />
          </Tarjeta>

          <div className="lg:col-span-2">
            <Tarjeta titulo="Tus productos" apunte="del mes">
              {/*
                Una tabla de verdad, no un dibujo. Se recorre por filas y
                columnas con lector de pantalla y su texto se puede copiar.

                En un teléfono no se desplaza a lo ancho: la columna de precio
                se apaga por debajo de `md` y quedan tres, que caben en 360 px.
                Es una columna menos, no un segundo marcado.
              */}
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th scope="col" className={TH}>
                      Producto
                    </th>
                    <th scope="col" className={cn(TH, NUM, "hidden md:table-cell")}>
                      Precio
                    </th>
                    <th scope="col" className={cn(TH, NUM)}>
                      Vistas
                    </th>
                    <th scope="col" className={cn(TH, NUM)}>
                      Contactos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {m.productos.map((p) => {
                    const datos = precioDe(p.nombre);
                    return (
                      <tr key={p.nombre}>
                        <th scope="row" className={cn(TD, "text-left font-medium")}>
                          {p.nombre}
                        </th>
                        <td className={cn(TD, NUM, "hidden md:table-cell whitespace-nowrap")}>
                          {datos?.precio === undefined ? "—" : precio(datos.precio, datos.desde)}
                        </td>
                        <td className={cn(TD, NUM)}>{p.vistas}</td>
                        <td className={cn(TD, NUM)}>{p.contactos}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Tarjeta>
          </div>

          <Tarjeta titulo="Cuándo te ven" apunte="del mes">
            <MapaHoras franjas={m.franjas} />
            <Inline gap="icon" align="start" wrap={false} className="mt-inset-sm">
              <IconoMetricas className="size-icon-sm shrink-0 text-content-tertiary" aria-hidden />
              <Text size="caption" tone="secondary">
                Los sábados a mediodía. Si un día vas a estar pendiente del teléfono, es ese.
              </Text>
            </Inline>
          </Tarjeta>
        </div>
      </Stack>
    </main>
  );
}
