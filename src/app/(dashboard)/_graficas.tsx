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
}: {
  serie: SerieDiaria;
  /** Lo que la gráfica dice en palabras, para quien no la ve. */
  etiqueta: string;
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

      {[0, Math.floor(serie.length / 2), serie.length - 1].map((i) => (
        <text
          key={i}
          x={x0 + i * paso + paso / 2}
          y={147}
          textAnchor="middle"
          fontSize={10}
          className="fill-content-tertiary"
        >
          {i + 1}
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
