"use client";

// "use client" justificado: `navigator.onLine` y los eventos online/offline no
// existen en el servidor.
//
// Vale su peso: la tesis entera del proyecto es que el visitante anda por la
// montaña o por una isla con señal intermitente. Que la aplicación se lo diga
// —y le recuerde que lo guardado sigue ahí— es la diferencia entre parecer rota
// y parecer preparada.
//
// Aquí dentro va también el registro del service worker, y no en un componente
// nuevo. Este archivo ya es cliente, ya está montado una sola vez en el layout
// del portal y ya trata exactamente de este asunto: qué pasa cuando no hay red.
// Ocho líneas no justifican otra directiva ni otro trozo de JavaScript.

import { useEffect, useSyncExternalStore } from "react";

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

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const registrar = () => void navigator.serviceWorker.register("/sw.js").catch(() => {});
    // Después de `load`, no antes: registrar compite por el ancho de banda con
    // el primer pintado, y el portal ya va en 2,65 s de LCP en 4G lenta.
    if (document.readyState === "complete") registrar();
    else window.addEventListener("load", registrar, { once: true });
  }, []);

  if (conectado) return null;
  return <OfflineBanner />;
}
