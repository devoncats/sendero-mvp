import Link from "next/link";
import type { ReactNode } from "react";

import { Compass, Menu } from "@/components/icons";
import { Container, Inline } from "@/components/layout";
import { Navegacion, type RutaNav } from "@/components/patterns";
import { Text } from "@/components/ui";
import { negocioDelDueno } from "@/data/panel";

/**
 * Las cinco pantallas del panel. Caben en el encabezado, y por eso siguen sin
 * barra lateral: un dueño que nunca usó un panel no tiene que aprender un menú
 * antes de poder hacer algo, y tener sitio de sobra no cambia esa razón.
 */
const RUTAS_PANEL: readonly RutaNav[] = [
  { href: "/dashboard", etiqueta: "Panel" },
  { href: "/dashboard/negocio", etiqueta: "Mi negocio" },
  { href: "/dashboard/productos", etiqueta: "Productos" },
  { href: "/dashboard/fotos", etiqueta: "Fotos" },
  { href: "/dashboard/horario", etiqueta: "Horario" },
];

/**
 * El dashboard. Mismos componentes, otra densidad: controles de 36 px, ritmo
 * de 1rem, herramienta de trabajo. El serif no entra aquí — no por una regla
 * de CSS, sino porque no se usa.
 *
 * Sin barra lateral, como decidió la dirección C. En escritorio las cinco
 * pantallas suben al encabezado; por debajo de `md` se sigue navegando desde
 * el panel, que es donde están todas las puertas.
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
                {/* Sin serif: la densidad operacional no lo usa nunca, y esa
                    palabra sola arrastraba 49,7 KB de Source Serif a las cinco
                    pantallas del dashboard. */}
                <Text as="span" size="heading-sm" weight="semibold">
                  Sendero
                </Text>
              </Link>
              {/* A md el encabezado no da para el nombre y los cinco enlaces. */}
              <Text size="body-md" tone="secondary" truncate className="md:hidden lg:block">
                {negocio.nombre}
              </Text>
              <Navegacion rutas={RUTAS_PANEL} etiqueta="Tu ficha" />
            </Inline>
            <Inline gap="sm" wrap={false}>
              <span
                className="flex size-avatar-sm items-center justify-center rounded-full bg-brand-surface text-caption font-semibold text-brand-content"
                aria-hidden
              >
                {iniciales}
              </span>
              <span className="sr-only">{negocio.persona.nombre}</span>
              <Menu className="size-icon-md md:hidden" aria-label="Menú" />
            </Inline>
          </Inline>
        </Container>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}
