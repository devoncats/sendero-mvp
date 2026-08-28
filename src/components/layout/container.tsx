import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const ANCHOS = {
  prose: "max-w-prose",
  sm: "max-w-page-sm",
  md: "max-w-page-md",
  lg: "max-w-page-lg",
  xl: "max-w-page-xl",
  full: "max-w-none",
} as const;

type Ancho = keyof typeof ANCHOS;
type Etiqueta = "div" | "main" | "section" | "article" | "header" | "footer" | "nav";

/**
 * Centra el contenido y aporta el margen lateral. `gutter` sale de la densidad:
 * 1.5rem en el portal, 1rem en el dashboard.
 */
export function Container({
  ancho = "xl",
  as: Tag = "div",
  sinGutter = false,
  className,
  children,
}: {
  ancho?: Ancho;
  as?: Etiqueta;
  sinGutter?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag className={cn("mx-auto w-full", ANCHOS[ancho], !sinGutter && "px-gutter", className)}>
      {children}
    </Tag>
  );
}
