import NextImage from "next/image";

import { Photo } from "@/components/icons";
import { cn } from "@/lib/cn";
import { inicialesDe, tinteDe } from "@/lib/marcador";

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
 * Sin `src` renderiza el marcador — que es también el estado de "la imagen no
 * cargó". Un negocio sin foto no puede quedar sin nombre ni sin teléfono, así
 * que el marcador nunca es un error, es un estado normal.
 *
 * Con `semilla` ese hueco tiene identidad: tinte estable e iniciales en serif
 * (ver lib/marcador.ts). Sin ella se queda el icono de siempre, que es lo
 * correcto para lo que no tiene nombre propio — un mapa, un croquis.
 */
export function Media({
  src,
  alt,
  proporcion = "4/3",
  radio = "media",
  sizes = "100vw",
  prioridad = false,
  etiqueta,
  semilla,
  className,
}: Base & {
  src?: string;
  alt?: string;
  sizes?: string;
  prioridad?: boolean;
  /** Texto del marcador. Solo se ve cuando no hay imagen ni semilla. */
  etiqueta?: string;
  /**
   * El nombre de lo que va en la foto — la zona, el negocio, la persona.
   * De aquí salen el tinte y las iniciales del marcador.
   */
  semilla?: string;
}) {
  const marco = cn("relative overflow-hidden", PROPORCIONES[proporcion], RADIOS[radio], className);

  if (!src && semilla) {
    /*
     * El monograma es decorativo: quien no ve la pantalla ya recibe el sentido
     * por el aria-label del contenedor, y quien la ve tiene el nombre completo
     * a un centímetro. Por eso va `aria-hidden` y no compite por el contraste
     * de texto — es una marca de agua, no una etiqueta.
     */
    return (
      <div
        className={cn(
          marco,
          "marco-marcador flex items-center justify-center ring-1 ring-inset ring-border-subtle",
          tinteDe(semilla),
        )}
        role="img"
        aria-label={alt ?? etiqueta ?? `Todavía sin foto de ${semilla}`}
      >
        <span className="monograma font-serif font-semibold text-content-primary/20" aria-hidden>
          {inicialesDe(semilla)}
        </span>
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={cn(
          marco,
          /* El filete importa en oscuro: ahí `surface-sunken` vale lo mismo que
             el fondo de la página, y sin él el hueco desaparecía del todo. */
          "flex flex-col items-center justify-center gap-inset-xs bg-surface-sunken text-content-tertiary ring-1 ring-inset ring-border-subtle",
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
