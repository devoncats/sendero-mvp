import type { Experiencia, Insumo, Negocio, Solicitud } from "@/data";
import {
  EXPERIENCIAS,
  INSUMOS,
  SOLICITUDES,
  cuentasDe,
  emprendimientosDe,
  ente,
  experiencia,
  negocioPorSlug,
  personas,
} from "@/data";
import { fechaConDia } from "@/lib/formato";
import type { Tarea } from "@/lib/reparto";
import { iso, repartir } from "@/lib/reparto";
import type { NivelSalud, Salud } from "@/lib/salud";
import { salud } from "@/lib/salud";

/**
 * Lo que el panel de la cooperativa sabe de su comunidad, en un solo sitio.
 *
 * La sesión está simulada igual que antes lo estaba la del dueño
 * (`negocioDelDueno`): el panel muestra siempre la cooperativa de El Valle.
 * Cuando exista autenticación, `sesion()` lee la de verdad y ninguna pantalla
 * cambia — todas piden aquí.
 *
 * Vive en `app/(dashboard)` y no en `data` porque junta las dos capas: los
 * datos y la lógica de `lib`. Los datos no importan de `lib`.
 */

const ENTE_DEMO = "coop-el-valle";

export function sesion() {
  const coop = ente(ENTE_DEMO);
  const e = EXPERIENCIAS.find((x) => x.ente === coop.id);
  if (!e) throw new Error(`La cooperativa ${coop.id} no tiene experiencia`);
  return { coop, experiencia: e, socios: emprendimientosDe(e) };
}

export function saludDe(slug: string): Salud {
  return salud(cuentasDe(slug));
}

export function nivelDe(slug: string): NivelSalud {
  return saludDe(slug).nivel;
}

const ORDEN_NIVEL: Record<NivelSalud, number> = { riesgo: 0, atencion: 1, estable: 2 };

/** Los socios, los que necesitan apoyo primero. */
export function sociosPorSalud(): { negocio: Negocio; salud: Salud }[] {
  return sesion()
    .socios.map((negocio) => ({ negocio, salud: saludDe(negocio.slug) }))
    .sort((a, b) => ORDEN_NIVEL[a.salud.nivel] - ORDEN_NIVEL[b.salud.nivel]);
}

export function solicitudesDeLaCooperativa(): Solicitud[] {
  const { experiencia: e } = sesion();
  return SOLICITUDES.filter((s) => s.experiencia === e.id);
}

export function solicitud(id: string): { s: Solicitud; e: Experiencia } | undefined {
  const s = solicitudesDeLaCooperativa().find((x) => x.id === id);
  const e = s ? experiencia(s.experiencia) : undefined;
  return s && e ? { s, e } : undefined;
}

export function tareasDe(s: Solicitud, e: Experiencia): Tarea[] {
  return repartir(s, e, negocioPorSlug);
}

/** Las que siguen vivas: lo que la cooperativa tiene que mover todavía. */
export function esActiva(s: Solicitud): boolean {
  return s.estado === "nueva" || s.estado === "confirmada" || s.estado === "repartida";
}

/**
 * Lo que le toca a un emprendimiento de aquí a `dias`, de las solicitudes ya
 * confirmadas o repartidas. Las nuevas no cuentan: todavía no son trabajo.
 */
export function porAtender(slug: string, ahora: Date, dias = 30): Tarea[] {
  const desde = iso(ahora);
  const tope = new Date(ahora);
  tope.setDate(tope.getDate() + dias);
  const hasta = iso(tope);

  return solicitudesDeLaCooperativa()
    .filter((s) => s.estado === "confirmada" || s.estado === "repartida")
    .flatMap((s) => tareasDe(s, experiencia(s.experiencia)!))
    .filter((t) => t.negocio.slug === slug && t.fecha >= desde && t.fecha <= hasta)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.bloque.hora.localeCompare(b.bloque.hora));
}

export function insumosBajos(): Insumo[] {
  return INSUMOS.filter((i) => i.existencias < i.minimo);
}

