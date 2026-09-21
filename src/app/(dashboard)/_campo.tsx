import type { ReactNode } from "react";

import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";

/**
 * Etiqueta, control y ayuda. La ayuda no es opcional: cada campo dice para qué
 * sirve, porque quien lo rellena nunca ha usado un panel y no obedece una
 * instrucción sin razón — y tiene toda la razón en no obedecerla.
 *
 * Vivía suelto dentro de `dashboard/negocio/page.tsx`. Lo necesitan tres
 * pantallas, y duplicar un patrón de etiqueta es exactamente como se degrada el
 * marcado accesible: la tercera copia es la que se olvida del `htmlFor`.
 *
 * La ayuda lleva el id `${id}-ayuda` para que el control la referencie con
 * `describedBy`. Quien use este componente tiene que pasarlo: la etiqueta la
 * ata `htmlFor`, pero la ayuda no se ata sola.
 */
export function Campo({
  id,
  etiqueta,
  ayuda,
  children,
}: {
  id: string;
  etiqueta: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <Stack gap="tight">
      <Text as="label" htmlFor={id} size="label" weight="medium">
        {etiqueta}
      </Text>
      {children}
      {ayuda ? (
        <Text id={`${id}-ayuda`} size="caption" tone="tertiary">
          {ayuda}
        </Text>
      ) : null}
    </Stack>
  );
}
