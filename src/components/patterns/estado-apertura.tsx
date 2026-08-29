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

  /*
   * El hueco reservado es el mismo marcado, solo que invisible.
   *
   * Antes era un div con `min-h-icon-lg`, una altura adivinada a ojo: 24 px
   * contra los 35 que mide de verdad la pastilla con su relleno. Eran 11 px de
   * salto en las treinta fichas, cada vez que hidrataba. Adivinar la altura de
   * algo que ya sabes dibujar no tiene sentido — se dibuja y se esconde.
   */
  if (minuto === null) {
    return (
      <Inline gap="icon" className="invisible" aria-hidden>
        <Badge tono="success">Abierto ahora</Badge>
      </Inline>
    );
  }

  const estado = apertura(semana, new Date(minuto * 60_000));

  if (estado.estado === "sinConfirmar") {
    return (
      <Inline gap="icon">
        <Badge tono="desactualizado">
          <AlertCircle className="size-icon-sm" aria-hidden />
          Horario sin confirmar
        </Badge>
      </Inline>
    );
  }

  if (estado.estado === "abierto") {
    return (
      <Inline gap="icon">
        <Badge tono="success">Abierto ahora</Badge>
        <Text size="body-sm" tone="tertiary">
          cierra a las {estado.cierraA}
        </Text>
      </Inline>
    );
  }

  /*
   * También pastilla, y no icono suelto con texto: los cuatro estados tienen
   * que medir lo mismo o el salto vuelve por otra puerta. Que la altura la fije
   * la estructura, y no un número que alguien tiene que acordarse de mantener.
   */
  return (
    <Inline gap="icon">
      <Badge tono="neutral">
        <Clock className="size-icon-sm" aria-hidden />
        Cerrado ahora
      </Badge>
      {estado.abreA ? (
        <Text size="body-sm" tone="tertiary">
          abre a las {estado.abreA}
        </Text>
      ) : null}
    </Inline>
  );
}
