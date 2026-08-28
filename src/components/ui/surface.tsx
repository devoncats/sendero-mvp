import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * La elevación no es una escala de sombras. En claro, `raised` es una sombra
 * sobre una superficie del mismo tono; en oscuro, la sombra se desvanece y el
 * trabajo lo hace una superficie más clara. Los dos casos están resueltos en
 * tokens.css — aquí solo se eligen.
 */
const NIVELES = {
  flat: "bg-surface",
  raised: "bg-surface-raised shadow-raised",
  sunken: "bg-surface-sunken",
  overlay: "bg-surface-overlay shadow-raised",
  none: "",
} as const;

const RADIOS = {
  none: "rounded-none",
  control: "rounded-control",
  surface: "rounded-surface",
  overlay: "rounded-overlay",
  media: "rounded-media",
} as const;

const RELLENOS = {
  none: "",
  xs: "p-inset-xs",
  sm: "p-inset-sm",
  md: "p-inset-md",
  lg: "p-inset-lg",
  xl: "p-inset-xl",
} as const;

type Etiqueta = "div" | "article" | "section" | "aside" | "li" | "figure";

/**
 * Cualquier caja con fondo propio. El relleno sale de la densidad: `lg` mide
 * 1.5rem en el portal y 1rem en el dashboard.
 */
export function Surface({
  nivel = "flat",
  radio = "surface",
  relleno = "lg",
  borde = true,
  as: Tag = "div",
  className,
  children,
}: {
  nivel?: keyof typeof NIVELES;
  radio?: keyof typeof RADIOS;
  relleno?: keyof typeof RELLENOS;
  borde?: boolean;
  as?: Etiqueta;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        NIVELES[nivel],
        RADIOS[radio],
        RELLENOS[relleno],
        borde && "border border-border-subtle",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
