import type { FranjaHoraria, SerieDiaria } from "@/data/panel";

/**
 * Las gráficas del modo experto, en SVG servido desde el servidor.
 *
 * Cero librerías y cero JavaScript de cliente: son elementos que Next escribe
 * en el HTML como cualquier otro. Una gráfica de treinta barras cuesta menos de
 * un kilobyte comprimido; Recharts cuesta cuarenta veces eso antes de dibujar
 * la primera.
 *
 * Cada una lleva `role="img"` y un `aria-label` que dice el dato en palabras.
 * Un rectángulo no se lee solo, y el dueño que amplía la letra del teléfono
 * también existe. Por lo mismo, las tablas de estas pantallas siguen siendo
 * tablas de HTML y no dibujos: un lector de pantalla las recorre por filas y
 * columnas, y su texto se puede copiar.
 *
 * La geometría se calcula de los datos. No hay ni un número mágico de estilo:
 * los colores salen de los tokens por `fill-*` y `stroke-*`.
 */

const DIAS_CORTOS = ["L", "M", "M", "J", "V", "S", "D"] as const;

/** Barras de una serie diaria. El día más alto va en ámbar y con su cifra. */
export function Barras({
  serie,
  etiqueta,
  ejes,
}: {
  serie: SerieDiaria;
  /** Lo que la gráfica dice en palabras, para quien no la ve. */
  etiqueta: string;
  /**
   * El nombre de cada barra, cuando no son días. Con seis meses caben todos;
   * con treinta días se rotulan tres, como siempre.
   */
  ejes?: readonly string[];
}) {
  const max = Math.max(...serie, 1);
  const pico = serie.indexOf(max);

  /*
    El lienzo mide siempre lo mismo y lo que cambia es el paso entre barras.
    Al revés —lienzo que crece con los datos— siete días salían con el triple
    de alto que de ancho, y las cifras del eje ocupaban media tarjeta.
  */
  const lienzo = 640;
  const x0 = 30;
  const util = lienzo - x0 - 4;
  const paso = util / serie.length;
  const ancho = Math.min(paso * 0.7, 24);
  const base = 130;
  const alto = 110;

  const y = (v: number) => base - (v / max) * alto;
  const medio = Math.round(max / 2);

  return (
    <svg viewBox={`0 0 ${lienzo} 158`} role="img" aria-label={etiqueta} className="w-full">
      {[0, medio, max].map((v) => (
        <line
          key={v}
          x1={x0}
          y1={y(v)}
          x2={lienzo - 4}
          y2={y(v)}
          className="stroke-border-subtle"
          strokeWidth={1}
          strokeDasharray={v === 0 ? undefined : "2 3"}
        />
      ))}
      {[0, medio, max].map((v) => (
        <text
          key={v}
          x={x0 - 6}
          y={y(v) + 3}
          textAnchor="end"
          fontSize={10}
          className="fill-content-tertiary"
        >
          {v}
        </text>
      ))}

      {serie.map((v, i) => (
        <rect
          key={i}
          x={x0 + i * paso + (paso - ancho) / 2}
          y={y(v)}
          width={ancho}
          height={base - y(v)}
          rx={2}
          className={i === pico ? "fill-accent" : "fill-brand"}
          fillOpacity={i === pico ? 1 : 0.55}
        />
      ))}

      <text
        x={x0 + pico * paso + paso / 2}
        y={y(max) - 6}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        className="fill-content-primary"
      >
        {max}
      </text>

      {(ejes ? serie.map((_, i) => i) : [0, Math.floor(serie.length / 2), serie.length - 1]).map((i) => (
        <text
          key={i}
          x={x0 + i * paso + paso / 2}
          y={147}
          textAnchor="middle"
          fontSize={10}
          className="fill-content-tertiary"
        >
          {ejes ? ejes[i] : i + 1}
        </text>
      ))}
    </svg>
  );
}

/**
 * La misma serie, del tamaño de una firma. Va dentro de la tarjeta de la cifra
 * para que el número diga también de dónde viene.
 */
export function Sparkline({ serie }: { serie: SerieDiaria }) {
  const max = Math.max(...serie, 1);
  const n = serie.length;
  const punto = (v: number, i: number) => `${(i / (n - 1)) * 100} ${26 - (v / max) * 24}`;
  const linea = serie.map(punto).join(" L ");

  return (
    /*
      `preserveAspectRatio="none"` estira el dibujo hasta el ancho de la
      tarjeta. Sin esto el lienzo de 100 unidades se ajustaba a los 28 px de
      alto y la firma salía de 100 px, centrada y perdida en una tarjeta de 370
      — que es exactamente como se veía.

      El precio de estirar sin proporción es que un círculo saldría ovalado, así
      que el último punto no lleva punto. La línea ya dice hacia dónde va, y su
      grosor lo sostiene `non-scaling-stroke`.
    */
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      aria-hidden
      className="mt-inset-sm h-10 w-full"
    >
      <path d={`M ${linea} L 100 28 L 0 28 Z`} className="fill-brand" fillOpacity={0.12} />
      <path
        d={`M ${linea}`}
        fill="none"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        className="stroke-brand"
      />
    </svg>
  );
}

