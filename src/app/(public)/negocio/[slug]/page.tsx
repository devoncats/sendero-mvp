import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
} from "@/components/icons";
import { Container, Grid, Inline, Stack } from "@/components/layout";
import { BotonGuardar, EstadoApertura } from "@/components/patterns";
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
  const nombreCorto = negocio.persona.nombre.split(" ")[0];

  const mensaje = `Hola, le escribo desde Sendero. Quisiera preguntarle por ${negocio.nombre}.`;

  return (
    <>
      <Container ancho="sm" as="main" className="pb-section lg:max-w-page-xl">
        {/*
          En escritorio la barra fija de WhatsApp no desaparece: cambia de sitio.
          Todo lo práctico —horario, contacto, dónde queda y desde cuándo están
          confirmados los datos— se junta en una sola tarjeta fija a la derecha,
          que es lo que se comprueba justo antes de escribir. Es la misma
          tarjeta que en el teléfono va al final; solo cambia dónde se coloca.

          El orden del DOM es el del teléfono y no se toca: en `lg` solo se
          reparte en columnas.
        */}
        <Stack gap="loose" className="pb-gutter sm:pt-gutter lg:grid lg:grid-cols-3 lg:items-start">
          {/* En escritorio la miga de pan reemplaza a la flecha sobre la foto */}
          <nav
            aria-label="Migas de pan"
            className="hidden items-center gap-inset-xs lg:col-span-3 lg:flex"
          >
            <Link href="/" className="text-body-sm text-content-tertiary">
              Descubrir
            </Link>
            <ChevronRight className="size-icon-sm text-content-tertiary" aria-hidden />
            <Link href={`/zona/${z.id}`} className="text-body-sm text-content-tertiary">
              {z.nombre}
            </Link>
            <ChevronRight className="size-icon-sm text-content-tertiary" aria-hidden />
            <Text as="span" size="body-sm">
              {negocio.persona.nombre}
            </Text>
          </nav>

          {/* Retrato: la persona es la portada, no el local */}
          <Stack
            gap="default"
            className="lg:col-span-2 lg:grid lg:grid-cols-2 lg:items-start lg:gap-inset-xl"
          >
            <div className="relative -mx-gutter sm:mx-0">
              {/*
                Cuadrado a lo ancho del teléfono; retrato cuando se sienta al
                lado del titular. Un 1/1 de 1440 px de lado sería una foto de
                un megabyte para decir lo mismo.
              */}
              <Media
                proporcion="1/1"
                radio="none"
                etiqueta={`Retrato de ${negocio.persona.nombre} en su taller`}
                alt={`${negocio.persona.nombre}, ${negocio.persona.oficio.toLowerCase()} en ${z.nombre}`}
                sizes="(min-width: 1024px) 368px, (min-width: 640px) 640px, 100vw"
                className="sm:rounded-media lg:aspect-portrait"
              />
              <Inline
                justify="between"
                wrap={false}
                className="absolute inset-x-inset-md top-inset-md lg:hidden"
              >
                <Link
                  href="/"
                  aria-label="Volver"
                  className="flex size-control-sm items-center justify-center rounded-full bg-surface shadow-raised"
                >
                  <ArrowLeft className="size-icon-md" aria-hidden />
                </Link>
                <BotonGuardar slug={negocio.slug} nombre={negocio.nombre} />
              </Inline>
            </div>

            <Stack gap="default">
              <Stack gap="tight">
                <Text
                  as="h1"
                  size="display-sm"
                  serif
                  weight="semibold"
                  className="lg:text-display-md"
                >
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
                <Text
                  as="blockquote"
                  size="heading-md"
                  serif
                  className="lg:border-l-2 lg:border-accent lg:pl-inset-lg"
                >
                  «{negocio.persona.cita}»
                </Text>
              ) : null}
            </Stack>
          </Stack>

          <Text size="body-md" tone="secondary" className="max-w-prose lg:col-span-2">
            {negocio.descripcion.es}
          </Text>

          {/* Qué encuentras — la lista vertical de la dirección A */}
          <Stack gap="default" className="lg:col-span-2">
            <Text as="h2" size="heading-sm" weight="semibold">
              Qué encuentras
            </Text>
            {/*
              Lo único que gana tamaño real en escritorio: los productos y sus
              precios se comparan de un vistazo, que es justo lo que se hace
              antes de escribir.
            */}
            <Grid cols={3} movil={1} gap="lg" as="ul">
              {negocio.productos.map((p) => (
                <Inline
                  key={p.nombre}
                  gap="md"
                  align="center"
                  wrap={false}
                  as="li"
                  className="lg:flex-col lg:items-stretch"
                >
                  <Media
                    proporcion="1/1"
                    className="h-avatar-xl w-avatar-xl shrink-0 lg:h-auto lg:w-full lg:shrink"
                    sizes="(min-width: 1024px) 232px, 80px"
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
            </Grid>
          </Stack>

          {/* Lo práctico, agrupado y en segundo plano */}
          <Surface
            relleno="lg"
            as="aside"
            className="lg:sticky lg:top-control-md lg:col-start-3 lg:row-start-2 lg:row-span-3 lg:shadow-raised"
          >
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

              {/* El contacto solo aparece aquí en escritorio: en el teléfono
                  vive en la barra de abajo, al alcance del pulgar. */}
              <Stack gap="tight" className="hidden border-t border-border-subtle pt-inset-md lg:flex">
                <ButtonLink href={enlaceWhatsApp(negocio.whatsapp, mensaje)} externo anchoCompleto>
                  <MessageCircle className="size-icon-md" aria-hidden />
                  Escribirle a {nombreCorto}
                </ButtonLink>
                <Inline gap="sm" wrap={false}>
                  <ButtonLink
                    href={enlaceLlamada(negocio.whatsapp)}
                    externo
                    variante="secondary"
                    className="flex-1"
                  >
                    <Phone className="size-icon-md" aria-hidden />
                    Llamar
                  </ButtonLink>
                  <BotonGuardar
                    slug={negocio.slug}
                    nombre={negocio.nombre}
                    className="size-control-md shrink-0 rounded-control border border-border-default shadow-none"
                  />
                </Inline>
              </Stack>

              <Inline
                gap="md"
                align="start"
                wrap={false}
                className="border-t border-border-subtle pt-inset-md"
              >
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
                  {/* Discreto a propósito: la acción de esta ficha es
                      escribirle a la persona, y nada compite con eso. */}
                  <Link
                    href={`/zona/${z.id}/ruta?intereses=${negocio.categoria}`}
                    className="inline-flex min-h-touch-min items-center gap-icon-gap text-body-sm font-medium text-brand"
                  >
                    Ver una ruta que pase por aquí
                  </Link>
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
                      ? `${nombreCorto} confirmó estos datos el ${fechaLarga(negocio.confirmadoEl)}`
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

      {/* Contacto en el teléfono: siempre a la vista, siempre al alcance del pulgar */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-surface shadow-sticky lg:hidden">
        <Container ancho="sm" sinGutter className="px-gutter py-inset-md">
          <Inline gap="sm" wrap={false}>
            <ButtonLink
              href={enlaceWhatsApp(negocio.whatsapp, mensaje)}
              externo
              className="flex-1"
            >
              <MessageCircle className="size-icon-md" aria-hidden />
              Escribirle a {nombreCorto}
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
