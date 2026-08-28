import type { Dia, DiaHorario, Franja, Semana } from "@/data/tipos";

/**
 * Formateadores del dominio. Importa los tipos de `data` pero solo como tipos:
 * `import type` se borra al compilar, así que no hay acoplamiento en ejecución.
 *
 * Ninguna función lee el reloj por su cuenta. La fecha siempre entra por
 * parámetro, porque una página estática y una petición viva necesitan verdades
 * distintas y esa decisión no le toca a un formateador.
 */

const DIAS: readonly Dia[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

const NOMBRE_DIA: Record<Dia, string> = {
  lun: "Lunes",
  mar: "Martes",
  mie: "Miércoles",
  jue: "Jueves",
  vie: "Viernes",
  sab: "Sábado",
  dom: "Domingo",
};

const NOMBRE_DIA_CORTO: Record<Dia, string> = {
  lun: "Lun",
  mar: "Mar",
  mie: "Mié",
  jue: "Jue",
  vie: "Vie",
  sab: "Sáb",
  dom: "Dom",
};

export function nombreDia(dia: Dia, corto = false): string {
  return corto ? NOMBRE_DIA_CORTO[dia] : NOMBRE_DIA[dia];
}

/** "B/. 180" · "desde B/. 180" · "B/. 3.50" */
export function precio(valor: number, desde = false): string {
  const entero = Number.isInteger(valor);
  const n = entero ? String(valor) : valor.toFixed(2);
  return `${desde ? "desde " : ""}B/. ${n}`;
}

/** "07:00" -> "7:00 a.m." — como se lee un horario en Panamá. */
export function hora(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h24 = Number(hStr);
  const sufijo = h24 < 12 ? "a.m." : "p.m.";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mStr} ${sufijo}`;
}

export function rango(franja: Franja): string {
  return `${hora(franja.desde)} – ${hora(franja.hasta)}`;
}

/** Texto de un día, sea franja, cerrado o sin confirmar. */
export function textoDia(valor: DiaHorario): string {
  if (valor === "cerrado") return "Cerrado";
  if (valor === "sinConfirmar") return "Sin confirmar";
  return rango(valor);
}

function mismaClave(valor: DiaHorario): string {
  if (typeof valor === "string") return valor;
  return `${valor.desde}-${valor.hasta}`;
}

/**
 * Agrupa los días seguidos que comparten horario: en vez de siete filas, sale
 * "Lun a vie · 7:00 a.m. – 5:00 p.m." y luego los que se salen.
 */
export function resumenSemana(semana: Semana): { dias: string; horario: string; valor: DiaHorario }[] {
  const filas: { dias: string; horario: string; valor: DiaHorario }[] = [];
  let inicio = 0;

  for (let i = 1; i <= DIAS.length; i++) {
    const cambia = i === DIAS.length || mismaClave(semana[DIAS[i]]) !== mismaClave(semana[DIAS[inicio]]);
    if (!cambia) continue;

    const desde = DIAS[inicio];
    const hasta = DIAS[i - 1];
    const valor = semana[desde];
    filas.push({
      dias:
        inicio === i - 1
          ? nombreDia(desde)
          : `${nombreDia(desde, true)} a ${nombreDia(hasta, true).toLowerCase()}`,
      horario: textoDia(valor),
      valor,
    });
    inicio = i;
  }

  return filas;
}

/** Índice de `Date.getDay()` (0 = domingo) al día de la semana del dominio. */
const POR_INDICE: readonly Dia[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

export type Apertura =
  | { estado: "abierto"; cierraA: string }
  | { estado: "cerrado"; abreA?: string }
  | { estado: "sinConfirmar" };

/**
 * Si el negocio está abierto en ese instante.
 *
 * Ojo: en una página estática esto se congela en el momento del build. La
 * decisión de dónde calcularlo —servidor por petición, o un componente cliente
 * mínimo— se toma en la pantalla, no aquí.
 */
export function apertura(semana: Semana, ahora: Date): Apertura {
  const hoy = semana[POR_INDICE[ahora.getDay()]];
  if (hoy === "sinConfirmar") return { estado: "sinConfirmar" };
  if (hoy === "cerrado") return { estado: "cerrado" };

  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const aMinutos = (s: string) => {
    const [hh, mm] = s.split(":").map(Number);
    return hh * 60 + mm;
  };

  if (minutos >= aMinutos(hoy.desde) && minutos < aMinutos(hoy.hasta)) {
    return { estado: "abierto", cierraA: hora(hoy.hasta) };
  }
  return { estado: "cerrado", abreA: minutos < aMinutos(hoy.desde) ? hora(hoy.desde) : undefined };
}

/** "hace 3 días" · "hace un mes" · "hoy". Para la frescura del dato. */
export function hace(iso: string, ahora: Date): string {
  const dias = Math.floor((ahora.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "hace un mes" : `hace ${meses} meses`;
}

/**
 * Enlace de WhatsApp con el mensaje ya escrito. Que el visitante no tenga que
 * redactar nada es medio contacto ganado.
 */
export function enlaceWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function enlaceLlamada(numero: string): string {
  return `tel:+${numero}`;
}
