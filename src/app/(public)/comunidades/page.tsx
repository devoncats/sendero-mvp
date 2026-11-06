import type { Metadata } from "next";
import Link from "next/link";

import { ChevronRight } from "@/components/icons";
import { Container, Grid, Inline, Stack } from "@/components/layout";
import { Media, Text } from "@/components/ui";
import { ENTES, experienciasDe, sociosDe, zona } from "@/data";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Comunidades",
  description: "Las comunidades que organizan las experiencias, y quién da la cara por cada una.",
};

const TIPO = { cooperativa: "Cooperativa", consorcio: "Consorcio", sociedad: "Sociedad" } as const;

/**
 * Las comunidades, una tarjeta por ente económico.
 *
 * Es la sección de primer nivel que antes era «La comunidad», en singular.
 * Con un ente por comunidad, la lista de entes es la lista de comunidades;
 * cada tarjeta lleva a quien da la cara y a sus socios.
 */
export default function ComunidadesPage() {
  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      <Stack gap="loose" className="py-stack-loose">
        <Stack gap="tight" className="max-w-prose">
          <Text size="overline" tone="brand">
            Quién organiza
          </Text>
          <Text as="h1" size="display-sm" serif weight="semibold" className="text-balance">
            Las comunidades detrás de cada experiencia
          </Text>
          <Text size="body-lg" tone="secondary">
            Cada comunidad vende junta a través de su cooperativa o su consorcio, que recibe tu solicitud y reparte
            el trabajo entre las familias.
          </Text>
        </Stack>

        <Grid cols={2} movil={1} gap="lg" as="ul">
          {ENTES.map((coop) => {
            const z = zona(coop.zona);
            const experiencias = experienciasDe(coop.id).length;
            return (
              <li key={coop.id}>
                <Link
                  href={`/comunidad/${coop.id}`}
                  className={cn(
                    "group flex h-full items-center gap-inset-md rounded-surface border border-border-subtle bg-surface p-inset-md",
                    "transition-[border-color,box-shadow] motion-reduce:transition-none",
                    "hover:border-border-default hover:shadow-card",
                    "active:scale-press active:bg-action-secondary-hover",
                  )}
                >
                  <Media
                    proporcion="1/1"
                    semilla={z.nombre}
                    alt={`${z.nombre}, ${z.provincia}`}
                    sizes="96px"
                    className="size-avatar-xl shrink-0"
                  />
                  <Stack gap="tight" className="min-w-0 flex-1">
                    <Text size="overline" tone="tertiary">
                      {z.nombre} · {TIPO[coop.tipo]}
                    </Text>
                    <Text as="h2" size="heading-xs" weight="semibold" className="group-hover:underline">
                      {coop.nombre}
                    </Text>
                    <Inline gap="sm">
                      <Text as="span" size="body-sm" tone="secondary">
                        {sociosDe(coop.id).length} familias ·{" "}
                        {experiencias === 1 ? "1 experiencia" : `${experiencias} experiencias`}
                      </Text>
                    </Inline>
                  </Stack>
                  <ChevronRight className="size-icon-md shrink-0 text-content-tertiary" aria-hidden />
                </Link>
              </li>
            );
          })}
        </Grid>
      </Stack>
    </Container>
  );
}
