import type { ActividadMensual, TipoCombustible } from "@/data";

/**
 * Cuánta energía consumieron los socios: el combustible que quemaron más la
 * electricidad que compraron a la red, en kilovatios hora.
 *
 * Sigue la definición de «energía consumida dentro de la organización» del
 * estándar GRI 302-1:
 *
 * - Cuenta lo que se quema en algo propio y lo que se compra a la red.
 * - **No** cuenta los trayectos en vehículo ajeno: esa energía la gasta otro
 *   (sería GRI 302-2, «fuera de la organización»), igual que sus emisiones son
 *   alcance 3 y no 1.
 * - La electricidad que uno genera y consume se cuenta **una sola vez**, como
 *   combustible. La Posada Isla Drake quema diésel en su planta: ese diésel es
 *   su energía, y sumarle además los kWh de la planta sería contarla dos veces.
 *   Los datos ya vienen así —su `electricidadKWh` es 0—.
 *
 * La unidad es el kWh y no el julio, aunque GRI acepta los dos: el kWh es lo
 * que una familia ya lee en su recibo de luz. 1 kWh = 3,6 MJ.
 *
 * Es energía **final** —lo que llega a la estufa, al motor, al enchufe—, no
 * primaria: no incluye lo que se perdió generando la electricidad en la planta.
 */

/** Megajulios por kilovatio hora, exacto por definición. */
export const MJ_POR_KWH = 3.6;

export type PoderCalorifico = {
  /** kWh por unidad de los datos (kg o L), ya convertidos. */
  kWhPorUnidad: number;
  unidad: "kg" | "L";
  /** Los números de partida, tal como los publica cada fuente. */
  original: string;
  fuente: string;
  url: string;
};

const IPCC = "IPCC 2006, poder calorífico neto por defecto";
const URL_IPCC = "https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol2.html";
const SEAI = "densidad de SEAI (Irlanda)";

/*
  El poder calorífico es el **neto** (inferior) del IPCC 2006, en MJ/kg: el
  mismo juego de valores de donde sale el factor de emisión del GLP. El neto
  descuenta el calor del vapor de agua que nunca se aprovecha; el bruto sale un
  5–6 % más alto en líquidos, y mezclarlos es el error más común en esta cuenta.

  La gasolina y el diésel se miden en litros, así que hace falta la densidad
  para pasar a kilos. Es la de combustible 100 % de petróleo que publica SEAI,
  la agencia de energía de Irlanda. Sus propios poderes caloríficos coinciden
  con los del IPCC en menos de un 1 %, lo que sirve de comprobación cruzada.
*/
export const PODER_CALORIFICO: Readonly<Record<TipoCombustible, PoderCalorifico>> = {
  glp: {
    kWhPorUnidad: 47.3 / MJ_POR_KWH,
    unidad: "kg",
    original: "47,3 MJ/kg",
    fuente: IPCC,
    url: URL_IPCC,
  },
  gasolina: {
    kWhPorUnidad: (44.3 * 0.741) / MJ_POR_KWH,
    unidad: "L",
    original: `44,3 MJ/kg × 0,741 kg/L (${SEAI})`,
    fuente: IPCC,
    url: URL_IPCC,
  },
  diesel: {
    kWhPorUnidad: (43.0 * 0.845) / MJ_POR_KWH,
    unidad: "L",
    original: `43,0 MJ/kg × 0,845 kg/L (${SEAI})`,
    fuente: IPCC,
    url: URL_IPCC,
  },
};

export const URL_SEAI = "https://www.seai.ie/resources/seai-statistics/conversion-factors/";

export type Energia = {
  /** kWh de cada combustible quemado en algo propio. */
  porCombustible: Record<TipoCombustible, number>;
  /** kWh de la red, tal como los marca el medidor. */
  electricidad: number;
  /** La suma de los combustibles. */
  combustibles: number;
  total: number;
};

const CERO: Energia = {
  porCombustible: { glp: 0, gasolina: 0, diesel: 0 },
  electricidad: 0,
  combustibles: 0,
  total: 0,
};

/** La energía consumida en un mes por un emprendimiento. */
export function energiaDelMes(m: ActividadMensual): Energia {
  const porCombustible = { ...CERO.porCombustible };
  for (const c of m.combustibles) {
    const cantidad = "kg" in c ? c.kg : c.litros;
    porCombustible[c.tipo] += cantidad * PODER_CALORIFICO[c.tipo].kWhPorUnidad;
  }
  const combustibles = porCombustible.glp + porCombustible.gasolina + porCombustible.diesel;
  return { porCombustible, electricidad: m.electricidadKWh, combustibles, total: combustibles + m.electricidadKWh };
}

/** La suma de varias: de varios socios, de varios meses, o de las dos cosas. */
export function sumarEnergia(lista: readonly Energia[]): Energia {
  return lista.reduce<Energia>(
    (t, e) => ({
      porCombustible: {
        glp: t.porCombustible.glp + e.porCombustible.glp,
        gasolina: t.porCombustible.gasolina + e.porCombustible.gasolina,
        diesel: t.porCombustible.diesel + e.porCombustible.diesel,
      },
      electricidad: t.electricidad + e.electricidad,
      combustibles: t.combustibles + e.combustibles,
      total: t.total + e.total,
    }),
    CERO,
  );
}
