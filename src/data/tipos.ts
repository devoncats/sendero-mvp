/**
 * Los tipos del dominio. Nada aquí importa de components ni de app: los datos
 * son el fondo de la pila y no saben quién los va a dibujar.
 */

/** Texto con traducción opcional. El chrome de la interfaz se traduce siempre;
 *  lo que escribe el dueño de su propio negocio, solo si él lo escribe. */
export type Texto = { es: string; en?: string };

export type CategoriaId =
  | "artesania"
  | "comida"
  | "hospedaje"
  | "experiencias"
  | "transporte"
  | "campo";

export type ZonaId =
  | "pedasi"
  | "santa-fe"
  | "portobelo"
  | "guna-yala"
  | "boquete"
  | "volcan"
  | "taboga"
  | "el-valle"
  | "bastimentos";

export type Categoria = {
  id: CategoriaId;
  nombre: Texto;
};

export type Zona = {
  id: ZonaId;
  nombre: string;
  provincia: string;
  descripcion: Texto;
  comoLlegar: Texto;
};

export type Dia = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

/**
 * Un día puede estar abierto, cerrado, o **sin confirmar** — y ese tercer
 * estado es deliberado. Un dueño que no ha dicho si abre el domingo no es lo
 * mismo que uno que cierra, y el visitante merece saber la diferencia.
 */
export type Franja = { desde: string; hasta: string };
export type DiaHorario = Franja | "cerrado" | "sinConfirmar";
export type Semana = Record<Dia, DiaHorario>;

/** Frescura del dato, no del negocio. */
export type EstadoDato = "verificado" | "desactualizado" | "sinConfirmar";

export type Producto = {
  nombre: string;
  /** En balboas. Ausente cuando el precio depende del encargo. */
  precio?: number;
  /** `true` cuando el precio es un punto de partida, no un cierre. */
  desde?: boolean;
  detalle?: string;
};

/**
 * Un punto en el mundo, en grados decimales. Nace aquí y no en `lib/` porque
 * las dependencias apuntan hacia abajo: `data` es el fondo de la pila y no
 * importa de nadie.
 */
export type Coordenadas = { lat: number; lng: number };

export type Persona = {
  nombre: string;
  oficio: string;
  /** Años en el oficio. Es la credencial que tiene esta gente. */
  anos?: number;
  /** Sus propias palabras. Solo si de verdad las dijo. */
  cita?: string;
};

export type Negocio = {
  slug: string;
  nombre: string;
  persona: Persona;
  categoria: CategoriaId;
  zona: ZonaId;
  descripcion: Texto;
  productos: Producto[];
  horario: Semana;
  /** Cómo llegar en palabras. Sigue valiendo más que un punto en el mapa. */
  referencia: string;
  /**
   * El punto exacto, si el dueño lo puso. Opcional, y va a seguir siéndolo: lo
   * pone él desde su panel, y un directorio nuevo está lleno de gente que
   * todavía no lo ha hecho. Sin él el negocio sale en las listas igual — solo
   * queda fuera del orden de una ruta, que es lo único que necesita geometría.
   */
  coordenadas?: Coordenadas;
  /** E.164 sin el signo, para armar el enlace wa.me. */
  whatsapp: string;
  pagos: string[];
  idiomas: string[];
  /** ISO. De aquí sale «confirmado hace 3 días». */
  confirmadoEl?: string;
  estadoDato: EstadoDato;
  /** Cuántas fotos tiene. En el MVP no hay archivos: los huecos se dibujan. */
  fotos: number;
  /**
   * Cuántas personas puede atender en un día: camas, cubiertos, cupo de una
   * gira. Solo lo tienen los que forman parte de una experiencia — es lo que
   * la cooperativa necesita para no prometer más de lo que cabe.
   */
  plazas?: number;
  /** La unidad de esas plazas, en palabras: «camas», «cubiertos», «personas». */
  unidadPlazas?: string;
};

/* ------------------------------------------------------------------------ */
/*  La experiencia y el ente económico                                       */
/* ------------------------------------------------------------------------ */

/**
 * Quien da la cara por la comunidad: la cooperativa, el consorcio o la
 * sociedad que agrupa a los emprendimientos. El portal no trata con cada
 * familia por separado — trata con este ente, y el ente reparte.
 */
export type EnteEconomico = {
  id: string;
  nombre: string;
  tipo: "cooperativa" | "consorcio" | "sociedad";
  zona: ZonaId;
  /** Quien contesta el WhatsApp. Con nombre, como todo en este proyecto. */
  contacto: Persona;
  /** E.164 sin el signo. Aquí llegan las solicitudes de los visitantes. */
  whatsapp: string;
  fundadaEn: number;
  descripcion: Texto;
};

/** De qué va cada momento del recorrido. Es también el orden del folleto. */
export type TipoBloque = "alojamiento" | "gastronomia" | "cultural" | "natural" | "traslado";

/**
 * Un momento del itinerario, y quién lo atiende. `porPersona` es lo que le
 * llega a ese emprendimiento por cada visitante: la suma de los bloques es el
 * precio de la experiencia, y por eso el portal puede decir a dónde va cada
 * balboa sin inventarse un porcentaje.
 */
export type Bloque = {
  /** 1, 2… Día del recorrido, no fecha. */
  dia: number;
  /** HH:MM */
  hora: string;
  /** Minutos que dura. */
  duracion: number;
  tipo: TipoBloque;
  actividad: Texto;
  /** Slug de un `Negocio`. */
  emprendimiento: string;
  porPersona: number;
  /**
   * Otros emprendimientos que pueden atender este mismo bloque. Es lo que
   * permite repartir visitantes con criterio: si dos fondas sirven el mismo
   * almuerzo, la cooperativa puede mandárselos a la que más lo necesita.
   */
  alternativas?: string[];
};

