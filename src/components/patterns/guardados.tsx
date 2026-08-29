"use client";

// Cuarto y último "use client" del proyecto. Lo que se guarda vive en el
// teléfono del visitante y en ningún otro sitio: no hay cuentas, no hay
// servidor, y no queremos ninguna de las dos cosas para esto.
//
// Es la pieza que hace verdadera la promesa de la ficha: guardas antes de
// subir a la montaña y el teléfono y la dirección siguen ahí sin señal.

import { useSyncExternalStore } from "react";

import { Bookmark } from "@/components/icons";
import { cn } from "@/lib/cn";

const CLAVE = "sendero:guardados";
/** Para enterarse de los cambios en la misma pestaña; `storage` solo avisa a las otras. */
const EVENTO = "sendero:guardados-cambio";

const VACIO: readonly string[] = [];

/**
 * `getSnapshot` tiene que devolver el mismo objeto mientras nada cambie, o
 * React vuelve a renderizar sin parar. Se cachea contra la cadena cruda.
 */
let crudoCache: string | null = null;
let listaCache: readonly string[] = VACIO;

function leer(): readonly string[] {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo !== crudoCache) {
      crudoCache = crudo;
      listaCache = crudo ? (JSON.parse(crudo) as string[]) : VACIO;
    }
    return listaCache;
  } catch {
    // Modo incógnito, almacenamiento lleno o bloqueado: se sigue sin guardar.
    return VACIO;
  }
}

function suscribir(avisar: () => void) {
  window.addEventListener("storage", avisar);
  window.addEventListener(EVENTO, avisar);
  return () => {
    window.removeEventListener("storage", avisar);
    window.removeEventListener(EVENTO, avisar);
  };
}

/** En el servidor no hay nada guardado. El cliente corrige al hidratar. */
const enElServidor = () => VACIO;

export function useGuardados(): readonly string[] {
  return useSyncExternalStore(suscribir, leer, enElServidor);
}

function alternar(slug: string) {
  try {
    const actual = leer();
    const nueva = actual.includes(slug) ? actual.filter((s) => s !== slug) : [...actual, slug];
    localStorage.setItem(CLAVE, JSON.stringify(nueva));
    window.dispatchEvent(new Event(EVENTO));
  } catch {
    // Sin almacenamiento no se puede guardar. Se falla en silencio: molestar
    // con un error por algo opcional no ayuda a nadie.
  }
}

/**
 * Guardar es `Bookmark`, nunca un corazón. Un corazón dice «me gusta»; aquí se
 * dice «lo quiero a mano cuando no tenga señal», que es otra cosa.
 */
export function BotonGuardar({
  slug,
  nombre,
  className,
}: {
  slug: string;
  nombre: string;
  className?: string;
}) {
  const guardados = useGuardados();
  const guardado = guardados.includes(slug);

  return (
    <button
      type="button"
      onClick={() => alternar(slug)}
      aria-pressed={guardado}
      aria-label={guardado ? `Quitar ${nombre} de guardados` : `Guardar ${nombre}`}
      className={cn(
        "flex size-control-sm items-center justify-center rounded-full bg-surface shadow-raised",
        className,
      )}
    >
      <Bookmark
        className={cn("size-icon-md", guardado ? "fill-brand text-brand" : "text-content-primary")}
        aria-hidden
      />
    </button>
  );
}
