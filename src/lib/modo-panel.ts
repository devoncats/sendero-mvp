import { cookies } from "next/headers";

/**
 * En qué modo ve el dueño su panel.
 *
 * `guiado` es el de siempre: una sola cosa a la vez, con el paso siguiente
 * escrito. Es lo que ve alguien que nunca usó un panel, y es el valor por
 * defecto para todo el mundo.
 *
 * `experto` es el tradicional: barra lateral, métricas por día y configuración
 * completa. Solo lo enciende quien lo pide.
 */
export type ModoPanel = "guiado" | "experto";

export const COOKIE_MODO = "sendero-modo";

/** Un año. La preferencia de modo no caduca en una semana. */
export const MAX_EDAD_MODO = 60 * 60 * 24 * 365;

/**
 * Lee el modo de la cookie, en el servidor.
 *
 * Se lee en el layout del dashboard, y eso saca sus rutas del renderizado
 * estático. Es el precio de que el modo llegue ya resuelto en el HTML: sin
 * parpadeo, sin JavaScript de layout y sin que el teléfono pinte una pantalla
 * para reemplazarla por otra. Aquí no hay backend, así que ese precio son
 * milisegundos.
 *
 * Cualquier valor que no sea exactamente "experto" es `guiado`. Una cookie
 * corrupta o de otra versión devuelve al modo seguro, no a uno roto.
 */
export async function modoPanel(): Promise<ModoPanel> {
  const jar = await cookies();
  return jar.get(COOKIE_MODO)?.value === "experto" ? "experto" : "guiado";
}
