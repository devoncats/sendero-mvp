import type { Metadata } from "next";

import { Check, Clock, MessageCircle, Photo } from "@/components/icons";
import { Container, Inline, Section, Stack } from "@/components/layout";
import { ButtonLink, Media, Surface, Text } from "@/components/ui";
import { NEGOCIOS, ZONAS, negocioPorSlug } from "@/data";

export const metadata: Metadata = {
  title: "Para tu negocio",
  description:
    "Pon tu negocio en Sendero y los visitantes que andan por tu zona te encuentran y te escriben al WhatsApp. Gratis y sin comisión.",
};

/** Las dudas reales de alguien que nunca ha tenido presencia digital. */
const DUDAS = [
  {
    titulo: "No necesitas página web",
    cuerpo:
      "Tampoco internet en tu local, ni computadora. Con tu teléfono basta, y solo cuando quieras cambiar algo.",
  },
  {
    titulo: "Te escriben a ti, directo",
    cuerpo:
      "El mensaje llega a tu WhatsApp de siempre. Nosotros no hablamos con el cliente ni nos metemos en el trato.",
  },
  {
    titulo: "No cobramos nada",
    cuerpo:
      "Ni por estar, ni por lo que vendas. Sendero es un proyecto de investigación, no una empresa que vive de tu comisión.",
  },
];

const REQUISITOS = [
  { icono: MessageCircle, texto: "Un teléfono con WhatsApp" },
  { icono: Photo, texto: "Tres fotos de lo que vendes. Con la cámara del teléfono está bien." },
  { icono: Clock, texto: "Saber a qué hora abres y a qué hora cierras" },
];

export default function ParaTuNegocioPage() {
  // Cifras reales del propio directorio, no inventadas.
  const delia = negocioPorSlug("artesanias-delia-quintero");

  return (
    <Container ancho="sm" as="main">
      <Stack gap="loose" className="py-section">
        {/* La promesa, en una frase */}
        <Stack gap="default">
          <Text as="h1" size="display-sm" serif weight="semibold">
            Que quien llegue a tu pueblo sepa que existes
          </Text>
          <Text size="body-lg" tone="secondary">
            Pones tu negocio en Sendero y los visitantes que andan por tu zona te encuentran y te
            escriben al WhatsApp. Nada más.
          </Text>
          <ButtonLink href="/acceso" tamano="lg" anchoCompleto>
            Poner mi negocio
          </ButtonLink>
          <Inline gap="icon" justify="center">
            <Check className="size-icon-sm text-success" aria-hidden />
            <Text size="body-md" tone="tertiary">
              Es gratis y toma unos 10 minutos
            </Text>
          </Inline>
        </Stack>

        {/* Prueba — contada por el propio directorio */}
        <Surface relleno="lg">
          <Inline justify="between" wrap={false} className="text-center">
            <Stack gap="tight" align="center" className="flex-1">
              <Text size="heading-md" weight="semibold">
                {NEGOCIOS.length}
              </Text>
              <Text size="caption" tone="tertiary">
                negocios
              </Text>
            </Stack>
            <div className="w-px self-stretch bg-border-subtle" aria-hidden />
            <Stack gap="tight" align="center" className="flex-1">
              <Text size="heading-md" weight="semibold">
                {ZONAS.length}
              </Text>
              <Text size="caption" tone="tertiary">
                zonas
              </Text>
            </Stack>
            <div className="w-px self-stretch bg-border-subtle" aria-hidden />
            <Stack gap="tight" align="center" className="flex-1">
              <Text size="heading-md" weight="semibold" tone="brand">
                0 %
              </Text>
              <Text size="caption" tone="tertiary">
                de comisión
              </Text>
            </Stack>
          </Inline>
        </Surface>

        {/* Las dudas reales */}
        <Section espaciado="none">
          <Stack gap="loose">
            {DUDAS.map((d) => (
              <Stack key={d.titulo} gap="tight">
                <Text as="h2" size="heading-sm" weight="semibold">
                  {d.titulo}
                </Text>
                <Text size="body-md" tone="secondary">
                  {d.cuerpo}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Section>

        {/* Qué hace falta */}
        <Surface relleno="lg" borde={false} className="bg-brand-surface">
          <Stack>
            <Text as="h2" size="heading-sm" weight="semibold" className="text-brand-content">
              Qué necesitas para empezar
            </Text>
            <Stack as="ul">
              {REQUISITOS.map(({ icono: Icono, texto }) => (
                <Inline key={texto} gap="md" align="start" wrap={false} as="li">
                  <Icono className="size-icon-md shrink-0 text-brand" aria-hidden />
                  <Text size="body-md" className="text-brand-content">
                    {texto}
                  </Text>
                </Inline>
              ))}
            </Stack>
          </Stack>
        </Surface>

        {/* Alguien que ya está */}
        {delia?.persona.cita ? (
          <Stack>
            <Text as="blockquote" size="heading-md" serif>
              «Antes vendía a quien pasaba por la casa. Ahora me escriben antes de subir y ya vienen
              sabiendo qué quieren.»
            </Text>
            <Inline gap="sm" wrap={false}>
              <Media
                proporcion="1/1"
                radio="full"
                className="size-avatar-md shrink-0"
                sizes="40px"
                alt={delia.persona.nombre}
              />
              <Stack gap="tight">
                <Text size="body-md" weight="semibold">
                  {delia.persona.nombre}
                </Text>
                <Text size="body-sm" tone="tertiary">
                  {delia.persona.oficio} en Santa Fe, Veraguas
                </Text>
              </Stack>
            </Inline>
          </Stack>
        ) : null}

        {/* Cierre */}
        <Stack className="border-t border-border-subtle pt-stack-loose">
          <ButtonLink href="/acceso" tamano="lg" anchoCompleto>
            Poner mi negocio
          </ButtonLink>
          <Text size="body-md" tone="secondary" className="text-center">
            ¿Prefieres que te ayudemos por teléfono? Escríbenos por WhatsApp y lo hacemos juntos.
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
}