/** Visitantes atendidos y lo que recibieron las familias por la experiencia, en un mes. */
export function resumenDelMes(mes: string) {
  const atendidas = solicitudesDeLaCooperativa().filter(
    (s) => s.estado === "atendida" && s.fecha.startsWith(mes),
  );
  const visitantes = atendidas.reduce((t, s) => t + personas(s), 0);
  const recibido = sesion().socios.reduce(
    (t, n) => t + (cuentasDe(n.slug).find((m) => m.mes === mes)?.ingresosRuta ?? 0),
    0,
  );
  return { grupos: atendidas.length, visitantes, recibido };
}

/** El último mes con cuentas cerradas. */
export function ultimoMes(): string {
  const { socios } = sesion();
  return cuentasDe(socios[0].slug).at(-1)?.mes ?? "";
}

/* ------------------------------------------------------------------------ */
/*  Lo siguiente                                                             */
/* ------------------------------------------------------------------------ */

export type Siguiente = {
  id: string;
  titulo: string;
  porque: string;
  accion: string;
  href: string;
  tipo: "solicitud" | "apoyo" | "insumo";
};

/**
 * Qué le toca hacer a la cooperativa, en orden de cuánto cuesta no hacerlo.
 *
 * Calculado de los datos, como `pendientes()` lo era de la ficha: nadie lo
 * mantiene a mano. El orden es una decisión y está aquí escrita:
 *
 * 1. Una solicitud nueva con un día en que alguien no abre — si se confirma
 *    sin mirar, alguien llega a una puerta cerrada.
 * 2. Las demás solicitudes nuevas, la más próxima primero: un visitante
 *    esperando respuesta se va a otra parte.
 * 3. Un socio que necesita apoyo.
 * 4. Un insumo por debajo del mínimo.
 */
export function loSiguiente(): Siguiente[] {
  const lista: Siguiente[] = [];

  const nuevas = solicitudesDeLaCooperativa()
    .filter((s) => s.estado === "nueva")
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const conConflicto = nuevas.filter((s) =>
    tareasDe(s, experiencia(s.experiencia)!).some((t) => t.conflicto),
  );
  const sinConflicto = nuevas.filter((s) => !conConflicto.includes(s));

  for (const s of conConflicto) {
    const t = tareasDe(s, experiencia(s.experiencia)!).filter((x) => x.conflicto);
    lista.push({
      id: `solicitud-${s.id}`,
      titulo: `Revisa la solicitud de ${s.nombre}`,
      porque: `Llegan el ${fechaConDia(s.fecha)}, y ese día ${t.length === 1 ? "hay una parada que no abre" : `hay ${t.length} paradas que no abren`}. Antes de confirmar, habla con ${t.length === 1 ? "esa familia" : "esas familias"} o propón otra fecha.`,
      accion: "Ver la solicitud",
      href: `/dashboard/solicitudes/${s.id}`,
      tipo: "solicitud",
    });
  }

  for (const s of sinConflicto) {
    lista.push({
      id: `solicitud-${s.id}`,
      titulo: `Confirma la solicitud de ${s.nombre}`,
      porque: `${personas(s)} personas para el ${fechaConDia(s.fecha)}. Están esperando respuesta, y quien espera mucho se va a otra parte.`,
      accion: "Ver la solicitud",
      href: `/dashboard/solicitudes/${s.id}`,
      tipo: "solicitud",
    });
  }

  for (const { negocio, salud: sl } of sociosPorSalud().filter((x) => x.salud.nivel === "riesgo")) {
    lista.push({
      id: `apoyo-${negocio.slug}`,
      titulo: `${negocio.nombre} necesita apoyo`,
      porque: sl.senales[0]?.que ?? "",
      accion: "Ver sus cuentas",
      href: `/dashboard/emprendimientos/${negocio.slug}`,
      tipo: "apoyo",
    });
  }

  for (const i of insumosBajos()) {
    const n = negocioPorSlug(i.emprendimiento);
    lista.push({
      id: `insumo-${i.emprendimiento}-${i.nombre}`,
      titulo: `A ${n?.persona.nombre.split(" ")[0] ?? "un socio"} le falta ${i.nombre.toLowerCase()}`,
      porque: `Tiene ${i.existencias} ${i.unidad} y necesita ${i.minimo} para un fin de semana lleno.`,
      accion: "Ver proveedores",
      href: "/dashboard/proveedores",
      tipo: "insumo",
    });
  }

  return lista;
}
