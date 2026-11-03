import type { ReactNode } from "react";

import { AlertTriangle, CheckCircle, Info } from "@/components/icons";
import { Inline, Stack } from "@/components/layout";
import { Badge, Surface, Text } from "@/components/ui";
import type { EstadoSolicitud } from "@/data";
import type { NivelSalud } from "@/lib/salud";
import { ETIQUETA_SALUD } from "@/lib/salud";

/**
 * Las piezas que repiten las pantallas del panel de la cooperativa. Solo del
 * dashboard: densidad operacional, sin serif, y nada que el portal deba usar.
 */

export const TH =
  "border-b border-border-subtle px-inset-sm py-inset-sm text-left text-overline uppercase text-content-tertiary font-semibold";
export const TD = "border-b border-border-subtle px-inset-sm py-inset-sm text-body-md align-top";
export const NUM = "text-right tabular-nums";

/** El título de una pantalla y una línea que dice de qué va. */
export function Cabecera({ titulo, apunte, children }: { titulo: string; apunte?: ReactNode; children?: ReactNode }) {
  return (
    <Inline justify="between" align="end" gap="md">
      <Stack gap="tight">
        <Text as="h1" size="heading-md" weight="semibold">
          {titulo}
        </Text>
        {apunte ? (
          <Text size="body-sm" tone="tertiary">
            {apunte}
          </Text>
        ) : null}
      </Stack>
      {children}
    </Inline>
  );
}

export function Tarjeta({
  titulo,
  apunte,
  children,
  className,
}: {
  titulo: string;
  apunte?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Surface relleno="md" as="section" className={className}>
      <Inline justify="between" align="baseline" gap="sm" className="mb-inset-md">
        <Text as="h2" size="body-md" weight="semibold">
          {titulo}
        </Text>
        {apunte ? (
          <Text as="span" size="caption" tone="tertiary">
            {apunte}
          </Text>
        ) : null}
      </Inline>
      {children}
    </Surface>
  );
}

/** Una cifra con su nota. Sin delta: aquí lo que importa es el valor y qué dice. */
export function Cifra({
  etiqueta,
  valor,
  nota,
  tono,
}: {
  etiqueta: string;
  valor: string | number;
  nota?: string;
  tono?: "warning" | "danger" | "success";
}) {
  return (
    <Surface relleno="md" as="li">
      <Text size="overline" tone="tertiary">
        {etiqueta}
      </Text>
      <Text size="heading-lg" weight="semibold" tone={tono ?? "primary"} className="mt-inset-xs tabular-nums">
        {valor}
      </Text>
      {nota ? (
        <Text size="caption" tone="tertiary" className="mt-inset-xs">
          {nota}
        </Text>
      ) : null}
    </Surface>
  );
}

/**
 * El semáforo. Nunca solo color: lleva icono y palabra, y la palabra de
 * «riesgo» es «necesita apoyo», no «quiebra».
 */
export function Semaforo({ nivel }: { nivel: NivelSalud }) {
  if (nivel === "estable") {
    return (
      <Badge tono="success">
        <CheckCircle className="size-icon-sm" aria-hidden />
        {ETIQUETA_SALUD.estable}
      </Badge>
    );
  }
  return (
    <Badge tono={nivel === "riesgo" ? "danger" : "warning"}>
      <AlertTriangle className="size-icon-sm" aria-hidden />
      {ETIQUETA_SALUD[nivel]}
    </Badge>
  );
}

const ESTADO: Record<EstadoSolicitud, { etiqueta: string; tono: "info" | "brand" | "success" | "neutral" | "warning" }> = {
  nueva: { etiqueta: "Nueva", tono: "warning" },
  confirmada: { etiqueta: "Confirmada", tono: "brand" },
  repartida: { etiqueta: "Repartida", tono: "success" },
  atendida: { etiqueta: "Atendida", tono: "neutral" },
  cancelada: { etiqueta: "Cancelada", tono: "neutral" },
};

export function EstadoBadge({ estado }: { estado: EstadoSolicitud }) {
  const e = ESTADO[estado];
  return <Badge tono={e.tono}>{e.etiqueta}</Badge>;
}

/** Una nota en voz baja dentro de una pantalla: qué significa lo que se ve. */
export function Nota({ children }: { children: ReactNode }) {
  return (
    <Inline gap="icon" align="start" wrap={false}>
      <Info className="size-icon-sm mt-0.5 shrink-0 text-content-tertiary" aria-hidden />
      <Text size="caption" tone="tertiary">
        {children}
      </Text>
    </Inline>
  );
}
