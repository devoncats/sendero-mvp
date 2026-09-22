"use client";

// "use client" por `usePathname`: una barra de pestañas sin saber cuál está
// activa no orienta a nadie. Es lo único que hace este componente.

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Bookmark, Compass, Ruta, Search } from "@/components/icons";
import { cn } from "@/lib/cn";

import { RUTAS_PORTAL } from "./_rutas";

/** El icono de cada sección. Las etiquetas y las rutas viven en `_rutas`. */
const ICONO: Record<string, typeof Compass> = {
  "/": Compass,
  "/buscar": Search,
  "/ruta": Ruta,
  "/guardados": Bookmark,
};

/**
 * Solo en las cuatro pantallas de primer nivel. Zona y Ficha son navegación
 * hacia dentro: llevan flecha de volver, y la ficha además tiene su propia
 * barra de WhatsApp abajo — dos barras fijas compitiendo por el pulgar es una
 * de más.
 *
 * Y solo por debajo de `md`: la barra inferior existe porque el pulgar llega
 * ahí. En un escritorio no hay pulgar, y las mismas cuatro secciones están
 * arriba, en el encabezado.
 */
export function Pestanas() {
  const ruta = usePathname();
  const esPrimerNivel = RUTAS_PORTAL.some((p) => p.href === ruta);
  if (!esPrimerNivel) return null;

  return (
    <nav
      aria-label="Secciones"
      // `shadow-sticky` porque la barra de WhatsApp de la ficha ya la lleva y
      // esta no: dos barras fijas del mismo producto no pueden despegarse del
      // contenido de maneras distintas.
      //
      // El relleno vertical baja a los enlaces para que el filete de la pestaña
      // activa quede pegado al borde de la barra y no flotando dentro.
      className="sticky bottom-0 flex border-t border-border-subtle bg-surface shadow-sticky md:hidden"
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
              "flex min-h-control-md flex-1 flex-col items-center justify-center gap-0.5 py-inset-xs text-caption",
              "transition-colors motion-reduce:transition-none active:bg-action-ghost-active",
              // El filete de 2 px sobre la pestaña activa. El color por sí solo
              // no basta: quien no lo distingue se queda sin saber dónde está.
              // El inactivo lo lleva transparente para que nada se mueva al
              // cambiar de sección.
              "border-t-2",
              activa ? "border-brand font-semibold text-brand" : "border-transparent text-content-tertiary",
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
