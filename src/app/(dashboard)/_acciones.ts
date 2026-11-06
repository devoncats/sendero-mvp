"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ENTES } from "@/data";
import { COOKIE_MODO, MAX_EDAD_MODO } from "@/lib/modo-panel";

import { COOKIE_ENTE } from "./_cooperativa";

/**
 * Cambia el modo del panel y devuelve al dueño a la portada del panel.
 *
 * Es una Server Action y no un manejador de cliente a propósito: el
 * interruptor del menú y las tarjetas de la configuración son formularios de
 * verdad. Funcionan sin JavaScript, no añaden un kilobyte al presupuesto, y el
 * modo llega decidido en el HTML de la siguiente pantalla.
 *
 * Se redirige a `/dashboard` porque los dos modos tienen ahí su portada, y
 * cada uno la suya: el guiado enseña «Lo siguiente», el experto las métricas.
 */
export async function cambiarModo(datos: FormData) {
  const modo = datos.get("modo") === "experto" ? "experto" : "guiado";

  const jar = await cookies();
  jar.set(COOKIE_MODO, modo, {
    path: "/",
    maxAge: MAX_EDAD_MODO,
    sameSite: "lax",
  });

  redirect("/dashboard");
}

/**
 * Cambia el ente del panel. **Solo existe porque la sesión es de mentira**:
 * sin cuentas, es la única manera de ver el panel del consorcio de Portobelo
 * además del de la cooperativa de El Valle. El día que haya autenticación,
 * esta acción y su formulario se borran — nadie elige de qué ente es.
 *
 * Un id que no está en `ENTES` no se escribe: la cookie se queda como estaba.
 */
export async function cambiarEnte(datos: FormData) {
  const id = String(datos.get("ente") ?? "");
  if (ENTES.some((e) => e.id === id)) {
    (await cookies()).set(COOKIE_ENTE, id, { path: "/", maxAge: MAX_EDAD_MODO, sameSite: "lax" });
  }
  redirect("/dashboard");
}
