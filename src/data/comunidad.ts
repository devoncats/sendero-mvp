import type { EnteEconomico } from "./tipos";

/**
 * El ente económico de cada comunidad: hoy, la cooperativa de El Valle y el
 * consorcio de Portobelo.
 *
 * Inventado como todo lo demás, pero con la forma de lo que existe: en Panamá
 * las cooperativas de servicios turísticos se inscriben en el IPACOOP y llevan
 * «R.L.» en el nombre. Es con quien trata el portal — el visitante le escribe a
 * la cooperativa, y la cooperativa le avisa a cada familia.
 */
export const ENTES: readonly EnteEconomico[] = [
  {
    id: "coop-el-valle",
    nombre: "Cooperativa de Servicios Turísticos El Valle, R.L.",
    tipo: "cooperativa",
    zona: "el-valle",
    contacto: {
      nombre: "Iris Batista",
      oficio: "Gerente de la cooperativa",
      anos: 8,
      cita: "Si una familia vende, vende el pueblo. Lo que hacemos es que nadie se quede fuera del reparto.",
    },
    whatsapp: "50764205517",
    fundadaEn: 2019,
    descripcion: {
      es: "Diez familias de El Valle de Antón que se juntaron para recibir visitantes sin intermediarios: cocineras, guías, anfitriones, artesanas y el conjunto típico del pueblo. La cooperativa arma el recorrido, recibe las solicitudes y reparte el trabajo entre sus socios.",
    },
  },
  {
    id: "consorcio-portobelo",
    nombre: "Consorcio Turístico Congo de Portobelo",
    tipo: "consorcio",
    zona: "portobelo",
    contacto: {
      nombre: "Arquímedes Molina",
      oficio: "Coordinador del consorcio",
      anos: 5,
      cita: "Antes cada uno le vendía al turista por su lado y el turista se iba al hotel de afuera. Juntos lo retenemos una noche.",
    },
    whatsapp: "50767430286",
    fundadaEn: 2021,
    descripcion: {
      es: "Ocho emprendimientos de Portobelo que firmaron un consorcio para vender juntos: un guía de patrimonio, el taller de máscaras, el grupo congo, dos cocinas, dos hospedajes y la lancha. El consorcio arma el recorrido, recibe las solicitudes y reparte el trabajo entre sus miembros.",
    },
  },
];

export function ente(id: string): EnteEconomico {
  const e = ENTES.find((x) => x.id === id);
  if (!e) throw new Error(`Ente desconocido: ${id}`);
  return e;
}

const ARTICULO: Record<EnteEconomico["tipo"], string> = {
  cooperativa: "la cooperativa",
  consorcio: "el consorcio",
  sociedad: "la sociedad",
};

/**
 * Cómo se nombra el ente en una frase: «la cooperativa te confirma», «el
 * consorcio te confirma». El copy no puede dar por hecho que todos son
 * cooperativas; el PO nombró tres tipos.
 */
export function elEnte(e: EnteEconomico): string {
  return ARTICULO[e.tipo];
}

/** «de la cooperativa», «del consorcio». «De el» no se dice. */
export function delEnte(e: EnteEconomico): string {
  const el = elEnte(e);
  return el.startsWith("el ") ? `del ${el.slice(3)}` : `de ${el}`;
}
