import type { CategoriaId, Dia, Negocio, ZonaId } from "@/data/tipos";
import type { Apertura } from "@/lib/formato";
import { apertura } from "@/lib/formato";
import type { Punto } from "@/lib/geo";
import { centro, distanciaKm } from "@/lib/geo";

/**
 * El planificador: qué cabe en el tiempo que alguien tiene, en qué orden, y qué
 * va a estar abierto cuando pase por ahí.
 *
 * Se llama `itinerario` y no `ruta` porque en este proyecto «ruta» ya significa
 * ruta de Next —`_rutas.ts`, `_rutas-panel.tsx`, el tipo `RutaNav`— y un
 * `lib/ruta.ts` al lado de esos sería una colisión de vocabulario.
 *
 * Todo es aritmética. No hay librería de grafos, no hay API de direcciones y no
 * va a haberlas: con doce paradas como máximo, el orden óptimo se busca a mano
 * en menos operaciones de las que cuesta arrancar un paquete de npm.
 *
 * `ahora` entra por parámetro y aquí dentro no se llama a `new Date()` ni una
 * vez. Es la misma regla de `formato.ts`, por la misma razón: una página
 * estática y una petición viva necesitan verdades distintas, y esa decisión no
 * le toca a quien calcula.
 */

export type Ritmo = "suave" | "normal" | "intenso";

/** Lo que el planificador necesita saber, ya validado. Lo arma la pantalla. */
export type PlanPedido = {
  zona: ZonaId;
  dias: 1 | 2 | 3;
  /** Vacío significa «todas». No existe el estado «ninguna». */
  intereses: readonly CategoriaId[];
  ritmo: Ritmo;
  /** "HH:MM" — a qué hora arranca cada día. */
  desde: string;
  diaInicio: Dia;
  /** Si el día lo fijó la URL (`?dia=sab`) o se resolvió contra el reloj. */
  congelado: boolean;
  /** Slug del hospedaje que hace de base, si eligió uno. */
  base?: string;
};

export type RazonSuelta = "sin-punto" | "cierra-ese-dia" | "cerrado-a-esa-hora" | "no-cupo";

export type Parada = {
  negocio: Negocio;
  /** Minutos desde medianoche. */
  llegada: number;
  salida: number;
  /** Kilómetros desde la parada anterior, ya con el rodeo dentro. */
  desdeAnterior: number;
  minutosDeViaje: number;
  apertura: Apertura;
};

export type DiaItinerario = {
  indice: number;
  dia: Dia;
  paradas: Parada[];
  kmTotal: number;
  arranca: number;
  termina: number;
};

export type Suelta = { negocio: Negocio; razon: RazonSuelta };

export type Itinerario = {
  dias: DiaItinerario[];
  sueltos: Suelta[];
  base?: Negocio;
  origen?: Punto;
  kmTotal: number;
  minutosTotal: number;
  /** Cuántos negocios de los que interesaban ni siquiera tienen punto. */
  sinPunto: number;
};

/**
 * Cuánto dura una parada, por categoría.
 *
 * Son convenciones del planificador, no mediciones: nadie ha cronometrado
 * treinta talleres. Están aquí y no en `data/` justamente para que se lean como
 * lo que son — `data/` guarda hechos sobre negocios, y «cuánto se tarda en una
 * fonda» no es un hecho sobre ninguna fonda en particular. Si el supuesto
 * cambia, se toca este archivo y ningún dato.
 */
const MINUTOS_PARADA: Record<CategoriaId, number> = {
  artesania: 40, // se entra, se conversa, se compra
  comida: 60, // el almuerzo corriente
  experiencias: 150, // la caminata o la salida en lancha: la parada cara del día
  campo: 45, // finca de café: se camina y se prueba
  transporte: 15, // no es una parada, es un trámite: se coordina y se sigue
  hospedaje: 0, // ancla, no parada — ver abajo
};

/**
 * `jornada` es cuánto dura el día en minutos; `factor` estira o encoge las
 * paradas; `colchon` son los minutos de aparcar, encontrar la casa y saludar,
 * que van por tramo y no por kilómetro porque no dependen de la distancia.
 */
const RITMOS = {
  suave: { jornada: 360, factor: 1.35, colchon: 20 },
  normal: { jornada: 480, factor: 1.0, colchon: 10 },
  intenso: { jornada: 600, factor: 0.85, colchon: 5 },
} as const;

