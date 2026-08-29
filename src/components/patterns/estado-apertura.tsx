"use client";

// "use client" justificado: es el único dato de la ficha que depende del reloj
// del visitante. La página es estática, así que calcularlo en el servidor lo
// congelaría en el momento del build y diría "abierto" a las tres de la mañana.
//
// Degrada bien: sin JavaScript el horario completo de la semana sigue ahí, que
// es la información que de verdad importa. Esto solo la resume.

import { useSyncExternalStore } from "react";

import { AlertCircle, Clock } from "@/components/icons";
import { Inline } from "@/components/layout";
import { Badge, Text } from "@/components/ui";
import type { Semana } from "@/data/tipos";
import { apertura } from "@/lib/formato";

/**
 * El minuto actual, o `null` en el servidor. `useSyncExternalStore` es la vía
 * correcta para leer algo que solo existe en el cliente: no hay `setState`
 * dentro de un efecto ni el renderizado en cascada que eso provoca.
 *
 * Sin suscripción a propósito: basta con leerlo al hidratar. Un temporizador
 * que despierte cada minuto costaría batería a cambio de nada — nadie mira una
 * ficha esperando a que el negocio cierre delante de sus ojos.
 */
const sinSuscripcion = () => () => {};
const minutoActual = () => Math.floor(Date.now() / 60_000);
const enElServidor = () => null;

export function EstadoApertura({ semana }: { semana: Semana }) {
  const minuto = useSyncExternalStore(sinSuscripcion, minutoActual, enElServidor);

  // Antes de hidratar se reserva la altura, para que nada salte al aparecer.
  if (minuto === null) return <div className="min-h-icon-lg" aria-hidden />;

  const estado = apertura(semana, new Date(minuto * 60_000));

  if (estado.estado === "sinConfirmar") {
    return (
      <Inline gap="icon" className="min-h-icon-lg">
        <Badge tono="desactualizado">
          <AlertCircle className="size-icon-sm" aria-hidden />
          Horario sin confirmar
        </Badge>
      </Inline>
    );
  }

  if (estado.estado === "abierto") {
    return (
      <Inline gap="icon" className="min-h-icon-lg">
        <Badge tono="success">Abierto ahora</Badge>
        <Text size="body-sm" tone="tertiary">
          cierra a las {estado.cierraA}
        </Text>
      </Inline>
    );
  }

  return (
    <Inline gap="icon" className="min-h-icon-lg">
      <Clock className="size-icon-sm text-content-tertiary" aria-hidden />
      <Text size="body-sm" tone="tertiary">
        {estado.abreA ? `Cerrado ahora · abre a las ${estado.abreA}` : "Cerrado ahora"}
      </Text>
    </Inline>
  );
}
