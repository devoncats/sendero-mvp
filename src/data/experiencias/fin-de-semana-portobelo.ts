import type { Experiencia } from "../tipos";

/**
 * Portobelo — la segunda experiencia, con el Consorcio Turístico Congo de
 * Portobelo. Es un consorcio y no una cooperativa a propósito: el modelo tiene
 * que servir para los tres tipos de ente que nombró el PO.
 *
 * Los dos almuerzos se cruzan: el titular de uno es la alternativa del otro.
 * Así, si una de las dos fondas necesita apoyo, el reparto puede darle los dos.
 */
export const FIN_DE_SEMANA_PORTOBELO: Experiencia = {
  id: "fin-de-semana-portobelo",
  nombre: "La bahía de los congos",
  lema: {
    es: "Dos días en Portobelo con quienes guardan su historia: los fuertes, el tambor congo, las máscaras de diablo y una playa a la que solo se llega en lancha.",
  },
  zona: "portobelo",
  ente: "consorcio-portobelo",
  dias: 2,
  noches: 1,
  cupo: 10,
  minimo: 2,
  descripcion: {
    es: "Portobelo fue el puerto por donde salía la plata de América, y también el pueblo de los cimarrones que se escaparon de él. La cultura congo nació de esa burla y hoy es Patrimonio Inmaterial de la Humanidad. Este recorrido la cuenta desde dentro: con el guía que se sabe lo que no dicen los letreros, en el taller donde se hacen las máscaras, en el patio de la reina congo y en la lancha del pescador.",
  },
  bloques: [
    {
      dia: 1,
      hora: "10:00",
      duracion: 120,
      tipo: "cultural",
      actividad: { es: "Los fuertes, la Real Aduana y el Cristo Negro, a pie" },
      emprendimiento: "guias-de-los-fuertes",
      porPersona: 12,
    },
    {
      dia: 1,
      hora: "12:30",
      duracion: 75,
      tipo: "gastronomia",
      actividad: { es: "Almuerzo de pescado en coco con arroz con coco" },
      emprendimiento: "cocina-congo-la-bahia",
      porPersona: 12,
      alternativas: ["fonda-el-malecon"],
    },
    {
      dia: 1,
      hora: "14:30",
      duracion: 90,
      tipo: "cultural",
      actividad: { es: "Taller de máscaras de diablo congo" },
      emprendimiento: "taller-diablos-y-congos",
      porPersona: 10,
    },
    {
      dia: 1,
      hora: "16:30",
      duracion: 60,
      tipo: "alojamiento",
      actividad: { es: "Llegada a la casa de huéspedes. Noche con desayuno" },
      emprendimiento: "casa-la-aduana",
      porPersona: 30,
      alternativas: ["posada-isla-drake"],
    },
    {
      dia: 1,
      hora: "19:30",
      duracion: 90,
      tipo: "cultural",
      actividad: { es: "Noche congo en el patio de la reina" },
      emprendimiento: "congos-reyes-de-la-bahia",
      porPersona: 10,
    },
    {
      dia: 2,
      hora: "08:30",
      duracion: 210,
      tipo: "natural",
      actividad: { es: "Lancha a Playa Blanca, con careta para ver el arrecife" },
      emprendimiento: "lanchas-playa-blanca",
      porPersona: 20,
    },
    {
      dia: 2,
      hora: "12:30",
      duracion: 75,
      tipo: "gastronomia",
      actividad: { es: "Almuerzo de pescado frito y patacones en el malecón" },
      emprendimiento: "fonda-el-malecon",
      porPersona: 10,
      alternativas: ["cocina-congo-la-bahia"],
    },
  ],
  incluye: [
    "El recorrido por los fuertes con guía",
    "Dos almuerzos y un desayuno",
    "Una noche en casa de huéspedes",
    "El taller de máscaras: la que hagas te la llevas",
    "La noche congo",
    "La lancha a Playa Blanca y la careta",
  ],
  noIncluye: [
    "El bus desde la ciudad hasta Portobelo",
    "La cena del primer día",
    "La entrada a la Real Aduana, que se paga allí",
  ],
  llevar: [
    "Ropa de baño y protector solar",
    "Zapatos cerrados para los fuertes: las piedras resbalan",
    "Una bolsa seca para la lancha",
    "Efectivo: en la playa no hay señal para Yappy",
  ],
};
