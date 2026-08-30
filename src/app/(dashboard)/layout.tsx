import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeft, Compass } from "@/components/icons";
import { Container, Inline } from "@/components/layout";
import { MenuCuenta, Navegacion, ShellExperto, type RutaNav } from "@/components/patterns";
import { Text } from "@/components/ui";
import { negocioDelDueno } from "@/data/panel";
import { pendientes } from "@/data/pendientes";
import { modoPanel } from "@/lib/modo-panel";

import { cambiarModo } from "./_acciones";
import { ContenidoMenuCuenta } from "./_menu-cuenta";
import { gruposLaterales } from "./_rutas-panel";

/**
 * Las cinco pantallas del panel guiado. Caben en el encabezado, y por eso el
 * modo guiado sigue sin barra lateral: un dueño que nunca usó un panel no tiene
 * que aprender un menú antes de poder hacer algo.
 *
 * En modo experto no se usan: ahí navega la barra lateral, y tener dos menús
 * para lo mismo sobra.
 */
const RUTAS_PANEL: readonly RutaNav[] = [
  { href: "/dashboard", etiqueta: "Panel" },
  { href: "/dashboard/negocio", etiqueta: "Mi negocio" },
  { href: "/dashboard/productos", etiqueta: "Productos" },
  { href: "/dashboard/fotos", etiqueta: "Fotos" },
  { href: "/dashboard/horario", etiqueta: "Horario" },
];

/** El logo. Es el mismo en los dos modos, y lleva siempre a la portada. */
function Marca() {
  return (
    <Link href="/dashboard" className="flex min-h-control-md shrink-0 items-center gap-icon-gap">
      <Compass className="size-icon-md text-brand" aria-hidden />
      {/* Sin serif: la densidad operacional no lo usa nunca, y esa palabra sola
          arrastraba 49,7 KB de Source Serif a todas las pantallas del panel. */}
      <Text as="span" size="heading-sm" weight="semibold">
        Sendero
      </Text>
    </Link>
  );
}

/**
 * El dashboard, en sus dos modos.
 *
 * Mismos componentes, misma densidad operacional: controles de 36 px, ritmo de
 * 1rem, herramienta de trabajo. El serif no entra aquí — no por una regla de
 * CSS, sino porque no se usa.
 *
 * El modo lo decide una cookie que se lee en el servidor, así que cada modo
 * manda su propio marcado y quien no enciende el experto no descarga ni la
 * barra lateral ni las gráficas. A cambio, estas rutas dejan de ser estáticas:
 * el precio está anotado en `modoPanel()`.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const modo = await modoPanel();
  const negocio = negocioDelDueno();
  const iniciales = negocio.persona.nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  const cuenta = (
    <MenuCuenta iniciales={iniciales} nombre={negocio.persona.nombre}>
      <ContenidoMenuCuenta modo={modo} />
    </MenuCuenta>
  );

  if (modo === "experto") {
    return (
      <div data-density="operational">
        <ShellExperto
          marca={<Marca />}
          cuenta={cuenta}
          grupos={gruposLaterales(pendientes(negocio, new Date()))}
          pie={
            <form action={cambiarModo}>
              <input type="hidden" name="modo" value="guiado" />
              <button
                type="submit"
                className="flex min-h-control-lg w-full items-center gap-icon-gap rounded-control border border-border-default bg-action-secondary px-inset-sm text-body-sm text-content-secondary transition-colors hover:bg-action-secondary-hover motion-reduce:transition-none md:min-h-control-md"
              >
                <ArrowLeft className="size-icon-sm shrink-0" aria-hidden />
                Volver al modo guiado
              </button>
            </form>
          }
        >
          {children}
        </ShellExperto>
      </div>
    );
  }

  return (
    <div data-density="operational" className="flex min-h-dvh flex-col">
      <header className="border-b border-border-subtle bg-surface">
        <Container ancho="lg">
          <Inline justify="between" wrap={false} className="h-control-lg">
            <Inline gap="lg" wrap={false} className="min-w-0">
              <Marca />
              {/* El nombre del negocio ya no vive aquí. Era una etiqueta que no
                  hacía nada y que encima se apagaba a partir de `md` para dejar
                  sitio a los cinco enlaces; ahora está en el menú de cuenta,
                  donde sí se puede hacer algo con él. */}
              <Navegacion rutas={RUTAS_PANEL} etiqueta="Tu ficha" />
            </Inline>
            {cuenta}
          </Inline>
        </Container>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}
