"use client";

// Octavo "use client" del proyecto. Mismo patrón exacto que `guardados.tsx`, y
// por la misma razón: lo que alguien planea vive en su teléfono y en ningún
// otro sitio. No hay cuentas, no hay servidor, y no queremos ninguna de las dos
// cosas para esto.
//
// La diferencia con los guardados es que aquí además se le avisa al service
// worker, porque una ruta guardada que no se puede abrir sin señal no es una
// ruta guardada: es una línea en localStorage.

import { useSyncExternalStore } from "react";

import { Bookmark } from "@/components/icons";
import { clasesDeBoton } from "@/components/ui";
import { cn } from "@/lib/cn";

const CLAVE = "sendero:ruta";
/** Para enterarse en la misma pestaña; `storage` solo avisa a las otras. */
const EVENTO = "sendero:ruta-cambio";

export type RutaGuardada = {
  /** La URL del plan, con el día ya resuelto. */
  href: string;
  zona: string;
  /** «Dos días en Santa Fe». */
  titulo: string;
  paradas: number;
  /** ISO. De aquí sale «guardada hace tres días». */
  guardadaEl: string;
};

/**
 * `getSnapshot` tiene que devolver el mismo objeto mientras nada cambie, o
 * React vuelve a renderizar sin parar. Se cachea contra la cadena cruda.
 */
let crudoCache: string | null = null;
let valorCache: RutaGuardada | null = null;

function leer(): RutaGuardada | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo !== crudoCache) {
      crudoCache = crudo;
      valorCache = crudo ? (JSON.parse(crudo) as RutaGuardada) : null;
    }
    return valorCache;
  } catch {
    // Incógnito, almacenamiento lleno o bloqueado: se sigue sin ruta guardada.
    return null;
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
const enElServidor = () => null;

export function useRutaGuardada(): RutaGuardada | null {
  return useSyncExternalStore(suscribir, leer, enElServidor);
}

function guardar(ruta: RutaGuardada, urls: readonly string[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(ruta));
    window.dispatchEvent(new Event(EVENTO));
  } catch {
    // Sin almacenamiento no se puede guardar. Se falla en silencio: molestar
    // con un error por algo opcional no ayuda a nadie.
  }

  /*
   * Y se le pide al service worker que se traiga las páginas. Esto es lo que
   * convierte «guardado» en «se abre sin señal». Si no hay worker todavía —la
   * primera visita, antes de que active— la ruta queda guardada igual y se
   * precachea la próxima vez que se pulse.
   *
   * Van también los estáticos que esta página está usando ahora mismo. Sin
   * esto, el HTML se guarda pero su CSS y sus tipografías dependen de que el
   * navegador todavía los tenga en su propia caché — y cuando los desaloje, la
   * ruta guardada abre sin estilos. El worker no puede adivinar cuáles son; la
   * página sí los sabe, porque acaba de cargarlos.
   */
  const estaticos = performance
    .getEntriesByType("resource")
    .map((e) => e.name)
    .filter((n) => n.includes("/_next/static/"));

  navigator.serviceWorker?.controller?.postMessage({ tipo: "guardar-ruta", urls, estaticos });
}

/**
 * Guardar es `Bookmark`, igual que en las fichas. Un corazón diría «me gusta»;
 * aquí se dice «lo quiero a mano cuando no tenga señal», que es otra cosa.
 *
 * Una ruta a la vez, no una colección: un plan no se acumula, se cambia. Cuando
 * ya hay otra guardada, el botón lo dice y la nombra, para que nadie pierda un
 * itinerario sin enterarse.
 */
export function BotonGuardarRuta({
  ruta,
  urls,
  className,
}: {
  ruta: RutaGuardada;
  urls: readonly string[];
  className?: string;
}) {
  const actual = useRutaGuardada();
  const esta = actual?.href === ruta.href;
  const hayOtra = actual !== null && !esta;

  return (
    <div className={cn("flex flex-col gap-inset-xs", className)}>
      <button
        type="button"
        onClick={() => guardar(ruta, urls)}
        disabled={esta}
        className={clasesDeBoton({ variante: esta ? "ghost" : "secondary" })}
      >
        <Bookmark className={cn("size-icon-sm", esta && "fill-brand text-brand")} aria-hidden />
        {esta ? "Guardada para cuando no haya señal" : hayOtra ? "Guardar esta en su lugar" : "Guardar esta ruta"}
      </button>
      {hayOtra ? (
        <span className="text-caption text-content-tertiary">
          Ahora tienes guardada «{actual.titulo}». Solo cabe una a la vez.
        </span>
      ) : null}
    </div>
  );
}
