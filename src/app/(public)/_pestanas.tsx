"use client";

// "use client" por `usePathname`: una barra de pestañas sin saber cuál está
// activa no orienta a nadie. Es lo único que hace este componente.

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Bookmark, Compass, Search } from "@/components/icons";
import { cn } from "@/lib/cn";

import { RUTAS_PORTAL } from "./_rutas";

/** El icono de cada sección. Las etiquetas y las rutas viven en `_rutas`. */
const ICONO: Record<string, typeof Compass> = {
  "/": Compass,
  "/buscar": Search,
  "/guardados": Bookmark,
};

/**
 * Solo en las tres pantallas de primer nivel. Zona y Ficha son navegación
 * hacia dentro: llevan flecha de volver, y la ficha además tiene su propia
 * barra de WhatsApp abajo — dos barras fijas compitiendo por el pulgar es una
 * de más.
 *
 * Y solo por debajo de `md`: la barra inferior existe porque el pulgar llega
 * ahí. En un escritorio no hay pulgar, y las mismas tres secciones están
 * arriba, en el encabezado.
 */
export function Pestanas() {
  const ruta = usePathname();
  const esPrimerNivel = RUTAS_PORTAL.some((p) => p.href === ruta);
  if (!esPrimerNivel) return null;

  return (
    <nav
      aria-label="Secciones"
      className="sticky bottom-0 flex border-t border-border-subtle bg-surface py-inset-xs md:hidden"
    >
      {RUTAS_PORTAL.map(({ href, etiqueta }) => {
        const activa = href === ruta;
        const Icono = ICONO[href];
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={cn(
              "flex min-h-control-md flex-1 flex-col items-center justify-center gap-0.5 text-caption",
              activa ? "font-semibold text-brand" : "text-content-tertiary",
            )}
          >
            <Icono className="size-icon-md" aria-hidden />
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
