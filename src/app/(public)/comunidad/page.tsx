import type { Metadata } from "next";

import { MessageCircle } from "@/components/icons";
import { Container, Grid, Inline, Section, Stack } from "@/components/layout";
import { EncabezadoSeccion } from "@/components/patterns";
import { ButtonLink, Media, Surface, Text } from "@/components/ui";
import { EXPERIENCIAS, PROVEEDORES, emprendimientosDe, ente, zona } from "@/data";
import { enlaceWhatsApp } from "@/lib/formato";

export const metadata: Metadata = {
  title: "La comunidad",
  description: "Quién organiza la experiencia y cómo se reparte lo que pagas.",
};

/**
 * Quién está detrás: el ente económico y las familias.
 *
 * El PO pidió que los emprendimientos no salgan en el portal como fichas
 * sueltas, y no salen: aquí no hay horario, ni productos, ni WhatsApp de cada
 * uno. Sale la gente —quién es y qué hace en el recorrido—, porque la tesis del
 * proyecto sigue siendo la misma: cada cosa que compras tiene nombre de persona.
 *
 * El único contacto es el de la cooperativa. Que el visitante le escriba a una
 * familia directamente rompería el reparto, que es lo que hace que le llegue
 * trabajo también a la que menos se conoce.
 */
export default function ComunidadPage() {
  const e = EXPERIENCIAS[0];
  const coop = ente(e.ente);
  const z = zona(coop.zona);
  const familias = emprendimientosDe(e);
  const locales = PROVEEDORES.filter((p) => p.local).length;

  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      <Stack gap="loose" className="py-stack-loose">
        <Stack gap="default" className="max-w-prose">
          <Stack gap="tight">
            <Text size="overline" tone="brand">
              {z.nombre} · desde {coop.fundadaEn}
            </Text>
            <Text as="h1" size="display-sm" serif weight="semibold" className="text-balance">
              {familias.length} familias, un solo recorrido
            </Text>
          </Stack>
          <Text size="body-lg" tone="secondary">
            {coop.descripcion.es}
          </Text>
        </Stack>

        {/* Quien contesta */}
        <Surface relleno="lg" className="lg:p-inset-xl">
          <div className="flex flex-col gap-stack sm:flex-row sm:items-center">
            <Inline gap="md" align="center" wrap={false} className="flex-1">
              <Media
                proporcion="1/1"
                radio="full"
                semilla={coop.contacto.nombre}
                alt={`Retrato de ${coop.contacto.nombre}`}
                sizes="96px"
                className="size-avatar-xl shrink-0"
              />
              <Stack gap="tight" className="min-w-0">
                <Stack gap="none">
                  <Text size="heading-xs" weight="semibold">
                    {coop.contacto.nombre}
                  </Text>
                  <Text size="body-sm" tone="tertiary">
                    {coop.contacto.oficio} · {coop.nombre}
                  </Text>
                </Stack>
                {coop.contacto.cita ? (
                  <Text as="blockquote" size="body-md" serif className="italic">
                    «{coop.contacto.cita}»
                  </Text>
                ) : null}
              </Stack>
            </Inline>
            <ButtonLink
              href={enlaceWhatsApp(coop.whatsapp, `Hola, ${coop.contacto.nombre.split(" ")[0]}. Tengo una pregunta sobre las experiencias de ${z.nombre}.`)}
              externo
              variante="secondary"
              className="shrink-0"
            >
              <MessageCircle className="size-icon-md" aria-hidden />
              Escribir a la cooperativa
            </ButtonLink>
          </div>
        </Surface>

        {/* Cómo se reparte */}
        <Section espaciado="none">
          <Stack>
            <EncabezadoSeccion kicker="Cómo funciona por dentro">Lo que hace la cooperativa</EncabezadoSeccion>
            <Grid cols={3} movil={1} gap="lg" as="ul">
              <li>
                <Stack gap="tight">
                  <Text as="h3" size="heading-xs" weight="semibold">
                    Recibe y reparte
                  </Text>
                  <Text size="body-md" tone="secondary">
                    Tu solicitud llega a la cooperativa, y ella le avisa a cada familia qué día, a qué
                    hora y cuántos van. Cuando dos pueden atender lo mismo, el trabajo se turna.
                  </Text>
                </Stack>
              </li>
              <li>
                <Stack gap="tight">
                  <Text as="h3" size="heading-xs" weight="semibold">
                    Lleva las cuentas
                  </Text>
                  <Text size="body-md" tone="secondary">
                    Cada familia reporta lo que vendió y lo que gastó. Si alguna pasa un mal momento,
                    la cooperativa lo ve a tiempo y le manda más visitantes.
                  </Text>
                </Stack>
              </li>
              <li>
                <Stack gap="tight">
                  <Text as="h3" size="heading-xs" weight="semibold">
                    Compra en el pueblo
                  </Text>
                  <Text size="body-md" tone="secondary">
                    {locales} de los {PROVEEDORES.length} proveedores de las familias son del propio
                    valle: la gallina, el maíz, el café y hasta la lavandería.
                  </Text>
                </Stack>
              </li>
            </Grid>
          </Stack>
        </Section>

        {/* Las familias */}
        <Section espaciado="none">
          <Stack>
            <EncabezadoSeccion kicker="Los socios">Quién te va a atender</EncabezadoSeccion>
            <Grid cols={2} movil={1} gap="lg" as="ul">
              {familias.map((n) => (
                <li key={n.slug}>
                  <Surface relleno="md" className="h-full">
                    <Stack gap="tight">
                      <Inline gap="md" align="center" wrap={false}>
                        <Media
                          proporcion="1/1"
                          radio="full"
                          semilla={n.persona.nombre}
                          alt={`Retrato de ${n.persona.nombre}`}
                          sizes="64px"
                          className="size-avatar-lg shrink-0"
                        />
                        <Stack gap="none" className="min-w-0">
                          <Text as="h3" size="heading-xs" weight="semibold">
                            {n.persona.nombre}
                          </Text>
                          <Text size="body-sm" tone="tertiary">
                            {n.persona.oficio}
                            {n.persona.anos ? ` · ${n.persona.anos} años` : ""} · {n.nombre}
                          </Text>
                        </Stack>
                      </Inline>
                      <Text size="body-md" tone="secondary">
                        {n.descripcion.es}
                      </Text>
                      {n.persona.cita ? (
                        <Text as="blockquote" size="body-md" serif className="italic">
                          «{n.persona.cita}»
                        </Text>
                      ) : null}
                    </Stack>
                  </Surface>
                </li>
              ))}
            </Grid>
          </Stack>
        </Section>
      </Stack>
    </Container>
  );
}
