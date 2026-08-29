import type { Metadata } from "next";
import Link from "next/link";

import { AlertCircle, ArrowLeft, Pencil, Plus, Trash } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { Input, Media, Surface, Text } from "@/components/ui";
import { negocioDelDueno } from "@/data/panel";
import { precio } from "@/lib/formato";

import { AvisoMvp } from "../../_aviso-mvp";

export const metadata: Metadata = { title: "Lo que vendes" };

const CLASES_BOTON_ICONO =
  "flex size-control-md shrink-0 items-center justify-center rounded-control border border-border-default bg-action-secondary text-action-secondary-content";

export default function ProductosPage() {
  const negocio = negocioDelDueno();
  const sinPrecio = negocio.productos.filter((p) => p.precio === undefined).length;

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
              Lo que vendes
            </Text>
            <Text size="body-lg" tone="secondary">
              Poner el precio no te obliga a nada. Sirve para que la gente sepa si le alcanza antes
              de escribirte.
            </Text>
          </Stack>
        </Stack>

        <AvisoMvp>
          En este MVP los cambios todavía no se guardan: no hay servidor detrás. Lo que se ve abajo
          es lo que está publicado en tu ficha.
        </AvisoMvp>

        {/* Lo que hay */}
        <Surface relleno="none" className="overflow-hidden">
          <Stack gap="none" as="ul">
            {negocio.productos.map((p, i) => (
              <li
                key={p.nombre}
                className={
                  i < negocio.productos.length - 1 ? "border-b border-border-subtle" : undefined
                }
              >
                <Inline gap="lg" align="center" wrap={false} className="p-inset-lg">
                  <Media
                    proporcion="1/1"
                    className="size-avatar-lg shrink-0"
                    sizes="56px"
                    alt={p.nombre}
                  />
                  <Stack gap="tight" className="min-w-0 flex-1">
                    <Text size="body-lg" weight="medium">
                      {p.nombre}
                    </Text>
                    {p.detalle ? (
                      <Text size="body-md" tone="secondary">
                        {p.detalle}
                      </Text>
                    ) : null}
                  </Stack>
                  {p.precio !== undefined ? (
                    <Text
                      size="body-lg"
                      weight="semibold"
                      className="shrink-0 tabular-nums text-right"
                    >
                      {precio(p.precio, p.desde)}
                    </Text>
                  ) : (
                    <Inline gap="icon" wrap={false} className="shrink-0 text-trust-stale">
                      <AlertCircle className="size-icon-sm" aria-hidden />
                      <Text size="body-md" tone="warning">
                        Sin precio
                      </Text>
                    </Inline>
                  )}
                  <Inline gap="sm" wrap={false} className="shrink-0">
                    <button
                      type="button"
                      aria-label={`Cambiar ${p.nombre}`}
                      className={CLASES_BOTON_ICONO}
                    >
                      <Pencil className="size-icon-sm" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Quitar ${p.nombre}`}
                      className={CLASES_BOTON_ICONO}
                    >
                      <Trash className="size-icon-sm" aria-hidden />
                    </button>
                  </Inline>
                </Inline>
              </li>
            ))}
          </Stack>
        </Surface>

        {sinPrecio > 0 ? (
          <Text size="body-md" tone="warning">
            {sinPrecio === 1
              ? "Un producto está sin precio. Sin él mucha gente no pregunta, por no incomodar."
              : `${sinPrecio} productos están sin precio. Sin él mucha gente no pregunta, por no incomodar.`}
          </Text>
        ) : null}

        {/* Alta */}
        <Surface relleno="xl" className="border-brand-border">
          <Stack gap="loose">
            <Text as="h2" size="heading-sm" weight="semibold">
              Agregar otro
            </Text>

            <Inline gap="lg" align="start">
              <Stack gap="tight" className="shrink-0">
                <Text as="span" size="label" weight="medium">
                  Foto
                </Text>
                <label
                  htmlFor="foto-producto"
                  className="flex size-avatar-xl cursor-pointer flex-col items-center justify-center gap-inset-xs rounded-media border-2 border-dashed border-border-default text-content-tertiary"
                >
                  <Plus className="size-icon-md" aria-hidden />
                  <span className="text-caption">Subir</span>
                  <input
                    id="foto-producto"
                    name="foto-producto"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                  />
                </label>
              </Stack>

              <Stack gap="default" className="min-w-0 flex-1">
                <Stack gap="tight">
                  <Text as="label" htmlFor="nombre-producto" size="label" weight="medium">
                    Qué es
                  </Text>
                  <Input id="nombre-producto" tamano="lg" placeholder="Bolso de pita teñida" />
                </Stack>
                <Inline gap="lg" align="start">
                  <Stack gap="tight" className="w-40 shrink-0">
                    <Text as="label" htmlFor="precio-producto" size="label" weight="medium">
                      Precio
                    </Text>
                    <Input
                      id="precio-producto"
                      type="number"
                      tamano="lg"
                      placeholder="40"
                      describedBy="precio-ayuda"
                    />
                    <Text id="precio-ayuda" size="caption" tone="tertiary">
                      En balboas
                    </Text>
                  </Stack>
                  <Stack gap="tight" className="min-w-0 flex-1">
                    <Text as="label" htmlFor="detalle-producto" size="label" weight="medium">
                      Detalle{" "}
                      <Text as="span" size="label" tone="tertiary" weight="regular">
                        — opcional
                      </Text>
                    </Text>
                    <Input
                      id="detalle-producto"
                      tamano="lg"
                      placeholder="Tamaño, color, cuánto te lleva hacerlo…"
                    />
                  </Stack>
                </Inline>
              </Stack>
            </Inline>

            <Inline
              gap="sm"
              justify="end"
              className="border-t border-border-subtle pt-inset-lg"
            >
              <button
                type="button"
                className="inline-flex h-control-md items-center rounded-control border border-border-default bg-action-secondary px-inset-lg text-body-md font-semibold text-action-secondary-content"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex h-control-md items-center rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content"
              >
                Agregar producto
              </button>
            </Inline>
          </Stack>
        </Surface>
      </Stack>
    </Container>
  );
}
