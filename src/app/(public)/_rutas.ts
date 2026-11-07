import type { RutaNav } from "@/components/patterns";

/**
 * Las secciones de primer nivel del portal, en un módulo sin `"use client"`
 * para que las lean los dos que las necesitan: la barra de pestañas —cliente,
 * por la ruta activa— y el encabezado, que es servidor.
 *
 * Son tres, y el orden es la jerarquía: primero la experiencia, que es lo que
 * se vende; después quién la organiza; y al final, los negocios sueltos del
 * directorio para quien va por su cuenta. Buscar, Rutas y Guardados viven
 * dentro de «Negocios» y no en la barra: son del directorio, no del portal.
 */
export const RUTAS_PORTAL: readonly RutaNav[] = [
  { href: "/", etiqueta: "Experiencias" },
  { href: "/comunidades", etiqueta: "Comunidades" },
  { href: "/negocios", etiqueta: "Negocios" },
];
