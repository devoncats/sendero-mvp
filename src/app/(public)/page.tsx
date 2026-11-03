import Link from "next/link";

import { ChevronRight, Comunidad } from "@/components/icons";
import { Container, Grid, Inline, Section, Stack } from "@/components/layout";
import { EncabezadoSeccion } from "@/components/patterns";
import { ButtonLink, Media, Surface, Text } from "@/components/ui";
import {
  EXPERIENCIAS,
  emprendimientosDe,
  ente,
  negocioPorSlug,
  precioPorPersona,
  repartoDelPrecio,
  zona,
} from "@/data";
import { precio } from "@/lib/formato";

/**
 * Lo que la portada promete en tres pasos. Era «le escribes directo, sin
 * reservas»; ahora hay un ente en medio, y la promesa honesta es que ese ente
 * es de la comunidad y no se queda con nada.
 */
const PASOS = [
  "Eliges la fecha y cuántos van.",
  "La cooperativa del pueblo te confirma por WhatsApp. No pagas nada en línea.",
  "Cada familia te atiende en su momento del recorrido y recibe su parte.",
];

/**
 * La portada del portal: la comunidad y lo que ofrece.
 *
 * Antes era un directorio —nueve zonas, seis categorías, un buscador—. El PO
 * pidió que el portal promueva una experiencia de una comunidad, con los
 * emprendimientos dentro, y eso es lo que hay aquí: la experiencia arriba,
 * a dónde va el dinero en medio, y quién te atiende al final.
 *
 * Hoy hay una sola experiencia y por eso manda la pantalla entera. Cuando haya
 * más, la cabecera pasa a ser la destacada y el resto entra en una rejilla
 * debajo — el marcado ya está pensado para eso: la experiencia es un bloque,
 * no la página.
 */
