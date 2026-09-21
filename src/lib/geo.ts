import type { Coordenadas } from "@/data/tipos";

/**
 * Geometría para el planificador de rutas. Aritmética pura y cero dependencias:
 * lo que hace falta aquí son cincuenta líneas de trigonometría, no una librería
 * de GIS en el teléfono de alguien que paga los datos por megabyte.
 *
 * El tipo del punto nace en `data/tipos.ts` y se importa como tipo, que se borra
 * al compilar. Las dependencias apuntan hacia abajo y este archivo no es una
 * excepción.
 */

export type Punto = Coordenadas;

const RADIO_TIERRA_KM = 6371;
const RAD = Math.PI / 180;

/** Distancia de gran círculo, en línea recta sobre la esfera. */
export function haversineKm(a: Punto, b: Punto): number {
  const dLat = (b.lat - a.lat) * RAD;
  const dLng = (b.lng - a.lng) * RAD;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * Factor de rodeo: cuánto más larga es la ruta real que la línea recta.
 *
 * El índice ronda 1.2–1.3 en llano cuadriculado, y aquí no hay llano
 * cuadriculado: son carreteras de montaña en Santa Fe, Boquete y Volcán, y
 * costa con entrantes en Portobelo. 1.35 es un medio conservador — vale más que
 * la estimación se quede corta de optimista que al revés, porque quien confía en
 * un número bonito es el que se queda sin luz a mitad de camino.
 *
 * En las zonas de isla —Guna Yala, Bastimentos, Taboga— se anda en lancha, que
 * va más recto que una carretera pero más lento por kilómetro. Los dos errores
 * van en direcciones opuestas y el 1.35 sigue sirviendo. Un factor por zona
 * sería precisión fingida sobre coordenadas que el propio archivo de datos
 * admite haber inventado.
 */
export const SINUOSIDAD = 1.35;

/** La distancia que se le enseña al visitante, ya con el rodeo dentro. */
export function distanciaKm(a: Punto, b: Punto): number {
  return haversineKm(a, b) * SINUOSIDAD;
}

/**
 * El centro de un puñado de puntos. Con las distancias de un pueblo la media
 * aritmética y el centroide esférico se diferencian en metros, y los metros no
 * importan cuando el rodeo ya mete un 35 %.
 */
export function centro(puntos: readonly Punto[]): Punto {
  if (puntos.length === 0) throw new Error("centro() necesita al menos un punto");
  const suma = puntos.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), {
    lat: 0,
    lng: 0,
  });
  return { lat: suma.lat / puntos.length, lng: suma.lng / puntos.length };
}

export type Caja = { min: Punto; max: Punto };

export function caja(puntos: readonly Punto[]): Caja {
  const lats = puntos.map((p) => p.lat);
  const lngs = puntos.map((p) => p.lng);
  return {
    min: { lat: Math.min(...lats), lng: Math.min(...lngs) },
    max: { lat: Math.max(...lats), lng: Math.max(...lngs) },
  };
}

/**
 * Proyección equirectangular para el esquema del recorrido.
 *
 * La longitud se escala por `cos(lat)` porque un grado de longitud mide menos
 * cuanto más lejos del ecuador; sin eso, un pueblo se vería estirado a lo ancho.
 * Panamá está a ~9°, donde el factor es 0.99 y casi da igual — se hace bien de
 * todos modos, porque la alternativa es un número mágico disfrazado de decisión.
 *
 * Y una advertencia que va con la función: esto sirve para dibujar el ORDEN de
 * las paradas, no para orientarse. El esquema que la usa lo dice en su pie.
 */
export function proyectar(p: Punto, c: Caja, ancho: number, alto: number): { x: number; y: number } {
  const escalaLng = Math.cos(((c.min.lat + c.max.lat) / 2) * RAD);
  const anchoGrados = (c.max.lng - c.min.lng) * escalaLng;
  const altoGrados = c.max.lat - c.min.lat;

  // Un solo punto, o todos en fila: sin extensión no hay escala. Se centra el eje.
  const escala =
    anchoGrados === 0 && altoGrados === 0
      ? 0
      : Math.min(anchoGrados === 0 ? Infinity : ancho / anchoGrados, altoGrados === 0 ? Infinity : alto / altoGrados);

  const x = anchoGrados === 0 ? ancho / 2 : (p.lng - c.min.lng) * escalaLng * escala + (ancho - anchoGrados * escala) / 2;
  // El eje Y del SVG crece hacia abajo y la latitud hacia arriba: se invierte.
  const y = altoGrados === 0 ? alto / 2 : alto - ((p.lat - c.min.lat) * escala + (alto - altoGrados * escala) / 2);

  return { x, y };
}
