import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  CheckCircle,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
} from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { EstadoApertura } from "@/components/patterns";
import { Badge, ButtonLink, Media, Surface, Text } from "@/components/ui";
import { NEGOCIOS, categoria, negocioPorSlug, zona } from "@/data";
import {
  enlaceLlamada,
  enlaceMapa,
  enlaceWhatsApp,
  fechaLarga,
  precio,
  resumenSemana,
} from "@/lib/formato";

/** Las 30 fichas se generan en build. No hay servidor que consultar. */
export function generateStaticParams() {
  return NEGOCIOS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = negocioPorSlug(slug);
  if (!n) return {};
  const z = zona(n.zona);
  return {
    title: `${n.nombre} · ${z.nombre}`,
    description: n.descripcion.es,
  };
}

export default async function NegocioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const negocio = negocioPorSlug(slug);
  if (!negocio) notFound();

  const z = zona(negocio.zona);
  const cat = categoria(negocio.categoria);
  const semana = resumenSemana(negocio.horario);

  const mensaje = `Hola, le escribo desde Sendero. Quisiera preguntarle por ${negocio.nombre}.`;

  return (
    <>
      {/* Retrato: la persona es la portada, no el local */}
      <div className="relative">
        <Media
          proporcion="1/1"
          radio="none"
          etiqueta={`Retrato de ${negocio.persona.nombre} en su taller`}
          alt={`${negocio.persona.nombre}, ${negocio.persona.oficio.toLowerCase()} en ${z.nombre}`}
          sizes="(min-width: 640px) 640px, 100vw"
        />
        <Inline
          justify="between"
          wrap={false}
          className="absolute inset-x-inset-md top-inset-md"
        >
          <Link
            href="/"
            aria-label="Volver"
            className="flex size-control-sm items-center justify-center rounded-full bg-surface shadow-raised"
          >
            <ArrowLeft className="size-icon-md" aria-hidden />
          </Link>
          <span className="flex size-control-sm items-center justify-center rounded-full bg-surface shadow-raised">
            <Bookmark className="size-icon-md" aria-label="Guardar" />
          </span>
        </Inline>
      </div>

      <Container ancho="sm" as="main" className="pb-section">
        <Stack gap="loose" className="py-gutter">
          {/* La persona es el titular */}
          <Stack gap="tight">
            <Text as="h1" size="display-sm" serif weight="semibold">
              {negocio.persona.nombre}
            </Text>
            <Text size="body-lg" tone="secondary">
              {negocio.persona.oficio} en {z.nombre}, {z.provincia}
            </Text>
            <Inline gap="icon" className="pt-inset-xs">
              <Badge tono="accent" overline>
                {cat.nombre.es}
              </Badge>
              {negocio.persona.anos ? (
                <Text size="body-sm" tone="tertiary">
                  {negocio.persona.anos} años en el oficio
                </Text>
              ) : null}
            </Inline>
          </Stack>

          {negocio.persona.cita ? (
            <Text as="blockquote" size="heading-md" serif>
              «{negocio.persona.cita}»
            </Text>
          ) : null}

          <Text size="body-md" tone="secondary">
            {negocio.descripcion.es}
          </Text>

          {/* Qué encuentras — la lista vertical de la dirección A */}
          <Stack gap="default">
            <Text as="h2" size="heading-sm" weight="semibold">
              Qué encuentras
            </Text>
            <Stack gap="tight" as="ul">
              {negocio.productos.map((p) => (
                <Inline key={p.nombre} gap="md" align="center" wrap={false} as="li">
                  <Media
                    proporcion="1/1"
                    className="size-avatar-xl shrink-0"
                    sizes="80px"
                    alt={p.nombre}
                  />
                  <Stack gap="tight" className="min-w-0">
                    <Text size="body-md" weight="medium">
                      {p.nombre}
                    </Text>
                    <Text size="body-sm" tone="tertiary">
                      {p.precio !== undefined ? precio(p.precio, p.desde) : "Precio según el encargo"}
                      {p.detalle ? ` · ${p.detalle}` : ""}
                    </Text>
                  </Stack>
                </Inline>
              ))}
            </Stack>
          </Stack>

          {/* Lo práctico, agrupado y en segundo plano */}
          <Surface relleno="lg">
            <Stack gap="default">
              <Stack gap="tight">
                <EstadoApertura semana={negocio.horario} />
                {/* Inline y no Grid: Grid es mobile-first y colapsa a una
                    columna en el teléfono, que es justo donde un par
                    etiqueta/valor tiene que seguir siendo una sola fila. */}
                <Stack gap="tight">
                  {semana.map((fila) => (
                    <Inline key={fila.dias} justify="between" gap="md" align="baseline" wrap={false}>
                      <Text as="span" size="body-md" tone="secondary">
                        {fila.dias}
                      </Text>
                      <Text
                        as="span"
                        size="body-md"
                        tone={fila.valor === "sinConfirmar" ? "warning" : "primary"}
                        className="text-right"
                      >
                        {fila.horario}
                      </Text>
                    </Inline>
                  ))}
                </Stack>
              </Stack>

              <Inline gap="md" align="start" wrap={false} className="border-t border-border-subtle pt-inset-md">
                <MapPin className="size-icon-md shrink-0 text-content-tertiary" aria-hidden />
                <Stack gap="tight">
                  <Text size="body-sm" tone="secondary">
                    {negocio.referencia}
                  </Text>
                  {/* La referencia escrita manda; el mapa es el respaldo. La
                      búsqueda va por nombre de zona porque nadie ha ido a
                      tomarle el GPS a treinta talleres. */}
                  <a
                    href={enlaceMapa(`${z.nombre}, ${z.provincia}, Panamá`)}
                    rel="noopener noreferrer"
                    className="inline-flex min-h-touch-min items-center gap-icon-gap text-body-sm font-medium text-brand"
                  >
                    Abrir {z.nombre} en la app de mapas
                    <ExternalLink className="size-icon-sm" aria-hidden />
                  </a>
                </Stack>
              </Inline>

              <Inline gap="md" align="start" wrap={false}>
                {negocio.estadoDato === "verificado" ? (
                  <CheckCircle className="size-icon-md shrink-0 text-success" aria-hidden />
                ) : (
                  <AlertCircle className="size-icon-md shrink-0 text-trust-stale" aria-hidden />
                )}
                <Stack gap="tight">
                  <Text
                    size="body-sm"
                    weight="medium"
                    tone={negocio.estadoDato === "verificado" ? "success" : "warning"}
                  >
                    {negocio.confirmadoEl
                      ? `${negocio.persona.nombre.split(" ")[0]} confirmó estos datos el ${fechaLarga(negocio.confirmadoEl)}`
                      : "Estos datos todavía no se han confirmado"}
                  </Text>
                  <Text size="body-sm" tone="tertiary">
                    {negocio.pagos.join(" · ")} · {negocio.idiomas.join(", ")}
                  </Text>
                </Stack>
              </Inline>
            </Stack>
          </Surface>
        </Stack>
      </Container>

      {/* Contacto: siempre a la vista, siempre al alcance del pulgar */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-surface shadow-sticky">
        <Container ancho="sm" sinGutter className="px-gutter py-inset-md">
          <Inline gap="sm" wrap={false}>
            <ButtonLink
              href={enlaceWhatsApp(negocio.whatsapp, mensaje)}
              externo
              className="flex-1"
            >
              <MessageCircle className="size-icon-md" aria-hidden />
              Escribirle a {negocio.persona.nombre.split(" ")[0]}
            </ButtonLink>
            <ButtonLink
              href={enlaceLlamada(negocio.whatsapp)}
              externo
              variante="secondary"
              soloIcono
            >
              <Phone className="size-icon-md" aria-label={`Llamar a ${negocio.persona.nombre}`} />
            </ButtonLink>
          </Inline>
        </Container>
      </div>
    </>
  );
}
