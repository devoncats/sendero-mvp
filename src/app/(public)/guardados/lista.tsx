"use client";

import Link from "next/link";

import { Bookmark, Ruta } from "@/components/icons";
import { Grid, Inline, Stack } from "@/components/layout";
import {
  BusinessCard,
  EmptyState,
  type NegocioResumen,
  useGuardados,
  useRutaGuardada,
} from "@/components/patterns";
import { Surface, Text, clasesDeBoton } from "@/components/ui";

/**
 * La ruta guardada va encima de los negocios: es un plan con fecha y hora, y
 * los negocios sueltos son consulta. Solo cabe una a la vez.
 */
function RutaGuardadaCard() {
  const ruta = useRutaGuardada();
  if (!ruta) return null;

  return (
    <Surface relleno="lg">
      <Stack gap="default">
        <Inline gap="icon" align="center">
          <Ruta className="size-icon-md shrink-0 text-brand" aria-hidden />
          <Text as="h2" size="heading-sm" weight="semibold">
            {ruta.titulo}
          </Text>
        </Inline>
        <Text size="body-sm" tone="secondary">
          {ruta.paradas} {ruta.paradas === 1 ? "parada" : "paradas"} · se abre aunque no tengas
          señal
        </Text>
        <Link href={ruta.href} className={clasesDeBoton({ variante: "secondary" })}>
          Abrir la ruta
        </Link>
      </Stack>
    </Surface>
  );
}

/**
 * Recibe los resúmenes de los treinta negocios desde el servidor y muestra los
 * que estén guardados. Se hace así, y no importando `data` en el cliente,
 * porque las descripciones completas de los treinta pesarían de más: el
 * resumen son cinco cadenas por negocio.
 */
export function ListaGuardados({ negocios }: { negocios: (NegocioResumen & { slug: string })[] }) {
  const guardados = useGuardados();
  const mios = negocios.filter((n) => guardados.includes(n.slug));

  return (
    <Stack gap="loose">
      <RutaGuardadaCard />

      {mios.length === 0 ? (
        <EmptyState
          icono={Bookmark}
          titulo="Guarda antes de perder la señal"
          descripcion="En la montaña y en las islas casi no hay datos. Lo que guardes se queda en este teléfono, con su teléfono y su dirección."
          accion={
            <Link href="/" className={clasesDeBoton({})}>
              Explorar zonas
            </Link>
          }
        />
      ) : (
        <Stack>
          <Text size="body-sm" tone="tertiary">
            {mios.length} {mios.length === 1 ? "negocio" : "negocios"} · se quedan aquí aunque estés
            sin señal
          </Text>
          <Grid cols={3} movil={1} gap="lg" as="ul">
            {mios.map((n) => (
              <li key={n.slug}>
                <BusinessCard negocio={n} orientacion="auto" />
              </li>
            ))}
          </Grid>
        </Stack>
      )}
    </Stack>
  );
}
