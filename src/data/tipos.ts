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
  /** Cómo llegar en palabras. Vale más que un punto en el mapa. */
  referencia: string;
  /** E.164 sin el signo, para armar el enlace wa.me. */
  whatsapp: string;
  pagos: string[];
  idiomas: string[];
  /** ISO. De aquí sale «confirmado hace 3 días». */
  confirmadoEl?: string;
  estadoDato: EstadoDato;
  /** Cuántas fotos tiene. En el MVP no hay archivos: los huecos se dibujan. */
  fotos: number;
};
