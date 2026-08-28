import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AlertCircle, Bookmark, CheckCircle, MessageCircle, Phone, Search } from "@/components/icons";
import { Container, Grid, Inline, Section, Stack } from "@/components/layout";
import {
  BusinessCard,
  CategoryChip,
  EmptyState,
  FilterGroup,
  FilterSheet,
  OfflineBanner,
} from "@/components/patterns";
import type { NegocioResumen } from "@/components/patterns";
import { Badge, Button, ButtonLink, Input, Media, Surface, Text } from "@/components/ui";

export const metadata: Metadata = { title: "Vista de componentes" };

/**
 * Sin Storybook, esta página es la única red contra regresiones. Cada primitivo
 * aparece en sus estados, y todo lo interesante se muestra dos veces: una en
 * cada densidad. Si algo se rompe, se rompe aquí antes que en una pantalla.
 */

function Bloque({ titulo, nota, children }: { titulo: string; nota?: string; children: ReactNode }) {
  return (
    <Section espaciado="none" className="border-t border-border-subtle pt-stack-loose">
      <Stack>
        <Stack gap="tight">
          <Text as="h2" size="heading-lg" serif>
            {titulo}
          </Text>
          {nota ? (
            <Text size="body-md" tone="secondary" className="max-w-prose">
              {nota}
            </Text>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </Section>
  );
}

/** Se renderiza igual bajo las dos densidades. Nunca recibe un prop de densidad. */
function DosDensidades({ children }: { children: ReactNode }) {
  return (
    <Grid cols={2} gap="stack">
      {/* El div con data-density es deliberado: en la app real ese atributo lo
          pone el layout de ruta, nunca un componente. Aquí lo falseamos para
          poder comparar las dos densidades en una misma página. */}
      <div data-density="editorial">
        <Stack gap="tight">
          <Text size="label" tone="tertiary">
            editorial · portal
          </Text>
          {children}
        </Stack>
      </div>
      <div data-density="operational">
        <Stack gap="tight">
          <Text size="label" tone="tertiary">
            operational · dashboard
          </Text>
          {children}
        </Stack>
      </div>
    </Grid>
  );
}

/**
 * Los campos no pueden pasar por `DosDensidades`: eso duplicaría los `id` en el
 * DOM y cada etiqueta apuntaría al primer control con ese id, no al suyo. El
 * sufijo mantiene los pares únicos.
 */
function Campos({ sufijo }: { sufijo: string }) {
  const tel = `tel-${sufijo}`;
  const nombre = `nombre-${sufijo}`;
  return (
    <Surface relleno="lg">
      <Stack gap="tight">
        <Stack gap="tight" align="stretch">
          <Text as="label" htmlFor={tel} size="label" weight="medium">
            Teléfono de WhatsApp
          </Text>
          <Input id={tel} type="tel" placeholder="6000-0000" />
          <Text size="caption" tone="tertiary">
            Es el número al que te van a escribir.
          </Text>
        </Stack>
        <Stack gap="tight" align="stretch">
          <Text as="label" htmlFor={nombre} size="label" weight="medium">
            Nombre del negocio
          </Text>
          <Input id={nombre} invalido describedBy={`${nombre}-error`} />
          <Text id={`${nombre}-error`} size="caption" tone="danger">
            Falta el nombre. Sin él la ficha no se puede publicar.
          </Text>
        </Stack>
      </Stack>
    </Surface>
  );
}

/**
 * Datos de muestra locales a esta página. Los de verdad llegan en la Fase 2, en
 * src/data — y los patrones seguirán sin importarlos: las dependencias apuntan
 * hacia abajo, así que una tarjeta nunca sabe de dónde salió su negocio.
 */
const NEGOCIOS: NegocioResumen[] = [
  {
    nombre: "Artesanías Delia Quintero",
    persona: "Delia Quintero",
    categoria: "Artesanía",
    zona: "Santa Fe, Veraguas",
    href: "#",
    estado: "Abierto ahora",
    estadoAbierto: true,
    confianza: "verificado",
    confianzaTexto: "Datos confirmados hace 3 días",
    guardado: true,
  },
  {
    nombre: "Hamacas de El Carmen",
    persona: "Odilia Sánchez",
    categoria: "Artesanía",
    zona: "Santa Fe, Veraguas",
    href: "#-2",
    estado: "Cierra a las 4:00 p.m.",
    confianza: "desactualizado",
    confianzaTexto: "Horario sin confirmar",
  },
  {
    nombre: "Fonda La Ensenada",
    persona: "Rita Domínguez",
    categoria: "Comida",
    zona: "Pedasí, Los Santos",
    href: "#-3",
  },
];

export default function ComponentsPreviewPage() {
  return (
    <Container ancho="xl" as="main">
      <Section>
        <Stack gap="loose">
          <Stack gap="tight">
            <Text size="overline" tone="tertiary">
              Fase 1
            </Text>
            <Text as="h1" size="display-sm" serif>
              Vista de componentes
            </Text>
            <Text size="body-lg" tone="secondary" className="max-w-prose">
              Los cinco layouts, los seis primitivos y los cinco patrones, en sus estados. Todo lo que se ve aquí es
              Server Component: en esta ruta no hay un solo kilobyte de JavaScript propio.
            </Text>
          </Stack>

          <Bloque
            titulo="Button"
            nota="El mismo botón, cuatro variantes y tres tamaños. A la izquierda mide 48 px; a la derecha, 36. No hay prop que lo cause."
          >
            <DosDensidades>
              <Surface relleno="lg">
                <Stack gap="tight">
                  <Inline gap="sm">
                    <Button>Primario</Button>
                    <Button variante="secondary">Secundario</Button>
                    <Button variante="ghost">Fantasma</Button>
                    <Button variante="danger">Eliminar</Button>
                  </Inline>
                  <Inline gap="sm" align="end">
                    <Button tamano="sm">Pequeño</Button>
                    <Button tamano="md">Medio</Button>
                    <Button tamano="lg">Grande</Button>
                  </Inline>
                  <Inline gap="sm">
                    <Button disabled>Deshabilitado</Button>
                    <Button soloIcono variante="secondary">
                      <Bookmark className="size-icon-md" aria-label="Guardar" />
                    </Button>
                    <ButtonLink href="/tokens-preview" variante="secondary">
                      Enlace con forma de botón
                    </ButtonLink>
                  </Inline>
                  <Button anchoCompleto>
                    <MessageCircle className="size-icon-md" aria-hidden />
                    Escribir por WhatsApp
                  </Button>
                </Stack>
              </Surface>
            </DosDensidades>
          </Bloque>

          <Bloque
            titulo="Text"
            nota="Cada tamaño trae su interlineado y su tracking desde el token. El serif es solo para titulares del portal."
          >
            <Grid cols={2} gap="stack">
              <Surface relleno="lg">
                <Stack gap="tight">
                  <Text size="display-sm" serif>
                    Display sm, serif
                  </Text>
                  <Text as="h3" size="heading-lg" serif>
                    Heading lg, serif
                  </Text>
                  <Text size="heading-sm" weight="semibold">
                    Heading sm
                  </Text>
                  <Text size="body-lg" tone="secondary">
                    Body lg — el cuerpo nunca baja de 16 px en el portal.
                  </Text>
                  <Text size="body-sm" tone="tertiary">
                    Body sm
                  </Text>
                  <Text size="overline" tone="tertiary">
                    Overline
                  </Text>
                </Stack>
              </Surface>
              <Surface relleno="lg">
                <Stack gap="tight">
                  <Text tone="primary">Tono primario</Text>
                  <Text tone="secondary">Tono secundario</Text>
                  <Text tone="tertiary">Tono terciario</Text>
                  <Text tone="brand">Tono de marca</Text>
                  <Text tone="accent">Tono de acento</Text>
                  <Text tone="success">Tono de éxito</Text>
                  <Text tone="warning">Tono de aviso</Text>
                  <Text tone="danger">Tono de peligro</Text>
                  <Text truncate className="max-w-page-sm">
                    Truncado: un nombre de negocio muy largo que no debe romper la fila donde vive
                  </Text>
                </Stack>
              </Surface>
            </Grid>
          </Bloque>

          <Bloque titulo="Surface" nota="La elevación es sombra en claro y superficie más clara en oscuro. Aquí, las dos.">
            <Grid cols={2} gap="stack">
              <Surface nivel="sunken" relleno="lg" borde={false}>
                <Stack gap="tight">
                  <Text size="label" tone="tertiary">
                    Claro
                  </Text>
                  <Surface nivel="flat">
                    <Text size="body-sm">flat</Text>
                  </Surface>
                  <Surface nivel="raised" borde={false}>
                    <Text size="body-sm">raised</Text>
                  </Surface>
                  <Surface nivel="sunken" borde={false}>
                    <Text size="body-sm">sunken</Text>
                  </Surface>
                </Stack>
              </Surface>
              <div data-theme="dark">
                <Surface nivel="sunken" relleno="lg" borde={false}>
                  <Stack gap="tight">
                    <Text size="label" tone="tertiary">
                      Oscuro
                    </Text>
                    <Surface nivel="flat">
                      <Text size="body-sm">flat</Text>
                    </Surface>
                    <Surface nivel="raised" borde={false}>
                      <Text size="body-sm">raised</Text>
                    </Surface>
                    <Surface nivel="sunken" borde={false}>
                      <Text size="body-sm">sunken</Text>
                    </Surface>
                  </Stack>
                </Surface>
              </div>
            </Grid>
          </Bloque>

          <Bloque
            titulo="Badge"
            nota="Los tres últimos son los estados de confianza del dato: es lo que separa un directorio vivo de una guía telefónica vieja."
          >
            <Surface relleno="lg">
              <Inline gap="sm">
                <Badge>Neutral</Badge>
                <Badge tono="brand">Marca</Badge>
                <Badge tono="accent" overline>
                  Artesanía
                </Badge>
                <Badge tono="success">Abierto ahora</Badge>
                <Badge tono="warning">Cierra pronto</Badge>
                <Badge tono="danger">Cerrado</Badge>
                <Badge tono="info">Nuevo</Badge>
                <Badge tono="verificado">
                  <CheckCircle className="size-icon-sm" aria-hidden />
                  Confirmado hace 3 días
                </Badge>
                <Badge tono="desactualizado">
                  <AlertCircle className="size-icon-sm" aria-hidden />
                  Horario sin confirmar
                </Badge>
                <Badge tono="sinConfirmar">Sin confirmar</Badge>
              </Inline>
            </Surface>
          </Bloque>

          <Bloque
            titulo="Media"
            nota="Proporción declarada siempre, así el hueco ya mide lo que va a medir. Sin src renderiza el marcador — que es también el estado de imagen que no cargó."
          >
            <Grid cols={4} gap="md">
              <Stack gap="tight">
                <Media proporcion="4/3" etiqueta="4 / 3" />
                <Text size="caption" tone="tertiary">
                  photo
                </Text>
              </Stack>
              <Stack gap="tight">
                <Media proporcion="1/1" etiqueta="1 / 1" />
                <Text size="caption" tone="tertiary">
                  square
                </Text>
              </Stack>
              <Stack gap="tight">
                <Media proporcion="3/4" etiqueta="3 / 4" />
                <Text size="caption" tone="tertiary">
                  portrait
                </Text>
              </Stack>
              <Stack gap="tight">
                <Media proporcion="16/9" etiqueta="16 / 9" />
                <Text size="caption" tone="tertiary">
                  wide
                </Text>
              </Stack>
            </Grid>
          </Bloque>

          <Bloque titulo="Input" nota="El foco se ve siempre. El estado inválido nunca depende solo del color.">
            <Grid cols={2} gap="stack">
              <div data-density="editorial">
                <Stack gap="tight">
                  <Text size="label" tone="tertiary">
                    editorial · portal
                  </Text>
                  <Campos sufijo="portal" />
                </Stack>
              </div>
              <div data-density="operational">
                <Stack gap="tight">
                  <Text size="label" tone="tertiary">
                    operational · dashboard
                  </Text>
                  <Campos sufijo="dashboard" />
                </Stack>
              </div>
            </Grid>
          </Bloque>

          <Bloque
            titulo="Layout"
            nota="Container, Stack, Inline, Grid y Section. Ninguno acepta un espacio arbitrario: solo la escala semántica."
          >
            <DosDensidades>
              <Surface relleno="lg">
                <Stack gap="tight">
                  <Text size="label" tone="tertiary">
                    Grid de 3 · gap md
                  </Text>
                  <Grid cols={3} gap="md">
                    <Surface nivel="sunken" relleno="sm" borde={false}>
                      <Text size="caption">uno</Text>
                    </Surface>
                    <Surface nivel="sunken" relleno="sm" borde={false}>
                      <Text size="caption">dos</Text>
                    </Surface>
                    <Surface nivel="sunken" relleno="sm" borde={false}>
                      <Text size="caption">tres</Text>
                    </Surface>
                  </Grid>
                  <Text size="label" tone="tertiary">
                    Inline · justify between
                  </Text>
                  <Inline justify="between" gap="sm" wrap={false}>
                    <Inline gap="icon">
                      <Search className="size-icon-md text-content-tertiary" aria-hidden />
                      <Text size="body-sm" tone="secondary">
                        Buscar
                      </Text>
                    </Inline>
                    <Phone className="size-icon-md text-content-tertiary" aria-label="Llamar" />
                  </Inline>
                </Stack>
              </Surface>
            </DosDensidades>
          </Bloque>

          <Bloque
            titulo="BusinessCard"
            nota="El patrón más repetido del portal: Descubrir, Zona, Resultados y Guardados. Toda la fila es el enlace, no un texto de 14 px."
          >
            <Grid cols={2} gap="stack">
              <Surface relleno="lg">
                <Stack>
                  {NEGOCIOS.map((n) => (
                    <BusinessCard key={n.href} negocio={n} />
                  ))}
                </Stack>
              </Surface>
              <Surface relleno="lg">
                <Grid cols={2} gap="md">
                  {NEGOCIOS.slice(0, 2).map((n) => (
                    <BusinessCard key={n.href} negocio={n} orientacion="vertical" />
                  ))}
                </Grid>
              </Surface>
            </Grid>
          </Bloque>

          <Bloque titulo="CategoryChip" nota="Es un enlace, no un botón: filtrar cambia la URL, así que el resultado se puede compartir y volver atrás. 44 px de alto en el portal.">
            <DosDensidades>
              <Surface relleno="lg">
                <Inline gap="sm">
                  <CategoryChip href="#" activo>
                    Artesanía
                  </CategoryChip>
                  <CategoryChip href="#">Comida</CategoryChip>
                  <CategoryChip href="#">Hospedaje</CategoryChip>
                  <CategoryChip href="#">Experiencias</CategoryChip>
                </Inline>
              </Surface>
            </DosDensidades>
          </Bloque>

          <Bloque titulo="EmptyState" nota="Nunca un texto gris centrado: dice qué pasó, por qué, y cuál es el siguiente paso.">
            <Grid cols={2} gap="stack">
              <Surface relleno="none">
                <EmptyState
                  icono={Bookmark}
                  titulo="Guarda antes de perder la señal"
                  descripcion="En la montaña y en las islas casi no hay datos. Lo que guardes se queda en el teléfono, con teléfono y dirección."
                  accion={<ButtonLink href="/">Explorar zonas</ButtonLink>}
                />
              </Surface>
              <Surface relleno="none">
                <EmptyState
                  icono={Search}
                  titulo="Todavía no hay hospedajes en Guna Yala"
                  descripcion="Es una zona nueva en Sendero. Hay 11 negocios de otras categorías."
                  accion={
                    <ButtonLink href="/" variante="secondary">
                      Ver artesanía en Guna Yala
                    </ButtonLink>
                  }
                />
              </Surface>
            </Grid>
          </Bloque>

          <Bloque titulo="OfflineBanner" nota="No dice «error»: dice qué se puede seguir haciendo. La detección real de red llegará como componente cliente, y se pagará en kilobytes cuando toque.">
            <Surface relleno="none" className="overflow-hidden">
              <OfflineBanner />
            </Surface>
          </Bloque>

          <Bloque
            titulo="FilterSheet"
            nota="Sobre <details> nativo. Sin Radix, sin JavaScript y sin dependencia: un panel de filtros no necesita ser modal, y en cuanto deja de serlo desaparece la razón de tener trampa de foco."
          >
            <Grid cols={2} gap="stack">
              <FilterSheet activos={2} resumen="6 negocios en Santa Fe" abiertoPorDefecto>
                <FilterGroup etiqueta="Zona">
                  <CategoryChip href="#">Todas</CategoryChip>
                  <CategoryChip href="#" activo>
                    Santa Fe
                  </CategoryChip>
                  <CategoryChip href="#">Pedasí</CategoryChip>
                </FilterGroup>
                <FilterGroup etiqueta="Categoría">
                  <CategoryChip href="#" activo>
                    Artesanía
                  </CategoryChip>
                  <CategoryChip href="#">Comida</CategoryChip>
                </FilterGroup>
              </FilterSheet>
              <FilterSheet activos={0} resumen="Cerrado, como llega la pantalla">
                <FilterGroup etiqueta="Zona">
                  <CategoryChip href="#">Todas</CategoryChip>
                </FilterGroup>
              </FilterSheet>
            </Grid>
          </Bloque>
        </Stack>
      </Section>
    </Container>
  );
}
