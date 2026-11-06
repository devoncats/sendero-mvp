import type { Experiencia } from "../tipos";
import { FIN_DE_SEMANA_EL_VALLE } from "./fin-de-semana-el-valle";
import { FIN_DE_SEMANA_PORTOBELO } from "./fin-de-semana-portobelo";
import { validar } from "./validar";

/**
 * El registro de experiencias que vende el portal.
 *
 * Cada experiencia vive en su propio archivo de esta carpeta y se suma aquí.
 * El orden de la lista es el de la portada. Para añadir una, los pasos están
 * en CLAUDE.md, «Cómo añadir una experiencia»; lo que no se puede olvidar lo
 * comprueba `validar()` y para el build si falta.
 *
 * El recorrido lo arma la comunidad, no un algoritmo: las horas, el orden y
 * quién atiende cada momento son una decisión del ente. El planificador de
 * rutas sigue en el código para lo que venga después, pero aquí no decide nada.
 *
 * Cada bloque dice cuánto le llega a quien lo atiende por visitante, y el
 * precio es la suma. No hay comisión escondida que restar.
 */
export const EXPERIENCIAS: readonly Experiencia[] = validar([
  FIN_DE_SEMANA_EL_VALLE,
  FIN_DE_SEMANA_PORTOBELO,
]);

export function experiencia(id: string): Experiencia | undefined {
  return EXPERIENCIAS.find((e) => e.id === id);
}

/** Las de un ente económico, en el orden del registro. */
export function experienciasDe(ente: string): Experiencia[] {
  return EXPERIENCIAS.filter((e) => e.ente === ente);
}

/** El precio por persona: la suma de lo que recibe cada emprendimiento. */
export function precioPorPersona(e: Experiencia): number {
  return e.bloques.reduce((t, b) => t + b.porPersona, 0);
}

/**
 * A dónde va el precio, emprendimiento por emprendimiento y de mayor a menor.
 * Cuenta a los titulares de cada bloque: es lo que el visitante paga si el
 * ente no reparte de otra manera.
 */
export function repartoDelPrecio(e: Experiencia): { slug: string; monto: number }[] {
  const montos = new Map<string, number>();
  for (const b of e.bloques) montos.set(b.emprendimiento, (montos.get(b.emprendimiento) ?? 0) + b.porPersona);
  return [...montos].map(([slug, monto]) => ({ slug, monto })).sort((a, b) => b.monto - a.monto);
}
