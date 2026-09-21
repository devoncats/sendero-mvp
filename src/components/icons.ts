/**
 * El set curado. Este es el único archivo autorizado a importar `lucide-react`.
 * Aquí no hay ESLint que lo verifique — lo verificas tú antes de proponer código.
 *
 * Añadir un icono es una decisión, no una conveniencia. Cada entrada es un glifo
 * que alguien tiene que reconocer, y un set que crece sin discusión deja de ser
 * un vocabulario y se vuelve un buscador. Añade uno cuando una pantalla lo pida,
 * nómbralo por lo que significa y no por lo que dibuja, y prefiere una entrada
 * que ya exista.
 *
 * `Heart` está deliberadamente ausente: guardar es `Bookmark`.
 *
 * Las 27 primeras entradas son las que usan las 14 pantallas del MVP. Las seis
 * últimas las trajo el modo experto: cinco nombran las secciones de su barra
 * lateral y una, cerrar sesión. Ninguna repite un significado que ya estuviera.
 */
export type { LucideIcon } from "lucide-react";

export {
  // Navegación y estructura
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Menu,
  X,

  // Acciones
  Bookmark,
  Check,
  ExternalLink,
  // En Lucide v1 el embudo es `Funnel`; el de tres líneas, `ListFilter`.
  // Filtrar una lista es lo segundo.
  ListFilter as Filter,
  Pencil,
  Plus,
  Search,
  Share2 as Share,
  Trash2 as Trash,
  Upload,

  // Estado y retroalimentación
  CircleAlert as AlertCircle,
  CircleCheck as CheckCircle,
  Info,
  LoaderCircle as Spinner,
  TriangleAlert as AlertTriangle,
  WifiOff,

  // Dominio — negocios, lugares, contacto
  Clock,
  Compass,
  // `Image` a secas colisiona con el elemento del DOM y confunde a jsx-a11y.
  // Además nombra lo que dibuja: aquí significa foto.
  Image as Photo,
  MapPin,
  MessageCircle,
  Phone,

  // Modo experto — las secciones de la barra lateral y la salida de la sesión
  ChartColumn as Metricas,
  // La ficha del negocio: el escaparate, no el edificio.
  Store as Ficha,
  Tag as Producto,
  SlidersHorizontal as Ajustes,
  // Idioma. `Languages` dibuja dos alfabetos; el globo se reconoce antes.
  Globe as Idioma,
  LogOut as CerrarSesion,

  // El planificador de rutas
  // Un recorrido ordenado por un pueblo. `Compass` ya está y significa
  // descubrir, que es lo contrario de esto: salir sin plan. Esto es el plan.
  Route as Ruta,
  // «Dónde estoy yo», que no es «dónde queda esto». El dueño ve las dos cosas
  // en la misma pantalla —su punto y el mapa de su pueblo—, y usar el mismo
  // glifo para ambas sería el peor sitio posible para ahorrarse una entrada.
  LocateFixed as MiUbicacion,
} from "lucide-react";
