import type { Metadata } from "next";
import Link from "next/link";

import { ChevronRight } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { Surface, Text } from "@/components/ui";
import { cuentasDe, delEnte } from "@/data";
import { precio } from "@/lib/formato";
import { ahoraEnPanama } from "@/lib/reloj";
import { resultado } from "@/lib/salud";

import { cooperativa } from "../../_cooperativa";
import { Cabecera, Nota, Semaforo } from "../../_piezas";

export const metadata: Metadata = { title: "Emprendimientos" };

/**
 * Las familias socias, las que necesitan apoyo primero.
 *
 * Una lista y no una tabla: en el teléfono de quien administra la cooperativa
 * cada fila tiene que caber entera, con su semáforo y su porqué, sin
 * desplazarse a lo ancho. La tabla con todas las cifras está en la portada del
 * modo experto, para quien la pidió.
 */
export default async function EmprendimientosPage() {
  const c = await cooperativa();
  const ahora = ahoraEnPanama();
  const lista = c.sociosPorSalud();

  return (
    <Container ancho="md" as="main" className="py-stack lg:max-w-page-lg">
      <Stack gap="default">
        <Cabecera titulo="Emprendimientos" apunte={`${lista.length} familias socias ${delEnte(c.coop)}`} />

        <Surface relleno="none" className="overflow-hidden">
          <ul className="divide-y divide-border-subtle">
            {lista.map(({ negocio, salud }) => {
              const m = cuentasDe(negocio.slug).at(-1);
              const tareas = c.porAtender(negocio.slug, ahora);
              const gente = tareas.reduce((t, x) => t + x.personas, 0);
              return (
                <li key={negocio.slug}>
                  <Link
                    href={`/dashboard/emprendimientos/${negocio.slug}`}
                    className="flex items-center gap-inset-md px-inset-md py-inset-sm hover:bg-action-secondary-hover"
                  >
                    <Stack gap="tight" className="min-w-0 flex-1">
                      <Inline gap="sm" align="center">
                        <Text as="span" size="body-md" weight="semibold">
                          {negocio.nombre}
                        </Text>
                        <Semaforo nivel={salud.nivel} />
                      </Inline>
                      <Text as="span" size="body-sm" tone="tertiary">
                        {negocio.persona.nombre} · {negocio.plazas ?? "—"} {negocio.unidadPlazas ?? "plazas"}
                        {m ? ` · el último mes ${resultado(m) >= 0 ? "le quedaron" : "perdió"} ${precio(Math.abs(resultado(m)))}` : ""}
                      </Text>
                      {salud.senales[0] ? (
                        <Text as="span" size="body-sm" tone={salud.nivel === "riesgo" ? "danger" : "warning"}>
                          {salud.senales[0].que}
                        </Text>
                      ) : null}
                      <Text as="span" size="body-sm" tone="secondary">
                        {gente > 0 ? `${gente} personas por atender en las próximas cuatro semanas` : "Nadie por atender en las próximas cuatro semanas"}
                      </Text>
                    </Stack>
                    <ChevronRight className="size-icon-sm shrink-0 text-content-tertiary" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Surface>

        <Nota>
          «Necesita apoyo» sale de las cuentas que reporta cada familia: poca caja, ventas que bajan
          tres meses seguidos, una deuda con un proveedor de más de un mes, o casi nada de ocupación.
          Con una de esas señales queda en atención; con dos, necesita apoyo.
        </Nota>
      </Stack>
    </Container>
  );
}
