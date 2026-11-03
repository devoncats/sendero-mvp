import type { Bloque, Dia, Experiencia, Negocio, Solicitud } from "@/data/tipos";
import type { NivelSalud } from "@/lib/salud";
import { fechaLarga, hora } from "@/lib/formato";

/**
 * El reparto: dada una solicitud, a quién le toca atender qué, cuánta gente le
 * llega y cuánto dinero. Es el «asistente administrativo» del PO — la
 * cooperativa recibe una sola solicitud y de aquí salen los avisos para cada
 * familia, ya escritos.
 *
 * Sin estado ni datos propios: todo entra por parámetro, como en
 * `itinerario.ts`. Quien llama decide de dónde salen los negocios y la salud.
 */

const POR_INDICE: readonly Dia[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

/** La fecha real de un día del recorrido. El día 1 es el de llegada. */
export function fechaDelDia(llegada: string, dia: number): Date {
  const d = new Date(`${llegada}T12:00:00`);
  d.setDate(d.getDate() + dia - 1);
  return d;
}

export function iso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export type Tarea = {
  indice: number;
  bloque: Bloque;
  negocio: Negocio;
  /** ISO, el día que le toca. */
  fecha: string;
  personas: number;
  monto: number;
  /**
   * Si ese día no abre. No se descarta —puede abrir para un grupo avisado—,
   * pero la cooperativa tiene que saberlo antes de confirmar.
   */
  conflicto?: string;
};

/**
 * Quién atiende cada bloque. Si la cooperativa ya eligió, manda su elección;
 * si no, el titular.
 */
export function repartir(
  s: Solicitud,
  e: Experiencia,
  porSlug: (slug: string) => Negocio | undefined,
): Tarea[] {
  const personas = s.adultos + s.ninos;
  return e.bloques.map((bloque, indice) => {
    const slug = s.asignaciones?.[indice] ?? bloque.emprendimiento;
    const negocio = porSlug(slug);
    if (!negocio) throw new Error(`Bloque ${indice} de ${e.id} sin emprendimiento: ${slug}`);
    const dia = fechaDelDia(s.fecha, bloque.dia);
    const ese = negocio.horario[POR_INDICE[dia.getDay()]];
    const conflicto =
      ese === "cerrado"
        ? `${negocio.nombre} no abre ese día.`
        : ese === "sinConfirmar"
          ? `${negocio.nombre} no ha confirmado si abre ese día.`
          : undefined;
    return {
      indice,
      bloque,
      negocio,
      fecha: iso(dia),
      personas,
      monto: bloque.porPersona * personas,
      conflicto,
    };
  });
}

/** Las tareas agrupadas por emprendimiento: un aviso por familia, no por bloque. */
export function porEmprendimiento(tareas: readonly Tarea[]): { negocio: Negocio; tareas: Tarea[]; monto: number }[] {
  const grupos = new Map<string, { negocio: Negocio; tareas: Tarea[]; monto: number }>();
  for (const t of tareas) {
    const g = grupos.get(t.negocio.slug) ?? { negocio: t.negocio, tareas: [], monto: 0 };
    g.tareas.push(t);
    g.monto += t.monto;
    grupos.set(t.negocio.slug, g);
  }
  return [...grupos.values()];
}

/**
 * El mensaje que le llega a cada familia por WhatsApp. Corto, con lo único que
 * necesita para preparar: cuándo, cuántos, qué y cuánto va a recibir.
 */
export function aviso(s: Solicitud, grupo: { negocio: Negocio; tareas: Tarea[]; monto: number }): string {
  const lineas = grupo.tareas.map(
    (t) => `• ${fechaLarga(t.fecha)}, ${hora(t.bloque.hora)}: ${t.bloque.actividad.es}`,
  );
  const ninos = s.ninos > 0 ? ` (${s.ninos} ${s.ninos === 1 ? "niño" : "niños"})` : "";
  return [
    `Hola, ${grupo.negocio.persona.nombre.split(" ")[0]}. Le escribe la cooperativa.`,
    `Le toca atender a ${s.nombre}, ${s.adultos + s.ninos} personas${ninos}:`,
    ...lineas,
    s.nota ? `Nota del grupo: ${s.nota}` : "",
    `Le corresponden B/. ${grupo.monto}. ¿Nos confirma que puede?`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Para un bloque con alternativas, a quién conviene mandárselo.
 *
 * Aquí la alerta deja de ser solo un aviso: si dos fondas pueden servir el
 * mismo almuerzo y una de ellas necesita apoyo, la sugerencia es ella. Si
 * ninguna lo necesita, se queda el titular — no se mueve a nadie sin razón.
 */
export function sugerencia(
  bloque: Bloque,
  nivelDe: (slug: string) => NivelSalud,
): { slug: string; porque: string } | undefined {
  if (!bloque.alternativas?.length) return undefined;
  const orden: Record<NivelSalud, number> = { riesgo: 0, atencion: 1, estable: 2 };
  const candidatos = [bloque.emprendimiento, ...bloque.alternativas];
  const mejor = [...candidatos].sort((a, b) => orden[nivelDe(a)] - orden[nivelDe(b)])[0];
  if (mejor === bloque.emprendimiento) return undefined;
  if (orden[nivelDe(mejor)] >= orden[nivelDe(bloque.emprendimiento)]) return undefined;
  return {
    slug: mejor,
    porque:
      nivelDe(mejor) === "riesgo"
        ? "Necesita apoyo, y puede atender este mismo bloque."
        : "Sus cuentas piden atención, y puede atender este mismo bloque.",
  };
}

/**
 * Las próximas salidas que ofrece el portal: los sábados, desde mañana.
 *
 * Es una convención de la cooperativa, no del recorrido —que funciona
 * cualquier día con aviso—. Quien quiera otra fecha la pide en la nota, y la
 * cooperativa ve en su panel si ese día alguien no abre.
 */
export function proximosSabados(ahora: Date, cuantos: number): string[] {
  const d = new Date(ahora);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  const fechas: string[] = [];
  for (let i = 0; i < cuantos; i++) {
    fechas.push(iso(d));
    d.setDate(d.getDate() + 7);
  }
  return fechas;
}
