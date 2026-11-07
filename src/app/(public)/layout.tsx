import Link from "next/link";
import type { ReactNode } from "react";

import { Compass } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { AvisoSinConexion, Navegacion } from "@/components/patterns";
import { Text } from "@/components/ui";

import { Pestanas } from "./_pestanas";
import { RUTAS_PORTAL } from "./_rutas";

/** Lo que no está en las pestañas y aun así hace falta poder encontrar. */
const ENLACES_PIE = [
  { href: "/comunidades", etiqueta: "Quién organiza" },
  { href: "/guardados", etiqueta: "Lo que guardaste" },
  { href: "/para-tu-negocio", etiqueta: "¿Tienes un negocio?" },
  { href: "/acceso", etiqueta: "Entrar como cooperativa o consorcio" },
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

            {/* A partir de md las pestañas suben aquí y la de abajo se apaga.
                Buscar no tiene atajo en el encabezado: es del directorio, que
                es secundario, y su buscador está en «Negocios». */}
            <Navegacion rutas={RUTAS_PORTAL} />
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

        Cuatro enlaces y una frase, y ni uno más. Repetir aquí las nueve zonas
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
                Experiencias organizadas por las propias comunidades de Panamá. Lo que pagas
                llega entero a las familias que te atienden.
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
