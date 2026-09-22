import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft, CheckCircle, ExternalLink, MessageCircle } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { Badge, ButtonLink, Input, Surface, Text } from "@/components/ui";
import { CATEGORIAS, ZONAS } from "@/data";
import { SLUG_DEMO, negocioDelDueno } from "@/data/panel";
import { fechaLarga } from "@/lib/formato";

import { AvisoMvp } from "../../_aviso-mvp";
import { Campo } from "../../_campo";

export const metadata: Metadata = { title: "Mi negocio" };

const MAX_DESCRIPCION = 400;

const CLASES_SELECT =
  "h-control-lg w-full rounded-control border border-border-default bg-surface px-inset-md text-body-lg text-content-primary";

export default function MiNegocioPage() {
  const negocio = negocioDelDueno();
  const descripcion = negocio.descripcion.es;

  return (
    <Container ancho="md" as="main">
      <Stack gap="loose" className="py-inset-xl">
        <Stack gap="default">
          <Link
            href="/dashboard"
            className="inline-flex min-h-control-md w-fit items-center gap-icon-gap text-body-md font-medium text-brand"
          >
            <ArrowLeft className="size-icon-sm" aria-hidden />
            Volver al panel
          </Link>
          <Stack gap="tight">
            <Text as="h1" size="heading-lg" weight="semibold">
              Mi negocio
            </Text>
            <Text size="body-lg" tone="secondary">
              Esto es lo que ven los visitantes en tu ficha.
            </Text>
          </Stack>
        </Stack>

        <AvisoMvp>
          En este MVP los cambios todavía no se guardan: no hay servidor detrás. Puedes escribir en
          los campos para ver cómo se sentirá; lo que hay ahora es lo que está publicado.
        </AvisoMvp>

        <Surface relleno="xl">
          <Stack gap="loose">
            <Campo
              id="nombre"
              etiqueta="Nombre del negocio"
              ayuda="Así aparece en las listas y en el título de tu ficha."
            >
              <Input
                id="nombre"
                tamano="lg"
                defaultValue={negocio.nombre}
                describedBy="nombre-ayuda"
              />
            </Campo>

            <Campo
              id="persona"
              etiqueta="Quién atiende"
              ayuda="Tu nombre va arriba de todo. La gente le escribe a una persona, no a un negocio."
            >
              <Input
                id="persona"
                tamano="lg"
                defaultValue={negocio.persona.nombre}
                describedBy="persona-ayuda"
              />
            </Campo>

            <Stack gap="tight">
              <Text as="label" htmlFor="descripcion" size="label" weight="medium">
                Qué vendes
              </Text>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={4}
                maxLength={MAX_DESCRIPCION}
                defaultValue={descripcion}
                aria-describedby="descripcion-ayuda"
                className="w-full rounded-control border border-border-default bg-surface p-inset-md text-body-lg text-content-primary"
              />
              <Inline justify="between" gap="md" wrap={false}>
                <Text id="descripcion-ayuda" size="caption" tone="tertiary">
                  Cuéntalo como se lo contarías a un vecino.
                </Text>
                {/* Cuenta estática: el contador vivo necesitaría JavaScript, y
                    `maxLength` ya impide pasarse sin costar un solo byte. */}
                <Text size="caption" tone="tertiary" className="shrink-0 tabular-nums">
                  {descripcion.length} / {MAX_DESCRIPCION}
                </Text>
              </Inline>
            </Stack>

            <Inline gap="lg" align="start">
              <Stack gap="tight" className="min-w-0 flex-1">
                <Text as="label" htmlFor="categoria" size="label" weight="medium">
                  Categoría
                </Text>
                <select
                  id="categoria"
                  name="categoria"
                  defaultValue={negocio.categoria}
                  className={CLASES_SELECT}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre.es}
                    </option>
                  ))}
                </select>
              </Stack>
              <Stack gap="tight" className="min-w-0 flex-1">
                <Text as="label" htmlFor="zona" size="label" weight="medium">
                  Zona
                </Text>
                <select id="zona" name="zona" defaultValue={negocio.zona} className={CLASES_SELECT}>
                  {ZONAS.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre}, {z.provincia}
                    </option>
                  ))}
                </select>
              </Stack>
            </Inline>

            <Campo
              id="whatsapp"
              etiqueta="Teléfono de WhatsApp"
              ayuda="Es el número al que te van a escribir. Sale del botón grande de tu ficha."
            >
              <Inline gap="sm" wrap={false}>
                <MessageCircle className="size-icon-md shrink-0 text-content-tertiary" aria-hidden />
                <Input
                  id="whatsapp"
                  type="tel"
                  tamano="lg"
                  defaultValue={`+${negocio.whatsapp}`}
                  describedBy="whatsapp-ayuda"
                />
              </Inline>
            </Campo>
          </Stack>
        </Surface>

        {/* La confirmación periódica, que es lo que mantiene vivo el directorio */}
        <Surface relleno="lg" className="border-success-border bg-trust-verified-surface">
          <Inline gap="lg" align="center" wrap={false}>
            <CheckCircle className="size-icon-md shrink-0 text-success" aria-hidden />
            <Stack gap="tight" className="flex-1">
              <Text size="body-lg" weight="medium" tone="success">
                {negocio.confirmadoEl
                  ? `Confirmaste tus datos el ${fechaLarga(negocio.confirmadoEl)}`
                  : "Todavía no has confirmado tus datos"}
              </Text>
              <Text size="body-md" tone="secondary">
                Cada 30 días te preguntamos si todo sigue igual. Los visitantes ven esa fecha, y por
                eso saben si pueden fiarse del horario.
              </Text>
            </Stack>
            <button
              type="button"
              className="inline-flex h-control-md shrink-0 items-center rounded-control border border-border-default bg-action-secondary px-inset-lg text-body-md font-semibold text-action-secondary-content"
            >
              Confirmar de nuevo
            </button>
          </Inline>
        </Surface>

        <Inline gap="md" justify="between">
          <Badge tono={negocio.estadoDato === "verificado" ? "verificado" : "desactualizado"}>
            {negocio.estadoDato === "verificado" ? "Ficha al día" : "Ficha por confirmar"}
          </Badge>
          <ButtonLink href={`/negocio/${SLUG_DEMO}`} variante="secondary">
            Ver mi ficha como la ven ellos
            <ExternalLink className="size-icon-sm" aria-hidden />
          </ButtonLink>
        </Inline>
      </Stack>
    </Container>
  );
}
