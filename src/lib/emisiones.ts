import type { ActividadMensual, Combustible, ModoTransporte, TipoCombustible } from "@/data";

/**
 * Cuánto CO₂ sale de lo que gastó un emprendimiento en un mes, por alcance.
 *
 * Es aritmética y nada más: actividad × factor. Lo que importa es que cada
 * factor diga de dónde sale, en qué año y qué cuenta —solo CO₂ o CO₂
 * equivalente—, porque una cifra de emisiones sin su fuente no se puede
 * revisar, y una que no se puede revisar no sirve para nada.
 *
 * Los factores se escriben **como los publica la fuente** —kilos por galón,
 * por milla, por gigajulio— y se convierten aquí, a la vista. Así quien revise
 * puede comparar el número con la tabla original sin hacer cuentas a mano.
 *
 * Lo que este archivo NO hace, a propósito:
 *
 * - No reparte. Las cifras son de **todo** lo que gastó cada socio, no solo de
 *   lo que gastó atendiendo la experiencia. Qué parte se le atribuye es una
 *   decisión de método que todavía no se ha tomado.
 * - No resta emisiones evitadas. Si algún día se calculan, se reportan aparte:
 *   el GHG Protocol no permite descontarlas del inventario.
 * - No inventa un factor. Un modo sin factor publicado devuelve su actividad en
 *   `sinFactor`, y la pantalla tiene que decir que el total está incompleto.
 */

/* ------------------------------------------------------------------------ */
/*  Conversiones                                                             */
/* ------------------------------------------------------------------------ */

/** Galón estadounidense, exacto por definición. */
export const LITROS_POR_GALON = 3.785411784;

/** Milla terrestre, exacta por definición. */
export const KM_POR_MILLA = 1.609344;

/* ------------------------------------------------------------------------ */
/*  Factores                                                                 */
/* ------------------------------------------------------------------------ */

export type Factor = {
  /** Kilos de gas por unidad de actividad, ya convertidos a la unidad de los datos. */
  kgPorUnidad: number;
  /** La unidad de actividad a la que se aplica, como la escriben los datos. */
  unidad: "kg" | "L" | "kWh" | "pasajero-km" | "km";
  /**
   * Qué cuenta el factor. `CO₂` deja fuera el metano y el óxido nitroso; en
   * combustibles son menos del 1 % del total, y está dicho en la pantalla.
   */
  gases: "CO₂" | "CO₂e";
  /** El factor tal como lo publica la fuente, para poder cotejarlo. */
  original: string;
  fuente: string;
  url: string;
  /** El año de los datos, no el de la publicación. */
  anio: number;
};

const EPA_HUB = "EPA, GHG Emission Factors Hub 2025";
const URL_EPA = "https://www.epa.gov/climateleadership/ghg-emission-factors-hub";

/**
 * Alcance 1: lo que se quema en algo que el emprendimiento tiene o maneja.
 *
 * El GLP va por masa con el valor por defecto del IPCC 2006 (63,1 t CO₂/TJ y un
 * poder calorífico neto de 47,3 TJ/Gg): es como se pesa en Panamá, en tanques
 * de 25 lb, y no obliga a suponer una densidad. La gasolina y el diésel van con
 * la Tabla 2 de la EPA, por galón.
 */
export const FACTORES_COMBUSTIBLE: Readonly<Record<TipoCombustible, Factor>> = {
  glp: {
    kgPorUnidad: (63.1 * 47.3) / 1000,
    unidad: "kg",
    gases: "CO₂",
    original: "63,1 t CO₂/TJ × 47,3 TJ/Gg",
    fuente: "IPCC 2006, valores por defecto (Vol. 2, cap. 1)",
    url: "https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol2.html",
    anio: 2006,
  },
  gasolina: {
    kgPorUnidad: 8.78 / LITROS_POR_GALON,
    unidad: "L",
    gases: "CO₂",
    original: "8,78 kg CO₂/galón",
    fuente: `${EPA_HUB}, tabla 2`,
    url: URL_EPA,
    anio: 2025,
  },
  diesel: {
    kgPorUnidad: 10.21 / LITROS_POR_GALON,
    unidad: "L",
    gases: "CO₂",
    original: "10,21 kg CO₂/galón",
    fuente: `${EPA_HUB}, tabla 2`,
    url: URL_EPA,
    anio: 2025,
  },
};

/**
 * Alcance 2: la electricidad de la red, con el factor para inventarios que
 * publica la Secretaría Nacional de Energía (Tabla VIII, «FE Inventarios»).
 *
 * No es el margen combinado de la misma resolución: ese sirve para proyectos
 * que desplazan generación, no para la huella de quien consume. Hay una
 * actualización a 2025 publicada en agosto de 2026 cuyo valor todavía no se ha
 * podido leer; cuando se lea, se cambia aquí y nada más.
 */
export const FACTOR_RED: Factor = {
  kgPorUnidad: 0.1501,
  unidad: "kWh",
  gases: "CO₂",
  original: "0,1501 t CO₂/MWh",
  fuente: "Secretaría Nacional de Energía, factor de emisión del SIN para inventarios",
  url: "https://transparencia-climatica.miambiente.gob.pa/wp-content/uploads/2025/11/2024_FACTOR-DE-EMISION-DEL-SIN-PANAMA-2024.pdf",
  anio: 2024,
};

/**
 * Alcance 3: trayectos en vehículo ajeno, con la Tabla 10 de la EPA (viajes de
 * negocio). El bus va por pasajero; el auto, por vehículo, lleve a quien lleve.
 *
 * Son factores del parque de Estados Unidos. Un bus panameño probablemente
 * emite más por pasajero que el promedio de allá, así que el alcance 3 de bus
 * tiende a quedarse corto. Está dicho en la pantalla.
 *
 * La lancha no tiene factor: ninguna fuente de las que se usan aquí publica
 * uno para una lancha de pasajeros con motor fuera de borda. Hasta que lo
 * haya, se reporta como actividad sin calcular.
 */
