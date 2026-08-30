import { Ajustes, Clock, Ficha, Metricas, Photo, Producto } from "@/components/icons";
import type { GrupoLateral } from "@/components/patterns";
import type { Pendiente } from "@/data/pendientes";

/**
 * Las secciones de la barra lateral del modo experto.
 *
 * Son las mismas cinco pantallas del modo guiado más dos: métricas, que es la
 * portada del modo, y configuración. El armazón no las conoce — se las pasa el
 * layout, igual que `Navegacion` recibe las suyas.
 *
 * El icono va ya renderizado porque un componente no cruza la frontera al
 * cliente. Un elemento sí.
 */

const ICONO = "size-icon-sm shrink-0";

/** Dónde se arregla cada pendiente. Es lo que enciende el contador de la barra. */
const SECCION_DE: Record<string, string> = {
  fotos: "/dashboard/fotos",
  horario: "/dashboard/horario",
  referencia: "/dashboard/horario",
  precios: "/dashboard/productos",
  confirmar: "/dashboard/negocio",
};

function contarPorSeccion(lista: readonly Pendiente[]): Record<string, number> {
  const cuenta: Record<string, number> = {};
  for (const p of lista) {
    const href = SECCION_DE[p.id];
    if (!href) continue;
    cuenta[href] = (cuenta[href] ?? 0) + 1;
  }
  return cuenta;
}

/**
 * El modo guiado dice una sola cosa a la vez. El experto enseña las siete
 * puertas y marca cuáles tienen algo pendiente detrás, que es lo que espera
 * quien pidió este modo: ver el estado entero de un vistazo.
 */
export function gruposLaterales(lista: readonly Pendiente[]): readonly GrupoLateral[] {
  const cuenta = contarPorSeccion(lista);

  return [
    {
      titulo: "Resumen",
      rutas: [
        {
          href: "/dashboard",
          etiqueta: "Métricas",
          icono: <Metricas className={ICONO} aria-hidden />,
        },
      ],
    },
    {
      titulo: "Mi negocio",
      rutas: [
        {
          href: "/dashboard/negocio",
          etiqueta: "Ficha",
          icono: <Ficha className={ICONO} aria-hidden />,
          pendientes: cuenta["/dashboard/negocio"],
        },
        {
          href: "/dashboard/productos",
          etiqueta: "Productos",
          icono: <Producto className={ICONO} aria-hidden />,
          pendientes: cuenta["/dashboard/productos"],
        },
        {
          href: "/dashboard/fotos",
          etiqueta: "Fotos",
          icono: <Photo className={ICONO} aria-hidden />,
          pendientes: cuenta["/dashboard/fotos"],
        },
        {
          href: "/dashboard/horario",
          etiqueta: "Horario",
          icono: <Clock className={ICONO} aria-hidden />,
          pendientes: cuenta["/dashboard/horario"],
        },
      ],
    },
    {
      titulo: "Cuenta",
      rutas: [
        {
          href: "/dashboard/configuracion",
          etiqueta: "Configuración",
          icono: <Ajustes className={ICONO} aria-hidden />,
        },
      ],
    },
  ];
}
