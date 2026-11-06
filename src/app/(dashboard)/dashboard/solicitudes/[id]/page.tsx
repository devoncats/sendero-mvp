import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AlertTriangle, ArrowLeft, MessageCircle } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { ButtonLink, Surface, Text } from "@/components/ui";
import { negocioPorSlug, personas } from "@/data";
import { cn } from "@/lib/cn";
import { enlaceWhatsApp, fechaConDia, fechaLarga, hora, precio } from "@/lib/formato";
import { abreEseDia, aviso, porEmprendimiento, sugerencia } from "@/lib/reparto";

import { AvisoMvp } from "../../../_aviso-mvp";
import { nivelDe, solicitud, tareasDe } from "../../../_cooperativa";
import { Cabecera, EstadoBadge, NUM, Semaforo, TD, TH, Tarjeta } from "../../../_piezas";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = solicitud((await params).id);
  return { title: r ? `Solicitud de ${r.s.nombre}` : "Solicitud" };
}

/**
 * Una solicitud, convertida en trabajo para cada familia.
 *
 * Esto es el «asistente administrativo» del PO: la cooperativa recibe un solo
 * mensaje del visitante y aquí lo ve repartido —quién atiende qué, cuántos le
 * llegan, cuánto le toca— con el aviso para cada familia ya escrito y a un
 * toque de WhatsApp.
 *
 * Antes de eso, dos cosas que no se pueden pasar por alto:
 *
 * - Los conflictos: un día en que alguien del recorrido no abre.
 * - Las sugerencias: un bloque que puede atender otra familia que necesita
 *   apoyo. Es donde la alerta de riesgo se vuelve acción.
 */
