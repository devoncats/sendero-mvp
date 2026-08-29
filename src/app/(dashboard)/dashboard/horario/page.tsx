import type { Metadata } from "next";
import Link from "next/link";

import { AlertCircle, ArrowLeft, ExternalLink, MapPin } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { Badge, ButtonLink, Input, Surface, Text } from "@/components/ui";
import type { Dia, Franja } from "@/data";
import { SLUG_DEMO, negocioDelDueno } from "@/data/panel";
import { zona } from "@/data";
import { enlaceMapa, fechaLarga, nombreDia, resumenSemana, textoDia } from "@/lib/formato";

import { AvisoMvp } from "../../_aviso-mvp";

export const metadata: Metadata = { title: "Horario y ubicación" };

const DIAS: readonly Dia[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

/**
 * Una fila por día. Los controles son nativos: `input type="time"` abre el
 * selector del sistema, que en un Android de gama media funciona mejor que
 * cualquier cosa que construyamos — y cuesta cero kilobytes.
 *
 * El día sin confirmar no lleva botones muertos de «Cerrado / Abro»: lleva la
 * misma fila que los demás, vacía y marcada. Rellenarla ES confirmarla.
 */
function FilaDia({ dia, valor }: { dia: Dia; valor: Franja | "cerrado" | "sinConfirmar" }) {
  const abre = typeof valor === "object";
  const falta = valor === "sinConfirmar";
  const idAbre = `abre-${dia}`;

  return (
    /*
      Envuelve a propósito. A 375 px la etiqueta y las dos horas no caben en una
      línea (160 + 128 + 128 se sale de la pantalla), así que el día ocupa su
      fila y las horas la siguiente. Desde `sm` vuelve a ser una sola.
    */
    <div
      className={`flex min-h-control-lg flex-wrap items-center gap-inset-sm border-b border-border-subtle px-inset-lg py-inset-sm sm:gap-inset-lg ${
        falta ? "bg-warning-surface" : ""
      }`}
    >
      {/* El objetivo táctil es la etiqueta entera, no la casilla de 20 px:
          pulsar el nombre del día también la marca. */}
      <label
        htmlFor={idAbre}
        className="flex min-h-control-lg w-full cursor-pointer items-center gap-inset-sm text-body-lg font-medium sm:w-40 sm:shrink-0"
      >
        <input
          id={idAbre}
          name={idAbre}
          type="checkbox"
          defaultChecked={abre}
          className="size-icon-lg shrink-0 accent-brand"
        />
        {nombreDia(dia)}
      </label>

      {falta ? (
        <Inline gap="icon" wrap={false} className="w-full text-warning-content sm:flex-1">
          <AlertCircle className="size-icon-sm shrink-0" aria-hidden />
          <Text size="body-md" tone="warning">
            Falta decir si abres. Marca la casilla y pon la hora, o déjala sin marcar.
          </Text>
        </Inline>
      ) : null}

      <Inline gap="sm" wrap={false} className="w-full sm:w-auto">
        <Input
          id={`desde-${dia}`}
          type="time"
          defaultValue={abre ? valor.desde : ""}
          ariaLabel={`Hora a la que abres ${nombreDia(dia).toLowerCase()}`}
          className="flex-1 sm:w-32 sm:flex-none"
        />
        <Text as="span" size="body-md" tone="tertiary">
          a
        </Text>
        <Input
          id={`hasta-${dia}`}
          type="time"
          defaultValue={abre ? valor.hasta : ""}
          ariaLabel={`Hora a la que cierras ${nombreDia(dia).toLowerCase()}`}
          className="flex-1 sm:w-32 sm:flex-none"
        />
      </Inline>
    </div>
  );
}

export default function HorarioPage() {
  const negocio = negocioDelDueno();
  const z = zona(negocio.zona);
  const semana = resumenSemana(negocio.horario);

  return (
    <Container ancho="lg" as="main">
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
              Horario y ubicación
            </Text>
            <Text size="body-lg" tone="secondary">
              Con esto los visitantes ven si estás abierto ahora mismo.
            </Text>
          </Stack>
        </Stack>

        <AvisoMvp>
          En este MVP los cambios todavía no se guardan: no hay servidor detrás. Los controles
          funcionan para que se vea cómo será, y lo que aparece abajo es lo que hay hoy en la ficha.
        </AvisoMvp>

        {/*
          Rejilla asimétrica 2/1: Grid solo modela columnas iguales, y aquí el
          formulario pesa el doble que la vista previa. Una columna hasta `md`,
          porque partir el formulario a la mitad en una tablet lo rompe.
        */}
        <div className="grid items-start gap-stack md:grid-cols-3">
          {/* Formulario */}
          <Stack gap="loose" className="md:col-span-2">
            <Surface relleno="none" className="overflow-hidden">
              <Stack gap="none">
                {DIAS.map((d) => (
                  <FilaDia key={d} dia={d} valor={negocio.horario[d]} />
                ))}
              </Stack>
            </Surface>

            <Stack gap="default">
              <Text as="h2" size="heading-sm" weight="semibold">
                Cómo llegar
              </Text>
              <Stack gap="tight">
                <Text as="label" htmlFor="referencia" size="label" weight="medium">
                  Explícalo con palabras
                </Text>
                <textarea
                  id="referencia"
                  name="referencia"
                  rows={3}
                  defaultValue={negocio.referencia}
                  className="w-full rounded-control border border-border-default bg-surface p-inset-md text-body-lg text-content-primary"
                />
                <Text size="caption" tone="tertiary">
                  Una referencia del pueblo sirve más que un punto en el mapa. Escríbelo como se lo
                  dirías a alguien por teléfono.
                </Text>
              </Stack>
              <a
                href={enlaceMapa(`${z.nombre}, ${z.provincia}, Panamá`)}
                rel="noopener noreferrer"
                className="inline-flex min-h-control-md items-center gap-icon-gap text-body-md font-medium text-brand"
              >
                Ver {z.nombre} en el mapa
                <ExternalLink className="size-icon-sm" aria-hidden />
              </a>
            </Stack>
          </Stack>

          {/* Así lo ven ellos — misma información, densidad editorial */}
          <Stack gap="default" className="md:sticky md:top-inset-xl">
            <Text size="overline" tone="tertiary">
              Así lo ven los visitantes
            </Text>
            <div data-density="editorial">
              <Surface relleno="lg">
                <Stack gap="default">
                  <Stack gap="tight">
                    {semana.map((fila) => (
                      <Inline
                        key={fila.dias}
                        justify="between"
                        gap="md"
                        align="baseline"
                        wrap={false}
                      >
                        <Text as="span" size="body-md" tone="secondary">
                          {fila.dias}
                        </Text>
                        <Text
                          as="span"
                          size="body-md"
                          tone={fila.valor === "sinConfirmar" ? "warning" : "primary"}
                          className="text-right"
                        >
                          {textoDia(fila.valor)}
                        </Text>
                      </Inline>
                    ))}
                  </Stack>
                  <Inline
                    gap="md"
                    align="start"
                    wrap={false}
                    className="border-t border-border-subtle pt-inset-md"
                  >
                    <MapPin className="size-icon-sm shrink-0 text-content-tertiary" aria-hidden />
                    <Text size="body-sm" tone="secondary">
                      {negocio.referencia}
                    </Text>
                  </Inline>
                </Stack>
              </Surface>
            </div>
            <Stack gap="tight">
              <Badge tono={negocio.confirmadoEl ? "verificado" : "sinConfirmar"}>
                {negocio.confirmadoEl
                  ? `Confirmado el ${fechaLarga(negocio.confirmadoEl)}`
                  : "Sin confirmar"}
              </Badge>
              <ButtonLink href={`/negocio/${SLUG_DEMO}`} variante="secondary">
                Ver mi ficha completa
                <ExternalLink className="size-icon-sm" aria-hidden />
              </ButtonLink>
            </Stack>
          </Stack>
        </div>
      </Stack>
    </Container>
  );
}
