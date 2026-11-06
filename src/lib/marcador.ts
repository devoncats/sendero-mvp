/**
 * El marcador de una imagen que todavía no existe.
 *
 * Un directorio nuevo está lleno de negocios que aún no subieron foto, y de las
 * nueve zonas no hay ni una. El cuadro gris rayado era honesto y era también
 * nueve veces el mismo cuadro: la portada no se podía leer de un vistazo porque
 * todas las piezas se veían igual.
 *
 * Aquí no se inventa una foto. Se le da identidad al hueco: un tinte estable
 * por nombre y las iniciales en serif. Cuesta cero bytes de imagen y hace que
 * Santa Fe y Pedasí dejen de ser intercambiables.
 */

/**
 * La escala de tintes.
 *
 * Son opacidades sobre `--color-brand` y `--color-accent`, no colores nuevos:
 * así el marcador se invierte solo en oscuro —donde la marca ya es un verde
 * claro— sin una segunda tabla que mantener.
 *
 * Cuatro pasos de marca y uno de acento a propósito. El acento es acento:
 * entra como la nota de tierra entre el agua y la selva, no como un segundo
 * color de marca. Las clases van literales para que Tailwind las encuentre al
 * escanear el árbol.
 */
const TINTES = [
  "bg-brand/10",
  "bg-brand/16",
  "bg-accent/18",
  "bg-brand/22",
  "bg-brand/28",
] as const;

/** Palabras que no son iniciales de nada. */
const VACIAS = new Set(["de", "del", "la", "el", "los", "las", "y", "en"]);

/**
 * FNV-1a de 32 bits: nueve líneas y ninguna dependencia.
 *
 * Lo primero que se le pide es que sea **estable**: Santa Fe tiene que salir
 * del mismo tono en la portada, en su ficha y en el recorrido.
 *
 * Lo segundo —repartir— resultó no ser gratis, y es la razón de que sea esta
 * función y no otra. Con djb2 cuatro de las nueve zonas caían en el mismo
 * tinte; añadirle la mezcla final de Murmur lo empeoró a siete de nueve,
 * porque su multiplicador (0x45d9f3b) es múltiplo de cinco y deja el resto
 * entre cinco pegado a un solo valor. FNV-1a reparte las nueve en los cinco
 * tonos sin ayuda. Está medido sobre los nombres de verdad, no supuesto.
 */
function huella(semilla: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < semilla.length; i += 1) {
    h ^= semilla.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** El tinte de fondo de un marcador, estable por nombre. */
export function tinteDe(semilla: string): string {
  return TINTES[huella(semilla) % TINTES.length];
}

/**
 * Las iniciales, como máximo dos.
 *
 * «Santa Fe» da SF y «El Valle de Antón» da VA, no EV: un artículo no es una
 * inicial. Los nombres de una sola palabra dan una sola letra, y está bien —
 * el tinte es lo que los separa, la letra solo los nombra.
 */
export function inicialesDe(texto: string): string {
  const palabras = texto
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0 && !VACIAS.has(p.toLocaleLowerCase("es")));

  return palabras
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toLocaleUpperCase("es");
}
