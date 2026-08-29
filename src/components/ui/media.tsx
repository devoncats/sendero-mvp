import NextImage from "next/image";

import { Photo } from "@/components/icons";
import { cn } from "@/lib/cn";

/**
 * Las proporciones son un conjunto cerrado. Que cada pantalla invente la suya
 * es como se llega a una parrilla que no alinea.
 */
const PROPORCIONES = {
  "1/1": "aspect-square",
  "4/3": "aspect-photo",
  "3/4": "aspect-portrait",
  "16/9": "aspect-wide",
} as const;

const RADIOS = {
  none: "rounded-none",
  media: "rounded-media",
  full: "rounded-full",
} as const;

type Base = {
  proporcion?: keyof typeof PROPORCIONES;
  radio?: keyof typeof RADIOS;
  className?: string;
};

/**
 * Toda imagen del proyecto pasa por aquí, y sale con proporción declarada.
 * Eso es lo que mantiene el CLS en cero: el hueco ya mide lo que va a medir
 * antes de que llegue un solo byte de la foto.
 *
 * Sin `src` renderiza el marcador rayado — que es también el estado de "la
 * imagen no cargó". Un negocio sin foto no puede quedar sin nombre ni sin
 * teléfono, así que el marcador nunca es un error, es un estado normal.
 */
export function Media({
  src,
  alt,
  proporcion = "4/3",
  radio = "media",
  sizes = "100vw",
  prioridad = false,
  etiqueta,
  className,
}: Base & {
  src?: string;
  alt?: string;
  sizes?: string;
  prioridad?: boolean;
  /** Texto del marcador. Solo se ve cuando no hay imagen. */
  etiqueta?: string;
}) {
  const marco = cn("relative overflow-hidden", PROPORCIONES[proporcion], RADIOS[radio], className);

  if (!src) {
    return (
      <div
        className={cn(
          marco,
          "flex flex-col items-center justify-center gap-inset-xs bg-surface-sunken text-content-tertiary",
        )}
        role="img"
        aria-label={alt ?? etiqueta ?? "Sin foto todavía"}
      >
        <Photo className="size-icon-lg" aria-hidden />
        {etiqueta ? <span className="px-inset-xs text-center text-caption">{etiqueta}</span> : null}
      </div>
    );
  }

  return (
    <div className={marco}>
      <NextImage
        src={src}
        alt={alt ?? ""}
        fill
        sizes={sizes}
        priority={prioridad}
        className="object-cover"
      />
    </div>
  );
}
