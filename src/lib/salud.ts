import type { MesFinanciero } from "@/data/tipos";

/**
 * La salud de un emprendimiento, en un semáforo y con su porqué.
 *
 * Esto es la «alerta de riesgo de quiebra» que pidió el PO, y se llama de otra
 * manera a propósito. Lo que la cooperativa necesita no es un pronóstico —con
 * seis meses de cuentas reportadas a mano nadie puede hacerlo— sino saber a
 * tiempo quién necesita apoyo y por qué. Por eso la pantalla nunca dice
 * «quiebra»: dice «necesita apoyo», y debajo, en palabras, qué lo provocó.
 *
 * Los umbrales son convenciones, no datos, como las duraciones de
 * `itinerario.ts`. Están escritos para que se discutan con la cooperativa, no
 * para que se crean.
 *
 * - Uno solo de los cuatro indicadores es «atención».
 * - Dos o más es «riesgo».
 */

/** Por debajo de dos meses de gastos fijos en caja, un mes malo la vacía. */
export const MESES_DE_CAJA_MINIMOS = 2;
/** Tres meses seguidos vendiendo menos que el anterior ya no es mala suerte. */
export const MESES_A_LA_BAJA = 3;
/** Más de un mes debiendo al proveedor es cuando el proveedor deja de fiar. */
export const DIAS_DE_ATRASO_MAXIMOS = 30;
/** Menos de una de cada cinco plazas ocupadas no paga lo que cuesta tenerlas. */
export const OCUPACION_MINIMA = 0.2;

export type NivelSalud = "estable" | "atencion" | "riesgo";

export type Senal = {
  id: "caja" | "ventas" | "deuda" | "ocupacion";
  /** Qué pasa, en una frase que se entienda sin saber de cuentas. */
  que: string;
  /** Qué puede hacer la cooperativa. Una alerta sin acción es ruido. */
  accion: string;
};

export type Salud = {
  nivel: NivelSalud;
  senales: Senal[];
  /** Meses de gastos fijos que aguanta con lo que tiene en caja. */
  mesesDeCaja: number;
};

export function ingresos(m: MesFinanciero): number {
  return m.ingresosRuta + m.ingresosPropios;
}

export function gastos(m: MesFinanciero): number {
  return m.gastosFijos + m.gastosVariables;
}

/** Lo que le quedó en el mes. Puede ser negativo. */
export function resultado(m: MesFinanciero): number {
  return ingresos(m) - gastos(m);
}

function aLaBaja(cuentas: readonly MesFinanciero[]): boolean {
  if (cuentas.length < MESES_A_LA_BAJA + 1) return false;
  const tramo = cuentas.slice(-(MESES_A_LA_BAJA + 1));
  for (let i = 1; i < tramo.length; i++) {
    if (ingresos(tramo[i]) >= ingresos(tramo[i - 1])) return false;
  }
  return true;
}

const fmt = (n: number) => n.toLocaleString("es-PA", { maximumFractionDigits: 1 });

/**
 * El semáforo, calculado de las cuentas y no escrito a mano — el mismo
 * principio que `pendientes()`: no es una lista que alguien mantiene, es lo que
 * los números dicen de sí mismos.
 */
export function salud(cuentas: readonly MesFinanciero[]): Salud {
  const ultimo = cuentas.at(-1);
  if (!ultimo) return { nivel: "estable", senales: [], mesesDeCaja: Number.POSITIVE_INFINITY };

  const senales: Senal[] = [];
  const mesesDeCaja = ultimo.gastosFijos > 0 ? ultimo.caja / ultimo.gastosFijos : Number.POSITIVE_INFINITY;

  if (mesesDeCaja < MESES_DE_CAJA_MINIMOS) {
    senales.push({
      id: "caja",
      que:
        mesesDeCaja < 1
          ? "Lo que tiene en caja no alcanza para un mes de gastos fijos."
          : `Lo que tiene en caja alcanza para ${fmt(mesesDeCaja)} meses de gastos fijos.`,
      accion: "Darle prioridad en el reparto de las próximas solicitudes.",
    });
  }

  if (aLaBaja(cuentas)) {
    senales.push({
      id: "ventas",
      que: `Lleva ${MESES_A_LA_BAJA} meses seguidos vendiendo menos que el mes anterior.`,
      accion: "Revisar con la familia qué cambió, y sacarla en la portada de la experiencia.",
    });
  }

  if (ultimo.diasAtraso > DIAS_DE_ATRASO_MAXIMOS) {
    senales.push({
      id: "deuda",
      que: `Debe B/. ${fmt(ultimo.deuda)} a un proveedor desde hace ${ultimo.diasAtraso} días.`,
      accion: "Hablar con el proveedor antes de que deje de fiarle.",
    });
  }

  if (ultimo.ocupacion < OCUPACION_MINIMA) {
    senales.push({
      id: "ocupacion",
      que: `Ocupó ${Math.round(ultimo.ocupacion * 100)} de cada 100 plazas el último mes.`,
      accion: "Mandarle visitantes cuando sea la alternativa de un bloque.",
    });
  }

  const nivel: NivelSalud = senales.length >= 2 ? "riesgo" : senales.length === 1 ? "atencion" : "estable";
  return { nivel, senales, mesesDeCaja };
}

export const ETIQUETA_SALUD: Record<NivelSalud, string> = {
  estable: "Estable",
  atencion: "Atención",
  riesgo: "Necesita apoyo",
};
