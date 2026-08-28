import Link from "next/link";

import { Check } from "@/components/icons";
import { cn } from "@/lib/cn";

/**
 * Chip de categoría o de zona. Es un enlace, no un botón: filtrar cambia la URL,
 * así que el resultado se puede compartir, guardar y volver atrás.
 *
 * La altura sale de --sd-size-control-sm: 44 px en el portal (el mínimo táctil
 * de WCAG 2.2) y 32 px en el dashboard.
 */
export function CategoryChip({
  href,
  activo = false,
  className,
  children,
}: {
  href: string;
  activo?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={activo ? "true" : undefined}
      className={cn(
        "inline-flex h-control-sm items-center gap-icon-gap rounded-full border px-inset-md text-body-md",
        "transition-colors motion-reduce:transition-none",
        activo
          ? "border-brand-border bg-brand-surface font-medium text-brand-content"
          : "border-border-default bg-surface text-content-secondary hover:bg-action-secondary-hover",
        className,
      )}
    >
      {children}
      {/* El estado activo no depende solo del color: lleva su marca. */}
      {activo ? <Check className="size-icon-sm" aria-hidden /> : null}
    </Link>
  );
}
