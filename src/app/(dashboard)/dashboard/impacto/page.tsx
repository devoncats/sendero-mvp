import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import { modoPanel } from "@/lib/modo-panel";

import { AvisoMvp } from "../../_aviso-mvp";
import { cooperativa } from "../../_cooperativa";
import { Cabecera, Tarjeta } from "../../_piezas";

export const metadata: Metadata = { title: "Huella de carbono" };

/**
 * El impacto ambiental de las experiencias del ente: lo que emiten, la energía
 * que gastan y el riesgo climático al que están expuestas.
 *
 * Es solo del modo experto. La barra lateral ya solo existe ahí, pero la
 * dirección se puede escribir a mano: en guiado se vuelve a la portada, que
 * es lo que ese modo promete —una sola cosa que hacer—, en vez de abrir una
 * pantalla de cifras que nadie pidió.
 *
 * Todavía no hay datos: el equipo los está recogiendo, y el backend se
 * diseñará después. Cada tarjeta dice qué va a mostrar y por qué está vacía.
 */
export default async function ImpactoPage() {
  if ((await modoPanel()) !== "experto") redirect("/dashboard");

  const { coop } = await cooperativa();

  return (
    <main className="p-gutter">
      <Stack gap="default">
        <Cabecera titulo="Huella de carbono" apunte={coop.nombre} />

        <AvisoMvp>
          Esta sección todavía no tiene cifras: los datos de las familias se están recogiendo. Cuando
          lleguen, se calcularán con un método publicado y cada número dirá de dónde sale.
        </AvisoMvp>

        <div className="grid items-start gap-inset-md lg:grid-cols-3">
          <Tarjeta titulo="Emisiones" apunte="alcances 1, 2 y 3">
            <Text size="body-sm" tone="tertiary">
              Aquí irán las emisiones de gases de efecto invernadero de la experiencia, separadas por
              alcance, en kilos de CO₂ equivalente por visitante.
            </Text>
          </Tarjeta>

          <Tarjeta titulo="Energía" apunte="consumo y ahorro">
            <Text size="body-sm" tone="tertiary">
              Aquí irá la energía que consumen las familias para atender a los grupos, y aparte la que
              se ahorra al coordinar el reparto desde el portal.
            </Text>
          </Tarjeta>

          <Tarjeta titulo="Riesgo climático" apunte="por emprendimiento">
            <Text size="body-sm" tone="tertiary">
              Aquí irá la exposición de cada parada del recorrido a inundaciones, calor y lluvias
              fuertes.
            </Text>
          </Tarjeta>
        </div>
      </Stack>
    </main>
  );
}