export type Experiencia = {
  id: string;
  nombre: string;
  /** La promesa en una frase. */
  lema: Texto;
  zona: ZonaId;
  ente: string;
  dias: number;
  noches: number;
  /** Personas por fecha. Lo pone la plaza más chica del recorrido. */
  cupo: number;
  /** Mínimo de personas para que salga. */
  minimo: number;
  descripcion: Texto;
  bloques: Bloque[];
  incluye: string[];
  noIncluye: string[];
  /** Qué llevar, en palabras de quien guía. */
  llevar: string[];
};

export type EstadoSolicitud = "nueva" | "confirmada" | "repartida" | "atendida" | "cancelada";

/**
 * Lo que manda un visitante desde el portal. No es una reserva hasta que la
 * cooperativa la confirma: el portal no cobra y no promete lo que no sabe.
 */
export type Solicitud = {
  id: string;
  experiencia: string;
  /** ISO, día de llegada. */
  fecha: string;
  adultos: number;
  ninos: number;
  nombre: string;
  /** País o ciudad. Es lo que la cooperativa necesita para su registro. */
  procedencia: string;
  idioma: string;
  estado: EstadoSolicitud;
  /** ISO, cuándo llegó. */
  recibida: string;
  nota?: string;
  /**
   * Quién atiende cada bloque, cuando la cooperativa eligió una alternativa.
   * Clave: índice del bloque. Sin entrada, lo atiende el titular.
   */
  asignaciones?: Record<number, string>;
};

/* ------------------------------------------------------------------------ */
/*  Lo administrativo: proveedores, insumos y cuentas                        */
/* ------------------------------------------------------------------------ */

export type Proveedor = {
  id: string;
  nombre: string;
  /** Qué vende, en una línea. */
  rubro: string;
  /** De dónde viene. Un proveedor de la misma comunidad también es derrame. */
  lugar: string;
  local: boolean;
  whatsapp: string;
};

/** Lo que un emprendimiento necesita tener para poder atender. */
export type Insumo = {
  emprendimiento: string;
  nombre: string;
  unidad: string;
  existencias: number;
  /** Por debajo de esto no alcanza para un fin de semana lleno. */
  minimo: number;
  proveedor: string;
};

/**
 * Un mes de cuentas de un emprendimiento, en balboas. Lo lleva la cooperativa
 * con lo que cada familia le reporta; no es contabilidad formal y no pretende
 * serlo.
 */
export type MesFinanciero = {
  /** "2026-10" */
  mes: string;
  /** Lo que llegó por la experiencia. */
  ingresosRuta: number;
  /** Lo que vendió por su cuenta. */
  ingresosPropios: number;
  gastosFijos: number;
  gastosVariables: number;
  /** Lo que tiene en caja al cierre. */
  caja: number;
  /** Lo que debe a proveedores al cierre. */
  deuda: number;
  /** Días que lleva vencida la deuda más vieja. 0 si va al día. */
  diasAtraso: number;
  /** Plazas ocupadas sobre plazas ofrecidas en el mes, 0–1. */
  ocupacion: number;
};

/* ------------------------------------------------------------------------ */
/*  Impacto ambiental                                                        */
/* ------------------------------------------------------------------------ */

/**
 * Un combustible quemado en el mes, en la unidad en que se pesa o se mide de
 * verdad. El gas de cocina va en kilos porque se compra en tanques de 25 lb y
 * sus factores de emisión se publican por kilo; la gasolina y el diésel van en
 * litros. Lo que la familia reporte en galones o en tanques se convierte al
 * capturarlo, no al calcular: aquí ya llega en la unidad del factor.
 *
 * Es el alcance 1: lo que se quema en algo que la familia tiene o maneja —su
 * estufa, su planta eléctrica, su busito, su lancha—.
 */
export type Combustible =
  | { tipo: "glp"; kg: number }
  | { tipo: "gasolina"; litros: number }
  | { tipo: "diesel"; litros: number };

export type TipoCombustible = Combustible["tipo"];

/**
 * Cómo se movió alguien en un vehículo que **no** es del emprendimiento. Si el
 * vehículo es suyo, lo que cuenta es el combustible, no el trayecto, y va en
 * `combustibles`. Es el alcance 3.
 */
export type ModoTransporte = "bus" | "auto" | "lancha";

export type Trayecto = {
  modo: ModoTransporte;
  /** Kilómetros recorridos en el mes, sumando ida y vuelta. */
  km: number;
  /** Cuántas personas iban. Con bus se cuenta por pasajero; con auto, por vehículo. */
  pasajeros: number;
  /** Para qué: «comprar pescado en San Carlos». Sin esto un número no se puede revisar. */
  motivo: string;
};

/**
 * Lo que un emprendimiento gastó en energía y transporte en un mes. Son datos de
 * **actividad**, no emisiones: los kilos de CO₂ los calcula `lib/` con factores
 * que dicen de dónde salen. Así, cuando lleguen los datos de verdad, entran en
 * esta misma forma y ninguna pantalla se entera.
 */
export type ActividadMensual = {
  /** "2026-10", los mismos meses que las cuentas. */
  mes: string;
  /** Alcance 1. Vacío si no quemó nada. */
  combustibles: readonly Combustible[];
  /** Alcance 2: lo que marca el medidor de la red. 0 si no tiene, o si no está conectado. */
  electricidadKWh: number;
  /** Alcance 3. Vacío si no se movió en vehículo ajeno. */
  transporte: readonly Trayecto[];
};