export const FACTORES_TRANSPORTE: Readonly<Record<ModoTransporte, Factor | null>> = {
  bus: {
    kgPorUnidad: 0.067 / KM_POR_MILLA,
    unidad: "pasajero-km",
    gases: "CO₂e",
    original: "0,067 kg CO₂e/pasajero-milla",
    fuente: `${EPA_HUB}, tabla 10`,
    url: URL_EPA,
    anio: 2025,
  },
  auto: {
    kgPorUnidad: 0.299 / KM_POR_MILLA,
    unidad: "km",
    gases: "CO₂e",
    original: "0,299 kg CO₂e/vehículo-milla",
    fuente: `${EPA_HUB}, tabla 10`,
    url: URL_EPA,
    anio: 2025,
  },
  lancha: null,
};

/* ------------------------------------------------------------------------ */
/*  Cálculo                                                                  */
/* ------------------------------------------------------------------------ */

export type Alcance = 1 | 2 | 3;

/** Una línea del cálculo: qué se gastó, con qué factor, y cuánto dio. */
export type Partida = {
  alcance: Alcance;
  /** «50 kg de gas», «240 km en bus» — lo que se le enseña a una persona. */
  que: string;
  cantidad: number;
  factor: Factor;
  kg: number;
};

export type Emisiones = {
  /** Kilos, por alcance. */
  alcance1: number;
  alcance2: number;
  alcance3: number;
  total: number;
  /** Lo que no se pudo calcular por falta de factor, dicho en palabras. */
  sinFactor: string[];
};

const NOMBRE: Record<TipoCombustible, string> = { glp: "gas", gasolina: "gasolina", diesel: "diésel" };

function cantidadDe(c: Combustible): number {
  return "kg" in c ? c.kg : c.litros;
}

/** Cada línea del cálculo de un mes, en orden de alcance. Lo que no tiene factor no sale aquí. */
export function partidas(m: ActividadMensual): Partida[] {
  const lista: Partida[] = [];

  for (const c of m.combustibles) {
    const factor = FACTORES_COMBUSTIBLE[c.tipo];
    const cantidad = cantidadDe(c);
    lista.push({
      alcance: 1,
      que: `${cantidad} ${factor.unidad} de ${NOMBRE[c.tipo]}`,
      cantidad,
      factor,
      kg: cantidad * factor.kgPorUnidad,
    });
  }

  if (m.electricidadKWh > 0) {
    lista.push({
      alcance: 2,
      que: `${m.electricidadKWh} kWh de la red`,
      cantidad: m.electricidadKWh,
      factor: FACTOR_RED,
      kg: m.electricidadKWh * FACTOR_RED.kgPorUnidad,
    });
  }

  for (const t of m.transporte) {
    const factor = FACTORES_TRANSPORTE[t.modo];
    if (!factor) continue;
    // El bus se cuenta por pasajero; el auto, por vehículo.
    const cantidad = factor.unidad === "pasajero-km" ? t.km * t.pasajeros : t.km;
    lista.push({
      alcance: 3,
      que: `${t.km} km en ${t.modo}${t.pasajeros > 1 ? `, ${t.pasajeros} personas` : ""}`,
      cantidad,
      factor,
      kg: cantidad * factor.kgPorUnidad,
    });
  }

  return lista;
}

/** Las emisiones de un mes de un emprendimiento, por alcance. */
export function emisionesDelMes(m: ActividadMensual): Emisiones {
  const lista = partidas(m);
  const de = (a: Alcance) => lista.filter((p) => p.alcance === a).reduce((t, p) => t + p.kg, 0);
  const alcance1 = de(1);
  const alcance2 = de(2);
  const alcance3 = de(3);

  const sinFactor = m.transporte
    .filter((t) => !FACTORES_TRANSPORTE[t.modo])
    // Solo la primera letra baja: «traer hielo de Isla Grande», no «isla grande».
    .map((t) => `${t.km} km en ${t.modo} (${t.motivo.charAt(0).toLowerCase()}${t.motivo.slice(1)})`);

  return { alcance1, alcance2, alcance3, total: alcance1 + alcance2 + alcance3, sinFactor };
}

/** La suma de varias: de varios socios en un mes, o de un socio en varios meses. */
export function sumar(lista: readonly Emisiones[]): Emisiones {
  return lista.reduce<Emisiones>(
    (t, e) => ({
      alcance1: t.alcance1 + e.alcance1,
      alcance2: t.alcance2 + e.alcance2,
      alcance3: t.alcance3 + e.alcance3,
      total: t.total + e.total,
      sinFactor: [...t.sinFactor, ...e.sinFactor],
    }),
    { alcance1: 0, alcance2: 0, alcance3: 0, total: 0, sinFactor: [] },
  );
}

/** Todos los factores que usa el cálculo, para enseñarlos con su fuente. */
export function factoresEnUso(): { que: string; factor: Factor }[] {
  return [
    { que: "Gas (GLP)", factor: FACTORES_COMBUSTIBLE.glp },
    { que: "Gasolina", factor: FACTORES_COMBUSTIBLE.gasolina },
    { que: "Diésel", factor: FACTORES_COMBUSTIBLE.diesel },
    { que: "Electricidad de la red", factor: FACTOR_RED },
    ...(Object.entries(FACTORES_TRANSPORTE) as [ModoTransporte, Factor | null][])
      .filter((x): x is [ModoTransporte, Factor] => x[1] !== null)
      .map(([modo, factor]) => ({ que: modo === "bus" ? "Bus" : "Auto", factor })),
  ];
}
