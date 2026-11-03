import type { EnteEconomico } from "./tipos";

/**
 * El ente económico de cada comunidad. Hoy hay uno, el de El Valle.
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
];

export function ente(id: string): EnteEconomico {
  const e = ENTES.find((x) => x.id === id);
  if (!e) throw new Error(`Ente desconocido: ${id}`);
  return e;
}
