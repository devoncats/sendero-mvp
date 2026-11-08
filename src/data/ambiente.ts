import { FINANZAS } from "./administracion";
import type { ActividadMensual, Combustible, ModoTransporte } from "./tipos";

/**
 * Lo que cada emprendimiento gasta en energía y transporte, mes a mes.
 * INVENTADO, como las cuentas: el equipo que recoge los datos de verdad todavía
 * no ha entregado nada, y el panel tiene que poder dibujarse mientras tanto.
 *
 * Son datos de **actividad** —kilos de gas, litros, kilovatios hora,
 * kilómetros—, no emisiones. Las emisiones las calcula `lib/` con factores que
 * dicen de dónde salen. Por eso el día que lleguen los datos reales se cambia
 * este archivo y nada más.
 *
 * Están cuadrados con `FINANZAS`: los mismos seis meses, y el consumo sube y
 * baja con la ocupación de cada uno. Cabañas La Pintada gasta cada vez menos
 * porque cada vez recibe a menos gente, no porque ahorre.
 *
 * Hay casos a propósito, para que el cálculo no sea código muerto:
 *
 * - **Posada Isla Drake** está en una isla y no tiene red: su luz sale de una
 *   planta de diésel. Eso es alcance 1, no 2, y su `electricidadKWh` es 0.
 * - **Transporte Valle Alto** y **Lanchas Playa Blanca** queman el combustible
 *   de su propio vehículo: alcance 1, y no un trayecto de alcance 3.
 * - **Cocina de Yolanda**, **Sombreros del Valle** y el **Taller Diablos y
 *   Congos** le compran a proveedores de fuera y van a buscar el insumo en
 *   vehículo ajeno: son los trayectos de alcance 3, y salen de `PROVEEDORES`
 *   con `local: false`.
 * - Los guías y el conjunto casi no gastan nada. Un cero también es un dato, y
 *   la pantalla tiene que saber dibujarlo.
 */

//                mes        glp kg  gasolina L  diésel L  kWh  viajes
type Fila = [string, number, number, number, number, number];

/** El viaje que un emprendimiento repite para traer un insumo, si lo hace. */
type Ruta = { modo: ModoTransporte; kmPorViaje: number; pasajeros: number; motivo: string };

/** Una fila compacta por mes, como en las cuentas, para que seis meses se lean. */
function meses(filas: Fila[], ruta?: Ruta): ActividadMensual[] {
  return filas.map(([mes, glp, gasolina, diesel, kWh, viajes]) => {
    const combustibles: Combustible[] = [];
    if (glp > 0) combustibles.push({ tipo: "glp", kg: glp });
    if (gasolina > 0) combustibles.push({ tipo: "gasolina", litros: gasolina });
    if (diesel > 0) combustibles.push({ tipo: "diesel", litros: diesel });

    return {
      mes,
      combustibles,
      electricidadKWh: kWh,
      transporte:
        ruta && viajes > 0
          ? [{ modo: ruta.modo, km: ruta.kmPorViaje * viajes, pasajeros: ruta.pasajeros, motivo: ruta.motivo }]
          : [],
    };
  });
}

