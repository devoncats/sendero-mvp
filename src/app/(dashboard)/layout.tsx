import Link from "next/link";
import type { ReactNode } from "react";

import { Compass, Menu } from "@/components/icons";
import { Container, Inline } from "@/components/layout";
import { Text } from "@/components/ui";
import { negocioDelDueno } from "@/data/panel";

/**
 * El dashboard. Mismos componentes, otra densidad: controles de 36 px, ritmo
 * de 1rem, herramienta de trabajo. El serif no entra aquí — no por una regla
 * de CSS, sino porque no se usa.
 *
 * Sin barra lateral, como decidió la dirección C: un dueño que nunca usó un
 * panel no tiene que aprender un menú antes de poder hacer nada. Barra
 * superior y «volver al panel», que es toda la navegación que hace falta con
 * cinco pantallas.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const negocio = negocioDelDueno();
  const iniciales = negocio.persona.nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  return (
    <div data-density="operational" className="flex min-h-dvh flex-col">
      <header className="border-b border-border-subtle bg-surface">
        <Container ancho="lg">
          <Inline justify="between" wrap={false} className="h-control-lg">
            <Inline gap="lg" wrap={false} className="min-w-0">
              <Link
                href="/dashboard"
                className="flex min-h-control-md shrink-0 items-center gap-icon-gap"
              >
                <Compass className="size-icon-md text-brand" aria-hidden />
                <Text as="span" size="heading-sm" serif weight="semibold">
                  Sendero
                </Text>
              </Link>
              <Text size="body-md" tone="secondary" truncate>
                {negocio.nombre}
              </Text>
            </Inline>
            <Inline gap="sm" wrap={false}>
              <span
                className="flex size-avatar-sm items-center justify-center rounded-full bg-brand-surface text-caption font-semibold text-brand-content"
                aria-hidden
              >
                {iniciales}
              </span>
              <span className="sr-only">{negocio.persona.nombre}</span>
              <Menu className="size-icon-md" aria-label="Menú" />
            </Inline>
          </Inline>
        </Container>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}