/**
 * A qué hora y qué día lo ven. Cinco franjas de tres horas por siete días.
 *
 * Es la única métrica de esta pantalla que cambia lo que alguien hace mañana:
 * dice cuándo conviene estar pendiente del teléfono.
 */
export function MapaHoras({ franjas }: { franjas: readonly FranjaHoraria[] }) {
  const max = Math.max(...franjas.flatMap((f) => [...f.porDia]), 1);
  const celda = { ancho: 32, alto: 20, pasoX: 36, pasoY: 28 };
  const x0 = 30;
  const y0 = 18;

  let mejor = { dia: 0, franja: franjas[0]?.franja ?? "", valor: 0 };
  franjas.forEach((f) => {
    f.porDia.forEach((v, d) => {
      if (v > mejor.valor) mejor = { dia: d, franja: f.franja, valor: v };
    });
  });

  const NOMBRES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábados", "domingos"];

  return (
    <svg
      viewBox={`0 0 300 ${y0 + franjas.length * celda.pasoY}`}
      role="img"
      aria-label={`Visitas por franja horaria y día de la semana. El máximo son los ${NOMBRES[mejor.dia]} de ${mejor.franja}, con ${mejor.valor} visitas.`}
      className="w-full"
    >
      {DIAS_CORTOS.map((d, i) => (
        <text
          key={i}
          x={x0 + i * celda.pasoX + celda.ancho / 2}
          y={10}
          textAnchor="middle"
          fontSize={10}
          className="fill-content-tertiary"
        >
          {d}
        </text>
      ))}

      {franjas.map((f, r) => (
        <g key={f.franja}>
          <text
            x={x0 - 4}
            y={y0 + r * celda.pasoY + 14}
            textAnchor="end"
            fontSize={10}
            className="fill-content-tertiary"
          >
            {f.franja}
          </text>
          {f.porDia.map((v, i) => (
            <rect
              key={i}
              x={x0 + i * celda.pasoX}
              y={y0 + r * celda.pasoY}
              width={celda.ancho}
              height={celda.alto}
              rx={3}
              className="fill-brand"
              /* La opacidad es el dato, no un estilo: sale de la proporción
                 con el máximo. El suelo de 0,08 evita que una casilla con una
                 visita se confunda con una vacía. */
              fillOpacity={v === 0 ? 0.06 : 0.08 + (v / max) * 0.92}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

/**
 * La opacidad de cada capa de `BarrasApiladas`, de abajo arriba. Es un solo
 * tono —el de marca— que se aclara: las capas tienen un orden (el alcance 1 es
 * lo que se quema, el 3 lo más lejano) y un orden se dice con claridad, no con
 * colores distintos. Además, ámbar ya significa «el pico» en `Barras`.
 *
 * No son números de estilo: son los que pasan el validador de paletas en los
 * dos temas, mezclados sobre la superficie de la tarjeta. Con 1 · 0,6 · 0,3 la
 * capa más clara quedaba en 1,55:1 sobre blanco, por debajo del mínimo de 2:1.
 * Con estos, 2,13:1 en claro y 2,88:1 en oscuro, y un salto de luminosidad
 * visible entre capas vecinas.
 */
export const OPACIDAD_CAPA = [1, 0.75, 0.5] as const;

/** Un rectángulo con las dos esquinas de arriba redondeadas y la base recta, apoyada en el eje. */
function barraRedondeada(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h);
  return `M ${x} ${y + h} V ${y + rr} Q ${x} ${y} ${x + rr} ${y} H ${x + w - rr} Q ${x + w} ${y} ${x + w} ${y + rr} V ${y + h} Z`;
}

/**
 * Barras apiladas: un total por columna, partido en hasta tres capas que suman
 * ese total. Es la forma correcta solo porque las capas son partes de un todo;
 * para comparar series que no suman, van barras lado a lado.
 *
 * Entre capas queda un hueco de 2 px del color de la superficie, que es lo que
 * las separa —no un borde—. Solo la capa de arriba lleva las esquinas
 * redondeadas; la base va recta sobre el eje.
 *
 * Se rotulan dos totales, no seis: el más alto y el último. El resto lo dicen
 * el eje, la leyenda de la página y la tabla. Cada capa lleva un `<title>`, que
 * el navegador enseña al pasar el ratón: es la capa de detalle sin una línea de
 * JavaScript.
 *
 * Una capa muy pequeña puede no verse —el alcance 3 suele ser un 1 %—. No se
 * agranda: dibujarla más alta de lo que es mentiría. Su cifra está en la
 * leyenda y en la tabla.
 */
export function BarrasApiladas({
  capas,
  ejes,
  etiqueta,
  unidad,
}: {
  /** De abajo arriba. Cada una con un valor por columna. Tres como mucho. */
  capas: readonly { nombre: string; valores: readonly number[] }[];
  /** El nombre de cada columna: «may.», «jun.»… */
  ejes: readonly string[];
  /** Lo que la gráfica dice en palabras, para quien no la ve. */
  etiqueta: string;
  /** Lo que va detrás de cada cifra: «kg». */
  unidad: string;
}) {
  const n = ejes.length;
  const totales = ejes.map((_, i) => capas.reduce((t, c) => t + (c.valores[i] ?? 0), 0));
  const mayor = Math.max(...totales, 1);
  const pico = totales.indexOf(mayor);
  /*
    El techo del eje se redondea hacia arriba a un número limpio —1445 kg da
    1500, con 750 a la mitad—. Con el máximo crudo el eje decía «1445» y «722»,
    que no se leen de un vistazo, y repetía la cifra rotulada sobre la barra.
  */
  const escalon = 5 * 10 ** (Math.floor(Math.log10(mayor)) - 1);
  const max = Math.ceil(mayor / escalon) * escalon;
  const rotuladas = [...new Set([pico, n - 1])];

  // El mismo lienzo que `Barras`, para que dos gráficas de la misma pantalla midan igual.
  const lienzo = 640;
  const x0 = 44;
  const util = lienzo - x0 - 4;
  const paso = util / n;
  const ancho = Math.min(paso * 0.5, 40);
  const base = 130;
  const alto = 104;
  const hueco = 2;

  const y = (v: number) => base - (v / max) * alto;
  const medio = Math.round(max / 2);

  return (
    <svg viewBox={`0 0 ${lienzo} 158`} role="img" aria-label={etiqueta} className="w-full">
      {[0, medio, max].map((v) => (
        <line
          key={v}
          x1={x0}
          y1={y(v)}
          x2={lienzo - 4}
          y2={y(v)}
          className="stroke-border-subtle"
          strokeWidth={1}
          strokeDasharray={v === 0 ? undefined : "2 3"}
        />
      ))}
      {[0, medio, max].map((v) => (
        <text key={v} x={x0 - 6} y={y(v) + 3} textAnchor="end" fontSize={10} className="fill-content-tertiary">
          {Math.round(v)}
        </text>
      ))}

      {ejes.map((eje, i) => {
        const x = x0 + i * paso + (paso - ancho) / 2;
        const visibles = capas
          .map((c, k) => ({ nombre: c.nombre, v: c.valores[i] ?? 0, k }))
          .filter((s) => s.v > 0);
        let acumulado = 0;

        return (
          <g key={eje}>
            {visibles.map((s, j) => {
              const abajo = y(acumulado);
              acumulado += s.v;
              const arriba = y(acumulado);
              // El hueco se le quita a la capa de encima, no a la de abajo:
              // la primera siempre toca el eje.
              const h = abajo - arriba - (j > 0 ? hueco : 0);
              if (h <= 0) return null;
              const esUltima = j === visibles.length - 1;
              const titulo = `${s.nombre}, ${eje}: ${Math.round(s.v)} ${unidad}`;
              return esUltima ? (
                <path
                  key={s.k}
                  d={barraRedondeada(x, arriba, ancho, h, 4)}
                  className="fill-brand"
                  fillOpacity={OPACIDAD_CAPA[s.k]}
                >
                  <title>{titulo}</title>
                </path>
              ) : (
                <rect
                  key={s.k}
                  x={x}
                  y={arriba}
                  width={ancho}
                  height={h}
                  className="fill-brand"
                  fillOpacity={OPACIDAD_CAPA[s.k]}
                >
                  <title>{titulo}</title>
                </rect>
              );
            })}
          </g>
        );
      })}

      {rotuladas.map((i) => (
        <text
          key={i}
          x={x0 + i * paso + paso / 2}
          y={y(totales[i]) - 6}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          className="fill-content-primary"
        >
          {Math.round(totales[i])} {unidad}
        </text>
      ))}

      {ejes.map((eje, i) => (
        <text
          key={eje}
          x={x0 + i * paso + paso / 2}
          y={147}
          textAnchor="middle"
          fontSize={10}
          className="fill-content-tertiary"
        >
          {eje}
        </text>
      ))}
    </svg>
  );
}

/** La muestra de color de una capa, para la leyenda. Del mismo tono y opacidad que la barra. */
export function MuestraCapa({ capa }: { capa: number }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="size-icon-sm shrink-0">
      <rect width={12} height={12} rx={2} className="fill-brand" fillOpacity={OPACIDAD_CAPA[capa]} />
    </svg>
  );
}
