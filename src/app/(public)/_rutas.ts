import type { RutaNav } from "@/components/patterns";

/**
 * Las cuatro secciones de primer nivel del portal, en un módulo sin
 * `"use client"` para que las lean los dos que las necesitan: la barra de
 * pestañas —cliente, por la ruta activa— y el encabezado, que es servidor.
 *
 * Una sola lista. Que la navegación de escritorio y la del teléfono se
 * separaran sería el principio de que dijeran cosas distintas.
 */
export const RUTAS_PORTAL: readonly RutaNav[] = [
  { href: "/", etiqueta: "Descubrir" },
  { href: "/buscar", etiqueta: "Buscar" },
  // Antes de Guardados a propósito: primero lo que se hace, y al final lo que
  // quedó guardado de haberlo hecho.
  { href: "/ruta", etiqueta: "Rutas" },
  { href: "/guardados", etiqueta: "Guardados" },
];
