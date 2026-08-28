import type { ReactNode } from "react";

import { ChevronDown, Filter } from "@/components/icons";
import { Inline, Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * El panel de filtros, sobre `<details>` nativo.
 *
 * La alternativa era un diálogo de Radix. Se descartó a conciencia: un panel de
 * filtros no necesita ser modal —nada malo pasa si el fondo sigue siendo
 * navegable— y en cuanto deja de ser modal desaparece la razón de tener trampa
 * de foco, bloqueo de scroll y cierre con Escape. Lo que queda lo hace el
 * navegador: `<details>` ya es accesible por teclado, se anuncia como grupo
 * expandible y funciona con JavaScript deshabilitado.
 *
 * Coste: cero kilobytes y cero dependencias, contra los ~15-20 KB de un diálogo.
 * Con 50 KB de margen en el presupuesto, no era una decisión difícil.
 *
 * En móvil se ancla abajo, que es donde llega el pulgar.
 */
export function FilterSheet({
  activos = 0,
  resumen,
  acciones,
  abiertoPorDefecto = false,
  className,
  children,
}: {
  /** Cuántos filtros hay puestos. Se muestra en la pastilla. */
  activos?: number;
  /** Línea corta bajo el título, ej. "6 negocios". */
  resumen?: string;
  /** Pie del panel: limpiar y aplicar. */
  acciones?: ReactNode;
  abiertoPorDefecto?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <details
      open={abiertoPorDefecto}
      className={cn(
        "group border-t border-border-subtle bg-surface-overlay",
        "sm:rounded-surface sm:border",
        className,
      )}
    >
      <summary
        className={cn(
          "flex h-control-md cursor-pointer list-none items-center gap-icon-gap px-gutter",
          "text-body-md font-semibold text-content-primary",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        <Filter className="size-icon-md" aria-hidden />
        <span className="flex-1">Filtros</span>
        {activos > 0 ? (
          <span className="inline-flex size-icon-lg items-center justify-center rounded-full bg-action-primary text-caption font-semibold text-action-primary-content">
            {activos}
          </span>
        ) : null}
        <ChevronDown
          className="size-icon-md transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden
        />
      </summary>

      <Stack gap="default" className="px-gutter pb-inset-lg pt-inset-md">
        {resumen ? (
          <Text size="body-sm" tone="tertiary">
            {resumen}
          </Text>
        ) : null}
        {children}
        {acciones ? (
          <Inline
            gap="sm"
            justify="between"
            wrap={false}
            className="border-t border-border-subtle pt-inset-md"
          >
            {acciones}
          </Inline>
        ) : null}
      </Stack>
    </details>
  );
}

/** Un grupo dentro del panel: la etiqueta y sus chips. */
export function FilterGroup({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <Stack gap="tight" as="section">
      <Text size="label" weight="medium">
        {etiqueta}
      </Text>
      <Inline gap="sm">{children}</Inline>
    </Stack>
  );
}
