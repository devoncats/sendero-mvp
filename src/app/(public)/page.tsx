import { Container, Grid, Inline, Section, Stack } from "@/components/layout";
import { EncabezadoSeccion } from "@/components/patterns";
import { ButtonLink, Surface, Text } from "@/components/ui";
import { ENTES, EXPERIENCIAS, NEGOCIOS, ZONAS } from "@/data";

import { TarjetaExperiencia } from "./_experiencia";

/**
 * Lo que la portada promete en tres pasos. Hay un ente en medio, y la promesa
 * honesta es que ese ente es de la comunidad y no se queda con nada.
 */
const PASOS = [
  "Eliges una experiencia, la fecha y cuántos van.",
  "La cooperativa o el consorcio del pueblo te confirma por WhatsApp. No pagas nada en línea.",
  "Cada familia te atiende en su momento del recorrido y recibe su parte.",
];

/**
 * La portada del portal: las experiencias de las comunidades.
 *
 * Una rejilla de tarjetas, en el orden del registro (`data/experiencias`).
 * Lo que antes estaba aquí de una sola experiencia —a dónde va el dinero, quién
 * atiende— vive ahora en la página de cada una, que es donde se decide.
 *
 * Con una experiencia la rejilla es una tarjeta; con nueve, nueve. La portada
 * no cambia cuando entra una nueva, y ese es el patrón.
 */
export default function ExperienciasPage() {
  const comunidades = ENTES.length;

  return (
    <div className="relative isolate">
      <div className="lavado-superior" aria-hidden />
      <Container ancho="sm" as="main" className="lg:max-w-page-xl">
        <Stack gap="loose" className="py-stack-loose">
          <Stack gap="tight" className="max-w-prose">
            <Text size="overline" tone="brand">
              Ecoturismo comunitario · Panamá
            </Text>
            <Text as="h1" size="display-sm" serif weight="semibold" className="text-balance lg:text-display-lg">
              El Panamá que te cuentan quienes viven en él
            </Text>
            <Text size="body-lg" tone="secondary">
              {EXPERIENCIAS.length === 1 ? "Una experiencia" : `${EXPERIENCIAS.length} experiencias`} organizadas
              por {comunidades === 1 ? "una comunidad" : `${comunidades} comunidades`}. Lo que pagas llega a las
              familias que te atienden, y se dice a cuál y cuánto.
            </Text>
          </Stack>

          {/* Las experiencias. Una sola rejilla, sin destacada: ninguna comunidad vale más que otra. */}
          <Section espaciado="none">
            <Grid cols={2} movil={1} gap="lg" as="ul">
              {EXPERIENCIAS.map((e, i) => (
                <li key={e.id}>
                  {/* Las dos primeras son el LCP en escritorio; en el teléfono, la primera. */}
                  <TarjetaExperiencia e={e} prioridad={i < 2} />
                </li>
              ))}
            </Grid>
          </Section>

          {/* Cómo funciona */}
          <Surface nivel="none" relleno="lg" borde={false} className="bg-brand-surface lg:p-inset-xl">
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
            El directorio, como secundario. Va después de las experiencias y de
            cómo funcionan, sin tarjetas ni fotos: una frase y un botón
            secundario. Quien llega a la portada tiene que ver primero lo que
            organiza la comunidad; quien prefiere ir por su cuenta encuentra
            aquí, y en la tercera pestaña, por dónde seguir.
          */}
          <Section espaciado="none">
            <Inline gap="lg" align="center" wrap={false} className="max-sm:flex-col max-sm:items-stretch">
              <Stack gap="tight" className="flex-1">
                <EncabezadoSeccion kicker="Por tu cuenta">¿Prefieres armar tu propio viaje?</EncabezadoSeccion>
                <Text size="body-md" tone="secondary" className="max-w-prose">
                  {NEGOCIOS.length} artesanos, fondas y hospedajes familiares en {ZONAS.length} zonas, con su
                  horario y su WhatsApp. Les escribes directo.
                </Text>
              </Stack>
              <ButtonLink href="/negocios" variante="secondary" className="shrink-0 max-sm:w-full">
                Ver los negocios
              </ButtonLink>
            </Inline>
          </Section>

          {/*
            Lo que viene. El PO quiere que el pase de día y los sitios sueltos
            vayan entrando poco a poco; decirlo aquí es honesto con quien solo
            tiene una mañana.
          */}
          <Section espaciado="none">
            <Stack>
              <EncabezadoSeccion kicker="Pronto">Un pase de día, para quien solo tiene una mañana</EncabezadoSeccion>
              <Text size="body-md" tone="secondary" className="max-w-prose">
                El mercado, la cascada, los fuertes o el mirador por separado. Lo estamos preparando con las
                comunidades.
              </Text>
            </Stack>
          </Section>
        </Stack>
      </Container>
    </div>
  );
}
