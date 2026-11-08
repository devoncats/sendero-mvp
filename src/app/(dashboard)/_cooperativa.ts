import { cookies } from "next/headers";
import { cache } from "react";

import type { Experiencia, Insumo, Proveedor, Solicitud } from "@/data";
import {
  ENTES,
  INSUMOS,
  PROVEEDORES,
  SOLICITUDES,
  actividadDe,
  cuentasDe,
  ente as enteDe,
  experiencia,
  experienciasDe,
  negocioPorSlug,
  personas,
  sociosDe,
} from "@/data";
import { fechaConDia } from "@/lib/formato";
import type { Tarea } from "@/lib/reparto";
import { iso, repartir } from "@/lib/reparto";
import type { NivelSalud, Salud } from "@/lib/salud";
import { salud } from "@/lib/salud";

/**
 * Lo que el panel sabe del ente económico que lo usa, en un solo sitio.
 *
 * Todo cuelga de `cooperativa()`, que devuelve el ente de la sesión y las
 * consultas ya acotadas a él: sus experiencias, sus socios, sus solicitudes,
 * sus proveedores. Ninguna pantalla filtra por su cuenta, y por eso añadir un
 * ente no toca ninguna pantalla.
 *
 * La sesión está simulada. El ente sale de la cookie `sendero-ente`, que
 * escribe `cambiarEnte` desde el menú de cuenta; sin cookie, el primero de
 * `ENTES`. Cuando exista autenticación, `enteDeLaSesion()` lee la de verdad y
 * nada más cambia.
 *
 * Vive en `app/(dashboard)` y no en `data` porque junta las dos capas: los
 * datos y la lógica de `lib`. Los datos no importan de `lib`.
 */

export const COOKIE_ENTE = "sendero-ente";

export async function enteDeLaSesion(): Promise<string> {
  const id = (await cookies()).get(COOKIE_ENTE)?.value;
  return ENTES.some((e) => e.id === id) ? id! : ENTES[0].id;
}

/* ------------------------------------------------------------------------ */
/*  Lo que no depende del ente                                               */
/* ------------------------------------------------------------------------ */

export function saludDe(slug: string): Salud {
  return salud(cuentasDe(slug));
}

export function nivelDe(slug: string): NivelSalud {
  return saludDe(slug).nivel;
}

export function tareasDe(s: Solicitud, e: Experiencia): Tarea[] {
  return repartir(s, e, negocioPorSlug);
}

/** Las que siguen vivas: lo que el ente tiene que mover todavía. */
export function esActiva(s: Solicitud): boolean {
  return s.estado === "nueva" || s.estado === "confirmada" || s.estado === "repartida";
}

const ORDEN_NIVEL: Record<NivelSalud, number> = { riesgo: 0, atencion: 1, estable: 2 };

export type Siguiente = {
  id: string;
  titulo: string;
  porque: string;
  accion: string;
  href: string;
  tipo: "solicitud" | "apoyo" | "insumo";
};

/* ------------------------------------------------------------------------ */
/*  Lo de un ente                                                            */
/* ------------------------------------------------------------------------ */

