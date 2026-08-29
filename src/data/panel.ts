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
