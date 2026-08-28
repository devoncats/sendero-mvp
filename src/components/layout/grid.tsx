import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Mobile-first de verdad: una columna siempre, y las demás desde `sm` o `md`
 * según cuánto quepa. Un Moto G Power no muestra tres columnas de nada.
 */
const COLUMNAS = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
} as const;

const GAPS = {
  sm: "gap-inset-sm",
  md: "gap-inset-md",
  lg: "gap-inset-lg",
  stack: "gap-stack",
} as const;

type Etiqueta = "div" | "ul" | "ol" | "section";

/**
 * Rejilla de columnas iguales. Se escribe con `repeat(N, minmax(0, 1fr))` bajo
 * el capó, que es lo que evita que una celda con texto largo empuje a las otras.
 */
export function Grid({
  cols = 2,
  gap = "md",
  as: Tag = "div",
  className,
  children,
}: {
  cols?: keyof typeof COLUMNAS;
  gap?: keyof typeof GAPS;
  as?: Etiqueta;
  className?: string;
  children?: ReactNode;
}) {
  return <Tag className={cn("grid", COLUMNAS[cols], GAPS[gap], className)}>{children}</Tag>;
}
