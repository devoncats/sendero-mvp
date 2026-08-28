import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const TONOS = {
  neutral: "bg-surface-sunken text-content-secondary border-border-subtle",
  brand: "bg-brand-surface text-brand-content border-brand-border",
  accent: "bg-accent-surface text-accent-content border-accent-border",
  success: "bg-success-surface text-success-content border-success-border",
  warning: "bg-warning-surface text-warning-content border-warning-border",
  danger: "bg-danger-surface text-danger-content border-danger-border",
  info: "bg-info-surface text-info-content border-info-border",
  /* Los tres estados del dato de un negocio. Es lo que separa un directorio
     vivo de una guía telefónica vieja. */
  verificado: "bg-trust-verified-surface text-success-content border-success-border",
  desactualizado: "bg-trust-stale-surface text-warning-content border-warning-border",
  sinConfirmar: "bg-trust-unconfirmed-surface text-content-secondary border-border-subtle",
} as const;

/**
 * Etiqueta de estado o de categoría. No es interactiva — si algo se puede
 * tocar, es un Button o un CategoryChip, no un Badge.
 */
export function Badge({
  tono = "neutral",
  overline = false,
  className,
  children,
}: {
  tono?: keyof typeof TONOS;
  /** Versalitas para categorías editoriales. */
  overline?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-icon-gap rounded-full border px-inset-sm py-inset-xs font-semibold",
        overline ? "text-overline uppercase" : "text-caption",
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
