type ClassValue = string | number | null | undefined | false;

/**
 * Une clases descartando lo falso. Sin clsx y sin tailwind-merge: dos
 * dependencias más en un Moto G Power a cambio de algo que aquí se resuelve
 * en cuatro líneas.
 *
 * No resuelve conflictos entre utilidades de Tailwind. Si dos clases pelean,
 * el arreglo es no pasarlas — no un resolvedor en tiempo de ejecución.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
