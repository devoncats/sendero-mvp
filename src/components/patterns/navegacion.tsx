"use client";

// Quinto y último "use client" del proyecto, y el único que añade el escritorio.
//
// Se justifica igual que `Pestanas`: por `usePathname`. Una navegación
// horizontal que no dice en qué sección estás no orienta a nadie, y en
// escritorio es todo lo que queda de la barra de pestañas — que sí marcaba la
// activa. Sin esto, el escritorio orientaría peor que el teléfono.
//
// Sirve al portal y al dashboard. La lista de rutas la pone cada layout: este
// componente no sabe en qué área está, igual que todos los demás.

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

export type RutaNav = { href: string; etiqueta: string };

/**
 * Oculta por debajo de `md`: ahí manda el pulgar y la barra de pestañas.
 *
 * El hover solo refuerza. Lo que dice cuál es la sección activa es el color y
 * el peso, que se ven sin ratón — y `aria-current`, que se oye.
 */
export function Navegacion({
  rutas,
  etiqueta = "Secciones",
  className,
}: {
  rutas: readonly RutaNav[];
  /** Nombre accesible del landmark. Dos `nav` distintos no pueden llamarse igual. */
  etiqueta?: string;
  className?: string;
}) {
  const ruta = usePathname();

  return (
    <nav
      aria-label={etiqueta}
      className={cn("hidden items-center gap-inset-xs md:flex", className)}
    >
      {rutas.map(({ href, etiqueta: texto }) => {
        const activa = href === ruta;
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={cn(
              "flex min-h-control-sm items-center rounded-control px-inset-md text-body-md",
              "transition-colors motion-reduce:transition-none",
              activa
                ? "font-semibold text-brand"
                : "text-content-secondary hover:bg-action-secondary-hover",
            )}
          >
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
