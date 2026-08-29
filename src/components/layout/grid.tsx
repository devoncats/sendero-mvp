import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Cuántas columnas en el teléfono, y cuántas cuando hay sitio.
 *
 * `movil = 1` es para bloques que necesitan el ancho completo en un teléfono:
 * dos textos comparados, un formulario. `movil = 2` es para tarjetas con foto,
 * que en 375 px se leen perfectamente a media pantalla — y que apiladas a una
 * columna convierten nueve zonas en una página infinita.
 *
 * Se aprendió construyendo Descubrir: el mobile-first automático no siempre es
 * el mobile-first correcto.
 */
const COLUMNAS = {
  "1-2": "grid-cols-1 sm:grid-cols-2",
  "1-3": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  "1-4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  "2-2": "grid-cols-2",
  "2-3": "grid-cols-2 md:grid-cols-3",
  "2-4": "grid-cols-2 md:grid-cols-4",
} as const;

const GAPS = {
  sm: "gap-inset-sm",
  md: "gap-inset-md",
  lg: "gap-inset-lg",
  stack: "gap-stack",
} as const;

type Etiqueta = "div" | "ul" | "ol" | "section";

/**
 * Rejilla de columnas iguales, con `repeat(N, minmax(0, 1fr))` bajo el capó —
 * que es lo que evita que una celda con texto largo empuje a las otras.
 */
export function Grid({
  cols = 2,
  movil = 1,
  gap = "md",
  as: Tag = "div",
  className,
  children,
}: {
  cols?: 2 | 3 | 4;
  movil?: 1 | 2;
  gap?: keyof typeof GAPS;
  as?: Etiqueta;
  className?: string;
  children?: ReactNode;
}) {
  const clave = `${movil}-${cols}` as keyof typeof COLUMNAS;
  return <Tag className={cn("grid", COLUMNAS[clave], GAPS[gap], className)}>{children}</Tag>;
}
