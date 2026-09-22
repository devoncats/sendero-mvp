import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ChevronRight, Compass, Ruta } from "@/components/icons";
import { Container, Grid, Inline, Stack } from "@/components/layout";
import { EmptyState } from "@/components/patterns";
import { Surface, Text, clasesDeBoton } from "@/components/ui";
import { ZONAS, cuantasParadasPosibles, zonasConRuta } from "@/data";

/**
 * Dos cosas en una ruta, y la segunda es la que la justifica.
 *
 * Con `?zona=`, redirige y no se renderiza: es el puente que necesita el
 * selector de la portada, porque un `<form method="get">` sabe armar
 * `?clave=valor` pero no escribir un segmento de la dirección, y la zona va en
 * la ruta porque un plan pertenece a un pueblo.
 *
 * Sin zona, es la pantalla que le faltaba a la navegación. Un enlace de primer
 * nivel necesita un destino, y el planificador no tiene uno sin zona: esto lo
 * es. Aquí sí se listan las nueve, y no se repite nada — no es la portada, es
 * una pantalla cuyo único trabajo es elegir dónde.
 */
export const metadata: Metadata = {
  title: "Armar una ruta",
  description:
    "Elige la zona a la que vas y te armamos el recorrido: qué te cabe en los días que tengas, en qué orden y qué estará abierto cuando pases.",
};

export default async function ArmarUnaRuta({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string }>;
}) {
  const { zona } = await searchParams;

  if (zona) {
    const z = ZONAS.find((x) => x.id === zona);
    // Descartar y no fallar, igual que en `/buscar`: una zona inventada no
    // merece un error, merece la lista para elegir bien.
    if (z) redirect(`/zona/${z.id}/ruta`);
  }

  const zonas = zonasConRuta();

  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      <Stack gap="loose" className="py-stack">
        <nav aria-label="Migas de pan" className="hidden items-center gap-inset-xs lg:flex">
          <Link href="/" className="text-body-sm text-content-tertiary">
            Descubrir
          </Link>
          <ChevronRight className="size-icon-sm text-content-tertiary" aria-hidden />
          <Text as="span" size="body-sm">
            Armar una ruta
          </Text>
        </nav>

        <Stack gap="tight">
          <Inline gap="icon" align="center">
            <Ruta className="size-icon-md shrink-0 text-brand" aria-hidden />
            <Text as="h1" size="heading-lg" serif weight="semibold">
              Armar una ruta
            </Text>
          </Inline>
          <Text size="body-lg" tone="secondary" className="max-w-prose">
            Elige a dónde vas. Después nos dices cuántos días tienes y qué te interesa, y te decimos
            qué te cabe, en qué orden pasar y qué va a estar abierto cuando llegues.
          </Text>
        </Stack>

        {zonas.length > 0 ? (
          <Grid cols={3} movil={1} gap="md" as="ul">
            {zonas.map((z) => {
              const paradas = cuantasParadasPosibles(z.id);
              return (
                <li key={z.id}>
                  <Link href={`/zona/${z.id}/ruta`} className="block">
                    <Surface relleno="lg" className="h-full">
                      <Stack gap="tight">
                        <Text size="overline" tone="tertiary">
                          {z.provincia}
                        </Text>
                        <Text size="heading-xs" weight="semibold">
                          {z.nombre}
                        </Text>
                        <Text size="body-sm" tone="secondary">
                          {paradas} {paradas === 1 ? "sitio" : "sitios"} que visitar
                        </Text>
                      </Stack>
                    </Surface>
                  </Link>
                </li>
              );
            })}
          </Grid>
        ) : (
          /*
            No pasa hoy, pero pasaría en un directorio recién abierto donde nadie
            ha puesto su punto todavía. Una pantalla en blanco ahí sería el peor
            momento posible para no decir nada.
          */
          <EmptyState
            icono={Compass}
            titulo="Todavía no hay ninguna zona con ruta"
            descripcion="Hacen falta al menos dos negocios con su punto en el mapa para que haya un orden que armar. Mientras tanto, las zonas están todas en Descubrir con sus horarios y teléfonos."
            accion={
              <Link href="/" className={clasesDeBoton({})}>
                Ver las zonas
              </Link>
            }
          />
        )}

        <Text size="caption" tone="tertiary" className="max-w-prose">
          Las distancias son aproximadas, en línea recta. Para llegar, usa las referencias escritas
          de cada ficha y la app de mapas.
        </Text>
      </Stack>
    </Container>
  );
}
