import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, ExternalLink, MapPin } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { BusinessCard, CategoryChip } from "@/components/patterns";
import { Media, Text } from "@/components/ui";
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
    <>
      <div className="relative">
        <Media
          proporcion="16/9"
          radio="none"
          etiqueta={`Paisaje de ${z.nombre}`}
          alt={`${z.nombre}, ${z.provincia}`}
          sizes="(min-width: 640px) 640px, 100vw"
        />
        <Link
          href="/"
          aria-label="Volver a Descubrir"
          className="absolute left-inset-md top-inset-md flex size-control-sm items-center justify-center rounded-full bg-surface shadow-raised"
        >
          <ArrowLeft className="size-icon-md" aria-hidden />
        </Link>
      </div>

      <Container ancho="sm" as="main">
        <Stack gap="loose" className="py-gutter">
          <Stack gap="tight">
            <Text size="overline" tone="tertiary">
              {z.provincia}
            </Text>
            <Text as="h1" size="display-sm" serif weight="semibold">
              {z.nombre}
            </Text>
            <Text size="body-lg" tone="secondary">
              {z.descripcion.es}
            </Text>
          </Stack>

          {/* Cómo llegar — imagen estática y enlace, nunca un mapa en JavaScript */}
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
            <Media proporcion="16/9" etiqueta="Mapa estático" alt={`Mapa de ${z.nombre}`} sizes="(min-width: 640px) 600px, 100vw" />
            <a
              href={enlaceMapa(`${z.nombre}, ${z.provincia}, Panamá`)}
              rel="noopener noreferrer"
              className="inline-flex min-h-touch-min items-center gap-icon-gap text-body-md font-medium text-brand"
            >
              Abrir en la app de mapas
              <ExternalLink className="size-icon-sm" aria-hidden />
            </a>
          </Stack>

          {/* Qué hay aquí */}
          <Stack>
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

          <Stack as="ul">
            {negocios.map((n) => (
              <li key={n.slug}>
                <BusinessCard negocio={resumir(n, { conZona: false })} />
              </li>
            ))}
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
