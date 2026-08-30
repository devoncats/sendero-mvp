import Link from "next/link";

import { AlertCircle, CheckCircle } from "@/components/icons";
import { Inline, Stack } from "@/components/layout";
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

  const cuerpo = (
    <Stack gap="tight">
      <Badge tono="accent" overline className="self-start">
        {categoria}
      </Badge>
      <Text size="body-md" weight="semibold">
        {nombre}
      </Text>
      <Text size="body-sm" tone="secondary">
        {persona}
      </Text>
      {zona ? (
        <Text size="body-sm" tone="tertiary">
          {zona}
        </Text>
      ) : null}
      {estado ? (
        <Text
          size="body-sm"
          tone={estadoAbierto ? "success" : "tertiary"}
          weight={estadoAbierto ? "medium" : undefined}
        >
          {estado}
        </Text>
      ) : null}
      {confianza && confianzaTexto && IconoConfianza ? (
        <Inline gap="icon">
          <IconoConfianza
            className={cn(
              "size-icon-sm",
              confianza === "verificado" ? "text-success" : "text-trust-stale",
            )}
            aria-hidden
          />
          <Text size="body-sm" tone={confianza === "verificado" ? "success" : "warning"}>
            {confianzaTexto}
          </Text>
        </Inline>
      ) : null}
    </Stack>
  );

  return (
    <Link
      href={href}
      className={cn(
        "group flex gap-inset-md rounded-media",
        vertical && "flex-col",
        !vertical && "flex-row items-start",
        auto && "sm:flex-col sm:items-stretch",
        className,
      )}
    >
      <Media
        src={foto}
        alt={fotoAlt ?? `Foto de ${nombre}`}
        proporcion={vertical ? "4/3" : "1/1"}
        sizes={
          vertical
            ? "(min-width: 1024px) 368px, (min-width: 640px) 33vw, 100vw"
            : auto
              ? "(min-width: 1024px) 420px, (min-width: 640px) 45vw, 80px"
              : "80px"
        }
        className={cn(
          vertical && "w-full",
          !vertical && "h-avatar-xl w-avatar-xl shrink-0",
          auto && "sm:aspect-photo sm:h-auto sm:w-full sm:shrink",
        )}
      />
      <div className="min-w-0 flex-1">{cuerpo}</div>
    </Link>
  );
}
