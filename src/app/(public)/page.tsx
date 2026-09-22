import Link from "next/link";

import { Ruta, Search } from "@/components/icons";
import { Container, Grid, Inline, Section, Stack } from "@/components/layout";
import { BusinessCard, CategoryChip } from "@/components/patterns";
import { ButtonLink, Media, Surface, Text } from "@/components/ui";
import { CATEGORIAS, ZONAS, cuantosEnZona, recientes, zonasConRuta } from "@/data";

import { resumir } from "./_resumen";

const PASOS = [
  "Eliges una zona o una categoría.",
  "Ves quién está detrás, qué vende y cuándo abre.",
  "Le escribes por WhatsApp. Sin reservas ni comisiones.",
];

/** Ofrecer una zona que lleva a un vacío es lo peor de un directorio pequeño. */
const ZONAS_CON_RUTA = zonasConRuta();

export default function DescubrirPage() {
  const nuevos = recientes(3);

  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      {/*
        En escritorio la misma pila se vuelve una rejilla de dos columnas y
        «Cómo funciona» sube al lado de la promesa: en el teléfono está a cuatro
        pantallazos, y quien no baja nunca se entera de que esto no cobra
        comisión.

        Se hace con `order` y no duplicando el bloque. El orden del DOM —que es
        el del teléfono— se queda como está, y con él el orden de lectura de un
        lector de pantalla. Mover ese bloque no rompe el foco porque dentro no
        hay nada enfocable: es una lista de tres frases.
      */}
      <Stack gap="loose" className="py-stack-loose lg:grid lg:grid-cols-2 lg:items-start">
        {/* La promesa, en una frase */}
        <Stack gap="default" className="lg:order-1 lg:pr-inset-xl">
          <Stack gap="tight">
            <Text as="h1" size="display-sm" serif weight="semibold" className="lg:text-display-md">
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

        {/*
          Armar una ruta, desde la portada.

          Va con un `<select>` y no con nueve chips a propósito: la rejilla de
          zonas está justo debajo, y repetir ahí los mismos nueve nombres sería
          decir dos veces lo mismo en la misma pantalla. Una lista desplegable
          ocupa una línea y dice lo mismo.

          El formulario es GET y nativo, como el buscador. La zona viaja como
          consulta y `/ruta` la convierte en segmento, porque un `<form>` no
          sabe escribir una parte de la dirección.
        */}
        {ZONAS_CON_RUTA.length > 0 ? (
          <Section espaciado="none" className="lg:order-3 lg:col-span-2">
            <Surface relleno="lg" className="lg:p-inset-xl">
              <Stack>
                <Stack gap="tight">
                  <Inline gap="icon" align="center">
                    <Ruta className="size-icon-md shrink-0 text-brand" aria-hidden />
                    <Text as="h2" size="heading-sm" weight="semibold">
                      ¿Ya sabes a qué zona vas?
                    </Text>
                  </Inline>
                  <Text size="body-md" tone="secondary">
                    Dinos cuántos días tienes y qué te interesa, y te armamos el recorrido: en qué
                    orden pasar y qué va a estar abierto cuando llegues.
                  </Text>
                </Stack>

                <form action="/ruta" method="get">
                  {/*
                    Apilados en el teléfono. Compartiendo fila a 375 px, al
                    selector le quedaban 147 px y se comía «El Valle de Antón,
                    Coclé» y hasta el propio «Elige una zona». Desde `sm` hay
                    sitio y vuelven a la misma línea.
                  */}
                  <div className="flex max-w-prose flex-col gap-inset-sm sm:flex-row sm:items-end">
                    <Stack gap="tight" className="min-w-0 flex-1">
                      <Text as="label" htmlFor="zona-ruta" size="label" weight="medium">
                        Zona
                      </Text>
                      <select
                        id="zona-ruta"
                        name="zona"
                        required
                        defaultValue=""
                        className="h-control-lg w-full rounded-control border border-border-default bg-surface px-inset-md text-body-md text-content-primary"
                      >
                        <option value="" disabled>
                          Elige una zona
                        </option>
                        {ZONAS_CON_RUTA.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.nombre}, {z.provincia}
                          </option>
                        ))}
                      </select>
                    </Stack>
                    <button
                      type="submit"
                      className="inline-flex h-control-lg shrink-0 items-center justify-center rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content"
                    >
                      Armar la ruta
                    </button>
                  </div>
                </form>
              </Stack>
            </Surface>
          </Section>
        ) : null}

        {/* Zonas — las nueve, sin página intermedia que no aporta nada */}
        <Section espaciado="none" className="lg:order-4 lg:col-span-2">
          <Stack>
            <Text as="h2" size="heading-sm" weight="semibold">
              Nueve zonas
            </Text>
            {/* Nueve caben exactas en un 3×3. Esa es la razón de tres y no cuatro. */}
            <Grid cols={3} movil={2} gap="md" as="ul">
              {ZONAS.map((z) => (
                <li key={z.id}>
                  <Link href={`/zona/${z.id}`} className="flex flex-col gap-inset-xs">
                    <Media
                      proporcion="4/3"
                      etiqueta={z.nombre}
                      alt={`Paisaje de ${z.nombre}`}
                      sizes="(min-width: 1024px) 380px, (min-width: 768px) 30vw, 45vw"
                    />
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
        <Section espaciado="none" className="lg:order-5 lg:col-span-2">
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

        {/* Cómo funciona — en escritorio, al lado de la promesa */}
        <Surface
          relleno="lg"
          borde={false}
          className="bg-brand-surface lg:order-2 lg:self-start lg:p-inset-xl"
        >
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

        {/* Para el otro lado del proyecto */}
        <Surface
          relleno="lg"
          className="border-accent-border bg-accent-surface lg:order-7 lg:col-span-2"
        >
          <Inline gap="lg" align="center" wrap={false}>
            <Stack gap="tight" className="flex-1">
              <Text size="body-lg" weight="semibold" tone="accent">
                ¿Tienes un negocio en una de estas zonas?
              </Text>
              <Text size="body-md" tone="secondary">
                Ponlo en Sendero. Es gratis y sin comisión.
              </Text>
            </Stack>
            <ButtonLink href="/para-tu-negocio" variante="secondary" className="shrink-0">
              Ver cómo
            </ButtonLink>
          </Inline>
        </Surface>

        {/* Los últimos en confirmar sus datos */}
        <Section espaciado="none" className="lg:order-6 lg:col-span-2">
          <Stack>
            <Text as="h2" size="heading-sm" weight="semibold">
              Nuevos en Sendero
            </Text>
            <Grid cols={3} movil={1} gap="lg" as="ul">
              {nuevos.map((n) => (
                <li key={n.slug}>
                  <BusinessCard negocio={resumir(n)} orientacion="auto" />
                </li>
              ))}
            </Grid>
          </Stack>
        </Section>
      </Stack>
    </Container>
  );
}