/**
 * Velocidad efectiva en carretera secundaria panameña, ya contando baches,
 * curvas y parar a preguntar. El piso de cinco minutos manda por debajo de dos
 * kilómetros, que es casi todo lo que pasa dentro de un pueblo: nadie llega a
 * ningún lado en cuarenta segundos, por cerca que esté.
 */
const VELOCIDAD_KMH = 25;
const MINUTOS_MINIMOS_VIAJE = 5;

export function minutosDeViaje(km: number): number {
  return Math.max(MINUTOS_MINIMOS_VIAJE, Math.round((km / VELOCIDAD_KMH) * 60));
}

/**
 * El tope. Más de doce paradas no es un itinerario, es una lista — y además el
 * 2-opt deja de ser gratis. Lo que no entra se muestra aparte, nunca se esconde.
 */
const MAX_PARADAS = 12;
const MAX_PASADAS_2OPT = 12;

const POR_INDICE: readonly Dia[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

/** Una parada que se está evaluando, antes de decidir si entra. */
type Candidata = {
  /** Su posición en la lista de pendientes, para sacarla sin volver a buscar. */
  i: number;
  negocio: Negocio;
  llegada: number;
  dura: number;
  kmTramo: number;
  viaje: number;
  apertura: Apertura;
};

function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** 510 -> "08:30". Para dárselo a `hora()` de formato.ts sin tocar formato.ts. */
export function enHHMM(minutos: number): string {
  const m = ((minutos % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** La primera fecha, desde `ahora`, que caiga en el día de la semana pedido. */
function fechaBase(ahora: Date, dia: Dia): Date {
  const adelanto = (POR_INDICE.indexOf(dia) - ahora.getDay() + 7) % 7;
  const d = new Date(ahora);
  d.setDate(d.getDate() + adelanto);
  return d;
}

/**
 * El instante concreto en que tocaría llegar. `apertura()` solo lee `getDay`,
 * `getHours` y `getMinutes`, así que con esto basta para preguntarle si el
 * negocio está abierto justo entonces.
 */
function enMomento(base: Date, offsetDias: number, minutos: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDias);
  d.setHours(Math.floor(minutos / 60), minutos % 60, 0, 0);
  return d;
}

function conPrecio(n: Negocio): number {
  return n.productos.filter((p) => p.precio !== undefined).length;
}

/**
 * Cuando hay más candidatas que sitio, cuáles se quedan.
 *
 * El desempate final por `slug` no es cosmético: garantiza que la misma URL
 * produzca siempre el mismo plan. Eso es lo que hace que precachear una ruta
 * sirva de algo y que compartir un enlace signifique lo que parece significar.
 */
function porInteres(origen: Punto) {
  return (a: Negocio, b: Negocio): number => {
    const verificado = (n: Negocio) => (n.estadoDato === "verificado" ? 0 : 1);
    if (verificado(a) !== verificado(b)) return verificado(a) - verificado(b);
    if (conPrecio(a) !== conPrecio(b)) return conPrecio(b) - conPrecio(a);
    if (a.fotos !== b.fotos) return b.fotos - a.fotos;
    const da = distanciaKm(origen, a.coordenadas!);
    const db = distanciaKm(origen, b.coordenadas!);
    if (da !== db) return da - db;
    return a.slug.localeCompare(b.slug);
  };
}

/** Vecino más cercano desde el origen. Punto de partida del 2-opt, no destino. */
function vecinoCercano(origen: Punto, puntos: readonly Punto[]): number[] {
  const quedan = puntos.map((_, i) => i);
  const orden: number[] = [];
  let pos = origen;

  while (quedan.length > 0) {
    let mejor = 0;
    let mejorKm = Infinity;
    for (let i = 0; i < quedan.length; i++) {
      const km = distanciaKm(pos, puntos[quedan[i]]);
      if (km < mejorKm) {
        mejorKm = km;
        mejor = i;
      }
    }
    const [elegido] = quedan.splice(mejor, 1);
    orden.push(elegido);
    pos = puntos[elegido];
  }
  return orden;
}

function largo(orden: readonly number[], puntos: readonly Punto[], origen: Punto): number {
  let total = 0;
  let pos = origen;
  for (const i of orden) {
    total += distanciaKm(pos, puntos[i]);
    pos = puntos[i];
  }
  return total;
}

/**
 * 2-opt: deshace los cruces que deja el vecino cercano invirtiendo tramos.
 *
 * Con doce paradas cada pasada son ~144 comparaciones, y sale en cuanto una
 * pasada no mejora nada. El peor caso son unas mil setecientas operaciones
 * aritméticas por petición: invisible, y cero librería.
 */
function dosOpt(inicial: readonly number[], puntos: readonly Punto[], origen: Punto): number[] {
  let orden = [...inicial];
  let mejorLargo = largo(orden, puntos, origen);

  for (let pasada = 0; pasada < MAX_PASADAS_2OPT; pasada++) {
    let mejoro = false;
    for (let i = 0; i < orden.length - 1; i++) {
      for (let j = i + 1; j < orden.length; j++) {
        const prueba = [...orden.slice(0, i), ...orden.slice(i, j + 1).reverse(), ...orden.slice(j + 1)];
        const l = largo(prueba, puntos, origen);
        if (l < mejorLargo - 1e-9) {
          orden = prueba;
          mejorLargo = l;
          mejoro = true;
        }
      }
    }
    if (!mejoro) break;
  }
  return orden;
}

export function planear(pedido: PlanPedido, negocios: readonly Negocio[], ahora: Date): Itinerario {
  const r = RITMOS[pedido.ritmo];
  const desdeMin = aMinutos(pedido.desde);
  const base = pedido.base ? negocios.find((n) => n.slug === pedido.base) : undefined;
  const sueltos: Suelta[] = [];

  const interesa = (n: Negocio) =>
    pedido.intereses.length === 0 || pedido.intereses.includes(n.categoria);

  // El hospedaje es ancla, no parada: se sale de él y se vuelve a él. Nunca
  // entra en el orden, por mucho que el visitante lo marque como interés.
  const candidatas = negocios.filter((n) => interesa(n) && n.categoria !== "hospedaje");

  const conPunto = candidatas.filter((n) => n.coordenadas);
  for (const n of candidatas) {
    if (!n.coordenadas) sueltos.push({ negocio: n, razon: "sin-punto" });
  }

  if (conPunto.length === 0) {
    return {
      dias: [],
      sueltos,
      base,
      kmTotal: 0,
      minutosTotal: 0,
      sinPunto: candidatas.length - conPunto.length,
    };
  }

  /*
   * Sin base elegida, el origen es el centroide de los negocios que sí tienen
   * punto. Es honesto: no nos inventamos un centro del pueblo que nadie ha
   * medido, lo derivamos de lo que existe.
   */
  const origen: Punto = base?.coordenadas ?? centro(conPunto.map((n) => n.coordenadas!));

  const elegidas = [...conPunto].sort(porInteres(origen));
  for (const n of elegidas.slice(MAX_PARADAS)) sueltos.push({ negocio: n, razon: "no-cupo" });

  const paraOrdenar = elegidas.slice(0, MAX_PARADAS);
  const puntos = paraOrdenar.map((n) => n.coordenadas!);
  const orden = dosOpt(vecinoCercano(origen, puntos), puntos, origen);

  /*
   * Orden primero, corte después. Se consideró agrupar por cercanía antes de
   * ordenar (k-means a `dias` grupos) y se descartó a propósito: dentro de un
   * pueblo todas las paradas caben en unos diez kilómetros, y la ganancia
   * geográfica de agrupar está por debajo del error de medir en línea recta.
   * Sería más código para simular una precisión que no tenemos.
   */
  const restantes = orden.map((i) => paraOrdenar[i]);
  const fallo = new Map<string, RazonSuelta>();
  const fecha = fechaBase(ahora, pedido.diaInicio);
  const dias: DiaItinerario[] = [];

  for (let d = 0; d < pedido.dias; d++) {
    let cursor = desdeMin;
    let pos = origen;
    let km = 0;
    const paradas: Parada[] = [];

    /*
     * Cada vuelta elige UNA parada y la saca de la lista.
     *
     * Se prefiere siempre la primera que esté abierta al llegar, para no romper
     * el orden geográfico que costó el 2-opt. Solo si ninguna lo está se acepta
     * esperar a que abra alguna — y entonces se toma la que abra antes, porque
     * esperar tres horas frente a una puerta cerrada es el plan que nadie pidió.
     */
    for (;;) {
      let abierta: Candidata | null = null;
      let esperando: Candidata | null = null;

      for (let i = 0; i < restantes.length; i++) {
        const n = restantes[i];
        const punto = n.coordenadas!;
        const kmTramo = distanciaKm(pos, punto);
        const viaje = minutosDeViaje(kmTramo);
        const llegada = cursor + viaje + r.colchon;
        const dura = Math.round(MINUTOS_PARADA[n.categoria] * r.factor);
        const tope = desdeMin + r.jornada;

        if (llegada + dura > tope) {
          fallo.set(n.slug, "no-cupo");
          continue;
        }

        const momento = enMomento(fecha, d, llegada);
        const ap = apertura(n.horario, momento);

        // `sinConfirmar` entra igual, marcada. No es lo mismo que cerrado, y
        // dejar fuera a alguien por no haber confirmado su domingo sería
        // castigarlo desde el producto.
        if (ap.estado !== "cerrado") {
          abierta = { i, negocio: n, llegada, dura, kmTramo, viaje, apertura: ap };
          break;
        }

        const valorDia = n.horario[POR_INDICE[momento.getDay()]];

        // ¿Abre más tarde ese mismo día? Entonces no está descartada: hay que
        // llegar después. Descartarla sería decirle al visitante que no puede
        // comer ahí cuando lo único que pasa es que la cocina abre a las once.
        if (typeof valorDia === "object") {
          const abre = aMinutos(valorDia.desde);
          if (abre > llegada && abre + dura <= tope) {
            if (!esperando || abre < esperando.llegada) {
              esperando = {
                i,
                negocio: n,
                llegada: abre,
                dura,
                kmTramo,
                viaje,
                apertura: apertura(n.horario, enMomento(fecha, d, abre)),
              };
            }
            continue;
          }
        }

        // Se distingue «ese día no abre» de «a esa hora ya cerró»: las dos
        // tienen salidas distintas, y una de ellas es cambiar el día.
        fallo.set(n.slug, valorDia === "cerrado" ? "cierra-ese-dia" : "cerrado-a-esa-hora");
      }

      const elegida = abierta ?? esperando;
      if (!elegida) break;

      paradas.push({
        negocio: elegida.negocio,
        llegada: elegida.llegada,
        salida: elegida.llegada + elegida.dura,
        desdeAnterior: elegida.kmTramo,
        minutosDeViaje: elegida.viaje,
        apertura: elegida.apertura,
      });
      km += elegida.kmTramo;
      cursor = elegida.llegada + elegida.dura;
      pos = elegida.negocio.coordenadas!;
      fallo.delete(elegida.negocio.slug);
      restantes.splice(elegida.i, 1);
    }

    // La vuelta a la base suma kilómetros pero no horario: nadie planifica a
    // qué hora llega a dormir.
    if (base?.coordenadas && paradas.length > 0) km += distanciaKm(pos, base.coordenadas);

    if (paradas.length > 0) {
      dias.push({
        indice: d,
        dia: POR_INDICE[enMomento(fecha, d, desdeMin).getDay()],
        paradas,
        kmTotal: km,
        arranca: paradas[0].llegada,
        termina: paradas[paradas.length - 1].salida,
      });
    }
  }

  for (const n of restantes) sueltos.push({ negocio: n, razon: fallo.get(n.slug) ?? "no-cupo" });

  return {
    dias,
    sueltos,
    base,
    origen,
    kmTotal: dias.reduce((s, d) => s + d.kmTotal, 0),
    minutosTotal: dias.reduce((s, d) => s + (d.termina - d.arranca), 0),
    sinPunto: candidatas.length - conPunto.length,
  };
}

/** Cuántas paradas tiene el plan entero. Lo piden el título y el esquema. */
export function cuantasParadas(it: Itinerario): number {
  return it.dias.reduce((s, d) => s + d.paradas.length, 0);
}

/** Las paradas de todos los días, en orden. Para el esquema y el enlace de mapas. */
export function todasLasParadas(it: Itinerario): Parada[] {
  return it.dias.flatMap((d) => d.paradas);
}
