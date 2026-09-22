import Link from "next/link";
import type { ReactNode } from "react";

import { Compass, Search } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { AvisoSinConexion, Navegacion } from "@/components/patterns";
import { Text } from "@/components/ui";

import { Pestanas } from "./_pestanas";
import { RUTAS_PORTAL } from "./_rutas";

/** Lo que no está en las pestañas y aun así hace falta poder encontrar. */
const ENLACES_PIE = [
  { href: "/ruta", etiqueta: "Armar una ruta" },
  { href: "/guardados", etiqueta: "Lo que guardaste" },
  { href: "/para-tu-negocio", etiqueta: "¿Tienes un negocio?" },
] as const;

/**
 * El portal. `data-density="editorial"` es todo el mecanismo: de aquí para
 * abajo los tokens semánticos valen lo que valen en revista de viaje —
 * controles de 48 px, ritmo de 1.5rem, serif permitido en titulares.
 *
 * Ningún componente sabe que está aquí. Tampoco sabe a qué ancho: lo único que
 * cambia en escritorio es dónde vive la navegación y cuántas columnas hay.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div data-density="editorial" className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface">
        <Container ancho="sm" className="lg:max-w-page-xl">
          <Inline justify="between" wrap={false} className="h-control-md">
            <Link href="/" className="flex min-h-control-sm items-center gap-icon-gap">
              <Compass className="size-icon-md text-brand" aria-hidden />
              <Text as="span" size="heading-sm" serif weight="semibold">
                Sendero
              </Text>
            </Link>

            {/* A partir de md las pestañas suben aquí y la de abajo se apaga */}
            <Navegacion rutas={RUTAS_PORTAL} />

            {/* El atajo del teléfono. Arriba de md lo dice la navegación. */}
            <Link
              href="/buscar"
              aria-label="Buscar"
              className="flex size-control-sm items-center justify-center rounded-full md:hidden"
            >
              <Search className="size-icon-md" aria-hidden />
            </Link>
          </Inline>
        </Container>
      </header>

      {/* Solo aparece cuando de verdad se cae la señal */}
      <AvisoSinConexion />

      <div className="flex-1">{children}</div>

      {/*
        El portal se acababa en seco: el último negocio de la lista y nada más.
        Un pie corto es lo que dice que la página terminó y no que se quedó a
        medio cargar.

        Tres enlaces y una frase, y ni uno más. Repetir aquí las nueve zonas
        sería un mapa del sitio, y un mapa del sitio es peso en un Moto G Power
        para decir lo que ya dicen el encabezado y las pestañas.
      */}
      <footer className="border-t border-border-subtle bg-surface-sunken py-stack">
        <Container ancho="sm" className="lg:max-w-page-xl">
          <Stack gap="default">
            <Stack gap="tight">
              <Inline gap="icon" wrap={false}>
                <Compass className="size-icon-md text-brand" aria-hidden />
                <Text as="span" size="heading-sm" serif weight="semibold">
                  Sendero
                </Text>
              </Inline>
              <Text size="body-sm" tone="secondary" className="max-w-prose">
                Un directorio de las zonas de Panamá donde no llegan los tours. Sin reservas, sin
                comisiones: le escribes directo a la persona.
              </Text>
            </Stack>

            <Inline gap="lg" as="nav" aria-label="Enlaces del pie">
              {ENLACES_PIE.map(({ href, etiqueta }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex min-h-touch-min items-center text-body-sm font-medium text-brand"
                >
                  {etiqueta}
                </Link>
              ))}
            </Inline>
          </Stack>
        </Container>
      </footer>

      <Pestanas />
    </div>
  );
}
