import type { ReactNode } from "react";

import type { LucideIcon } from "@/components/icons";
import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Un vacío nunca es un texto gris centrado. Dice qué pasó, por qué, y ofrece la
 * siguiente acción — porque el visitante que llega a un vacío está a un paso de
 * cerrar la aplicación.
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
      className={cn("px-inset-xl py-section text-center", className)}
    >
      <Icono className="size-icon-xl text-content-tertiary" aria-hidden />
      <Stack gap="tight" align="center">
        <Text as="h2" size="heading-sm" weight="semibold">
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
