import { ENTES } from "../comunidad";
import { NEGOCIOS } from "../negocios";
import type { Experiencia, Negocio } from "../tipos";

/**
 * Las reglas que toda experiencia tiene que cumplir para entrar en el portal.
 *
 * Aquí no hay tests, así que la red es el build: el registro llama a esto al
 * importarse, y una experiencia mal armada **rompe `pnpm build`** con un
 * mensaje que dice qué arreglar. Es más barato que descubrirlo cuando un grupo
 * llega a una puerta cerrada o la cooperativa promete más camas de las que hay.
 *
 * Cada regla está porque protege algo del producto, no por orden:
 *
 * - El ente y la experiencia son de la misma zona, y todo emprendimiento
 *   también: una cooperativa reparte entre **sus** socios.
 * - Toda alternativa es de la misma categoría que el titular. Una fonda se
 *   cambia por otra fonda, no por un guía.
 * - Todo emprendimiento declara sus plazas, y ningún titular tiene menos que
 *   el cupo: la cooperativa no puede prometer más de lo que cabe.
 * - Los bloques van en orden y dentro de los días del recorrido.
 * - Hay un bloque de alojamiento por noche, o la noche no tiene dónde dormir.
 * - Cada bloque le paga algo a alguien. Un bloque gratis es un bloque sin
 *   familia detrás, y eso no es lo que se vende.
 */

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function erroresDe(e: Experiencia): string[] {
  const errores: string[] = [];
  const porSlug = (slug: string): Negocio | undefined => NEGOCIOS.find((n) => n.slug === slug);

  if (!ID.test(e.id)) errores.push(`el id «${e.id}» tiene que ir en minúsculas y con guiones`);

  const ente = ENTES.find((x) => x.id === e.ente);
  if (!ente) errores.push(`el ente «${e.ente}» no existe en data/comunidad.ts`);
  else if (ente.zona !== e.zona) errores.push(`el ente es de ${ente.zona} y la experiencia de ${e.zona}`);

  if (e.noches > e.dias) errores.push("tiene más noches que días");
  if (e.minimo < 1 || e.minimo > e.cupo) errores.push(`el mínimo (${e.minimo}) tiene que estar entre 1 y el cupo (${e.cupo})`);
  if (e.bloques.length === 0) errores.push("no tiene bloques");

  e.bloques.forEach((b, i) => {
    const donde = `bloque ${i + 1} (día ${b.dia}, ${b.hora})`;

    if (b.dia < 1 || b.dia > e.dias) errores.push(`${donde}: el día está fuera del recorrido`);
    if (b.porPersona <= 0) errores.push(`${donde}: no le paga nada a nadie`);
    const previo = e.bloques[i - 1];
    if (previo && (b.dia < previo.dia || (b.dia === previo.dia && minutos(b.hora) <= minutos(previo.hora)))) {
      errores.push(`${donde}: va antes que el bloque anterior`);
    }

    const titular = porSlug(b.emprendimiento);
    const todos = [b.emprendimiento, ...(b.alternativas ?? [])];
    for (const slug of todos) {
      const n = porSlug(slug);
      if (!n) {
        errores.push(`${donde}: «${slug}» no existe en data/negocios.ts`);
        continue;
      }
      if (n.zona !== e.zona) errores.push(`${donde}: ${n.nombre} es de ${n.zona}, no de ${e.zona}`);
      if (n.plazas === undefined) errores.push(`${donde}: ${n.nombre} no declara sus plazas`);
      // Solo el titular tiene que cubrir el cupo. Una alternativa más chica
      // vale: el reparto comprueba si cabe el grupo concreto antes de sugerirla.
      else if (slug === b.emprendimiento && n.plazas < e.cupo) {
        errores.push(`${donde}: ${n.nombre} tiene ${n.plazas} ${n.unidadPlazas ?? "plazas"} y el cupo es ${e.cupo}`);
      }
      if (titular && slug !== b.emprendimiento && n.categoria !== titular.categoria) {
        errores.push(`${donde}: la alternativa ${n.nombre} no es de la misma categoría que ${titular.nombre}`);
      }
    }
    if ((b.alternativas ?? []).includes(b.emprendimiento)) errores.push(`${donde}: el titular está también en sus alternativas`);
  });

  for (let noche = 1; noche <= e.noches; noche++) {
    if (!e.bloques.some((b) => b.dia === noche && b.tipo === "alojamiento")) {
      errores.push(`la noche del día ${noche} no tiene bloque de alojamiento`);
    }
  }

  return errores;
}

/** Para el registro: o pasan todas, o el build se para aquí. */
export function validar(lista: readonly Experiencia[]): readonly Experiencia[] {
  const vistos = new Set<string>();
  const problemas: string[] = [];
  for (const e of lista) {
    if (vistos.has(e.id)) problemas.push(`«${e.id}» está registrada dos veces`);
    vistos.add(e.id);
    for (const err of erroresDe(e)) problemas.push(`«${e.id}»: ${err}`);
  }
  if (problemas.length > 0) {
    throw new Error(`Hay experiencias mal armadas:\n- ${problemas.join("\n- ")}`);
  }
  return lista;
}
