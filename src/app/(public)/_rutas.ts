import type { RutaNav } from "@/components/patterns";

/**
 * Las secciones de primer nivel del portal, en un módulo sin `"use client"`
 * para que las lean los dos que las necesitan: la barra de pestañas —cliente,
 * por la ruta activa— y el encabezado, que es servidor.
 *
 * Eran cuatro y son dos. Buscar, Rutas y Guardados eran del directorio, que
 * está dormido (`lib/directorio.ts`): el portal vende una experiencia, y lo
 * que queda por elegir es cuál, y con quién.
 */
export const RUTAS_PORTAL: readonly RutaNav[] = [
  { href: "/", etiqueta: "Experiencias" },
  { href: "/comunidad", etiqueta: "La comunidad" },
];
