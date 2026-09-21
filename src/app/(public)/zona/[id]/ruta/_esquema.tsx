import type { Parada } from "@/lib/itinerario";
import { caja, proyectar } from "@/lib/geo";

/**
 * El orden de las paradas, dibujado.
 *
 * Lo que esto enseña y la lista no puede: si el recorrido se dobla sobre sí
 * mismo. Una columna de horas y kilómetros no lo muestra; siete puntos
 * numerados y una línea entre ellos, sí, de un vistazo.
 *
 * **No es un mapa, y el pie lo dice con todas sus letras.** El CLAUDE.md
 * prohíbe mapas interactivos en JavaScript; esto no lo es —es SVG servido desde
 * el servidor, como las gráficas del panel— pero un dibujo de puntos y líneas
 * *se lee* como mapa, y ahí está el riesgo de verdad: que alguien intente
 * orientarse con él. Por eso no hay costa, ni carreteras, ni norte, ni escala.
 * Para llegar están las referencias escritas y la app de mapas.
 *
 * Mismo contrato que `_graficas.tsx`: lienzo fijo, color siempre por clase de
 * Tailwind y nunca como atributo `fill=`, y un `aria-label` que dice el dato en
 * palabras.
 */

const ANCHO = 640;
const ALTO = 360;
const MARGEN = 28;
const RADIO = 15;

/** Con dos puntos y una raya no se informa de nada. Ahí el esquema no sale. */
const MINIMO = 3;

function kmCorto(n: number): string {
  return n < 10 ? n.toFixed(1).replace(".", ",") : String(Math.round(n));
}

export function Esquema({ paradas, className }: { paradas: readonly Parada[]; className?: string }) {
  if (paradas.length < MINIMO) return null;

  const puntos = paradas.map((p) => p.negocio.coordenadas!);
  const c = caja(puntos);
  const xy = puntos.map((p) => proyectar(p, c, ANCHO - MARGEN * 2, ALTO - MARGEN * 2));
  const coords = xy.map((p) => ({ x: p.x + MARGEN, y: p.y + MARGEN }));

  const km = paradas.reduce((s, p) => s + p.desdeAnterior, 0);

  /* El label se genera del propio dato: quien no ve el dibujo oye el recorrido
     entero, en orden, con nombres de personas y no de negocios. */
  const etiqueta = `Orden de las paradas: ${paradas
    .map((p, i) => `${i + 1}, ${p.negocio.persona.nombre}`)
    .join("; ")}. En total, unos ${kmCorto(km)} kilómetros. Es un esquema del orden, no un mapa a escala.`;

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        role="img"
        aria-label={etiqueta}
        className="h-auto w-full"
      >
        <polyline
          points={coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
          fill="none"
          strokeWidth={2}
          strokeDasharray="6 5"
          strokeLinejoin="round"
          className="stroke-border-strong"
        />
        {coords.map((p, i) => (
          <g key={paradas[i].negocio.slug}>
            <circle
              cx={p.x}
              cy={p.y}
              r={RADIO}
              className={i === 0 ? "fill-accent" : "fill-brand"}
            />
            {/* El número lo dice el aria-label; aquí es decoración del dibujo. */}
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight={600}
              aria-hidden
              className="fill-action-primary-content"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="pt-inset-sm text-caption text-content-tertiary">
        Esquema del orden de las paradas. No es un mapa a escala: para llegar, usa las referencias
        escritas de cada ficha y la app de mapas.
      </figcaption>
    </figure>
  );
}
