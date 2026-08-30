import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, ChevronRight, ExternalLink, MapPin } from "@/components/icons";
import { Container, Grid, Inline, Stack } from "@/components/layout";
import { BusinessCard, CategoryChip } from "@/components/patterns";
import { Media, Surface, Text } from "@/components/ui";
import type { ZonaId } from "@/data";
import { ZONAS, categoria, categoriasDeZona, negociosDeZona } from "@/data";
import { enlaceMapa } from "@/lib/formato";

import { resumir } from "../../_resumen";

/** Las nueve zonas se generan en build. */
export function generateStaticParams() {
  return ZONAS.map((z) => ({ id: z.id }));
}

function buscarZona(id: string) {
  return ZONAS.find((z) => z.id === id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const z = buscarZona(id);
  if (!z) return {};
  return {
    title: `${z.nombre}, ${z.provincia}`,
    description: z.descripcion.es,
  };
}

export default async function ZonaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const z = buscarZona(id);
  if (!z) notFound();

  const zonaId = z.id as ZonaId;
  const negocios = negociosDeZona(zonaId);
  const categorias = categoriasDeZona(zonaId);

  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      {/*
        «Cómo llegar» es información de consulta: se vuelve a mirar mientras se
        recorre la lista. En el teléfono está intercalada porque no hay dónde
        ponerla; en escritorio se va a una columna fija a la derecha y se queda
        a la vista.
      */}
      <Stack gap="loose" className="pb-gutter sm:pt-gutter lg:grid lg:grid-cols-3 lg:items-start">
        {/*
          La portada sale del contenedor en el teléfono y vuelve dentro a partir
          de `sm`, y en `lg` ocupa dos tercios con «Cómo llegar» al lado. Un
          16/9 a lo ancho de un monitor mide 800 px de alto: una portada que se
          come la primera pantalla entera.
        */}
        <div className="relative -mx-gutter sm:mx-0 lg:col-span-2">
          <Media
            proporcion="16/9"
            radio="none"
            etiqueta={`Paisaje de ${z.nombre}`}
            alt={`${z.nombre}, ${z.provincia}`}
            sizes="(min-width: 1024px) 755px, (min-width: 640px) 640px, 100vw"
            className="sm:rounded-media"
          />
          {/* En escritorio esto lo dice la miga de pan, y el navegador ya trae
              su propio botón de volver justo encima. */}
          <Link
            href="/"
            aria-label="Volver a Descubrir"
            className="absolute left-inset-md top-inset-md flex size-control-sm items-center justify-center rounded-full bg-surface shadow-raised lg:hidden"
          >
            <ArrowLeft className="size-icon-md" aria-hidden />
          </Link>
        </div>

        {/* En escritorio, la miga de pan reemplaza a la flecha sobre la foto */}
        <nav
          aria-label="Migas de pan"
          className="hidden items-center gap-inset-xs lg:col-span-2 lg:flex"
        >
          <Link href="/" className="text-body-sm text-content-tertiary">
            Descubrir
          </Link>
          <ChevronRight className="size-icon-sm text-content-tertiary" aria-hidden />
          <Text as="span" size="body-sm">
            {z.nombre}
          </Text>
        </nav>

        <Stack gap="tight" className="lg:col-span-2">
          <Text size="overline" tone="tertiary">
            {z.provincia}
          </Text>
          <Text as="h1" size="display-sm" serif weight="semibold" className="lg:text-display-md">
            {z.nombre}
          </Text>
          <Text size="body-lg" tone="secondary" className="max-w-prose">
            {z.descripcion.es}
          </Text>
        </Stack>

        {/* Cómo llegar — imagen estática y enlace, nunca un mapa en JavaScript */}
        <Surface
          nivel="none"
          relleno="none"
          borde={false}
          as="aside"
          className="lg:sticky lg:top-control-md lg:col-start-3 lg:row-start-1 lg:row-span-5 lg:border lg:border-border-subtle lg:bg-surface lg:p-inset-lg"
        >
          <Stack>
            <Inline gap="icon">
              <MapPin className="size-icon-md text-content-tertiary" aria-hidden />
              <Text as="h2" size="heading-sm" weight="semibold">
                Cómo llegar
              </Text>
            </Inline>
            <Text size="body-md" tone="secondary">
              {z.comoLlegar.es}
            </Text>
            <Media
              proporcion="16/9"
              etiqueta="Mapa estático"
              alt={`Mapa de ${z.nombre}`}
              sizes="(min-width: 1024px) 352px, (min-width: 640px) 600px, 100vw"
            />
            <a
              href={enlaceMapa(`${z.nombre}, ${z.provincia}, Panamá`)}
              rel="noopener noreferrer"
              className="inline-flex min-h-touch-min items-center gap-icon-gap text-body-md font-medium text-brand"
            >
              Abrir en la app de mapas
              <ExternalLink className="size-icon-sm" aria-hidden />
            </a>
          </Stack>
        </Surface>

        {/* Qué hay aquí */}
        <Stack className="lg:col-span-2">
          <Text as="h2" size="heading-sm" weight="semibold">
            {negocios.length} {negocios.length === 1 ? "negocio" : "negocios"} en {z.nombre}
          </Text>
          {/* Solo las categorías que de verdad tienen algo: un chip que lleva
              a un vacío es la peor experiencia en un directorio pequeño */}
          <Inline gap="sm">
            {categorias.map((c) => (
              <CategoryChip key={c} href={`/buscar?zona=${z.id}&categoria=${c}`}>
                {categoria(c).nombre.es}
              </CategoryChip>
            ))}
          </Inline>
        </Stack>

        <Grid cols={2} movil={1} gap="lg" as="ul" className="lg:col-span-2">
          {negocios.map((n) => (
            <li key={n.slug}>
              <BusinessCard negocio={resumir(n, { conZona: false })} orientacion="auto" />
            </li>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
