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
 * Estas 27 entradas son exactamente las que usan las 14 pantallas del MVP.
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
  Image,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
