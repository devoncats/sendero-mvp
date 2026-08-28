import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const TAMANOS = {
  "display-lg": "text-display-lg",
  "display-md": "text-display-md",
  "display-sm": "text-display-sm",
  "heading-lg": "text-heading-lg",
  "heading-md": "text-heading-md",
  "heading-sm": "text-heading-sm",
  "heading-xs": "text-heading-xs",
  "body-lg": "text-body-lg",
  "body-md": "text-body-md",
  "body-sm": "text-body-sm",
  label: "text-label",
  caption: "text-caption",
  overline: "text-overline uppercase",
} as const;

const TONOS = {
  primary: "text-content-primary",
  secondary: "text-content-secondary",
  tertiary: "text-content-tertiary",
  inverse: "text-content-inverse",
  disabled: "text-content-disabled",
  brand: "text-brand",
  accent: "text-accent-content",
  success: "text-success-content",
  warning: "text-warning-content",
  danger: "text-danger-content",
} as const;

const PESOS = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
} as const;

type Etiqueta =
  | "p"
  | "span"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "blockquote"
  | "figcaption"
  | "label"
  | "strong";

/**
 * Todo el texto de la aplicación pasa por aquí. Cada tamaño trae ya su
 * interlineado y su tracking desde el token: no se ajustan por separado.
 *
 * `serif` es **solo para titulares editoriales del portal**. El dashboard nunca
 * lo usa — no hay una regla de CSS que lo impida, lo impides tú al revisar.
 *
 * `as` y `size` son independientes a propósito: un h2 puede verse pequeño y un
 * span puede verse grande. El orden de encabezados lo manda la semántica de la
 * página, no la escala tipográfica.
 */
export function Text({
  size = "body-md",
  tone = "primary",
  weight,
  serif = false,
  as: Tag = "p",
  truncate = false,
  id,
  htmlFor,
  className,
  children,
}: {
  size?: keyof typeof TAMANOS;
  tone?: keyof typeof TONOS;
  weight?: keyof typeof PESOS;
  serif?: boolean;
  as?: Etiqueta;
  truncate?: boolean;
  /** Para que un mensaje de error pueda ser el `aria-describedby` de su campo. */
  id?: string;
  /** Solo con `as="label"`. Ata la etiqueta a su control. */
  htmlFor?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag
      id={id}
      htmlFor={Tag === "label" ? htmlFor : undefined}
      className={cn(
        TAMANOS[size],
        TONOS[tone],
        weight && PESOS[weight],
        serif ? "font-serif" : "font-sans",
        truncate ? "truncate" : "text-pretty",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
