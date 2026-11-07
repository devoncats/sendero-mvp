import { notFound } from "next/navigation";

/**
 * El directorio de negocios sueltos —zonas, fichas, buscador, planificador y
 * guardados—, encendido como sección **secundaria** del portal.
 *
 * Lo que se vende sigue siendo la experiencia de la comunidad: va primera en la
 * navegación, ocupa la portada, y la zona y la ficha de un socio llevan a ella.
 * El directorio es para quien va por su cuenta, y vive bajo «Negocios»
 * (`/negocios`).
 *
 * Si se vuelve a poner en `false`, sus rutas responden 404 y hay que quitar
 * «Negocios» de `_rutas.ts` y el bloque de la portada que enlaza a él.
 */
export const DIRECTORIO_VISIBLE = true;

/** Primera línea de cada página del directorio. */
export function soloConDirectorio(): void {
  if (!DIRECTORIO_VISIBLE) notFound();
}
