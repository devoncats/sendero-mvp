"use client";

// "use client" por `usePathname`: una barra de pestañas sin saber cuál está
// activa no orienta a nadie. Es lo único que hace este componente.

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Bookmark, Compass, Search } from "@/components/icons";
import { cn } from "@/lib/cn";

const PESTANAS = [
  { href: "/", etiqueta: "Descubrir", icono: Compass },
  { href: "/buscar", etiqueta: "Buscar", icono: Search },
  { href: "/guardados", etiqueta: "Guardados", icono: Bookmark },
] as const;

/**
 * Solo en las tres pantallas de primer nivel. Zona y Ficha son navegación
 * hacia dentro: llevan flecha de volver, y la ficha además tiene su propia
 * barra de WhatsApp abajo — dos barras fijas compitiendo por el pulgar es una
 * de más.
 */
export function Pestanas() {
  const ruta = usePathname();
  const esPrimerNivel = PESTANAS.some((p) => p.href === ruta);
  if (!esPrimerNivel) return null;

  return (
    <nav
      aria-label="Secciones"
      className="sticky bottom-0 flex border-t border-border-subtle bg-surface py-inset-xs"
    >
      {PESTANAS.map(({ href, etiqueta, icono: Icono }) => {
        const activa = href === ruta;
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
