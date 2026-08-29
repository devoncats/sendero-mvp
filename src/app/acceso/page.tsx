import type { Metadata } from "next";
import Link from "next/link";

import { Compass, Info, MessageCircle } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { Input, Surface, Text } from "@/components/ui";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entra a tu negocio en Sendero con tu número de teléfono. Sin contraseñas.",
};

/**
 * Acceso del dueño.
 *
 * Fuera de (dashboard) a propósito: ese layout muestra el nombre del negocio y
 * las iniciales de la persona, y aquí todavía no sabemos quién es. Pone su
 * propia densidad operacional.
 *
 * Sin contraseñas, por decisión de producto. Un dueño de 60 años que entra dos
 * veces al mes no va a recordar una contraseña, y la va a apuntar en un papel
 * junto al teléfono — que es peor que no tenerla. Un código por SMS usa lo
 * único que siempre lleva encima.
 */
export default function AccesoPage() {
  return (
    <div data-density="operational" className="flex min-h-dvh flex-col">
      <header className="border-b border-border-subtle bg-surface">
        <Container ancho="md">
          <Inline wrap={false} className="h-control-lg">
            <Link href="/" className="flex min-h-control-md items-center gap-icon-gap">
              <Compass className="size-icon-md text-brand" aria-hidden />
              {/* Sin serif: es densidad operacional, y evita traer la segunda
                  familia entera por una palabra. */}
              <Text as="span" size="heading-sm" weight="semibold">
                Sendero
              </Text>
            </Link>
          </Inline>
        </Container>
      </header>

      <Container ancho="md" as="main" className="flex flex-1 items-center py-inset-xl">
        <Stack gap="loose" className="w-full">
          <Surface relleno="xl" radio="overlay" className="mx-auto w-full max-w-page-sm">
            <Stack gap="loose">
              <Stack gap="tight">
                <Text as="h1" size="heading-lg" weight="semibold">
                  Entra a tu negocio
                </Text>
                <Text size="body-lg" tone="secondary">
                  Sin contraseñas. Te mandamos un código por mensaje al número que ya usas.
                </Text>
              </Stack>

              {/*
                Formulario GET a la misma ruta: sin servidor no hay a quién
                mandarle el código. Los controles son nativos y funcionan para
                que se vea el flujo; el aviso de abajo dice qué falta.
              */}
              <form action="/acceso" method="get">
                <Stack gap="default">
                  <Stack gap="tight">
                    <Text as="label" htmlFor="telefono" size="label" weight="medium">
                      Tu número de teléfono
                    </Text>
                    <Inline gap="sm" wrap={false}>
                      <MessageCircle
                        className="size-icon-md shrink-0 text-content-tertiary"
                        aria-hidden
                      />
                      <Input
                        id="telefono"
                        type="tel"
                        tamano="lg"
                        placeholder="6000-0000"
                        describedBy="telefono-ayuda"
                      />
                    </Inline>
                    <Text id="telefono-ayuda" size="caption" tone="tertiary">
                      El mismo donde recibes WhatsApp.
                    </Text>
                  </Stack>

                  <button
                    type="submit"
                    className="inline-flex h-control-lg w-full items-center justify-center rounded-control bg-action-primary px-inset-xl text-body-lg font-semibold text-action-primary-content"
                  >
                    Enviarme el código
                  </button>
                </Stack>
              </form>
            </Stack>
          </Surface>

          <Surface
            relleno="lg"
            radio="control"
            className="mx-auto w-full max-w-page-sm border-info-border bg-info-surface"
          >
            <Inline gap="md" align="start" wrap={false}>
              <Info className="size-icon-md shrink-0 text-info" aria-hidden />
              <Text size="body-md" className="text-info-content">
                En este MVP no hay envío de mensajes ni cuentas de verdad: no hay servidor detrás.{" "}
                <Link href="/dashboard" className="font-semibold underline">
                  Entra directo al panel
                </Link>{" "}
                para ver cómo es por dentro.
              </Text>
            </Inline>
          </Surface>

          <Text size="body-md" tone="secondary" className="mx-auto max-w-page-sm text-center">
            ¿Tu negocio no está en Sendero todavía?{" "}
            <Link href="/para-tu-negocio" className="font-medium text-brand">
              Ponlo aquí, es gratis
            </Link>
          </Text>
        </Stack>
      </Container>
    </div>
  );
}