/** Todas las consultas del panel, acotadas a un ente. */
export function cooperativaDe(enteId: string) {
  const coop = enteDe(enteId);
  const experiencias = experienciasDe(coop.id);
  if (experiencias.length === 0) throw new Error(`El ente ${coop.id} no tiene experiencias`);

  const socios = sociosDe(coop.id);
  const esSocio = (slug: string) => socios.some((n) => n.slug === slug);

  const ids = new Set(experiencias.map((e) => e.id));
  const solicitudes = (): Solicitud[] => SOLICITUDES.filter((s) => ids.has(s.experiencia));

  const insumos = (): Insumo[] => INSUMOS.filter((i) => esSocio(i.emprendimiento));
  const insumosBajos = (): Insumo[] => insumos().filter((i) => i.existencias < i.minimo);

  /** Los proveedores de este ente: a quien le compra alguno de sus socios. */
  const proveedores = (): Proveedor[] =>
    PROVEEDORES.filter((p) => insumos().some((i) => i.proveedor === p.id));

  const sociosPorSalud = () =>
    socios
      .map((negocio) => ({ negocio, salud: saludDe(negocio.slug) }))
      .sort((a, b) => ORDEN_NIVEL[a.salud.nivel] - ORDEN_NIVEL[b.salud.nivel]);

  function solicitud(id: string): { s: Solicitud; e: Experiencia } | undefined {
    const s = solicitudes().find((x) => x.id === id);
    const e = s ? experiencia(s.experiencia) : undefined;
    return s && e ? { s, e } : undefined;
  }

  /**
   * Lo que le toca a un socio de aquí a `dias`, de las solicitudes ya
   * confirmadas o repartidas. Las nuevas no cuentan: todavía no son trabajo.
   */
  function porAtender(slug: string, ahora: Date, dias = 30): Tarea[] {
    const desde = iso(ahora);
    const tope = new Date(ahora);
    tope.setDate(tope.getDate() + dias);
    const hasta = iso(tope);
    return solicitudes()
      .filter((s) => s.estado === "confirmada" || s.estado === "repartida")
      .flatMap((s) => tareasDe(s, experiencia(s.experiencia)!))
      .filter((t) => t.negocio.slug === slug && t.fecha >= desde && t.fecha <= hasta)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.bloque.hora.localeCompare(b.bloque.hora));
  }

  /**
   * Lo que gastó cada socio en energía y transporte, mes a mes, en el orden de
   * `socios`. Es actividad, no emisiones: el cálculo vive en `lib/`.
   */
  const actividadPorSocio = () => socios.map((negocio) => ({ negocio, meses: actividadDe(negocio.slug) }));

  /** El último mes con cuentas cerradas. */
  function ultimoMes(): string {
    return cuentasDe(socios[0].slug).at(-1)?.mes ?? "";
  }

  /** Visitantes atendidos y lo que recibieron los socios por las experiencias, en un mes. */
  function resumenDelMes(mes: string) {
    const atendidas = solicitudes().filter((s) => s.estado === "atendida" && s.fecha.startsWith(mes));
    const visitantes = atendidas.reduce((t, s) => t + personas(s), 0);
    const recibido = socios.reduce(
      (t, n) => t + (cuentasDe(n.slug).find((m) => m.mes === mes)?.ingresosRuta ?? 0),
      0,
    );
    return { grupos: atendidas.length, visitantes, recibido };
  }

  /**
   * Qué le toca hacer al ente, en orden de cuánto cuesta no hacerlo.
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
  function loSiguiente(): Siguiente[] {
    const lista: Siguiente[] = [];
    const nuevas = solicitudes()
      .filter((s) => s.estado === "nueva")
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    const conflictosDe = (s: Solicitud) => tareasDe(s, experiencia(s.experiencia)!).filter((t) => t.conflicto);

    for (const s of nuevas.filter((x) => conflictosDe(x).length > 0)) {
      const t = conflictosDe(s);
      lista.push({
        id: `solicitud-${s.id}`,
        titulo: `Revisa la solicitud de ${s.nombre}`,
        porque: `Llegan el ${fechaConDia(s.fecha)}, y ese día ${t.length === 1 ? "hay una parada que no abre" : `hay ${t.length} paradas que no abren`}. Antes de confirmar, habla con ${t.length === 1 ? "esa familia" : "esas familias"} o propón otra fecha.`,
        accion: "Ver la solicitud",
        href: `/dashboard/solicitudes/${s.id}`,
        tipo: "solicitud",
      });
    }

    for (const s of nuevas.filter((x) => conflictosDe(x).length === 0)) {
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

  return {
    coop,
    experiencias,
    socios,
    esSocio,
    solicitudes,
    solicitud,
    insumos,
    insumosBajos,
    proveedores,
    sociosPorSalud,
    actividadPorSocio,
    porAtender,
    ultimoMes,
    resumenDelMes,
    loSiguiente,
  };
}

export type Cooperativa = ReturnType<typeof cooperativaDe>;

/**
 * El ente de esta petición. `cache` hace que el layout y la página, que lo
 * piden los dos, lo calculen una sola vez.
 */
export const cooperativa = cache(async (): Promise<Cooperativa> => cooperativaDe(await enteDeLaSesion()));
