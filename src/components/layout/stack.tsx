import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const GAPS = {
  none: "gap-0",
  tight: "gap-stack-tight",
  default: "gap-stack",
  loose: "gap-stack-loose",
} as const;

const ALINEACIONES = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

type Etiqueta = "div" | "section" | "article" | "li" | "ul" | "ol" | "form" | "header" | "footer";

/**
 * Flujo vertical. El ritmo sale de --sd-space-stack, que vale 1.5rem en el
 * portal y 1rem en el dashboard: el mismo Stack respira distinto en cada área
 * sin que nadie se lo diga.
 *
 * No acepta un gap arbitrario a propósito. Si un espacio no está en la escala,
 * la respuesta correcta es discutir el token, no escribir un número.
 */
export function Stack({
  gap = "default",
  align = "stretch",
  as: Tag = "div",
  className,
  children,
}: {
  gap?: keyof typeof GAPS;
  align?: keyof typeof ALINEACIONES;
  as?: Etiqueta;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag className={cn("flex flex-col", GAPS[gap], ALINEACIONES[align], className)}>{children}</Tag>
  );
}
