import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const GAPS = {
  none: "gap-0",
  icon: "gap-icon-gap",
  xs: "gap-inset-xs",
  sm: "gap-inset-sm",
  md: "gap-inset-md",
  lg: "gap-inset-lg",
} as const;

const ALINEACIONES = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
} as const;

const JUSTIFICACIONES = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

type Etiqueta = "div" | "span" | "li" | "ul" | "nav" | "header" | "footer";

/**
 * Flujo horizontal con `gap`. Se usa siempre esto en vez de márgenes por
 * elemento o espacios en el marcado: el gap sobrevive a que alguien reordene,
 * duplique o borre un hijo.
 *
 * `wrap` está activo por defecto — en un teléfono de 360 px todo se envuelve.
 */
export function Inline({
  gap = "sm",
  align = "center",
  justify = "start",
  wrap = true,
  as: Tag = "div",
  className,
  children,
}: {
  gap?: keyof typeof GAPS;
  align?: keyof typeof ALINEACIONES;
  justify?: keyof typeof JUSTIFICACIONES;
  wrap?: boolean;
  as?: Etiqueta;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "flex",
        wrap ? "flex-wrap" : "flex-nowrap",
        GAPS[gap],
        ALINEACIONES[align],
        JUSTIFICACIONES[justify],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