export const ACTIVIDAD: Readonly<Record<string, ActividadMensual[]>> = {
  /* -------------------------- El Valle de Antón ------------------------- */

  //                              mes      glp gas  dsl  kWh viajes
  "transporte-valle-alto": meses([
    ["2026-05", 0, 0, 310, 0, 0],
    ["2026-06", 0, 0, 280, 0, 0],
    ["2026-07", 0, 0, 355, 0, 0],
    ["2026-08", 0, 0, 330, 0, 0],
    ["2026-09", 0, 0, 350, 0, 0],
    ["2026-10", 0, 0, 365, 0, 0],
  ]),
  "senderos-india-dormida": meses([
    ["2026-05", 0, 0, 0, 0, 0],
    ["2026-06", 0, 0, 0, 0, 0],
    ["2026-07", 0, 0, 0, 0, 0],
    ["2026-08", 0, 0, 0, 0, 0],
    ["2026-09", 0, 0, 0, 0, 0],
    ["2026-10", 0, 0, 0, 0, 0],
  ]),
  "fonda-dona-eneida": meses([
    ["2026-05", 41, 0, 0, 210, 0],
    ["2026-06", 37, 0, 0, 195, 0],
    ["2026-07", 46, 0, 0, 230, 0],
    ["2026-08", 43, 0, 0, 220, 0],
    ["2026-09", 48, 0, 0, 240, 0],
    ["2026-10", 50, 0, 0, 250, 0],
  ]),
  "cocina-de-yolanda": meses(
    [
      ["2026-05", 23, 0, 0, 130, 4],
      ["2026-06", 20, 0, 0, 125, 4],
      ["2026-07", 18, 0, 0, 120, 3],
      ["2026-08", 18, 0, 0, 118, 3],
      ["2026-09", 16, 0, 0, 112, 3],
      ["2026-10", 17, 0, 0, 115, 3],
    ],
    { modo: "bus", kmPorViaje: 80, pasajeros: 1, motivo: "Comprar pescado en San Carlos" },
  ),
  "vivero-orquideas-del-crater": meses([
    ["2026-05", 0, 0, 0, 95, 0],
    ["2026-06", 0, 0, 0, 90, 0],
    ["2026-07", 0, 0, 0, 100, 0],
    ["2026-08", 0, 0, 0, 98, 0],
    ["2026-09", 0, 0, 0, 102, 0],
    ["2026-10", 0, 0, 0, 104, 0],
  ]),
  "hospedaje-cerro-gaital": meses([
    ["2026-05", 14, 0, 0, 420, 0],
    ["2026-06", 12, 0, 0, 380, 0],
    ["2026-07", 17, 0, 0, 510, 0],
    ["2026-08", 15, 0, 0, 470, 0],
    ["2026-09", 16, 0, 0, 500, 0],
    ["2026-10", 17, 0, 0, 520, 0],
  ]),
  "cabanas-la-pintada": meses([
    ["2026-05", 9, 0, 0, 260, 0],
    ["2026-06", 9, 0, 0, 270, 0],
    ["2026-07", 8, 0, 0, 230, 0],
    ["2026-08", 7, 0, 0, 200, 0],
    ["2026-09", 6, 0, 0, 170, 0],
    ["2026-10", 5, 0, 0, 150, 0],
  ]),
  "conjunto-flor-del-valle": meses([
    ["2026-05", 0, 0, 0, 28, 0],
    ["2026-06", 0, 0, 0, 22, 0],
    ["2026-07", 0, 0, 0, 34, 0],
    ["2026-08", 0, 0, 0, 30, 0],
    ["2026-09", 0, 0, 0, 33, 0],
    ["2026-10", 0, 0, 0, 34, 0],
  ]),
  "guias-chorro-las-mozas": meses([
    ["2026-05", 0, 0, 0, 0, 0],
    ["2026-06", 0, 0, 0, 0, 0],
    ["2026-07", 0, 0, 0, 0, 0],
    ["2026-08", 0, 0, 0, 0, 0],
    ["2026-09", 0, 0, 0, 0, 0],
    ["2026-10", 0, 0, 0, 0, 0],
  ]),
  "sombreros-del-valle": meses(
    [
      ["2026-05", 0, 0, 0, 35, 1],
      ["2026-06", 0, 0, 0, 33, 1],
      ["2026-07", 0, 0, 0, 38, 2],
      ["2026-08", 0, 0, 0, 36, 1],
      ["2026-09", 0, 0, 0, 38, 1],
      ["2026-10", 0, 0, 0, 39, 1],
    ],
    { modo: "bus", kmPorViaje: 60, pasajeros: 1, motivo: "Traer junco seco de Cabuya" },
  ),

  /* ------------------------------ Portobelo ----------------------------- */

  "guias-de-los-fuertes": meses([
    ["2026-05", 0, 0, 0, 0, 0],
    ["2026-06", 0, 0, 0, 0, 0],
    ["2026-07", 0, 0, 0, 0, 0],
    ["2026-08", 0, 0, 0, 0, 0],
    ["2026-09", 0, 0, 0, 0, 0],
    ["2026-10", 0, 0, 0, 0, 0],
  ]),
  "cocina-congo-la-bahia": meses([
    ["2026-05", 38, 0, 0, 190, 0],
    ["2026-06", 34, 0, 0, 180, 0],
    ["2026-07", 44, 0, 0, 215, 0],
    ["2026-08", 41, 0, 0, 205, 0],
    ["2026-09", 43, 0, 0, 210, 0],
    ["2026-10", 42, 0, 0, 210, 0],
  ]),
  "fonda-el-malecon": meses([
    ["2026-05", 30, 0, 0, 160, 0],
    ["2026-06", 28, 0, 0, 155, 0],
    ["2026-07", 34, 0, 0, 175, 0],
    ["2026-08", 32, 0, 0, 168, 0],
    ["2026-09", 33, 0, 0, 172, 0],
    ["2026-10", 34, 0, 0, 175, 0],
  ]),
  "taller-diablos-y-congos": meses(
    [
      ["2026-05", 0, 0, 0, 45, 1],
      ["2026-06", 0, 0, 0, 42, 1],
      ["2026-07", 0, 0, 0, 50, 2],
      ["2026-08", 0, 0, 0, 47, 1],
      ["2026-09", 0, 0, 0, 49, 2],
      ["2026-10", 0, 0, 0, 50, 1],
    ],
    { modo: "auto", kmPorViaje: 66, pasajeros: 1, motivo: "Comprar madera de balsa en Sabanitas" },
  ),
  "casa-la-aduana": meses([
    ["2026-05", 18, 0, 0, 520, 0],
    ["2026-06", 16, 0, 0, 470, 0],
    ["2026-07", 22, 0, 0, 640, 0],
    ["2026-08", 20, 0, 0, 580, 0],
    ["2026-09", 21, 0, 0, 610, 0],
    ["2026-10", 20, 0, 0, 600, 0],
  ]),
  // En la isla no llega la red: la luz sale de una planta de diésel.
  "posada-isla-drake": meses([
    ["2026-05", 6, 0, 70, 0, 0],
    ["2026-06", 6, 0, 66, 0, 0],
    ["2026-07", 6, 0, 72, 0, 0],
    ["2026-08", 5, 0, 60, 0, 0],
    ["2026-09", 5, 0, 58, 0, 0],
    ["2026-10", 5, 0, 55, 0, 0],
  ]),
  "congos-reyes-de-la-bahia": meses([
    ["2026-05", 0, 0, 0, 30, 0],
    ["2026-06", 0, 0, 0, 25, 0],
    ["2026-07", 0, 0, 0, 38, 0],
    ["2026-08", 0, 0, 0, 33, 0],
    ["2026-09", 0, 0, 0, 36, 0],
    ["2026-10", 0, 0, 0, 35, 0],
  ]),
  "lanchas-playa-blanca": meses([
    ["2026-05", 0, 380, 0, 0, 0],
    ["2026-06", 0, 330, 0, 0, 0],
    ["2026-07", 0, 470, 0, 0, 0],
    ["2026-08", 0, 420, 0, 0, 0],
    ["2026-09", 0, 460, 0, 0, 0],
    ["2026-10", 0, 450, 0, 0, 0],
  ]),
};

