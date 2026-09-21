import type { Metadata } from "next";
import Link from "next/link";

import { WifiOff } from "@/components/icons";
import { Container, Stack } from "@/components/layout";
import { EmptyState } from "@/components/patterns";
import { Text, clasesDeBoton } from "@/components/ui";

/**
 * Lo que se ve cuando no hay red y la página pedida no está guardada.
 *
 * Server Component, cero JavaScript propio, y el service worker la precachea al
 * instalarse para que esté ahí cuando haga falta — que es justo cuando no se
 * puede ir a buscarla.
 *
 * Dice **qué sí funciona**, no qué falló. «Error de red» no le sirve de nada a
 * alguien que ya sabe que no tiene señal; saber que lo que guardó sigue en el
 * teléfono, sí.
 */
export const metadata: Metadata = {
  title: "Sin señal",
  robots: { index: false },
};

export default function SinConexionPage() {
  return (
    <Container ancho="sm" as="main">
      <Stack gap="loose" className="py-stack">
        <EmptyState
          icono={WifiOff}
          titulo="Sin señal"
          descripcion="Esta página no la tienes descargada. Lo que guardaste sí sigue en este teléfono, con su horario y su teléfono."
          accion={
            <Stack gap="default" align="center">
              <Link href="/guardados" className={clasesDeBoton({})}>
                Ver lo que guardé
              </Link>
              <Link href="/" className={clasesDeBoton({ variante: "ghost" })}>
                Ir al inicio
              </Link>
            </Stack>
          }
        />
        <Text size="caption" tone="tertiary" className="text-center">
          En cuanto vuelva la señal, esta página carga sola al recargar.
        </Text>
      </Stack>
    </Container>
  );
}
