import { negocioPorSlug } from "./index";
import type { Negocio } from "./tipos";

/**
 * La sesión del dueño, simulada.
 *
 * No hay backend ni cuentas: el dashboard del MVP muestra siempre el mismo
 * negocio. Cuando exista autenticación, esto se reemplaza por la sesión real y
 * ninguna pantalla del dashboard tiene que cambiar — todas piden el negocio
 * aquí.
 */
export const SLUG_DEMO = "artesanias-delia-quintero";

export function negocioDelDueno(): Negocio {
  const n = negocioPorSlug(SLUG_DEMO);
  if (!n) throw new Error(`El negocio de demostración no existe: ${SLUG_DEMO}`);
  return n;
}

/**
 * Cifras de muestra. INVENTADAS, como todo lo demás del MVP — aquí no hay
 * analítica de ningún tipo.
 *
 * Se dejan en el modelo de datos y no incrustadas en la pantalla justamente
 * para que se vea que son datos y no una promesa: el día que haya medición de
 * verdad, se cambia esta constante por su origen y la pantalla no se entera.
 */
export type Metricas = {
  visitasFicha: number;
  contactosWhatsapp: number;
  periodo: string;
};

export const METRICAS_DEMO: Metricas = {
  visitasFicha: 148,
  contactosWhatsapp: 12,
  periodo: "este mes",
};

/**
 * La cola de subida de fotos del dueño.
 *
 * Vive aquí y no en `Negocio` porque no es dato público: un visitante nunca ve
 * una cola de subida, solo el dueño dentro de su sesión. Cuando exista un
 * servicio de subida real, esta constante se cambia por su origen y la pantalla
 * no se entera.
 *
 * Los tres estados están representados a propósito. En un teléfono con señal de
 * montaña, «subiendo» y «falló» no son casos raros: son el día normal.
 */
export type EstadoFoto = "lista" | "subiendo" | "fallida";

export type Foto = {
  id: string;
  /** Qué se ve en ella. Es también el texto alternativo. */
  etiqueta: string;
  estado: EstadoFoto;
  /** 0–100, solo mientras sube. */
  progreso?: number;
  peso?: string;
  archivo?: string;
};

export const COLA_DEMO: readonly Foto[] = [
  { id: "f1", etiqueta: "Delia tejiendo en el corredor", estado: "lista" },
  { id: "f2", etiqueta: "El taller por dentro", estado: "lista" },
  { id: "f3", etiqueta: "Sombreros terminados", estado: "lista" },
  {
    id: "f4",
    etiqueta: "Sombrero de once vueltas",
    estado: "subiendo",
    progreso: 38,
    peso: "2,4 MB",
    archivo: "sombrero-11-vueltas.jpg",
  },
  {
    id: "f5",
    etiqueta: "Batea de totuma",
    estado: "fallida",
    peso: "1,8 MB",
    archivo: "batea-totuma.jpg",
  },
];

/**
 * El WhatsApp de soporte de Sendero. Inventado, como todo lo demás del MVP.
 *
 * Vive aquí y no incrustado en el menú porque el día que exista un número real
 * se cambia esta constante y ninguna pantalla se entera.
 */
export const SOPORTE_WHATSAPP = "50761234567";

/**
 * Las cifras del modo experto. Inventadas, igual que `METRICAS_DEMO`, y
 * cuadradas entre sí a propósito: la serie diaria suma las mismas 148 visitas
 * que los orígenes, que las franjas horarias y que los productos. Un panel
 * cuyas cifras no cuadran entre pantallas enseña a desconfiar de todas.
 *
 * `METRICAS_DEMO` se queda como está y no se toca: es lo que lee el modo
 * guiado, que dice dos números en una frase y no necesita nada de esto.
 *
 * El día que haya medición de verdad, se cambia esta constante por su origen y
 * las pantallas no se enteran.
 */
export type SerieDiaria = readonly number[];

export type Origen = { etiqueta: string; visitas: number };

export type FranjaHoraria = {
  /** "12–15". Tres horas, que es lo que dura una decisión de visitar algo. */
  franja: string;
  /** Siete números, de lunes a domingo. */
  porDia: readonly number[];
};

export type MetricaProducto = { nombre: string; vistas: number; contactos: number };

export type MetricasExpertas = {
  periodo: string;
  /** Una entrada por día del periodo. */
  visitas: SerieDiaria;
  contactos: SerieDiaria;
  llamadas: SerieDiaria;
  /** El mismo recuento en el periodo anterior, para el delta. */
  anterior: { visitas: number; contactos: number; llamadas: number };
  origenes: readonly Origen[];
  franjas: readonly FranjaHoraria[];
  productos: readonly MetricaProducto[];
};

export const METRICAS_EXPERTAS: MetricasExpertas = {
  periodo: "Del 1 al 30 de agosto",
  visitas: [
    3, 4, 2, 5, 6, 4, 7, 3, 5, 4, 6, 8, 5, 4, 3, 6, 11, 7, 4, 5, 3, 6, 4, 5, 7, 4, 3, 5, 6, 3,
  ],
  contactos: [
    0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 2, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0,
  ],
  llamadas: [
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  ],
  anterior: { visitas: 120, contactos: 8, llamadas: 4 },
  origenes: [
    { etiqueta: "Buscando en Sendero", visitas: 89 },
    { etiqueta: "Desde la zona · Santa Fe", visitas: 34 },
    { etiqueta: "Desde Artesanía", visitas: 16 },
    { etiqueta: "Enlace directo", visitas: 9 },
  ],
  franjas: [
    { franja: "6–9", porDia: [1, 2, 1, 2, 2, 4, 4] },
    { franja: "9–12", porDia: [3, 4, 3, 4, 5, 8, 5] },
    { franja: "12–15", porDia: [4, 4, 3, 5, 6, 11, 7] },
    { franja: "15–18", porDia: [3, 3, 4, 4, 5, 9, 6] },
    { franja: "18–21", porDia: [2, 2, 3, 3, 4, 7, 5] },
  ],
  productos: [
    { nombre: "Sombrero pintao, 11 vueltas", vistas: 96, contactos: 9 },
    { nombre: "Hamaca de pita", vistas: 31, contactos: 2 },
    { nombre: "Batea de totuma tallada", vistas: 21, contactos: 1 },
  ],
};

/** Suma de una serie. Las cifras del panel salen de los datos, no a mano. */
export function total(serie: SerieDiaria): number {
  return serie.reduce((a, b) => a + b, 0);
}
