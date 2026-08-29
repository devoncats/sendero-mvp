"use client";

// "use client" justificado: `navigator.onLine` y los eventos online/offline no
// existen en el servidor. Es el segundo y último componente cliente del portal.
//
// Vale su peso: la tesis entera del proyecto es que el visitante anda por la
// montaña o por una isla con señal intermitente. Que la aplicación se lo diga
// —y le recuerde que lo guardado sigue ahí— es la diferencia entre parecer rota
// y parecer preparada.

import { useSyncExternalStore } from "react";

import { OfflineBanner } from "./offline-banner";

function suscribir(avisar: () => void) {
  window.addEventListener("online", avisar);
  window.addEventListener("offline", avisar);
  return () => {
    window.removeEventListener("online", avisar);
    window.removeEventListener("offline", avisar);
  };
}

const enElCliente = () => navigator.onLine;

/** En el servidor se asume conexión: si la página llegó, la había. */
const enElServidor = () => true;

export function AvisoSinConexion() {
  const conectado = useSyncExternalStore(suscribir, enElCliente, enElServidor);
  if (conectado) return null;
  return <OfflineBanner />;
}
