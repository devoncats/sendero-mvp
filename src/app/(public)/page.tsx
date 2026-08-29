import Link from "next/link";

import { Search } from "@/components/icons";
import { Container, Grid, Inline, Section, Stack } from "@/components/layout";
import { BusinessCard, CategoryChip } from "@/components/patterns";
import { Media, Surface, Text } from "@/components/ui";
import { CATEGORIAS, ZONAS, cuantosEnZona, recientes } from "@/data";

import { resumir } from "./_resumen";

const PASOS = [
  "Eliges una zona o una categoría.",
  "Ves quién está detrás, qué vende y cuándo abre.",
  "Le escribes por WhatsApp. Sin reservas ni comisiones.",
];

export default function DescubrirPage() {
  const nuevos = recientes(3);

  return (
    <Container ancho="sm" as="main">
      <Stack gap="loose" className="py-stack-loose">
        {/* La promesa, en una frase */}
        <Stack gap="default">
          <Stack gap="tight">
            <Text as="h1" size="display-sm" serif weight="semibold">
              El Panamá que no sale en el folleto
            </Text>
            <Text size="body-lg" tone="secondary">
              Artesanos, fondas y hospedajes familiares en zonas donde no llegan los tours. Les
              escribes directo.
            </Text>
          </Stack>

          {/*
            Formulario GET, sin JavaScript: el navegador arma la URL y /buscar la
            lee en el servidor. Un buscador que funciona con el JS deshabilitado
            y cuyo resultado se puede compartir y guardar.
          */}
          <form action="/buscar" method="get">
            <Inline gap="sm" wrap={false}>
              <label htmlFor="q" className="sr-only">
                Buscar zona, negocio o producto
              </label>
              <input
                id="q"
                name="q"
                type="search"
                placeholder="¿A qué zona vas?"
                className="h-control-lg w-full min-w-0 flex-1 rounded-control border border-border-default bg-surface px-inset-md text-body-md text-content-primary placeholder:text-content-tertiary"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="flex size-control-lg shrink-0 items-center justify-center rounded-control bg-action-primary text-action-primary-content"
              >
                <Search className="size-icon-md" aria-hidden />
              </button>
            </Inline>
          </form>
        </Stack>

        {/* Zonas — las nueve, sin página intermedia que no aporta nada */}
        <Section espaciado="none">
          <Stack>
            <Text as="h2" size="heading-sm" weight="semibold">
              Nueve zonas
            </Text>
            <Grid cols={2} movil={2} gap="md" as="ul">
              {ZONAS.map((z) => (
                <li key={z.id}>
                  <Link href={`/zona/${z.id}`} className="flex flex-col gap-inset-xs">
                    <Media proporcion="4/3" etiqueta={z.nombre} alt={`Paisaje de ${z.nombre}`} sizes="(min-width: 640px) 300px, 45vw" />
                    <Text size="body-md" weight="semibold">
                      {z.nombre}
                    </Text>
                    <Text size="body-sm" tone="tertiary">
                      {z.provincia} · {cuantosEnZona(z.id)} negocios
                    </Text>
                  </Link>
                </li>
              ))}
            </Grid>
          </Stack>
        </Section>

        {/* Categorías */}
        <Section espaciado="none">
          <Stack>
            <Text as="h2" size="heading-sm" weight="semibold">
              Qué buscas
            </Text>
            <Inline gap="sm">
              {CATEGORIAS.map((c) => (
                <CategoryChip key={c.id} href={`/buscar?categoria=${c.id}`}>
                  {c.nombre.es}
                </CategoryChip>
              ))}
            </Inline>
          </Stack>
        </Section>

        {/* Cómo funciona */}
        <Surface relleno="lg" borde={false} className="bg-brand-surface">
          <Stack>
            <Text as="h2" size="heading-sm" weight="semibold" className="text-brand-content">
              Cómo funciona
            </Text>
            <Stack gap="tight" as="ol">
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
            </Stack>
          </Stack>
        </Surface>

        {/* Los últimos en confirmar sus datos */}
        <Section espaciado="none">
          <Stack>
            <Text as="h2" size="heading-sm" weight="semibold">
              Nuevos en Sendero
            </Text>
            <Stack as="ul">
              {nuevos.map((n) => (
                <li key={n.slug}>
                  <BusinessCard negocio={resumir(n)} />
                </li>
              ))}
            </Stack>
          </Stack>
        </Section>
      </Stack>
    </Container>
  );
}
