import type { Metadata } from "next";
import Link from "next/link";

import { AlertTriangle, ChevronRight, Solicitud as IconoSolicitud } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { EmptyState } from "@/components/patterns";
import { Surface, Text } from "@/components/ui";
import type { EstadoSolicitud, Solicitud } from "@/data";
import { experiencia, personas } from "@/data";
import { fechaConDia } from "@/lib/formato";

import { solicitudesDeLaCooperativa, tareasDe } from "../../_cooperativa";
import { Cabecera, EstadoBadge } from "../../_piezas";

export const metadata: Metadata = { title: "Solicitudes" };

/**
 * Las solicitudes, por lo que falta hacer con ellas.
 *
 * Un grupo por estado y en el orden en que se trabajan: primero lo que espera
 * respuesta, luego lo confirmado que falta avisar, luego lo ya repartido. Lo
 * atendido y lo cancelado es historial y va plegado en un `<details>`, que es
 * accesible por teclado y cuesta cero JavaScript.
 */

const GRUPOS: { estado: EstadoSolicitud; titulo: string; vacio: string }[] = [
  { estado: "nueva", titulo: "Esperan respuesta", vacio: "Nadie espera respuesta." },
  { estado: "confirmada", titulo: "Confirmadas, falta avisar a las familias", vacio: "Todo lo confirmado ya está repartido." },
  { estado: "repartida", titulo: "Repartidas", vacio: "No hay grupos repartidos por delante." },
];

function Fila({ s }: { s: Solicitud }) {
  const conflictos = tareasDe(s, experiencia(s.experiencia)!).filter((t) => t.conflicto).length;
  return (
    <li>
      <Link
        href={`/dashboard/solicitudes/${s.id}`}
        className="flex min-h-control-lg items-center gap-inset-md px-inset-md py-inset-sm hover:bg-action-secondary-hover"
      >
        <Stack gap="none" className="min-w-0 flex-1">
          <Inline gap="sm" align="center">
            <Text as="span" size="body-md" weight="semibold">
              {s.nombre}
            </Text>
            <EstadoBadge estado={s.estado} />
          </Inline>
          <Text as="span" size="body-sm" tone="tertiary" className="first-letter:uppercase">
            {fechaConDia(s.fecha)} · {personas(s)} personas · {s.procedencia}
          </Text>
          {conflictos > 0 && s.estado !== "atendida" && s.estado !== "cancelada" ? (
            <Inline gap="icon" align="center" className="mt-inset-xs text-warning-content">
              <AlertTriangle className="size-icon-sm shrink-0" aria-hidden />
              <Text as="span" size="body-sm" tone="warning">
                {conflictos === 1 ? "Una parada no abre ese día" : `${conflictos} paradas no abren ese día`}
              </Text>
            </Inline>
          ) : null}
        </Stack>
        <ChevronRight className="size-icon-sm shrink-0 text-content-tertiary" aria-hidden />
      </Link>
    </li>
  );
}

export default function SolicitudesPage() {
  const todas = solicitudesDeLaCooperativa().sort((a, b) => a.fecha.localeCompare(b.fecha));
  const historial = todas.filter((s) => s.estado === "atendida" || s.estado === "cancelada").reverse();

  if (todas.length === 0) {
    return (
      <Container ancho="md" as="main" className="py-section">
        <EmptyState
          icono={IconoSolicitud}
          titulo="Todavía no ha llegado ninguna solicitud"
          descripcion="Cuando un visitante pida la experiencia desde el portal, aparecerá aquí para que la confirmes y la repartas."
        />
      </Container>
    );
  }

  return (
    <Container ancho="md" as="main" className="py-stack lg:max-w-page-lg">
      <Stack gap="default">
        <Cabecera titulo="Solicitudes" apunte="Lo que mandan los visitantes desde el portal" />

        {GRUPOS.map((g) => {
          const lista = todas.filter((s) => s.estado === g.estado);
          return (
            <Stack key={g.estado} gap="tight" as="section">
              <Text as="h2" size="overline" tone="tertiary">
                {g.titulo} · {lista.length}
              </Text>
              {lista.length > 0 ? (
                <Surface relleno="none" className="overflow-hidden">
                  <ul className="divide-y divide-border-subtle">
                    {lista.map((s) => (
                      <Fila key={s.id} s={s} />
                    ))}
                  </ul>
                </Surface>
              ) : (
                <Text size="body-sm" tone="tertiary">
                  {g.vacio}
                </Text>
              )}
            </Stack>
          );
        })}

        <details className="group">
          <summary className="flex min-h-control-md cursor-pointer items-center gap-icon-gap text-overline uppercase text-content-tertiary">
            <ChevronRight className="size-icon-sm transition-transform group-open:rotate-90 motion-reduce:transition-none" aria-hidden />
            Historial · {historial.length}
          </summary>
          <Surface relleno="none" className="mt-inset-sm overflow-hidden">
            <ul className="divide-y divide-border-subtle">
              {historial.map((s) => (
                <Fila key={s.id} s={s} />
              ))}
            </ul>
          </Surface>
        </details>
      </Stack>
    </Container>
  );
}
