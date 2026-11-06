import Link from "next/link";

import { Grid, Inline, Stack } from "@/components/layout";
import { Media, Surface, Text } from "@/components/ui";
import type { Experiencia, Negocio } from "@/data";
import { ente, negocioPorSlug, precioPorPersona, repartoDelPrecio, zona } from "@/data";
import { cn } from "@/lib/cn";
import { precio } from "@/lib/formato";

/**
 * Las piezas con que el portal dibuja una experiencia, sea cual sea.
 *
 * Una experiencia nueva no pide ni una línea de interfaz: entra en el
 * registro de `data/experiencias` y la portada, su página y la de su
 * comunidad la dibujan con esto. Si algún día una experiencia necesita una
 * pieza que estas no tienen, la pieza se añade aquí para todas — no se hace
 * una página a medida.
 */

/** La tarjeta de la portada. Toda la tarjeta es el enlace: lo que se elige es una tarjeta. */
export function TarjetaExperiencia({ e, prioridad = false }: { e: Experiencia; prioridad?: boolean }) {
  const z = zona(e.zona);
  const familias = repartoDelPrecio(e).length;
  return (
    <Link
      href={`/experiencia/${e.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-surface border border-border-subtle bg-surface",
        "transition-[border-color,box-shadow] motion-reduce:transition-none",
        "hover:border-border-default hover:shadow-card",
        "active:scale-press active:bg-action-secondary-hover",
      )}
    >
      <Media
        proporcion="16/9"
        radio="none"
        semilla={z.nombre}
        alt={`${z.nombre}, ${z.provincia}`}
        sizes="(min-width: 1024px) 580px, 100vw"
        prioridad={prioridad}
      />
      <Stack gap="tight" className="flex-1 p-inset-lg">
        <Text size="overline" tone="brand">
          {z.nombre} · {z.provincia}
        </Text>
        <Text
          as="h2"
          size="heading-md"
          serif
          weight="semibold"
          className="text-balance group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2"
        >
          {e.nombre}
        </Text>
        <Text size="body-md" tone="secondary">
          {e.lema.es}
        </Text>
        <Text size="body-sm" tone="tertiary" className="mt-auto pt-inset-sm">
          <strong className="font-semibold text-content-primary">{precio(precioPorPersona(e))} por persona</strong>{" "}
          · {e.dias} días, {e.noches === 1 ? "1 noche" : `${e.noches} noches`} · llega a {familias} familias
        </Text>
      </Stack>
    </Link>
  );
}

/**
 * A dónde va el dinero. Tabla de verdad —dos columnas que se leen por filas— y
 * no barras: un lector de pantalla la recorre, y la cifra exacta dice más que
 * una longitud.
 */
export function Derrame({ e }: { e: Experiencia }) {
  return (
    <Stack gap="tight">
      <Text size="overline" tone="tertiary">
        Por persona
      </Text>
      <table className="w-full overflow-hidden rounded-control bg-surface-sunken text-body-md">
        <caption className="sr-only">Cuánto recibe cada emprendimiento por cada visitante</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Quién</th>
            <th scope="col">Cuánto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {repartoDelPrecio(e).map(({ slug, monto }) => {
            const n = negocioPorSlug(slug)!;
            return (
              <tr key={slug}>
                <th scope="row" className="px-inset-md py-inset-sm text-left font-normal">
                  <span className="block text-content-primary">{n.persona.nombre}</span>
                  <span className="block text-body-sm text-content-tertiary">
                    {n.persona.oficio} · {n.nombre}
                  </span>
                </th>
                <td className="px-inset-md py-inset-sm text-right font-semibold tabular-nums">{precio(monto)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Stack>
  );
}

/** Quién atiende: persona, oficio y años. Sin ficha ni contacto propio — eso es del ente. */
export function Familias({ negocios, conCita = false }: { negocios: readonly Negocio[]; conCita?: boolean }) {
  return (
    <Grid cols={conCita ? 2 : 3} movil={1} gap="lg" as="ul">
      {negocios.map((n) => (
        <li key={n.slug}>
          <Surface relleno="md" className="h-full">
            <Stack gap="tight">
              <Inline gap="md" align="center" wrap={false}>
                <Media
                  proporcion="1/1"
                  radio="full"
                  semilla={n.persona.nombre}
                  alt={`Retrato de ${n.persona.nombre}`}
                  sizes="64px"
                  className="size-avatar-lg shrink-0"
                />
                <Stack gap="none" className="min-w-0">
                  <Text as="h3" size="heading-xs" weight="semibold">
                    {n.persona.nombre}
                  </Text>
                  <Text size="body-sm" tone="tertiary">
                    {n.persona.oficio}
                    {n.persona.anos ? ` · ${n.persona.anos} años` : ""} · {n.nombre}
                  </Text>
                </Stack>
              </Inline>
              {conCita ? (
                <>
                  <Text size="body-md" tone="secondary">
                    {n.descripcion.es}
                  </Text>
                  {n.persona.cita ? (
                    <Text as="blockquote" size="body-md" serif className="italic">
                      «{n.persona.cita}»
                    </Text>
                  ) : null}
                </>
              ) : null}
            </Stack>
          </Surface>
        </li>
      ))}
    </Grid>
  );
}

/** El nombre corto del ente para una frase: «Cooperativa de Servicios Turísticos El Valle». */
export function nombreCorto(enteId: string): string {
  return ente(enteId).nombre.split(",")[0];
}
