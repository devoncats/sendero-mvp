import type { Experiencia } from "./tipos";

/**
 * Las experiencias que vende el portal. Hoy hay una.
 *
 * El recorrido lo arma la cooperativa, no un algoritmo: las horas, el orden y
 * quién atiende cada momento son una decisión de la comunidad. El planificador
 * de rutas sigue en el código para lo que venga después —el pase de día, los
 * sitios sueltos—, pero aquí no decide nada.
 *
 * Cada bloque dice cuánto le llega a quien lo atiende por cada visitante, y el
 * precio es la suma. No hay comisión escondida que restar: la cooperativa se
 * sostiene con la cuota de sus socios, y eso también se dice en la portada.
 */
export const EXPERIENCIAS: readonly Experiencia[] = [
  {
    id: "fin-de-semana-el-valle",
    nombre: "Un fin de semana dentro del cráter",
    lema: {
      es: "Dos días en El Valle de Antón con las familias que viven en él: sendero, cascada, sancocho, tamborito y una noche junto a la quebrada.",
    },
    zona: "el-valle",
    ente: "coop-el-valle",
    dias: 2,
    noches: 1,
    cupo: 8,
    minimo: 2,
    descripcion: {
      es: "El Valle está dentro del cráter de un volcán apagado, a dos horas de la ciudad. La mayoría lo visita en una mañana y se va. Este recorrido se queda: sube La India Dormida con quien se sabe la leyenda, almuerza donde comen los del pueblo, baila tamborito en la casa comunal y duerme en una casa de familia.",
    },
    bloques: [
      {
        dia: 1,
        hora: "08:30",
        duracion: 30,
        tipo: "traslado",
        actividad: { es: "Recogida en la parada de San Carlos y subida al valle" },
        emprendimiento: "transporte-valle-alto",
        porPersona: 6,
      },
      {
        dia: 1,
        hora: "09:00",
        duracion: 180,
        tipo: "natural",
        actividad: { es: "Subida a La India Dormida, con parada en los petroglifos" },
        emprendimiento: "senderos-india-dormida",
        porPersona: 15,
      },
      {
        dia: 1,
        hora: "12:30",
        duracion: 75,
        tipo: "gastronomia",
        actividad: { es: "Almuerzo de sancocho y tortilla de maíz nuevo" },
        emprendimiento: "fonda-dona-eneida",
        porPersona: 10,
        alternativas: ["cocina-de-yolanda"],
      },
      {
        dia: 1,
        hora: "14:30",
        duracion: 60,
        tipo: "natural",
        actividad: { es: "Recorrido por el vivero de orquídeas del cráter" },
        emprendimiento: "vivero-orquideas-del-crater",
        porPersona: 5,
      },
      {
        dia: 1,
        hora: "16:00",
        duracion: 60,
        tipo: "alojamiento",
        actividad: { es: "Llegada a la casa de familia. Noche con desayuno" },
        emprendimiento: "hospedaje-cerro-gaital",
        porPersona: 35,
        alternativas: ["cabanas-la-pintada"],
      },
      {
        dia: 1,
        hora: "19:00",
        duracion: 90,
        tipo: "cultural",
        actividad: { es: "Noche de tamborito en la casa comunal" },
        emprendimiento: "conjunto-flor-del-valle",
        porPersona: 8,
      },
      {
        dia: 2,
        hora: "08:30",
        duracion: 120,
        tipo: "natural",
        actividad: { es: "Caminata por el río hasta el Chorro Las Mozas" },
        emprendimiento: "guias-chorro-las-mozas",
        porPersona: 10,
      },
      {
        dia: 2,
        hora: "11:00",
        duracion: 90,
        tipo: "cultural",
        actividad: { es: "Mercado de artesanías y taller de tejido de junco" },
        emprendimiento: "sombreros-del-valle",
        porPersona: 8,
      },
      {
        dia: 2,
        hora: "12:45",
        duracion: 75,
        tipo: "gastronomia",
        actividad: { es: "Almuerzo de guacho y chicha de saril" },
        emprendimiento: "cocina-de-yolanda",
        porPersona: 10,
        alternativas: ["fonda-dona-eneida"],
      },
      {
        dia: 2,
        hora: "14:30",
        duracion: 30,
        tipo: "traslado",
        actividad: { es: "Bajada a la parada de San Carlos" },
        emprendimiento: "transporte-valle-alto",
        porPersona: 6,
      },
    ],
    incluye: [
      "Los dos traslados desde y hasta San Carlos",
      "Guía en el sendero y en el río",
      "Dos almuerzos y un desayuno",
      "Una noche en casa de familia",
      "La noche de tamborito",
      "El taller de junco",
    ],
    noIncluye: [
      "El bus desde la ciudad hasta San Carlos",
      "La cena del primer día",
      "Lo que compres en el mercado",
    ],
    llevar: [
      "Zapatos que se puedan mojar",
      "Ropa para el río",
      "Abrigo para la noche: en el cráter refresca",
      "Efectivo: no todos reciben Yappy",
    ],
  },
];

export function experiencia(id: string): Experiencia | undefined {
  return EXPERIENCIAS.find((e) => e.id === id);
}

/** El precio por persona: la suma de lo que recibe cada emprendimiento. */
export function precioPorPersona(e: Experiencia): number {
  return e.bloques.reduce((t, b) => t + b.porPersona, 0);
}

/**
 * A dónde va el precio, emprendimiento por emprendimiento y de mayor a menor.
 * Cuenta a los titulares de cada bloque: es lo que el visitante paga si la
 * cooperativa no reparte de otra manera.
 */
export function repartoDelPrecio(e: Experiencia): { slug: string; monto: number }[] {
  const montos = new Map<string, number>();
  for (const b of e.bloques) montos.set(b.emprendimiento, (montos.get(b.emprendimiento) ?? 0) + b.porPersona);
  return [...montos].map(([slug, monto]) => ({ slug, monto })).sort((a, b) => b.monto - a.monto);
}
