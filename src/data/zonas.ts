import type { Zona, ZonaId } from "./tipos";

/**
 * Las nueve zonas del MVP. Ninguna es de las masificadas: no está Casco Antiguo
 * ni San Blas de tour, están los lugares donde el turista llega y no sabe a
 * quién comprarle.
 */
export const ZONAS: readonly Zona[] = [
  {
    id: "santa-fe",
    nombre: "Santa Fe",
    provincia: "Veraguas",
    descripcion: {
      es: "Montaña, río y neblina a tres horas de la capital. Se viene por el café, las orquídeas y los sombreros — y se come donde cocinan las señoras del pueblo, no en un restaurante.",
      en: "Mountains, rivers and mist three hours from the capital. People come for the coffee, the orchids and the hats — and eat where the town's women cook, not in a restaurant.",
    },
    comoLlegar: {
      es: "Desde Santiago, 55 km por la carretera a Santa Fe. Bus cada hora desde la terminal, 2 horas. En carro, 1 h 15.",
      en: "From Santiago, 55 km along the Santa Fe road. Buses hourly from the terminal, 2 hours. By car, 1 h 15.",
    },
  },
  {
    id: "pedasi",
    nombre: "Pedasí",
    provincia: "Los Santos",
    descripcion: {
      es: "Pueblo de calles anchas y casas bajas a media hora de playas donde casi nunca hay nadie. Se vive de la pesca y, desde hace poco, de quien viene a surfear.",
      en: "A town of wide streets and low houses, half an hour from beaches that are almost always empty. It lives on fishing and, more recently, on surfers.",
    },
    comoLlegar: {
      es: "Desde Chitré, 45 minutos por la carretera nacional. Buses cada media hora hasta las 6 p.m.",
      en: "From Chitré, 45 minutes on the national road. Buses every half hour until 6 p.m.",
    },
  },
  {
    id: "portobelo",
    nombre: "Portobelo",
    provincia: "Colón",
    descripcion: {
      es: "Bahía, fuertes en ruinas y la cultura congo, que es Patrimonio Inmaterial de la Humanidad. Se come pescado con coco y se sale en lancha a las playas que no tienen carretera.",
      en: "A bay, ruined forts and Congo culture, recognised by UNESCO. You eat fish in coconut and take a boat to beaches no road reaches.",
    },
    comoLlegar: {
      es: "Desde la ciudad de Panamá, 1 h 30 por la carretera a Colón y luego la costera. Bus desde Sabanitas.",
      en: "From Panama City, 1 h 30 via the Colón road then the coastal road. Bus from Sabanitas.",
    },
  },
  {
    id: "guna-yala",
    nombre: "Guna Yala",
    provincia: "Comarca",
    descripcion: {
      es: "Territorio guna, con gobierno propio. Las molas se compran a quien las cose, y quedarse es en cabañas de la comunidad, no en hoteles.",
      en: "Guna territory, self-governed. Molas are bought from the women who sew them, and you stay in community cabins, not hotels.",
    },
    comoLlegar: {
      es: "Por tierra hasta Cartí, 3 horas desde la capital en 4x4, y de ahí en lancha. Se entra con permiso del congreso local.",
      en: "By land to Cartí, 3 hours from the capital in a 4x4, then by boat. Entry requires the local congress's permission.",
    },
  },
  {
    id: "boquete",
    nombre: "Boquete",
    provincia: "Chiriquí",
    descripcion: {
      es: "Tierra alta, café de altura y sendero de los Quetzales. Detrás de las fincas grandes hay decenas de productores pequeños que tuestan en su casa.",
      en: "Highlands, high-altitude coffee and the Quetzales trail. Behind the big estates are dozens of small growers who roast at home.",
    },
    comoLlegar: {
      es: "Desde David, 40 minutos subiendo. Buses cada 20 minutos desde la terminal.",
      en: "From David, 40 minutes uphill. Buses every 20 minutes from the terminal.",
    },
  },
  {
    id: "volcan",
    nombre: "Volcán",
    provincia: "Chiriquí",
    descripcion: {
      es: "La otra falda del Barú, más fría y menos visitada que Boquete. Aquí se hacen quesos, se crían truchas y se siembra la hortaliza que come el país.",
      en: "The other slope of Barú, colder and less visited than Boquete. Here they make cheese, farm trout and grow the vegetables the country eats.",
    },
    comoLlegar: {
      es: "Desde David, 1 hora por la carretera a Cerro Punta. Bus directo desde la terminal.",
      en: "From David, 1 hour on the Cerro Punta road. Direct bus from the terminal.",
    },
  },
  {
    id: "taboga",
    nombre: "Isla Taboga",
    provincia: "Panamá",
    descripcion: {
      es: "La isla de las flores, a media hora en ferry de la ciudad. Un pueblo sin carros, con hospedajes familiares y comedores que abren cuando llega la lancha.",
      en: "The island of flowers, half an hour by ferry from the city. A town without cars, with family lodgings and eateries that open when the boat arrives.",
    },
    comoLlegar: {
      es: "Ferry desde el Causeway de Amador, 30 minutos. Cuatro salidas al día entre semana.",
      en: "Ferry from the Amador Causeway, 30 minutes. Four departures a day on weekdays.",
    },
  },
  {
    id: "el-valle",
    nombre: "El Valle de Antón",
    provincia: "Coclé",
    descripcion: {
      es: "Un pueblo dentro del cráter de un volcán dormido. Mercado de artesanía todos los días, aguas termales y los únicos árboles de tronco cuadrado del mundo.",
      en: "A town inside the crater of a dormant volcano. A craft market every day, hot springs and the world's only square-trunked trees.",
    },
    comoLlegar: {
      es: "Desde la Interamericana, se sube en Las Uvas: 25 minutos de curvas. Bus directo desde Albrook, 2 h 30.",
      en: "Turn off the Interamericana at Las Uvas: 25 minutes of switchbacks. Direct bus from Albrook, 2 h 30.",
    },
  },
  {
    id: "bastimentos",
    nombre: "Bastimentos",
    provincia: "Bocas del Toro",
    descripcion: {
      es: "Isla sin carreteras, con comunidad afroantillana y ngäbe. Se camina de una playa a otra por senderos de tierra y se come lo que entró en la lancha esa mañana.",
      en: "A road-free island with Afro-Caribbean and Ngäbe communities. You walk between beaches on dirt paths and eat whatever came in on the morning boat.",
    },
    comoLlegar: {
      es: "Desde Bocas Town, 10 minutos en taxi marino. Salen cuando se llenan, desde el muelle principal.",
      en: "From Bocas Town, 10 minutes by water taxi. They leave when full, from the main dock.",
    },
  },
] as const;

const POR_ID = new Map(ZONAS.map((z) => [z.id, z]));

export function zona(id: ZonaId): Zona {
  const z = POR_ID.get(id);
  if (!z) throw new Error(`Zona desconocida: ${id}`);
  return z;
}
