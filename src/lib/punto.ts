import type { Coordenadas } from "@/data/tipos";

/**
 * Sacar un punto de lo que sea que el dueño haya pegado en el campo.
 *
 * Módulo puro y sin directiva: lo usa un componente cliente, pero no tiene por
 * qué ser cliente él mismo, y separarlo deja el regex donde se puede leer sin
 * el ruido del estado de un formulario.
 *
 * El supuesto de partida es que quien usa esto tiene 55 años, un Moto G Power y
 * nunca ha oído la palabra "latitud". Por eso se acepta de todo: la URL larga
 * de Google Maps, la corta que no sirve, y dos números separados por una coma.
 */

const PATRONES: readonly RegExp[] = [
  // El punto del LUGAR. Google lo mete así en la URL larga, y es el preciso.
  /!3d(-?\d{1,3}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/,
  // El `@` es dónde estaba la CÁMARA cuando se copió la URL. Puede errar cien
  // metros, así que va después: solo se usa si no hubo `!3d`.
  /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
  // Los parámetros de consulta, con la coma codificada o sin codificar.
  /[?&](?:q|query|daddr|saddr|ll|center|destination)=(-?\d{1,3}\.\d+)%2C\s*(-?\d{1,3}\.\d+)/i,
  /[?&](?:q|query|daddr|saddr|ll|center|destination)=(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/i,
  // Y pegar "8.5128, -81.0766" a secas, que es lo que hace quien ya sabe.
  /^\s*(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/,
];

/**
 * Los enlaces cortos no traen el punto dentro: hay que pedírselo al servidor de
 * Google, y eso no se puede hacer desde aquí. CORS lo bloquea, y aunque no lo
 * bloqueara, mandarle a un tercero la intención de geolocalizar a este dueño
 * desde un MVP sin backend no es una decisión que nos toque tomar. Se detectan
 * para poder decir qué hacer en vez de un «no se pudo» a secas.
 */
const CORTO = /^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)\//i;

export function esEnlaceCorto(texto: string): boolean {
  return CORTO.test(texto.trim());
}

export function puntoDeEnlace(texto: string): Coordenadas | null {
  const t = texto.trim();
  if (!t) return null;

  for (const patron of PATRONES) {
    const m = t.match(patron);
    if (!m) continue;
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
}

/**
 * Panamá con margen generoso: de Punta Burica a Puerto Obaldía. No es una
 * validación de frontera, es una red para cazar el error evidente — el enlace
 * que en realidad era de Costa Rica, o el cero de más al teclear.
 */
const LAT = { min: 7.0, max: 9.8 };
const LNG = { min: -83.2, max: -77.0 };

export function enPanama(p: Coordenadas): boolean {
  return p.lat >= LAT.min && p.lat <= LAT.max && p.lng >= LNG.min && p.lng <= LNG.max;
}

/**
 * El fallo que de verdad comete la gente: teclear la longitud en el campo de la
 * latitud. Se detecta porque al revés sí caen dentro de Panamá, y entonces se
 * ofrece cambiarlos en vez de decirle al dueño que se equivocó y dejarlo ahí.
 */
export function pareceInvertido(p: Coordenadas): boolean {
  return !enPanama(p) && enPanama({ lat: p.lng, lng: p.lat });
}

/** Seis decimales: ~11 cm. Más allá es ruido del GPS con aire de precisión. */
export function redondear(p: Coordenadas): Coordenadas {
  return { lat: Number(p.lat.toFixed(6)), lng: Number(p.lng.toFixed(6)) };
}
