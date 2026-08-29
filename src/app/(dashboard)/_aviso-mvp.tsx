import type { ReactNode } from "react";

import { Info } from "@/components/icons";
import { Inline, Stack } from "@/components/layout";
import { Surface, Text } from "@/components/ui";

/**
 * El aviso de que nada se guarda todavía.
 *
 * Aparece en las cuatro pantallas del dashboard que tienen controles. Es una
 * decisión de producto, no un detalle: sin servidor, una barra que diga
 * «guardado hace un momento» sería mentira. Los controles funcionan de verdad
 * —son nativos— para que se vea cómo se sentirá, y este aviso pone el contrato
 * de la página entera.
 *
 * El día que haya backend, se borra este componente y sus cuatro usos.
 */
export function AvisoMvp({ children }: { children: ReactNode }) {
  return (
    <Surface relleno="lg" radio="control" className="border-info-border bg-info-surface">
      <Inline gap="md" align="start" wrap={false}>
        <Info className="size-icon-md shrink-0 text-info" aria-hidden />
        <Stack gap="tight">
          <Text size="body-md" className="text-info-content">
            {children}
          </Text>
        </Stack>
      </Inline>
    </Surface>
  );
}
