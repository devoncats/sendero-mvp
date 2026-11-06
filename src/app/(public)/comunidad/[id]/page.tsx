import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, MessageCircle } from "@/components/icons";
import { Container, Grid, Inline, Section, Stack } from "@/components/layout";
import { EncabezadoSeccion } from "@/components/patterns";
import { ButtonLink, Media, Surface, Text } from "@/components/ui";
import { ENTES, INSUMOS, PROVEEDORES, elEnte, experienciasDe, sociosDe, zona } from "@/data";
import { enlaceWhatsApp } from "@/lib/formato";

import { Familias, TarjetaExperiencia } from "../../_experiencia";

export function generateStaticParams() {
  return ENTES.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const coop = ENTES.find((e) => e.id === id);
  if (!coop) return {};
  return { title: coop.nombre, description: `Quién organiza las experiencias de ${zona(coop.zona).nombre} y cómo se reparte lo que pagas.` };
}

/**
 * Quién está detrás de una comunidad: el ente económico, sus experiencias y
 * sus socios.
 *
 * El PO pidió que los emprendimientos no salgan en el portal como fichas
 * sueltas, y no salen: aquí no hay horario, ni productos, ni WhatsApp de cada
 * uno. Sale la gente —quién es y qué hace en el recorrido—, porque la tesis del
 * proyecto sigue siendo la misma: cada cosa que compras tiene nombre de persona.
 *
 * El único contacto es el del ente. Que el visitante le escriba a una familia
 * directamente rompería el reparto, que es lo que hace que le llegue trabajo
 * también a la que menos se conoce.
 *
 * Estática: una por ente, generada en el build.
 */
export default async function ComunidadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coop = ENTES.find((e) => e.id === id);
  if (!coop) notFound();

  const z = zona(coop.zona);
  const experiencias = experienciasDe(coop.id);
  const socios = sociosDe(coop.id);
  const quien = elEnte(coop);

  // Los proveedores de esta comunidad: a quien le compra alguno de sus socios.
  const proveedores = PROVEEDORES.filter((p) =>
    INSUMOS.some((i) => i.proveedor === p.id && socios.some((n) => n.slug === i.emprendimiento)),
  );
  const locales = proveedores.filter((p) => p.local).length;

  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      <Stack gap="loose" className="py-stack">
        <Link
          href="/comunidades"
          className="inline-flex min-h-touch-min items-center gap-icon-gap self-start text-body-md font-medium text-brand"
        >
          <ArrowLeft className="size-icon-md" aria-hidden />
          Comunidades
        </Link>

        <Stack gap="default" className="max-w-prose">
          <Stack gap="tight">
            <Text size="overline" tone="brand">
              {z.nombre} · {z.provincia} · desde {coop.fundadaEn}
            </Text>
            <Text as="h1" size="display-sm" serif weight="semibold" className="text-balance">
              {coop.nombre}
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
                    {coop.contacto.oficio}
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
              href={enlaceWhatsApp(
                coop.whatsapp,
                `Hola, ${coop.contacto.nombre.split(" ")[0]}. Tengo una pregunta sobre las experiencias de ${z.nombre}.`,
              )}
              externo
              variante="secondary"
              className="shrink-0"
            >
              <MessageCircle className="size-icon-md" aria-hidden />
              Escribir a {quien}
            </ButtonLink>
          </div>
        </Surface>

        {/* Lo que organiza */}
        <Section espaciado="none">
          <Stack>
            <EncabezadoSeccion kicker="Lo que organiza">
              {experiencias.length === 1 ? "Su experiencia" : `Sus ${experiencias.length} experiencias`}
            </EncabezadoSeccion>
            <Grid cols={2} movil={1} gap="lg" as="ul">
              {experiencias.map((e) => (
                <li key={e.id}>
                  <TarjetaExperiencia e={e} />
                </li>
              ))}
            </Grid>
          </Stack>
        </Section>

        {/* Cómo se reparte */}
        <Section espaciado="none">
          <Stack>
            <EncabezadoSeccion kicker="Cómo funciona por dentro">Lo que hace {quien}</EncabezadoSeccion>
            <Grid cols={3} movil={1} gap="lg" as="ul">
              <li>
                <Stack gap="tight">
                  <Text as="h3" size="heading-xs" weight="semibold">
                    Recibe y reparte
                  </Text>
                  <Text size="body-md" tone="secondary">
                    Tu solicitud llega a {quien}, que le avisa a cada familia qué día, a qué hora y cuántos van.
                    Cuando dos pueden atender lo mismo, el trabajo se turna.
                  </Text>
                </Stack>
              </li>
              <li>
                <Stack gap="tight">
                  <Text as="h3" size="heading-xs" weight="semibold">
                    Lleva las cuentas
                  </Text>
                  <Text size="body-md" tone="secondary">
                    Cada familia reporta lo que vendió y lo que gastó. Si alguna pasa un mal momento,{" "}
                    {quien} lo ve a tiempo y le manda más visitantes.
                  </Text>
                </Stack>
              </li>
              <li>
                <Stack gap="tight">
                  <Text as="h3" size="heading-xs" weight="semibold">
                    Compra en el pueblo
                  </Text>
                  <Text size="body-md" tone="secondary">
                    {proveedores.length > 0
                      ? `${locales} de los ${proveedores.length} proveedores de las familias son de ${z.nombre}: el dinero se queda en la comunidad una vuelta más.`
                      : "Las familias le compran a proveedores de la propia comunidad siempre que pueden."}
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
            <Familias negocios={socios} conCita />
          </Stack>
        </Section>
      </Stack>
    </Container>
  );
}
