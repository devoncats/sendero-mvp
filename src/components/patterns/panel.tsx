"use client";

// Sexto y último "use client" del proyecto, y uno solo para las dos cosas del
// panel que se abren y se cierran: el menú de cuenta del encabezado y, en modo
// experto, el cajón de la barra lateral por debajo de `md`.
//
// Podrían haber sido dos archivos y dos directivas. Son uno porque comparten
// exactamente lo que justifica el JavaScript: cerrar con Esc, cerrar al tocar
// fuera y devolver el foco a quien abrió. Lo demás —el contenido del menú, los
// enlaces, el formulario que cambia de modo— entra ya renderizado desde el
// servidor y no pesa aquí.
//
// El cajón necesita además `usePathname`, por lo mismo que `Navegacion`: una
// barra lateral que no dice en qué sección estás no orienta a nadie.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { ChevronDown, Menu, X } from "@/components/icons";
import { cn } from "@/lib/cn";

/**
 * Esc y toque fuera. Es todo lo que hace falta para que un desplegable no se
 * quede pegado en la pantalla, y es todo lo que hay de JavaScript aquí.
 *
 * `pointerdown` y no `click`: en un teléfono el toque fuera tiene que cerrar
 * aunque el dedo se mueva un poco antes de levantarse.
 */
function useCerrarAlSalir(
  abierto: boolean,
  cerrar: () => void,
  caja: RefObject<HTMLElement | null>,
  disparador: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!abierto) return;

    function tecla(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      cerrar();
      disparador.current?.focus();
    }

    function fuera(e: PointerEvent) {
      const destino = e.target as Node;
      if (caja.current?.contains(destino)) return;
      if (disparador.current?.contains(destino)) return;
      cerrar();
    }

    document.addEventListener("keydown", tecla);
    document.addEventListener("pointerdown", fuera);
    return () => {
      document.removeEventListener("keydown", tecla);
      document.removeEventListener("pointerdown", fuera);
    };
  }, [abierto, cerrar, caja, disparador]);
}

/**
 * El menú de la cuenta, detrás de las iniciales del dueño.
 *
 * Las iniciales solas no invitan a nadie a tocarlas: el chevrón dice que hay
 * algo debajo, y el nombre accesible dice de quién es la sesión. Nada vive solo
 * en hover — el menú se abre al tocar.
 *
 * El contenido llega como `children` desde el servidor. Este componente no sabe
 * qué hay dentro, y por eso no crece cuando el menú crece.
 */
export function MenuCuenta({
  iniciales,
  nombre,
  children,
}: {
  iniciales: string;
  /** Nombre real de la persona. Es el nombre accesible del botón. */
  nombre: string;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const id = useId();

  useCerrarAlSalir(abierto, () => setAbierto(false), caja, boton);

  return (
    <div className="relative">
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((v) => !v)}
        className="flex min-h-control-md items-center gap-inset-xs rounded-full p-inset-xs transition-colors hover:bg-action-secondary-hover motion-reduce:transition-none"
      >
        <span
          aria-hidden
          className="flex size-avatar-sm items-center justify-center rounded-full bg-brand-surface text-caption font-semibold text-brand-content"
        >
          {iniciales}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-icon-sm text-content-tertiary transition-transform motion-reduce:transition-none",
            abierto && "rotate-180",
          )}
        />
        <span className="sr-only">{nombre} — menú de cuenta</span>
      </button>

      {/*
        Se esconde con `hidden`, no se desmonta.

        Dentro hay un formulario que cambia el modo del panel. Si al tocarlo el
        menú se desmontara en el mismo evento, React se llevaría el formulario
        antes de que el envío llegara a dispararse y el botón no haría nada
        —costó un diagnóstico—. Escondido sigue montado, sale del árbol de
        accesibilidad y el envío llega.
      */}
      <div
        id={id}
        ref={caja}
        hidden={!abierto}
        /* Cualquier cosa que se toque aquí dentro navega o envía. Cerrar al
           vuelo evita que el menú tape la pantalla a la que acaba de llevar. */
        onClick={() => setAbierto(false)}
        className="absolute right-0 top-full z-50 mt-inset-xs w-72 rounded-overlay border border-border-default bg-surface-overlay p-inset-sm shadow-raised"
      >
        {children}
      </div>
    </div>
  );
}

export type RutaLateral = {
  href: string;
  etiqueta: string;
  /** El icono llega ya renderizado: un componente no cruza la frontera. */
  icono: ReactNode;
  /** Cuántas cosas están pendientes en esa sección. Cero no se dibuja. */
  pendientes?: number;
};

