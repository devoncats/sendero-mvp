import Link from "next/link";
import type { ReactNode } from "react";

import { Compass, Search } from "@/components/icons";
import { Container, Inline } from "@/components/layout";
import { Text } from "@/components/ui";

/**
 * El portal. `data-density="editorial"` es todo el mecanismo: de aquí para
 * abajo los tokens semánticos valen lo que valen en revista de viaje —
 * controles de 48 px, ritmo de 1.5rem, serif permitido en titulares.
 *
 * Ningún componente sabe que está aquí.
 *
 * La barra de pestañas del diseño (Descubrir · Buscar · Guardados) todavía no
 * está: Guardados necesita estado en el teléfono del visitante y esa decisión
 * —con sus kilobytes— se toma cuando se construya. Mientras tanto, una cabecera
 * que no lleva a ningún sitio muerto.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div data-density="editorial" className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface">
        <Container ancho="sm">
          <Inline justify="between" wrap={false} className="h-control-md">
            <Link href="/" className="flex items-center gap-icon-gap">
              <Compass className="size-icon-md text-brand" aria-hidden />
              <Text as="span" size="heading-sm" serif weight="semibold">
                Sendero
              </Text>
            </Link>
            <Link
              href="/buscar"
              aria-label="Buscar"
              className="flex size-control-sm items-center justify-center rounded-full"
            >
              <Search className="size-icon-md" aria-hidden />
            </Link>
          </Inline>
        </Container>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}
