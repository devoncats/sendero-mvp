import type { ReactNode } from "react";

import type { LucideIcon } from "@/components/icons";
import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Un vacío nunca es un texto gris centrado. Dice qué pasó, por qué, y ofrece la
 * siguiente acción — porque el visitante que llega a un vacío está a un paso de
 * cerrar la aplicación.
 *
 * El copy ya cumplía esa promesa; los píxeles no. Eran un icono gris de 32 px
 * sobre blanco: exactamente el texto gris centrado que este archivo dice que no
 * hay que hacer. El disco de marca y el borde discontinuo lo convierten en un
 * sitio al que se ha llegado, y no en una pantalla a medio cargar.
 */
export function EmptyState({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  className,
}: {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
}) {
  return (
    <Stack
      gap="default"
      align="center"
      className={cn(
        "rounded-surface border border-dashed border-border-default px-inset-xl py-section text-center",
        className,
      )}
    >
      <span
        className="flex size-avatar-lg items-center justify-center rounded-full bg-brand-surface text-brand"
        aria-hidden
      >
        <Icono className="size-icon-lg" />
      </span>
      <Stack gap="tight" align="center">
        {/* Sin `serif`: este patrón también lo usa el límite de error del panel,
            y en el dashboard el serif no entra nunca. */}
        <Text as="h2" size="heading-md" weight="semibold">
          {titulo}
        </Text>
        {descripcion ? (
          <Text size="body-md" tone="secondary" className="max-w-prose">
            {descripcion}
          </Text>
        ) : null}
      </Stack>
      {accion}
    </Stack>
  );
}
