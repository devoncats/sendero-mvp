import { CATEGORIAS, categoria } from "./categorias";
import { NEGOCIOS } from "./negocios";
import type { CategoriaId, Experiencia, Negocio, Zona, ZonaId } from "./tipos";
import { experienciasDe } from "./experiencias";
import { ZONAS, zona } from "./zonas";

export { CATEGORIAS, categoria, NEGOCIOS, ZONAS, zona };
export { ENTES, delEnte, elEnte, ente } from "./comunidad";
export { EXPERIENCIAS, experiencia, experienciasDe, precioPorPersona, repartoDelPrecio } from "./experiencias";
export { SOLICITUDES, personas, plazasOcupadas } from "./solicitudes";
export { FINANZAS, INSUMOS, PROVEEDORES, cuentasDe, proveedor } from "./administracion";
export { ACTIVIDAD, actividadDe } from "./ambiente";

/**
 * Los emprendimientos de una experiencia, sin repetir y en el orden en que
 * aparecen en el recorrido — titulares y alternativas. Es la lista de socios
 * que ve la cooperativa y la de familias que ve el visitante.
 */
export function emprendimientosDe(e: Experiencia): Negocio[] {
  const slugs = new Set<string>();
  for (const b of e.bloques) {
    slugs.add(b.emprendimiento);
    for (const a of b.alternativas ?? []) slugs.add(a);
  }
  return [...slugs].map((s) => {
    const n = negocioPorSlug(s);
    if (!n) throw new Error(`La experiencia ${e.id} nombra un emprendimiento que no existe: ${s}`);
    return n;
  });
}

/**
 * Los socios de un ente: quien atiende algún bloque de alguna de sus
 * experiencias, sin repetir. No hay una lista de socios aparte que mantener —
 * se es socio por estar en el recorrido.
 */
export function sociosDe(enteId: string): Negocio[] {
  const socios: Negocio[] = [];
  for (const e of experienciasDe(enteId)) {
    for (const n of emprendimientosDe(e)) if (!socios.some((x) => x.slug === n.slug)) socios.push(n);
  }
  return socios;
}
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
 * Cuántas paradas de verdad puede tener una ruta por esa zona.
 *
 * No es lo mismo que «cuántos tienen punto», y la diferencia importa: el
 * hospedaje tiene punto pero nunca es parada —es ancla, se sale de él y se
 * vuelve a él—, así que contarlo inflaba el número. Con eso, Volcán se ofrecía
 * y El Valle no, teniendo las dos exactamente dos paradas: la única diferencia
 * era si a un hospedaje le habían puesto la coordenada.
 */
export function cuantasParadasPosibles(id: ZonaId): number {
  return NEGOCIOS.reduce(
    (n, negocio) =>
      n + (negocio.zona === id && negocio.coordenadas && negocio.categoria !== "hospedaje" ? 1 : 0),
    0,
  );
}

/**
 * Las zonas donde armar una ruta tiene sentido: hacen falta dos sitios para que
 * exista un orden. Vive aquí y no en cada pantalla porque lo preguntan la
 * portada, la navegación y la ficha de la zona, y tres copias del mismo filtro
 * son tres sitios donde puede empezar a discrepar.
 */
export function zonasConRuta(): Zona[] {
  return ZONAS.filter((z) => cuantasParadasPosibles(z.id) >= 2);
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
