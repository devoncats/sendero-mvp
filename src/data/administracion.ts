import type { Insumo, MesFinanciero, Proveedor } from "./tipos";

/**
 * Lo administrativo de la comunidad: a quién le compra cada emprendimiento, qué
 * tiene en existencia y cómo le fue cada mes. INVENTADO, como las solicitudes.
 *
 * No es dato público. El visitante nunca ve esto — vive aparte de `Negocio`
 * por la misma razón que la cola de fotos vive en `panel.ts`.
 */

export const PROVEEDORES: readonly Proveedor[] = [
  {
    id: "granja-los-cerritos",
    nombre: "Granja Los Cerritos — Efraín Rodríguez",
    rubro: "Gallina de patio, huevos",
    lugar: "El Valle de Antón",
    local: true,
    whatsapp: "50764882210",
  },
  {
    id: "finca-la-mesa",
    nombre: "Finca La Mesa — Cándida Ortega",
    rubro: "Maíz nuevo, ñame, culantro, café",
    lugar: "La Mesa, El Valle",
    local: true,
    whatsapp: "50765314478",
  },
  {
    id: "pescaderia-san-carlos",
    nombre: "Pescadería San Carlos",
    rubro: "Pescado fresco",
    lugar: "San Carlos, Panamá Oeste",
    local: false,
    whatsapp: "50769920036",
  },
  {
    id: "abarroteria-el-valle",
    nombre: "Abarrotería El Valle — familia Chen",
    rubro: "Arroz, aceite, gas, víveres",
    lugar: "El Valle de Antón",
    local: true,
    whatsapp: "50762217784",
  },
  {
    id: "junqueros-de-cabuya",
    nombre: "Junqueros de Cabuya",
    rubro: "Junco cortado y secado",
    lugar: "Cabuya, Coclé",
    local: false,
    whatsapp: "50766450192",
  },
  {
    id: "lavanderia-del-cerro",
    nombre: "Lavandería del Cerro — Elsa Pérez",
    rubro: "Lavado de sábanas y toallas",
    lugar: "El Valle de Antón",
    local: true,
    whatsapp: "50767038815",
  },
  {
    id: "estacion-anton",
    nombre: "Estación de combustible Antón",
    rubro: "Diésel",
    lugar: "Antón, Coclé",
    local: false,
    whatsapp: "50769958841",
  },
];

export function proveedor(id: string): Proveedor | undefined {
  return PROVEEDORES.find((p) => p.id === id);
}

/**
 * Lo que cada uno necesita tener para atender un fin de semana lleno. Tres
 * están por debajo del mínimo a propósito: el panel tiene que avisarlos.
 */
export const INSUMOS: readonly Insumo[] = [
  { emprendimiento: "fonda-dona-eneida", nombre: "Gallina de patio", unidad: "unidades", existencias: 6, minimo: 4, proveedor: "granja-los-cerritos" },
  { emprendimiento: "fonda-dona-eneida", nombre: "Maíz nuevo", unidad: "docenas de mazorcas", existencias: 3, minimo: 4, proveedor: "finca-la-mesa" },
  { emprendimiento: "fonda-dona-eneida", nombre: "Gas", unidad: "tanques de 25 lb", existencias: 2, minimo: 1, proveedor: "abarroteria-el-valle" },
  { emprendimiento: "cocina-de-yolanda", nombre: "Pescado", unidad: "libras", existencias: 4, minimo: 12, proveedor: "pescaderia-san-carlos" },
  { emprendimiento: "cocina-de-yolanda", nombre: "Frijol y arroz", unidad: "quintales", existencias: 1, minimo: 1, proveedor: "abarroteria-el-valle" },
  { emprendimiento: "hospedaje-cerro-gaital", nombre: "Juegos de sábanas", unidad: "juegos", existencias: 10, minimo: 8, proveedor: "lavanderia-del-cerro" },
  { emprendimiento: "hospedaje-cerro-gaital", nombre: "Café", unidad: "libras", existencias: 3, minimo: 2, proveedor: "finca-la-mesa" },
  { emprendimiento: "cabanas-la-pintada", nombre: "Juegos de sábanas", unidad: "juegos", existencias: 6, minimo: 6, proveedor: "lavanderia-del-cerro" },
  { emprendimiento: "sombreros-del-valle", nombre: "Junco seco", unidad: "manojos", existencias: 2, minimo: 5, proveedor: "junqueros-de-cabuya" },
  { emprendimiento: "transporte-valle-alto", nombre: "Diésel", unidad: "galones", existencias: 14, minimo: 10, proveedor: "estacion-anton" },
];

