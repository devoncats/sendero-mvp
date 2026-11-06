import type { ReactNode } from "react";

import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * La cabecera de una sección del portal.
 *
 * Los seis `<h2>` del portal eran todos `heading-sm` sans — 1,25 rem, el mismo
 * cuerpo que el logotipo y casi el mismo que el nombre de un negocio. Leída de
 * lejos, la página no tenía secciones: tenía párrafos de distinto largo.
 *
 * Aquí se junta lo que las separa: el filete que abre, la versalita que dice de
 * qué va y el titular en serif que lo cuenta. Es la tipografía de una revista y
 * no cuesta un byte de JavaScript.
 *
 * El serif es deliberado y es **solo del portal**: este componente no se usa en
 * el dashboard ni debe usarse.
 */
export function EncabezadoSeccion({
  kicker,
  children,
  as = "h2",
  className,
}: {
  /** Dos palabras en versalita. Dice la categoría, no repite el titular. */
  kicker: string;
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Stack gap="tight" className={cn("border-t border-border-subtle pt-inset-md", className)}>
      <Text size="overline" tone="tertiary">
        {kicker}
      </Text>
      <Text as={as} size="heading-md" serif weight="semibold" className="text-balance">
        {children}
      </Text>
    </Stack>
  );
}
