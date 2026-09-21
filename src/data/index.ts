import { CATEGORIAS, categoria } from "./categorias";
import { NEGOCIOS } from "./negocios";
import type { CategoriaId, Negocio, ZonaId } from "./tipos";
import { ZONAS, zona } from "./zonas";

export { CATEGORIAS, categoria, NEGOCIOS, ZONAS, zona };
export type * from "./tipos";

/**
 * Consultas sobre datos estáticos. Todo se resuelve en build time: no hay fetch,
 * no hay API routes, no hay estado global. Con treinta negocios, recorrer el
 * arreglo cuesta menos que mantener un índice.
 */

export function negocioPorSlug(slug: string): Negocio | undefined {
  return NEGOCIOS.find((n) => n.slug === slug);
}

export function negociosDeZona(id: ZonaId, cat?: CategoriaId): Negocio[] {
  return NEGOCIOS.filter((n) => n.zona === id && (!cat || n.categoria === cat));
}

export function negociosDeCategoria(id: CategoriaId): Negocio[] {
  return NEGOCIOS.filter((n) => n.categoria === id);
}

export function cuantosEnZona(id: ZonaId): number {
  return NEGOCIOS.reduce((n, negocio) => n + (negocio.zona === id ? 1 : 0), 0);
}

/**
 * Cuántos negocios de la zona han puesto su punto. Lo pregunta el portal para
 * decidir si ofrece armar una ruta: con dos paradas no hay nada que ordenar.
 */
export function cuantosConPunto(id: ZonaId): number {
  return NEGOCIOS.reduce((n, negocio) => n + (negocio.zona === id && negocio.coordenadas ? 1 : 0), 0);
}

/**
 * Las categorías que de verdad tienen algo en esa zona. Ofrecer un filtro que
 * lleva a un vacío es la peor experiencia posible en un directorio pequeño.
 */
export function categoriasDeZona(id: ZonaId): CategoriaId[] {
  const presentes = new Set(NEGOCIOS.filter((n) => n.zona === id).map((n) => n.categoria));
  return CATEGORIAS.filter((c) => presentes.has(c.id)).map((c) => c.id);
}

/** Los últimos confirmados. Los que nunca se confirmaron quedan al final. */
export function recientes(cuantos = 3): Negocio[] {
  return [...NEGOCIOS]
    .sort((a, b) => (b.confirmadoEl ?? "").localeCompare(a.confirmadoEl ?? ""))
    .slice(0, cuantos);
}

/**
 * Marcas diacríticas combinantes (U+0300–U+036F). Se arma desde una cadena a
 * propósito: escritas como literal en el código son caracteres invisibles que
 * cualquier editor o herramienta puede comerse sin avisar.
 */
const DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "gu");

function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(DIACRITICOS, "");
}

/**
 * Búsqueda sencilla sobre nombre, persona, productos y zona. Sin acentos y sin
 * mayúsculas, porque nadie escribe "Pedasí" con tilde en un teclado de teléfono.
 */
export function buscar(consulta: string): Negocio[] {
  const q = normalizar(consulta.trim());
  if (q.length < 2) return [];

  return NEGOCIOS.filter((n) => {
    const heno = [
      n.nombre,
      n.persona.nombre,
      n.persona.oficio,
      zona(n.zona).nombre,
      zona(n.zona).provincia,
      categoria(n.categoria).nombre.es,
      n.descripcion.es,
      ...n.productos.map((p) => p.nombre),
    ]
      .map(normalizar)
      .join(" ");
    return heno.includes(q);
  });
}
