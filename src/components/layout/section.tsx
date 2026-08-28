import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const ESPACIADOS = {
  none: "",
  default: "py-section",
  top: "pt-section",
  bottom: "pb-section",
} as const;

type Etiqueta = "section" | "div" | "article" | "header" | "footer";

/**
 * Bloque de ritmo vertical. `--sd-space-section` vale 4rem en el portal y 2rem
 * en el dashboard: la revista respira, la herramienta no.
 *
 * Solo aporta espacio. El titular y la descripción son composición, no layout.
 */
export function Section({
  espaciado = "default",
  as: Tag = "section",
  className,
  children,
}: {
  espaciado?: keyof typeof ESPACIADOS;
  as?: Etiqueta;
  className?: string;
  children?: ReactNode;
}) {
  return <Tag className={cn(ESPACIADOS[espaciado], className)}>{children}</Tag>;
}
