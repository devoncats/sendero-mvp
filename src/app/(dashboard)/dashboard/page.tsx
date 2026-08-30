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
import { Container, Inline, Stack } from "@/components/layout";
import { Badge, ButtonLink, Media, Surface, Text } from "@/components/ui";
import { categoria, zona } from "@/data";
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

  const z = zona(negocio.zona);
  const cat = categoria(negocio.categoria);

  return (
    <Container ancho="md" as="main" className="lg:max-w-page-lg">
      {/*
        La tarjeta de «Lo siguiente» no crece con la pantalla: ensanchada a
        1000 px se volvería un banner y perdería la voz de instrucción. Lo que
        el escritorio añade es lo que un teléfono no puede dar — la ficha de
        verdad al lado de la tarea, para que «agrega dos fotos» deje de ser una
        instrucción abstracta.
      */}
      <Stack
        gap="loose"
        className="items-center py-section lg:grid lg:grid-cols-3 lg:items-start"
      >
        {siguiente ? (
          /* Una sola cosa. Todo lo demás en voz baja. */
          <Surface
            relleno="xl"
            radio="overlay"
            className="w-full max-w-page-sm border-brand-border text-center lg:col-span-2 lg:max-w-none"
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
            className="w-full max-w-page-sm border-success-border text-center lg:col-span-2 lg:max-w-none"
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
        <Stack gap="default" className="w-full max-w-page-sm lg:col-span-2 lg:max-w-none">
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
          las bajó a esto a propósito, y tener sitio de sobra no lo cambia.
        */}
        <Text
          size="body-lg"
          tone="secondary"
          className="max-w-page-sm text-center lg:col-span-2 lg:max-w-none lg:text-left"
        >
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

        {/* Lo único que añade el escritorio */}
        <aside className="hidden w-full lg:sticky lg:top-inset-lg lg:col-start-3 lg:row-start-1 lg:row-span-3 lg:block">
          <Stack gap="tight">
            <Text size="overline" tone="tertiary">
              Tu ficha, como la ven ellos
            </Text>
            <Surface relleno="none" className="overflow-hidden">
              {/*
                Densidad editorial dentro de una pantalla operacional. Todo el
                mecanismo es este atributo: la misma tarjeta que ve el visitante
                respira como en el portal, sin que ningún componente se entere.
              */}
              <div data-density="editorial">
                <Media
                  proporcion="4/3"
                  radio="none"
                  etiqueta={`Retrato de ${negocio.persona.nombre}`}
                  alt={`Foto de ${negocio.nombre}`}
                  sizes="304px"
                />
                <Stack gap="tight" className="p-inset-md">
                  <Badge tono="accent" overline className="self-start">
                    {cat.nombre.es}
                  </Badge>
                  <Text size="body-md" weight="semibold">
                    {negocio.nombre}
                  </Text>
                  <Text size="body-sm" tone="secondary">
                    {negocio.persona.nombre} · {z.nombre}
                  </Text>
                  {negocio.fotos < 3 ? (
                    <Inline gap="icon">
                      <AlertCircle className="size-icon-sm text-trust-stale" aria-hidden />
                      <Text size="body-sm" tone="warning">
                        {negocio.fotos === 1 ? "Solo 1 foto" : `Solo ${negocio.fotos} fotos`}
                      </Text>
                    </Inline>
                  ) : null}
                  <Inline gap="icon">
                    {negocio.estadoDato === "verificado" ? (
                      <CheckCircle className="size-icon-sm text-success" aria-hidden />
                    ) : (
                      <AlertCircle className="size-icon-sm text-trust-stale" aria-hidden />
                    )}
                    <Text
                      size="body-sm"
                      tone={negocio.estadoDato === "verificado" ? "success" : "warning"}
                    >
                      {negocio.estadoDato === "verificado"
                        ? "Datos confirmados"
                        : "Sin confirmar todavía"}
                    </Text>
                  </Inline>
                </Stack>
              </div>
            </Surface>
            <ButtonLink href={`/negocio/${SLUG_DEMO}`} variante="ghost" tamano="sm">
              Abrir la ficha completa
              <ExternalLink className="size-icon-sm" aria-hidden />
            </ButtonLink>
          </Stack>
        </aside>
      </Stack>
    </Container>
  );
}
