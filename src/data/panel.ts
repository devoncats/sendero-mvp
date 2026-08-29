import { negocioPorSlug } from "./index";
import type { Negocio } from "./tipos";

/**
 * La sesión del dueño, simulada.
 *
 * No hay backend ni cuentas: el dashboard del MVP muestra siempre el mismo
 * negocio. Cuando exista autenticación, esto se reemplaza por la sesión real y
 * ninguna pantalla del dashboard tiene que cambiar — todas piden el negocio
 * aquí.
 */
export const SLUG_DEMO = "artesanias-delia-quintero";

export function negocioDelDueno(): Negocio {
  const n = negocioPorSlug(SLUG_DEMO);
  if (!n) throw new Error(`El negocio de demostración no existe: ${SLUG_DEMO}`);
  return n;
}

/**
 * Cifras de muestra. INVENTADAS, como todo lo demás del MVP — aquí no hay
 * analítica de ningún tipo.
 *
 * Se dejan en el modelo de datos y no incrustadas en la pantalla justamente
 * para que se vea que son datos y no una promesa: el día que haya medición de
 * verdad, se cambia esta constante por su origen y la pantalla no se entera.
 */
export type Metricas = {
  visitasFicha: number;
  contactosWhatsapp: number;
  periodo: string;
};

export const METRICAS_DEMO: Metricas = {
  visitasFicha: 148,
  contactosWhatsapp: 12,
  periodo: "este mes",
};