export type GrupoLateral = { titulo: string; rutas: readonly RutaLateral[] };

/**
 * El armazón del modo experto: encabezado, barra lateral y contenido.
 *
 * Un solo marcado para los dos anchos. La barra lateral es una columna fija
 * desde `md` y, por debajo, el mismo `<nav>` desplazado fuera de la pantalla
 * que entra con la hamburguesa. No hay una versión móvil aparte, ni un enlace
 * repetido: el orden del DOM es el mismo en las dos.
 *
 * `marca`, `cuenta`, `pie` y `children` vienen del servidor.
 */
export function ShellExperto({
  marca,
  cuenta,
  grupos,
  pie,
  children,
}: {
  marca: ReactNode;
  cuenta: ReactNode;
  grupos: readonly GrupoLateral[];
  /** Lo que cierra la barra lateral: el formulario que vuelve al modo guiado. */
  pie: ReactNode;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  const nav = useRef<HTMLElement>(null);
  const hamburguesa = useRef<HTMLButtonElement>(null);
  const id = useId();

  useCerrarAlSalir(abierto, () => setAbierto(false), nav, hamburguesa);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border-subtle bg-surface">
        <div className="flex h-control-lg items-center gap-inset-md px-gutter">
          <button
            ref={hamburguesa}
            type="button"
            aria-expanded={abierto}
            aria-controls={id}
            onClick={() => setAbierto((v) => !v)}
            className="-ml-inset-sm flex size-control-lg shrink-0 items-center justify-center rounded-control text-content-primary md:hidden"
          >
            {abierto ? (
              <X className="size-icon-md" aria-hidden />
            ) : (
              <Menu className="size-icon-md" aria-hidden />
            )}
            <span className="sr-only">{abierto ? "Cerrar" : "Abrir"} las secciones del panel</span>
          </button>
          {marca}
          <div className="ml-auto">{cuenta}</div>
        </div>
      </header>

      <div className="flex flex-1 md:items-stretch">
        {/* El velo solo existe mientras el cajón está abierto, y solo estorba
            por debajo de `md`, que es donde el cajón tapa algo. */}
        {abierto ? (
          <div
            className="fixed inset-x-0 bottom-0 top-control-lg z-40 bg-scrim md:hidden"
            aria-hidden
            onClick={() => setAbierto(false)}
          />
        ) : null}

        <nav
          id={id}
          ref={nav}
          aria-label="Secciones del panel"
          className={cn(
            /* Empieza por debajo del encabezado, no en el borde de la pantalla:
               si lo tapara, el botón que lo cerró quedaría debajo del cajón y
               solo se podría salir por el velo o con Esc. */
            "fixed bottom-0 left-0 top-control-lg z-50 flex w-72 flex-col overflow-y-auto border-r border-border-subtle bg-surface-sunken p-inset-md",
            "transition-transform motion-reduce:transition-none",
            abierto ? "translate-x-0" : "-translate-x-full",
            "md:static md:z-auto md:w-54 md:shrink-0 md:translate-x-0",
          )}
        >
          {grupos.map((grupo) => (
            <div key={grupo.titulo}>
              <p className="px-inset-sm pt-inset-md pb-inset-xs text-overline uppercase text-content-tertiary">
                {grupo.titulo}
              </p>
              {grupo.rutas.map((r) => {
                const activa = r.href === ruta;
                return (
                  <Link
                    key={r.href}
                    href={r.href}
                    aria-current={activa ? "page" : undefined}
                    /* Tocar un enlace cierra el cajón: si no, la pantalla nueva
                       nace tapada. Va en el evento y no en un efecto sobre la
                       ruta, que provocaría un render en cascada por cada
                       navegación. */
                    onClick={() => setAbierto(false)}
                    className={cn(
                      "flex min-h-control-lg items-center gap-icon-gap rounded-control px-inset-sm text-body-md md:min-h-control-md",
                      "transition-colors motion-reduce:transition-none",
                      activa
                        ? "bg-brand-surface font-semibold text-brand-content"
                        : "text-content-secondary hover:bg-action-secondary-hover",
                    )}
                  >
                    {r.icono}
                    <span className="flex-1">{r.etiqueta}</span>
                    {r.pendientes ? (
                      <span className="rounded-full bg-warning-surface px-inset-xs text-caption font-semibold text-warning-content">
                        {r.pendientes}
                        <span className="sr-only"> pendientes</span>
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="mt-auto pt-inset-lg">{pie}</div>
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