type Fila = [string, number, number, number, number, number, number, number, number];

/** Una fila compacta por mes, para que seis meses de diez familias se lean. */
function meses(filas: Fila[]): MesFinanciero[] {
  return filas.map(([mes, ingresosRuta, ingresosPropios, gastosFijos, gastosVariables, caja, deuda, diasAtraso, ocupacion]) => ({
    mes,
    ingresosRuta,
    ingresosPropios,
    gastosFijos,
    gastosVariables,
    caja,
    deuda,
    diasAtraso,
    ocupacion,
  }));
}

/**
 * Seis meses de cuentas por emprendimiento, de mayo a octubre de 2026.
 *
 * Dos están en riesgo y uno en atención, a propósito y por razones distintas,
 * para que la alerta no sea código muerto:
 *
 * - **Cocina de Yolanda**: menos de un mes de caja y una deuda con la
 *   pescadería que pasa de los treinta días.
 * - **Cabañas La Pintada**: tres meses seguidos a la baja y la ocupación por
 *   debajo del 20 %. Abrió hace poco y casi nadie la conoce.
 * - **Sombreros del Valle**: las cuentas están bien, pero le debe junco a
 *   Cabuya desde hace más de un mes.
 */
export const FINANZAS: Readonly<Record<string, MesFinanciero[]>> = {
  //                         mes        ruta  propios fijos var  caja  deuda atraso ocup
  "fonda-dona-eneida": meses([
    ["2026-05", 180, 940, 220, 510, 860, 0, 0, 0.52],
    ["2026-06", 150, 880, 220, 480, 1010, 0, 0, 0.48],
    ["2026-07", 260, 1020, 220, 560, 1250, 60, 8, 0.58],
    ["2026-08", 210, 960, 220, 530, 1400, 0, 0, 0.55],
    ["2026-09", 330, 990, 220, 590, 1620, 0, 0, 0.61],
    ["2026-10", 300, 1050, 220, 600, 1840, 40, 5, 0.63],
  ]),
  "cocina-de-yolanda": meses([
    ["2026-05", 60, 520, 180, 360, 410, 80, 10, 0.31],
    ["2026-06", 40, 470, 180, 350, 340, 120, 20, 0.27],
    ["2026-07", 0, 430, 180, 330, 250, 160, 28, 0.22],
    ["2026-08", 40, 410, 180, 320, 190, 190, 35, 0.21],
    ["2026-09", 0, 400, 180, 300, 160, 210, 42, 0.19],
    ["2026-10", 60, 390, 180, 310, 150, 230, 48, 0.2],
  ]),
  "hospedaje-cerro-gaital": meses([
    ["2026-05", 420, 610, 310, 280, 1300, 0, 0, 0.46],
    ["2026-06", 350, 540, 310, 260, 1340, 0, 0, 0.41],
    ["2026-07", 560, 720, 310, 330, 1650, 0, 0, 0.58],
    ["2026-08", 490, 650, 310, 300, 1880, 0, 0, 0.52],
    ["2026-09", 630, 600, 310, 320, 2150, 0, 0, 0.57],
    ["2026-10", 595, 640, 310, 330, 2420, 0, 0, 0.6],
  ]),
  "cabanas-la-pintada": meses([
    ["2026-05", 160, 420, 250, 150, 780, 0, 0, 0.3],
    ["2026-06", 200, 380, 250, 160, 840, 0, 0, 0.32],
    ["2026-07", 120, 340, 250, 140, 760, 0, 0, 0.26],
    ["2026-08", 80, 300, 250, 130, 620, 40, 12, 0.21],
    ["2026-09", 40, 240, 250, 120, 500, 60, 18, 0.15],
    ["2026-10", 0, 210, 250, 110, 420, 80, 24, 0.12],
  ]),
  "senderos-india-dormida": meses([
    ["2026-05", 240, 690, 60, 90, 1100, 0, 0, 0.55],
    ["2026-06", 180, 600, 60, 80, 1310, 0, 0, 0.47],
    ["2026-07", 330, 810, 60, 110, 1600, 0, 0, 0.66],
    ["2026-08", 270, 760, 60, 100, 1880, 0, 0, 0.6],
    ["2026-09", 405, 720, 60, 110, 2190, 0, 0, 0.64],
    ["2026-10", 405, 780, 60, 120, 2480, 0, 0, 0.67],
  ]),
  "guias-chorro-las-mozas": meses([
    ["2026-05", 160, 380, 40, 60, 620, 0, 0, 0.48],
    ["2026-06", 120, 330, 40, 50, 700, 0, 0, 0.41],
    ["2026-07", 220, 450, 40, 70, 860, 0, 0, 0.59],
    ["2026-08", 180, 420, 40, 60, 990, 0, 0, 0.54],
    ["2026-09", 270, 400, 40, 70, 1150, 0, 0, 0.57],
    ["2026-10", 270, 430, 40, 70, 1320, 0, 0, 0.6],
  ]),
  "conjunto-flor-del-valle": meses([
    ["2026-05", 128, 300, 90, 120, 540, 0, 0, 0.38],
    ["2026-06", 96, 260, 90, 110, 590, 0, 0, 0.33],
    ["2026-07", 176, 420, 90, 140, 750, 0, 0, 0.46],
    ["2026-08", 144, 380, 90, 130, 870, 0, 0, 0.42],
    ["2026-09", 216, 350, 90, 130, 1010, 0, 0, 0.45],
    ["2026-10", 216, 360, 90, 140, 1150, 0, 0, 0.47],
  ]),
  "sombreros-del-valle": meses([
    ["2026-05", 128, 560, 70, 210, 900, 0, 0, 0.4],
    ["2026-06", 96, 520, 70, 200, 980, 30, 5, 0.36],
    ["2026-07", 176, 610, 70, 230, 1100, 60, 12, 0.46],
    ["2026-08", 144, 580, 70, 220, 1180, 90, 22, 0.43],
    ["2026-09", 216, 600, 70, 240, 1300, 110, 31, 0.47],
    ["2026-10", 216, 620, 70, 240, 1420, 120, 38, 0.49],
  ]),
  "vivero-orquideas-del-crater": meses([
    ["2026-05", 80, 720, 150, 210, 1400, 0, 0, 0.35],
    ["2026-06", 60, 680, 150, 200, 1500, 0, 0, 0.31],
    ["2026-07", 110, 800, 150, 230, 1680, 0, 0, 0.4],
    ["2026-08", 90, 760, 150, 220, 1820, 0, 0, 0.38],
    ["2026-09", 135, 740, 150, 230, 1980, 0, 0, 0.41],
    ["2026-10", 135, 790, 150, 240, 2140, 0, 0, 0.43],
  ]),
  "transporte-valle-alto": meses([
    ["2026-05", 192, 1100, 380, 520, 1250, 0, 0, 0.5],
    ["2026-06", 144, 1020, 380, 500, 1310, 0, 0, 0.45],
    ["2026-07", 264, 1240, 380, 570, 1560, 0, 0, 0.57],
    ["2026-08", 216, 1180, 380, 550, 1760, 0, 0, 0.53],
    ["2026-09", 324, 1150, 380, 560, 1990, 0, 0, 0.56],
    ["2026-10", 324, 1210, 380, 580, 2240, 0, 0, 0.59],
  ]),
};

export function cuentasDe(slug: string): MesFinanciero[] {
  return FINANZAS[slug] ?? [];
}