export default async function SolicitudPage({ params }: { params: Promise<{ id: string }> }) {
  const r = solicitud((await params).id);
  if (!r) notFound();
  const { s, e } = r;

  const tareas = tareasDe(s, e);
  const conflictos = tareas.filter((t) => t.conflicto);
  const sugerencias = e.bloques
    .map((b, i) => ({
      b,
      i,
      sug: s.asignaciones?.[i]
        ? undefined
        : sugerencia(b, nivelDe, (slug) => {
            const n = negocioPorSlug(slug);
            return Boolean(n && abreEseDia(n, s.fecha, b.dia));
          }),
    }))
    .filter((x) => x.sug);
  const grupos = porEmprendimiento(tareas);
  const total = grupos.reduce((t, g) => t + g.monto, 0);
  const activa = s.estado !== "atendida" && s.estado !== "cancelada";

  return (
    <Container ancho="md" as="main" className="py-stack lg:max-w-page-lg">
      <Stack gap="default">
        <Link
          href="/dashboard/solicitudes"
          className="inline-flex min-h-control-md items-center gap-icon-gap self-start text-body-sm font-medium text-brand"
        >
          <ArrowLeft className="size-icon-sm" aria-hidden />
          Solicitudes
        </Link>

        <Cabecera
          titulo={s.nombre}
          apunte={
            <>
              <span className="first-letter:uppercase">{fechaConDia(s.fecha)}</span> · {s.adultos} adultos
              {s.ninos > 0 ? ` y ${s.ninos} niños` : ""} · {s.procedencia} · {s.idioma}
            </>
          }
        >
          <EstadoBadge estado={s.estado} />
        </Cabecera>

        {s.nota ? (
          <Surface nivel="sunken" relleno="md"  borde={false}>
            <Text size="overline" tone="tertiary">
              Nota del grupo
            </Text>
            <Text size="body-md">{s.nota}</Text>
          </Surface>
        ) : null}

        {activa && conflictos.length > 0 ? (
          <Surface nivel="none" relleno="md" className="border-warning-border bg-warning-surface" as="section">
            <Inline gap="md" align="start" wrap={false}>
              <AlertTriangle className="size-icon-md shrink-0 text-warning-content" aria-hidden />
              <Stack gap="tight">
                <Text as="h2" size="body-md" weight="semibold" tone="warning">
                  Antes de confirmar: {conflictos.length === 1 ? "una parada no abre" : `${conflictos.length} paradas no abren`}
                </Text>
                <ul className="grid gap-inset-xs">
                  {conflictos.map((t) => (
                    <li key={t.indice} className="text-body-sm text-warning-content">
                      <span className="first-letter:uppercase">{fechaConDia(t.fecha)}</span>, {hora(t.bloque.hora)}: {t.conflicto}{" "}
                      <a
                        href={enlaceWhatsApp(
                          t.negocio.whatsapp,
                          `Hola, ${t.negocio.persona.nombre.split(" ")[0]}. Le escribe la cooperativa. Tenemos un grupo de ${personas(s)} personas el ${fechaConDia(t.fecha)}. ¿Podría abrir ese día a las ${hora(t.bloque.hora)}?`,
                        )}
                        rel="noopener noreferrer"
                        className="font-semibold underline"
                      >
                        Preguntarle si puede abrir
                      </a>
                    </li>
                  ))}
                </ul>
              </Stack>
            </Inline>
          </Surface>
        ) : null}

        {activa && sugerencias.length > 0 ? (
          <Tarjeta titulo="Para repartir mejor">
            <ul className="grid gap-inset-md">
              {sugerencias.map(({ b, sug }) => {
                const titular = negocioPorSlug(b.emprendimiento)!;
                const otro = negocioPorSlug(sug!.slug)!;
                return (
                  <li key={`${b.dia}-${b.hora}`}>
                    <Stack gap="tight">
                      <Text size="body-md">
                        <strong className="font-semibold">{b.actividad.es}</strong> (día {b.dia}): lo
                        atiende {titular.nombre}, pero también puede {otro.nombre}.
                      </Text>
                      <Inline gap="sm" align="center">
                        <Semaforo nivel={nivelDe(otro.slug)} />
                        <Text as="span" size="body-sm" tone="secondary">
                          {sug!.porque}
                        </Text>
                      </Inline>
                    </Stack>
                  </li>
                );
              })}
            </ul>
          </Tarjeta>
        ) : null}

        {/* El reparto: quién atiende qué */}
        <Tarjeta titulo="El reparto" apunte={`${personas(s)} personas · ${precio(total)} en total`}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={TH}>
                  Cuándo
                </th>
                <th scope="col" className={TH}>
                  Qué y quién
                </th>
                <th scope="col" className={cn(TH, NUM)}>
                  Le toca
                </th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.indice}>
                  <td className={cn(TD, "whitespace-nowrap")}>
                    <span className="block">Día {t.bloque.dia}</span>
                    <span className="block text-body-sm text-content-tertiary">{hora(t.bloque.hora)}</span>
                  </td>
                  <td className={TD}>
                    <span className="block">{t.bloque.actividad.es}</span>
                    <span className="block text-body-sm text-content-tertiary">
                      {t.negocio.nombre}
                      {s.asignaciones?.[t.indice] ? " · elegida por la cooperativa" : ""}
                    </span>
                    {t.conflicto && activa ? (
                      <span className="mt-inset-xs flex items-center gap-icon-gap text-body-sm text-warning-content">
                        <AlertTriangle className="size-icon-sm shrink-0" aria-hidden />
                        No abre ese día
                      </span>
                    ) : null}
                  </td>
                  <td className={cn(TD, NUM)}>{precio(t.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>

        {/* Los avisos: uno por familia, ya escritos */}
        {activa ? (
          <Tarjeta titulo="Avisar a cada familia" apunte="Un mensaje por familia, con todo lo que necesita">
            <ul className="grid gap-inset-sm">
              {grupos.map((g) => (
                <li key={g.negocio.slug}>
                  <Inline justify="between" align="center" gap="md" className="rounded-control border border-border-subtle p-inset-sm">
                    <Stack gap="none" className="min-w-0 flex-1">
                      <Text size="body-md" weight="semibold">
                        {g.negocio.persona.nombre}
                      </Text>
                      <Text size="body-sm" tone="tertiary">
                        {g.negocio.nombre} · {g.tareas.length === 1 ? "un momento" : `${g.tareas.length} momentos`} · {precio(g.monto)}
                      </Text>
                    </Stack>
                    <ButtonLink
                      href={enlaceWhatsApp(g.negocio.whatsapp, aviso(s, g))}
                      externo
                      variante="secondary"
                      tamano="sm"
                    >
                      <MessageCircle className="size-icon-sm" aria-hidden />
                      Avisar
                    </ButtonLink>
                  </Inline>
                </li>
              ))}
            </ul>
          </Tarjeta>
        ) : null}

        <AvisoMvp>
          Confirmar, repartir o cancelar todavía no cambia el estado de la solicitud: no hay servidor
          donde guardarlo. Los avisos de WhatsApp sí salen de verdad. Recibida el {fechaLarga(s.recibida)}.
        </AvisoMvp>
      </Stack>
    </Container>
  );
}
