import type { Dia, Negocio, ZonaId } from "@/data";
import type { PlanPedido, Ritmo } from "@/lib/itinerario";

/**
 * De la URL al pedido, y del pedido de vuelta a la URL.
 *
 * El estado del plan vive entero en la dirección. No hay formulario con estado,
 * no hay JavaScript y no hay sesión: la misma URL da siempre el mismo
 * itinerario, hoy y dentro de un mes. Eso es lo que hace que guardarla sin red
 * y compartirla por WhatsApp signifiquen lo que parecen significar.
 *
 * El precio, anotado igual que se anotó el de la cookie del panel: leer
 * `searchParams` saca esta ruta del render estático. Es la segunda del portal
 * después de `/buscar`. Sin backend detrás, son milisegundos.
 */

/** El estado del plan ya limpio, listo para volver a la URL. Todo string. */
export type ParamsRuta = {
  dias?: string;
  paradas?: string;
  ritmo?: string;
  desde?: string;
  base?: string;
  dia?: string;
};

/**
 * Lo que llega crudo. `paradas` puede venir repetida —es lo que manda un
 * formulario GET con varias casillas del mismo nombre— y `intereses` es la
 * clave de antes: los enlaces y las rutas guardadas que la llevan siguen
 * sirviendo, convertidas en una selección por categoría.
 */
export type ParamsCrudos = Omit<ParamsRuta, "paradas"> & {
  paradas?: string | string[];
  intereses?: string;
};

export const DIAS_VALIDOS: readonly Dia[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
const RITMOS: readonly Ritmo[] = ["suave", "normal", "intenso"];
const POR_INDICE: readonly Dia[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

export const DESDE_POR_DEFECTO = "08:00";
const DESDE_MIN = 5 * 60;
const DESDE_MAX = 14 * 60;

/** Las horas que se ofrecen en el selector. Nadie arranca una ruta a las 3 a.m. */
export const HORAS_INICIO: readonly string[] = Array.from({ length: DESDE_MAX / 60 - DESDE_MIN / 60 + 1 }, (_, i) =>
  `${String(DESDE_MIN / 60 + i).padStart(2, "0")}:00`,
);

function leerDias(v: string | undefined): 1 | 2 | 3 {
  // Tope de tres a propósito: un itinerario de cuatro días en un pueblo de
  // cuatro negocios no es un plan, es una mentira con formato de plan.
  const n = Number(v);
  return n === 2 || n === 3 ? n : 1;
}

/**
 * Se filtra contra los negocios reales de la zona, se deduplica y **se reordena
 * al orden canónico de la zona**. Lo último no es cosmético: marcar `a,b` o
 * `b,a` tiene que producir la misma cadena, o el service worker acaba guardando
 * dos entradas de caché para el mismo plan y compartir el enlace deja de ser
 * exacto. Los hospedajes no entran: son la base, no una parada.
 */
function leerParadas(v: string | string[] | undefined, negocios: readonly Negocio[]): string[] {
  if (!v) return [];
  const pedidos = new Set((Array.isArray(v) ? v : [v]).flatMap((x) => x.split(",")));
  return negocios.filter((n) => n.categoria !== "hospedaje" && pedidos.has(n.slug)).map((n) => n.slug);
}

/** `?intereses=comida,artesania`, de antes de poder elegir: todos los de esas categorías. */
function desdeIntereses(v: string | undefined, negocios: readonly Negocio[]): string[] {
  if (!v) return [];
  const categorias = new Set(v.split(","));
  return negocios.filter((n) => n.categoria !== "hospedaje" && categorias.has(n.categoria)).map((n) => n.slug);
}

function leerDesde(v: string | undefined): string {
  const m = v?.match(/^(\d{1,2}):([0-5]\d)$/);
  if (!m) return DESDE_POR_DEFECTO;
  const minutos = Number(m[1]) * 60 + Number(m[2]);
  if (minutos < DESDE_MIN || minutos > DESDE_MAX) return DESDE_POR_DEFECTO;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

/**
 * Lee la URL y devuelve algo en lo que ya se puede confiar.
 *
 * La regla es descartar, nunca fallar — el mismo criterio de `/buscar`. Una URL
 * con basura enseña el plan por defecto; no enseña un error, porque un error no
 * le sirve de nada a quien llegó por un enlace que alguien le pasó mal.
 */
export function leerPedido(
  zona: ZonaId,
  p: ParamsCrudos,
  negociosDeLaZona: readonly Negocio[],
  ahora: Date,
): PlanPedido {
  const diaPedido = DIAS_VALIDOS.find((d) => d === p.dia);

  // Un hospedaje de otro pueblo como base es un plan absurdo: se descarta.
  const base = negociosDeLaZona.find((n) => n.slug === p.base && n.categoria === "hospedaje")?.slug;

  return {
    zona,
    dias: leerDias(p.dias),
    paradas:
      p.paradas !== undefined
        ? leerParadas(p.paradas, negociosDeLaZona)
        : desdeIntereses(p.intereses, negociosDeLaZona),
    ritmo: RITMOS.find((r) => r === p.ritmo) ?? "normal",
    desde: leerDesde(p.desde),
    diaInicio: diaPedido ?? POR_INDICE[ahora.getDay()],
    congelado: diaPedido !== undefined,
    base,
  };
}

/**
 * El orden de las claves es fijo, y por eso se recorre una lista en vez de
 * escribir seis `if` como en `/buscar`: dos filtros equivalentes tienen que dar
 * la misma cadena, carácter por carácter. De eso depende que la URL precacheada
 * y la URL compartida sean la misma.
 */
const ORDEN: readonly (keyof ParamsRuta)[] = ["dias", "paradas", "ritmo", "desde", "base", "dia"];

export function enlaceCon(zona: ZonaId, actual: ParamsRuta, cambio: Partial<ParamsRuta>): string {
  const final = { ...actual, ...cambio };
  const p = new URLSearchParams();
  for (const clave of ORDEN) {
    const v = final[clave];
    if (v) p.set(clave, v);
  }
  const s = p.toString();
  return s ? `/zona/${zona}/ruta?${s}` : `/zona/${zona}/ruta`;
}

/** Los params tal como vinieron, ya limpios, para volver a serializarlos. */
export function normalizar(pedido: PlanPedido): ParamsRuta {
  return {
    dias: pedido.dias === 1 ? undefined : String(pedido.dias),
    paradas: pedido.paradas.length > 0 ? pedido.paradas.join(",") : undefined,
    ritmo: pedido.ritmo === "normal" ? undefined : pedido.ritmo,
    desde: pedido.desde === DESDE_POR_DEFECTO ? undefined : pedido.desde,
    base: pedido.base,
    dia: pedido.congelado ? pedido.diaInicio : undefined,
  };
}
