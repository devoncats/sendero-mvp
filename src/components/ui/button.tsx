import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/*
 * Cada variante trae su hover **y su active**. El active faltaba en las cuatro
 * aunque los tokens existían: en un teléfono no hay puntero, así que el único
 * estado que el dueño del negocio llega a ver es el que no estaba.
 */
const VARIANTES = {
  primary:
    "bg-action-primary text-action-primary-content hover:bg-action-primary-hover active:bg-action-primary-active",
  secondary:
    "bg-action-secondary text-action-secondary-content border border-border-default hover:bg-action-secondary-hover active:bg-action-secondary-active",
  ghost: "text-content-primary hover:bg-action-ghost-hover active:bg-action-ghost-active",
  danger:
    "bg-action-danger text-action-danger-content hover:bg-action-danger-hover active:bg-action-danger-active",
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
/**
 * Las clases del botón, sueltas.
 *
 * Existe para los componentes cliente que sí necesitan un manejador —el límite
 * de error y su "Reintentar"— sin obligar a Button a aceptar onClick. El
 * vocabulario visual sigue teniendo una sola fuente.
 */
export function clasesDeBoton({
  variante = "primary",
  tamano = "md",
  soloIcono,
  anchoCompleto,
  className,
}: Base) {
  return cn(
    "inline-flex items-center justify-center gap-icon-gap rounded-control font-semibold",
    "transition-colors motion-reduce:transition-none",
    "active:scale-press",
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
    <button type={type} disabled={disabled} className={clasesDeBoton(props)}>
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
      <a href={href} rel="noopener noreferrer" className={clasesDeBoton(props)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={clasesDeBoton(props)}>
      {children}
    </Link>
  );
}
