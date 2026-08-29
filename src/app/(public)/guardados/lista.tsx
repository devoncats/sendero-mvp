"use client";

import Link from "next/link";

import { Bookmark } from "@/components/icons";
import { Stack } from "@/components/layout";
import { BusinessCard, EmptyState, type NegocioResumen, useGuardados } from "@/components/patterns";
import { Text, clasesDeBoton } from "@/components/ui";

/**
 * Recibe los resúmenes de los treinta negocios desde el servidor y muestra los
 * que estén guardados. Se hace así, y no importando `data` en el cliente,
 * porque las descripciones completas de los treinta pesarían de más: el
 * resumen son cinco cadenas por negocio.
 */
export function ListaGuardados({ negocios }: { negocios: (NegocioResumen & { slug: string })[] }) {
  const guardados = useGuardados();
  const mios = negocios.filter((n) => guardados.includes(n.slug));

  if (mios.length === 0) {
    return (
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
    );
  }

  return (
    <Stack>
      <Text size="body-sm" tone="tertiary">
        {mios.length} {mios.length === 1 ? "negocio" : "negocios"} · se quedan aquí aunque estés sin
        señal
      </Text>
      <Stack as="ul">
        {mios.map((n) => (
          <li key={n.slug}>
            <BusinessCard negocio={n} />
          </li>
        ))}
      </Stack>
    </Stack>
  );
}
