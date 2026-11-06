import type { Solicitud } from "./tipos";

/**
 * Las solicitudes que ha recibido la cooperativa. INVENTADAS: no hay backend,
 * y lo que el visitante manda desde el portal sale por WhatsApp y no vuelve
 * aquí. Cuando exista dónde guardarlas, esta constante se cambia por su
 * origen y ninguna pantalla se entera.
 *
 * Los estados están mezclados a propósito, como el estado del dato en los
 * negocios: el panel tiene que verse bien con todos.
 *
 * - Las atendidas, de septiembre y octubre, son el registro de visitantes.
 * - `s-1109` llega un lunes, y ese día el vivero y el conjunto no abren. Es el
 *   conflicto de horario que el panel tiene que señalar antes de confirmar.
 * - `s-1114` ya está repartida con la cocina de Yolanda en el almuerzo del
 *   primer día: la cooperativa eligió a quien más lo necesitaba.
 */
export const SOLICITUDES: readonly Solicitud[] = [
  /* --------------------------------------------------------- Atendidas */
  {
    id: "s-0906",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-09-06",
    adultos: 4,
    ninos: 0,
    nombre: "Familia Herrera",
    procedencia: "Ciudad de Panamá",
    idioma: "Español",
    estado: "atendida",
    recibida: "2026-08-28",
  },
  {
    id: "s-0913",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-09-13",
    adultos: 2,
    ninos: 0,
    nombre: "Hannah Weber",
    procedencia: "Alemania",
    idioma: "Inglés",
    estado: "atendida",
    recibida: "2026-09-01",
  },
  {
    id: "s-0920",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-09-20",
    adultos: 5,
    ninos: 2,
    nombre: "Grupo parroquial de Chitré",
    procedencia: "Herrera, Panamá",
    idioma: "Español",
    estado: "atendida",
    recibida: "2026-09-08",
  },
  {
    id: "s-1004",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-10-04",
    adultos: 2,
    ninos: 1,
    nombre: "Carlos y Mónica Ibarra",
    procedencia: "Costa Rica",
    idioma: "Español",
    estado: "atendida",
    recibida: "2026-09-25",
  },
  {
    id: "s-1011",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-10-11",
    adultos: 3,
    ninos: 0,
    nombre: "Julien Moreau",
    procedencia: "Francia",
    idioma: "Inglés",
    estado: "atendida",
    recibida: "2026-10-02",
  },
  {
    id: "s-1025",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-10-25",
    adultos: 6,
    ninos: 0,
    nombre: "Estudiantes de turismo, UNACHI",
    procedencia: "Chiriquí, Panamá",
    idioma: "Español",
    estado: "atendida",
    recibida: "2026-10-10",
  },

  /* ------------------------------------------------------ Por delante */
  {
    id: "s-1107",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-11-07",
    adultos: 2,
    ninos: 2,
    nombre: "Familia Castillo",
    procedencia: "Ciudad de Panamá",
    idioma: "Español",
    estado: "repartida",
    recibida: "2026-10-26",
  },
  {
    id: "s-1107b",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-11-07",
    adultos: 2,
    ninos: 0,
    nombre: "Sarah y Tom Whitfield",
    procedencia: "Estados Unidos",
    idioma: "Inglés",
    estado: "confirmada",
    recibida: "2026-10-30",
    nota: "Ella es vegetariana.",
  },
  {
    id: "s-1109",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-11-09",
    adultos: 3,
    ninos: 0,
    nombre: "Lucía Fernández",
    procedencia: "Colombia",
    idioma: "Español",
    estado: "nueva",
    recibida: "2026-11-02",
    nota: "Llegamos el lunes porque el domingo estamos en la ciudad.",
  },
  {
    id: "s-1114",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-11-14",
    adultos: 4,
    ninos: 0,
    nombre: "Equipo de Fundación Natura",
    procedencia: "Ciudad de Panamá",
    idioma: "Español",
    estado: "repartida",
    recibida: "2026-10-29",
    asignaciones: { 2: "cocina-de-yolanda" },
  },
  {
    id: "s-1121",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-11-21",
    adultos: 2,
    ninos: 0,
    nombre: "Kenji Watanabe",
    procedencia: "Japón",
    idioma: "Inglés",
    estado: "nueva",
    recibida: "2026-11-03",
  },
  {
    id: "s-1128",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-11-28",
    adultos: 5,
    ninos: 1,
    nombre: "Familia Ríos Delgado",
    procedencia: "Santiago, Veraguas",
    idioma: "Español",
    estado: "nueva",
    recibida: "2026-11-01",
  },
  {
    id: "s-1031",
    experiencia: "fin-de-semana-el-valle",
    fecha: "2026-10-31",
    adultos: 2,
    ninos: 0,
    nombre: "Ana Lucía Samudio",
    procedencia: "Ciudad de Panamá",
    idioma: "Español",
    estado: "cancelada",
    recibida: "2026-10-20",
    nota: "Canceló por la lluvia.",
  },
];

export function personas(s: Solicitud): number {
  return s.adultos + s.ninos;
}

/** Cuántas plazas quedan para esa fecha, contando lo confirmado y lo repartido. */
export function plazasOcupadas(experiencia: string, fecha: string): number {
  return SOLICITUDES.filter(
    (s) =>
      s.experiencia === experiencia &&
      s.fecha === fecha &&
      (s.estado === "confirmada" || s.estado === "repartida"),
  ).reduce((t, s) => t + personas(s), 0);
}
