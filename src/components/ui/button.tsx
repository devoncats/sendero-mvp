import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const VARIANTES = {
  primary: "bg-action-primary text-action-primary-content hover:bg-action-primary-hover",
  secondary:
    "bg-action-secondary text-action-secondary-content border border-border-default hover:bg-action-secondary-hover",
  ghost: "text-content-primary hover:bg-action-secondary-hover",
  danger: "bg-action-danger text-action-danger-content",
} as const;

const TAMANOS = {
  sm: "h-control-sm px-inset-md text-body-sm",
  md: "h-control-md px-inset-lg text-body-md",
  lg: "h-control-lg px-inset-xl text-body-lg",
} as const;

const SOLO_ICONO = {
  sm: "size-control-sm px-0",
  md: "size-control-md px-0",
  lg: "size-control-lg px-0",
} as const;

type Base = {
  variante?: keyof typeof VARIANTES;
  tamano?: keyof typeof TAMANOS;
  soloIcono?: boolean;
  anchoCompleto?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * El mismo botón mide 48 px en el portal y 36 px en el dashboard. Ningún prop
 * causa eso: --sd-size-control-md ya vale distinto bajo cada data-density.
 *
 * Es un Server Component y no acepta `onClick` a propósito. Casi todo lo que
 * parece un botón en Sendero navega o abre WhatsApp — pasa `href` y sale un
 * enlace. Si de verdad hace falta un manejador, el "use client" se justifica
 * en la pantalla que lo necesita, no aquí.
 *
 * Ningún estado vive solo en hover: el hover es refuerzo, nunca la única señal.
 */
function clases({ variante = "primary", tamano = "md", soloIcono, anchoCompleto, className }: Base) {
  return cn(
    "inline-flex items-center justify-center gap-icon-gap rounded-control font-semibold",
    "transition-colors motion-reduce:transition-none",
    VARIANTES[variante],
    soloIcono ? SOLO_ICONO[tamano] : TAMANOS[tamano],
    anchoCompleto && "w-full",
    "disabled:bg-action-primary-disabled disabled:text-content-disabled",
    className,
  );
}

export function Button({
  type = "button",
  disabled = false,
  children,
  ...props
}: Base & { type?: "button" | "submit" | "reset"; disabled?: boolean }) {
  return (
    <button type={type} disabled={disabled} className={clases(props)}>
      {children}
    </button>
  );
}

/** Un botón que navega. Visualmente idéntico, semánticamente un enlace. */
export function ButtonLink({
  href,
  externo = false,
  children,
  ...props
}: Base & { href: string; externo?: boolean }) {
  if (externo) {
    return (
      <a href={href} rel="noopener noreferrer" className={clases(props)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={clases(props)}>
      {children}
    </Link>
  );
}
