import type { CategoriaId, Dia, Negocio, ZonaId } from "@/data";
import { CATEGORIAS } from "@/data";
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

/** Lo que llega crudo de la URL. Todo string, todo sospechoso. */
export type ParamsRuta = {
  dias?: string;
  intereses?: string;
  ritmo?: string;
  desde?: string;
  base?: string;
  dia?: string;
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
 * Se filtra contra las categorías reales, se deduplica y **se reordena al orden
 * canónico**. Lo último no es cosmético: `comida,artesania` y `artesania,comida`
 * tienen que producir la misma cadena, o el service worker acaba guardando dos
 * entradas de caché para el mismo plan y compartir el enlace deja de ser exacto.
 */
function leerIntereses(v: string | undefined): CategoriaId[] {
  if (!v) return [];
  const pedidos = new Set(v.split(","));
  return CATEGORIAS.filter((c) => pedidos.has(c.id)).map((c) => c.id);
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
  p: ParamsRuta,
  negociosDeLaZona: readonly Negocio[],
  ahora: Date,
): PlanPedido {
  const diaPedido = DIAS_VALIDOS.find((d) => d === p.dia);

  // Un hospedaje de otro pueblo como base es un plan absurdo: se descarta.
  const base = negociosDeLaZona.find((n) => n.slug === p.base && n.categoria === "hospedaje")?.slug;

  return {
    zona,
    dias: leerDias(p.dias),
    intereses: leerIntereses(p.intereses),
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
const ORDEN: readonly (keyof ParamsRuta)[] = ["dias", "intereses", "ritmo", "desde", "base", "dia"];

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

/** Añade o quita una categoría del csv, manteniendo el orden canónico. */
export function alternarInteres(csv: string | undefined, id: CategoriaId): string | undefined {
  const actuales = leerIntereses(csv);
  const siguientes = actuales.includes(id) ? actuales.filter((c) => c !== id) : [...actuales, id];
  const ordenadas = CATEGORIAS.filter((c) => siguientes.includes(c.id)).map((c) => c.id);
  return ordenadas.length > 0 ? ordenadas.join(",") : undefined;
}

/** Los params tal como vinieron, ya limpios, para volver a serializarlos. */
export function normalizar(pedido: PlanPedido): ParamsRuta {
  return {
    dias: pedido.dias === 1 ? undefined : String(pedido.dias),
    intereses: pedido.intereses.length > 0 ? pedido.intereses.join(",") : undefined,
    ritmo: pedido.ritmo === "normal" ? undefined : pedido.ritmo,
    desde: pedido.desde === DESDE_POR_DEFECTO ? undefined : pedido.desde,
    base: pedido.base,
    dia: pedido.congelado ? pedido.diaInicio : undefined,
  };
}
