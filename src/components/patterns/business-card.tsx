import Link from "next/link";
import type { ReactNode } from "react";

import { AlertCircle, CheckCircle } from "@/components/icons";
import { Stack } from "@/components/layout";
import { Badge, Media, Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * El estado del dato, no del negocio. Un negocio puede estar abierto y su
 * horario estar sin confirmar: son cosas distintas y se muestran aparte.
 */
export type Confianza = "verificado" | "desactualizado" | "sinConfirmar";

const CONFIANZA_ICONO = {
  verificado: CheckCircle,
  desactualizado: AlertCircle,
  sinConfirmar: AlertCircle,
} as const;

export type NegocioResumen = {
  nombre: string;
  /** El nombre de la persona detrás. Nunca es opcional en Sendero. */
  persona: string;
  categoria: string;
  /** Se omite cuando ya se sabe: en la página de una zona, repetirla en cada
   *  tarjeta es ruido. */
  zona?: string;
  href: string;
  foto?: string;
  fotoAlt?: string;
  /** Ej. "Abierto ahora", "Cierra a las 4:00 p.m.". */
  estado?: string;
  estadoAbierto?: boolean;
  confianza?: Confianza;
  confianzaTexto?: string;
};

/**
 * El patrón más repetido del portal: aparece en Descubrir, Zona, Resultados y
 * Guardados. Toda la tarjeta es un enlace, así que el objetivo táctil es la
 * fila entera y no un texto de 14 px.
 *
 * `orientacion="vertical"` pone la foto arriba, para rejillas.
 *
 * `orientacion="auto"` es la de las listas que se vuelven rejilla: fila con
 * miniatura en el teléfono, y foto arriba a partir de `sm`, que es donde las
 * rejillas del proyecto pasan a dos columnas. La orientación no puede ser un
 * prop del ancho —el componente no sabe a qué ancho está—, así que la decide
 * el mismo punto de ruptura que la rejilla que la contiene.
 */
export function BusinessCard({
  negocio,
  orientacion = "horizontal",
  className,
}: {
  negocio: NegocioResumen;
  orientacion?: "horizontal" | "vertical" | "auto";
  className?: string;
}) {
  const {
    nombre,
    persona,
    categoria,
    zona,
    href,
    foto,
    fotoAlt,
    estado,
    estadoAbierto,
    confianza,
    confianzaTexto,
  } = negocio;

  const IconoConfianza = confianza ? CONFIANZA_ICONO[confianza] : null;
  const vertical = orientacion === "vertical";
  const auto = orientacion === "auto";
  const fila = !vertical;

  /*
   * Zona, horario y confianza iban en tres líneas apiladas de 14 px gris, y el
   * nombre —16 px— apenas les ganaba. Eran cinco renglones casi del mismo peso:
   * la tarjeta se leía como un muro, no como una ficha.
   *
   * En una sola línea el nombre vuelve a mandar y estos tres pasan a ser lo que
   * son: el pie de la ficha. Cada uno conserva su color y su icono, así que el
   * color sigue sin ser la única señal de nada.
   */
  const meta: ReactNode[] = [];

  /*
   * El punto separador va DENTRO del dato que sigue, no suelto entre los dos.
   * Suelto, al envolver la línea se quedaba colgando al final del renglón
   * anterior —«Portobelo, Colón ·»— y el siguiente dato empezaba desnudo.
   * Dentro, el punto y su dato envuelven juntos o no envuelven.
   */
  if (zona) {
    meta.push(
      <span key="zona" className="inline-flex items-center gap-icon-gap text-content-tertiary">
        {zona}
      </span>,
    );
  }
  if (estado) {
    meta.push(
      <span
        key="estado"
        className={cn(
          "inline-flex items-center gap-icon-gap",
          estadoAbierto ? "font-medium text-success-content" : "text-content-tertiary",
        )}
      >
        {meta.length > 0 ? (
          <span className="text-content-disabled" aria-hidden>
            ·
          </span>
        ) : null}
        {estado}
      </span>,
    );
  }
  if (confianza && confianzaTexto && IconoConfianza) {
    meta.push(
      <span
        key="confianza"
        className={cn(
          "inline-flex items-center gap-icon-gap",
          confianza === "verificado" ? "text-success-content" : "text-warning-content",
        )}
      >
        {meta.length > 0 ? (
          <span className="text-content-disabled" aria-hidden>
            ·
          </span>
        ) : null}
        <IconoConfianza
          className={cn(
            "size-icon-sm shrink-0",
            confianza === "verificado" ? "text-success" : "text-trust-stale",
          )}
          aria-hidden
        />
        {confianzaTexto}
      </span>,
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        /*
         * Hasta aquí esto era un <Link> pelado: sin fondo, sin borde y sin
         * relleno. Declaraba `group` y no había un solo `group-hover:` en el
         * archivo, así que pasar el puntero por encima no hacía absolutamente
         * nada. La tarjeta del portal no era una tarjeta.
         */
        "group flex overflow-hidden rounded-surface border border-border-subtle bg-surface",
        "transition-[border-color,box-shadow] motion-reduce:transition-none",
        "hover:border-border-default hover:shadow-card",
        /* El pulsado no se fía solo del encogido: quien pidió menos movimiento
           no lo recibe, y el fondo sí cambia para todo el mundo. */
        "active:scale-press active:bg-action-secondary-hover",
        vertical && "flex-col",
        fila && "flex-row items-start gap-inset-md p-inset-sm",
        auto && "sm:flex-col sm:items-stretch sm:gap-0 sm:p-0",
        className,
      )}
    >
      <Media
        src={foto}
        alt={fotoAlt ?? `Foto de ${nombre}`}
        semilla={nombre}
        proporcion={vertical ? "4/3" : "1/1"}
        radio={vertical ? "none" : "media"}
        sizes={
          vertical
            ? "(min-width: 1024px) 368px, (min-width: 640px) 33vw, 100vw"
            : auto
              ? "(min-width: 1024px) 420px, (min-width: 640px) 45vw, 80px"
              : "80px"
        }
        className={cn(
          vertical && "w-full",
          fila && "h-avatar-xl w-avatar-xl shrink-0",
          /* Desde `sm` la miniatura se vuelve la foto de cabecera y se pega a
             los bordes: el radio lo pone ya la tarjeta. */
          auto && "sm:aspect-photo sm:h-auto sm:w-full sm:shrink sm:rounded-none",
        )}
      />

      <div className={cn("min-w-0 flex-1", vertical && "p-inset-md", auto && "sm:p-inset-md")}>
        <Stack gap="tight">
          <Badge tono="accent" overline className="self-start">
            {categoria}
          </Badge>
          {/* El nombre sube a heading-xs y se subraya al pasar por encima: es lo
              que se está eligiendo, y tiene que pesar más que su propio pie. */}
          <Text
            size="heading-xs"
            weight="semibold"
            className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2"
          >
            {nombre}
          </Text>
          <Text size="body-sm" tone="secondary">
            {persona}
          </Text>
          {meta.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-inset-sm gap-y-inset-xs text-body-sm">
              {meta}
            </div>
          ) : null}
        </Stack>
      </div>
    </Link>
  );
}