export default function ExperienciasPage() {
  const e = EXPERIENCIAS[0];
  const z = zona(e.zona);
  const coop = ente(e.ente);
  const total = precioPorPersona(e);
  const reparto = repartoDelPrecio(e);
  const familias = emprendimientosDe(e);
  const href = `/experiencia/${e.id}`;

  return (
    <div className="relative isolate">
      <div className="lavado-superior" aria-hidden />
      <Container ancho="sm" as="main" className="lg:max-w-page-xl">
        <Stack gap="loose" className="py-stack-loose">
          {/* La experiencia. En escritorio, texto a la izquierda y foto a la derecha. */}
          <div className="flex flex-col gap-stack lg:grid lg:grid-cols-2 lg:items-center">
            <Stack gap="default" className="lg:pr-inset-xl">
              <Stack gap="tight">
                <Text size="overline" tone="brand">
                  {z.nombre} · {z.provincia}
                </Text>
                <Text
                  as="h1"
                  size="display-sm"
                  serif
                  weight="semibold"
                  className="text-balance lg:text-display-lg"
                >
                  {e.nombre}
                </Text>
                <Text size="body-lg" tone="secondary" className="max-w-prose">
                  {e.lema.es}
                </Text>
              </Stack>

              {/* Los cuatro datos que deciden si sigue leyendo. Una línea, no una tabla. */}
              <Text size="body-md" tone="secondary">
                <strong className="font-semibold text-content-primary">
                  {precio(total)} por persona
                </strong>{" "}
                · {e.dias} días, {e.noches} noche · hasta {e.cupo} personas
              </Text>

              <Inline gap="sm" className="max-sm:flex-col max-sm:items-stretch">
                <ButtonLink href={`${href}#solicitar`} tamano="lg" className="max-sm:w-full">
                  Ver fechas y solicitar
                </ButtonLink>
                <ButtonLink href={href} variante="secondary" tamano="lg" className="max-sm:w-full">
                  Ver el recorrido
                </ButtonLink>
              </Inline>
            </Stack>

            <Media
              proporcion="4/3"
              semilla={z.nombre}
              alt={`El cráter de ${z.nombre}`}
              sizes="(min-width: 1024px) 560px, 100vw"
              prioridad
            />
          </div>

          {/* Cómo funciona */}
          <Surface relleno="lg" borde={false} className="bg-brand-surface lg:p-inset-xl">
            <Stack>
              <Text as="h2" size="heading-sm" weight="semibold" className="text-brand-content">
                Cómo funciona
              </Text>
              <Grid cols={3} movil={1} gap="lg" as="ol">
                {PASOS.map((paso, i) => (
                  <Inline key={paso} gap="md" align="start" wrap={false} as="li">
                    <span
                      className="flex size-avatar-xs shrink-0 items-center justify-center rounded-full bg-brand text-body-sm font-semibold text-action-primary-content"
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <Text size="body-md" className="text-brand-content">
                      {paso}
                    </Text>
                  </Inline>
                ))}
              </Grid>
            </Stack>
          </Surface>

          {/*
            A dónde va tu dinero.

            Es la razón de ser del proyecto puesta donde el visitante la ve: el
            precio no es una cifra, es la suma de lo que recibe cada familia.
            Tabla de verdad —dos columnas que se leen por filas— y no barras:
            un lector de pantalla la recorre, y la cifra exacta dice más que
            una longitud.
          */}
          <Section espaciado="none">
            <Stack>
              <EncabezadoSeccion kicker="El derrame">
                De cada {precio(total)}, a quién le llega
              </EncabezadoSeccion>
              <Text size="body-md" tone="secondary" className="max-w-prose">
                El precio es la suma de lo que recibe cada familia del recorrido. La cooperativa no
                se queda con una comisión: se sostiene con la cuota de sus socios.
              </Text>
              <Stack gap="tight">
                <Text size="overline" tone="tertiary">
                  Por persona
                </Text>
                <table className="w-full overflow-hidden rounded-control bg-surface-sunken text-body-md">
                  <caption className="sr-only">
                    Cuánto recibe cada emprendimiento por cada visitante
                  </caption>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Quién</th>
                      <th scope="col">Cuánto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {reparto.map(({ slug, monto }) => {
                      const n = negocioPorSlug(slug)!;
                      return (
                        <tr key={slug}>
                          <th scope="row" className="px-inset-md py-inset-sm text-left font-normal">
                            <span className="block text-content-primary">{n.persona.nombre}</span>
                            <span className="block text-body-sm text-content-tertiary">
                              {n.persona.oficio} · {n.nombre}
                            </span>
                          </th>
                          <td className="px-inset-md py-inset-sm text-right font-semibold tabular-nums">
                            {precio(monto)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Stack>
            </Stack>
          </Section>

          {/* Quién te atiende */}
          <Section espaciado="none">
            <Stack>
              <EncabezadoSeccion kicker="Quién te atiende">
                {familias.length} familias de {z.nombre}
              </EncabezadoSeccion>
              <Grid cols={3} movil={1} gap="lg" as="ul">
                {familias.map((n) => (
                  <li key={n.slug}>
                    <Surface relleno="none" className="h-full overflow-hidden">
                      <Inline gap="md" align="center" wrap={false} className="p-inset-md">
                        <Media
                          proporcion="1/1"
                          semilla={n.persona.nombre}
                          alt={`Retrato de ${n.persona.nombre}`}
                          sizes="64px"
                          radio="full"
                          className="size-avatar-lg shrink-0"
                        />
                        <Stack gap="none" className="min-w-0">
                          <Text size="heading-xs" weight="semibold">
                            {n.persona.nombre}
                          </Text>
                          <Text size="body-sm" tone="tertiary">
                            {n.persona.oficio}
                            {n.persona.anos ? ` · ${n.persona.anos} años` : ""} · {n.nombre}
                          </Text>
                        </Stack>
                      </Inline>
                    </Surface>
                  </li>
                ))}
              </Grid>
              <Link
                href="/comunidad"
                className="inline-flex min-h-touch-min items-center gap-icon-gap self-start text-body-md font-medium text-brand"
              >
                <Comunidad className="size-icon-md" aria-hidden />
                Conoce a {coop.nombre.split(",")[0]}
                <ChevronRight className="size-icon-sm" aria-hidden />
              </Link>
            </Stack>
          </Section>

          {/*
            Lo que viene. El PO quiere que el pase de día y los sitios sueltos
            vayan entrando poco a poco; decirlo aquí es honesto con quien solo
            tiene una mañana, y no cuesta nada que luego no se pueda cumplir.
          */}
          <Surface relleno="lg" className="border-accent-border bg-accent-surface">
            <Stack gap="tight">
              <Text size="overline" tone="accent">
                Pronto
              </Text>
              <Text as="h2" size="heading-sm" weight="semibold" tone="accent">
                Un pase de día, para quien solo tiene una mañana
              </Text>
              <Text size="body-md" tone="secondary" className="max-w-prose">
                El mercado, la cascada y el mirador por separado. Lo estamos preparando con la
                cooperativa.
              </Text>
            </Stack>
          </Surface>
        </Stack>
      </Container>
    </div>
  );
}