export function actividadDe(slug: string): ActividadMensual[] {
  return ACTIVIDAD[slug] ?? [];
}

/**
 * La actividad tiene que cubrir a los mismos emprendimientos y los mismos meses
 * que las cuentas. Si no, la pantalla dibujaría un mes con cuentas y sin
 * emisiones, o al revés, y nadie sabría cuál de las dos está mal.
 *
 * Corre al importar, como `validar()` en las experiencias, y para `pnpm build`
 * con un mensaje por error. Aquí no hay tests: el build es la red.
 */
function comprobar() {
  const errores: string[] = [];
  const conCuentas = Object.keys(FINANZAS);
  const conActividad = Object.keys(ACTIVIDAD);

  for (const slug of conCuentas.filter((s) => !conActividad.includes(s)))
    errores.push(`${slug} tiene cuentas pero no actividad ambiental`);
  for (const slug of conActividad.filter((s) => !conCuentas.includes(s)))
    errores.push(`${slug} tiene actividad ambiental pero no cuentas: ¿el slug está bien escrito?`);

  for (const slug of conActividad.filter((s) => conCuentas.includes(s))) {
    const esperados = FINANZAS[slug].map((m) => m.mes).join(", ");
    const tiene = ACTIVIDAD[slug].map((m) => m.mes).join(", ");
    if (esperados !== tiene) errores.push(`${slug}: las cuentas son de ${esperados} y la actividad de ${tiene}`);

    for (const m of ACTIVIDAD[slug]) {
      const negativos = [
        m.electricidadKWh,
        ...m.combustibles.map((c) => ("kg" in c ? c.kg : c.litros)),
        ...m.transporte.flatMap((t) => [t.km, t.pasajeros]),
      ].some((v) => v < 0);
      if (negativos) errores.push(`${slug}, ${m.mes}: hay una cantidad negativa`);
    }
  }

  if (errores.length > 0) {
    throw new Error(`La actividad ambiental no cuadra con las cuentas:\n- ${errores.join("\n- ")}`);
  }
}

comprobar();
