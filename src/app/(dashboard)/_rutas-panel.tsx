import { Ajustes, Ficha, Metricas, Proveedor, Solicitud, Visitantes } from "@/components/icons";
import type { GrupoLateral, RutaNav } from "@/components/patterns";

/**
 * La navegación del panel de la cooperativa, en los dos modos.
 *
 * Las mismas cinco pantallas en el encabezado del guiado y en la barra lateral
 * del experto, que añade la configuración. El armazón no las conoce — se las
 * pasa el layout, igual que `Navegacion` recibe las suyas.
 *
 * Las pantallas de la ficha del dueño (negocio, productos, fotos, horario)
 * siguen en el código pero salieron de aquí: el panel ya no es de una familia.
 * Volverán como la ficha de cada emprendimiento, editada por la cooperativa.
 */

export const RUTAS_PANEL: readonly RutaNav[] = [
  { href: "/dashboard", etiqueta: "Panel" },
  { href: "/dashboard/solicitudes", etiqueta: "Solicitudes" },
  { href: "/dashboard/emprendimientos", etiqueta: "Emprendimientos" },
  { href: "/dashboard/visitantes", etiqueta: "Visitantes" },
  { href: "/dashboard/proveedores", etiqueta: "Proveedores" },
];

const ICONO = "size-icon-sm shrink-0";

/** Lo que hay pendiente detrás de cada puerta. Enciende el contador de la barra. */
export type Cuenta = {
  solicitudes: number;
  emprendimientos: number;
  proveedores: number;
};

/**
 * El experto enseña todas las puertas y marca cuáles tienen algo pendiente
 * detrás, que es lo que espera quien pidió este modo: el estado entero de un
 * vistazo.
 */
export function gruposLaterales(cuenta: Cuenta): readonly GrupoLateral[] {
  return [
    {
      titulo: "Resumen",
      rutas: [{ href: "/dashboard", etiqueta: "Métricas", icono: <Metricas className={ICONO} aria-hidden /> }],
    },
    {
      titulo: "Visitantes",
      rutas: [
        {
          href: "/dashboard/solicitudes",
          etiqueta: "Solicitudes",
          icono: <Solicitud className={ICONO} aria-hidden />,
          pendientes: cuenta.solicitudes || undefined,
        },
        {
          href: "/dashboard/visitantes",
          etiqueta: "Registro",
          icono: <Visitantes className={ICONO} aria-hidden />,
        },
      ],
    },
    {
      titulo: "La comunidad",
      rutas: [
        {
          href: "/dashboard/emprendimientos",
          etiqueta: "Emprendimientos",
          icono: <Ficha className={ICONO} aria-hidden />,
          pendientes: cuenta.emprendimientos || undefined,
        },
        {
          href: "/dashboard/proveedores",
          etiqueta: "Proveedores",
          icono: <Proveedor className={ICONO} aria-hidden />,
          pendientes: cuenta.proveedores || undefined,
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
