import type { Metadata } from "next";
import Link from "next/link";

import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Pencil,
  Photo,
  Upload,
} from "@/components/icons";
import { Container, Stack } from "@/components/layout";
import { ButtonLink, Surface, Text } from "@/components/ui";
import { ACCIONES, pendientes } from "@/data/pendientes";
import { METRICAS_DEMO, SLUG_DEMO, negocioDelDueno } from "@/data/panel";

export const metadata: Metadata = { title: "Panel" };

/**
 * Cada pendiente con su icono. El mapa vive aquí y no en `data` porque los
 * datos no importan componentes — las dependencias apuntan hacia abajo.
 *
 * Nunca un check para algo pendiente: un visto significa hecho, y ponerlo en
 * una tarea sin hacer es mentirle a quien la lee de un vistazo.
 */
const ICONO = {
  fotos: Photo,
  horario: Clock,
  referencia: MapPin,
  precios: Pencil,
  confirmar: AlertCircle,
} as const;

/** Solo la de fotos lleva icono en el botón; subir es la única acción física. */
const ICONO_ACCION = { fotos: Upload } as const;

export default function PanelPage() {
  const negocio = negocioDelDueno();
  const lista = pendientes(negocio, new Date());
  const [siguiente, ...resto] = lista;
  const nombre = negocio.persona.nombre.split(" ")[0];
  const Icono = siguiente ? ICONO[siguiente.id as keyof typeof ICONO] : CheckCircle;
  const IconoAccion = siguiente
    ? ICONO_ACCION[siguiente.id as keyof typeof ICONO_ACCION]
    : undefined;

  return (
    <Container ancho="md" as="main">
      <Stack gap="loose" className="items-center py-section">
        {siguiente ? (
          /* Una sola cosa. Todo lo demás en voz baja. */
          <Surface
            relleno="xl"
            radio="overlay"
            className="w-full max-w-page-sm border-brand-border text-center"
          >
            <Stack gap="default" align="center">
              <span
                className="flex size-avatar-lg items-center justify-center rounded-full bg-brand-surface text-brand"
                aria-hidden
              >
                <Icono className="size-icon-lg" />
              </span>
              <Stack gap="tight" align="center">
                <Text size="overline" tone="tertiary">
                  Lo siguiente
                </Text>
                <Text as="h1" size="heading-lg" weight="semibold">
                  {siguiente.titulo}
                </Text>
              </Stack>
              <Text size="body-lg" tone="secondary" className="max-w-prose">
                {siguiente.porque}
              </Text>
              <Stack gap="tight" align="center" className="w-full">
                <ButtonLink href={siguiente.href} tamano="lg">
                  {IconoAccion ? <IconoAccion className="size-icon-md" aria-hidden /> : null}
                  {siguiente.accion}
                </ButtonLink>
              </Stack>
            </Stack>
          </Surface>
        ) : (
          /* Nada que arreglar. La pantalla no puede quedarse muda. */
          <Surface
            relleno="xl"
            radio="overlay"
            className="w-full max-w-page-sm border-success-border text-center"
          >
            <Stack gap="default" align="center">
              <span
                className="flex size-avatar-lg items-center justify-center rounded-full bg-success-surface text-success"
                aria-hidden
              >
                <CheckCircle className="size-icon-lg" />
              </span>
              <Stack gap="tight" align="center">
                <Text size="overline" tone="tertiary">
                  Todo al día
                </Text>
                <Text as="h1" size="heading-lg" weight="semibold">
                  Tu ficha está completa, {nombre}
                </Text>
              </Stack>
              <Text size="body-lg" tone="secondary" className="max-w-prose">
                No hay nada que arreglar. Volveremos a preguntarte dentro de un mes si todo sigue
                igual.
              </Text>
              <ButtonLink href={`/negocio/${SLUG_DEMO}`} variante="secondary" tamano="lg">
                Ver mi ficha como la ven ellos
                <ExternalLink className="size-icon-md" aria-hidden />
              </ButtonLink>
            </Stack>
          </Surface>
        )}

        {/* Todo lo demás, en voz baja */}
        <Stack gap="default" className="w-full max-w-page-sm">
          <Text size="overline" tone="tertiary">
            También puedes
          </Text>
          <Stack gap="none" as="ul">
            {resto.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="flex min-h-control-lg items-center gap-inset-md border-b border-border-subtle px-inset-lg text-body-lg text-content-secondary"
                >
                  <span className="flex-1">{p.titulo}</span>
                  <ChevronRight className="size-icon-sm shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
            {ACCIONES.map((a) => (
              <li key={a.href + a.titulo}>
                <Link
                  href={a.href}
                  className="flex min-h-control-lg items-center gap-inset-md border-b border-border-subtle px-inset-lg text-body-lg text-content-secondary"
                >
                  <span className="flex-1">{a.titulo}</span>
                  <ChevronRight className="size-icon-sm shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </Stack>
        </Stack>

        {/*
          Las cifras como frase, no como widgets. Cuatro tarjetas con números
          sin acción son ruido para quien nunca usó un panel — la dirección C
          las bajó a esto a propósito.
        */}
        <Text size="body-lg" tone="secondary" className="max-w-page-sm text-center">
          {METRICAS_DEMO.periodo === "este mes" ? "Este mes " : ""}
          <strong className="font-semibold text-content-primary">
            {METRICAS_DEMO.visitasFicha} personas
          </strong>{" "}
          vieron tu ficha y{" "}
          <strong className="font-semibold text-brand">
            {METRICAS_DEMO.contactosWhatsapp} te escribieron
          </strong>{" "}
          por WhatsApp.
        </Text>
      </Stack>
    </Container>
  );
}
