import { notFound } from "next/navigation";

/**
 * El directorio de negocios sueltos —zonas, fichas, buscador, planificador y
 * guardados— está apagado.
 *
 * El PO cambió lo que vende el portal: una experiencia de la comunidad, no
 * negocios uno por uno. El directorio no se borró porque vuelve con el pase de
 * día y los sitios sueltos (el mercado, la cascada, el mirador), y rehacerlo
 * costaría más que tenerlo dormido. Mientras esté en `false`, sus rutas
 * responden 404 y no salen en ninguna navegación.
 */
export const DIRECTORIO_VISIBLE = false;

/** Primera línea de cada página del directorio. */
export function soloConDirectorio(): void {
  if (!DIRECTORIO_VISIBLE) notFound();
}
