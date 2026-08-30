import type { RutaNav } from "@/components/patterns";

/**
 * Las tres secciones de primer nivel del portal, en un módulo sin
 * `"use client"` para que las lean los dos que las necesitan: la barra de
 * pestañas —cliente, por la ruta activa— y el encabezado, que es servidor.
 *
 * Una sola lista. Que la navegación de escritorio y la del teléfono se
 * separaran sería el principio de que dijeran cosas distintas.
 */
export const RUTAS_PORTAL: readonly RutaNav[] = [
  { href: "/", etiqueta: "Descubrir" },
  { href: "/buscar", etiqueta: "Buscar" },
  { href: "/guardados", etiqueta: "Guardados" },
];
