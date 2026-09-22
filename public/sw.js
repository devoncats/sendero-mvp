/*
 * Service worker escrito a mano. Sin next-pwa, sin workbox, sin nada.
 *
 * Lo que tiene que lograr es concreto: que quien armó una ruta por Santa Fe y
 * la guardó pueda abrirla arriba en la montaña, donde no hay señal, y ver las
 * paradas con su horario y su teléfono. Sin esto, «guardar» solo escribe en
 * localStorage un plan que después no se puede ni cargar, porque el HTML no
 * está en ninguna parte.
 *
 * Vive en `public/` y no pasa por el bundler a propósito: Next no le pone hash
 * al contenido de `public/`, así que `/sw.js` es una URL estable y su ámbito es
 * `/` sin tocar cabeceras ni `next.config.ts`.
 */

const VERSION = "v1";

const PAGINAS = `sendero-paginas-${VERSION}`;
const ESTATICO = `sendero-estatico-${VERSION}`;
const RUTA = `sendero-ruta-${VERSION}`;
const MIOS = [PAGINAS, ESTATICO, RUTA];

const CAIDA = "/sin-conexion";

/* Lo mínimo para que la aplicación abra sin red: las pantallas a las que lleva
   la navegación de primer nivel, más la que explica qué pasa. Buscar no entra:
   sin red no hay nada que buscar que no esté ya en guardados. */
const SEMILLA = ["/", "/ruta", "/guardados", CAIDA];

/* El techo de paciencia en 3G. Pasados estos milisegundos se sirve la copia en
   vez de dejar a alguien mirando una pantalla en blanco. */
const ESPERA_RED_MS = 3000;

/* Cuántas URLs se precachean al guardar una ruta. El plan, su zona y sus
   paradas: con doce paradas como máximo, dieciséis cubre el peor caso. */
const TOPE_RUTA = 16;

/* Los trozos de JS, el CSS y las tipografías de una página del portal. Treinta
   cubre de sobra las diez y pico que hay hoy, y pone un techo si algún día se
   dispara. */
const TOPE_ESTATICOS = 30;

self.addEventListener("install", (e) => {
  /*
   * Solo la semilla. NO se precachean los assets con hash, y es una decisión y
   * no un olvido: un manifiesto de URLs hasheadas escrito a mano se queda
   * obsoleto en el primer despliegue y sirve el CSS de la versión anterior, que
   * es peor que no tener caché. La primera visita es online por definición y la
   * caché de ejecución recoge `/_next/static/**` entonces.
   *
   * El hueco, dicho: quien pierde la señal DURANTE su primerísima carga no
   * queda cubierto. Se acepta.
   */
  e.waitUntil(caches.open(PAGINAS).then((c) => c.addAll(SEMILLA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => !MIOS.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** Red primero, con una carrera contra el reloj. Si tarda o falla, la copia. */
async function navegacion(req) {
  try {
    const red = await Promise.race([
      fetch(req),
      new Promise((_, no) => setTimeout(() => no(new Error("lenta")), ESPERA_RED_MS)),
    ]);
    if (red && red.ok) {
      const copia = red.clone();
      caches.open(PAGINAS).then((c) => c.put(req, copia));
    }
    return red;
  } catch {
    /* El plan guardado se busca primero: es lo que alguien vino a ver. */
    return (
      (await caches.match(req, { cacheName: RUTA })) ??
      (await caches.match(req, { cacheName: PAGINAS })) ??
      (await caches.match(CAIDA)) ??
      Response.error()
    );
  }
}

/** Caché primero, sin revalidar: si el contenido cambia, cambia la URL. */
async function estatico(req) {
  const guardado = await caches.match(req, { cacheName: ESTATICO });
  if (guardado) return guardado;
  const red = await fetch(req);
  if (red.ok) {
    const copia = red.clone();
    caches.open(ESTATICO).then((c) => c.put(req, copia));
  }
  return red;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;

  // La Server Action `cambiarModo` es un POST. No se toca nada que no sea GET.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // wa.me, tel:, google.com/maps. Interceptarlos sería un bug, no una mejora.
  if (url.origin !== self.location.origin) return;

  /*
   * El panel NUNCA se sirve de caché, y esto es obligatorio, no precaución.
   * El modo vive en la cookie `sendero-modo` y el dashboard se renderiza por
   * petición: servir una copia le enseñaría al dueño el modo equivocado, o los
   * datos de otra sesión.
   */
  if (url.pathname.startsWith("/dashboard") || url.pathname === "/acceso") return;

  if (req.mode === "navigate") {
    e.respondWith(navegacion(req));
    return;
  }

  // Incluye las tipografías .woff2, que viven bajo /_next/static.
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(estatico(req));
  }

  /*
   * `/_next/image` no tiene rama todavía porque `Media` aún no recibe `src` y
   * no hay ni una petición de imagen. Cuando entren las fotos, la rama va aquí,
   * caché primero y con tope de entradas. No se escribe para un futuro que no
   * ha llegado.
   */
});

self.addEventListener("message", (e) => {
  if (e.data?.tipo !== "guardar-ruta") return;
  e.waitUntil(precachearRuta(e.data.urls ?? [], e.data.estaticos ?? []));
});

async function precachearRuta(urls, estaticos) {
  /*
   * Primero los estáticos que la página dice estar usando. Sin ellos se guarda
   * el HTML y nada más, y la ruta abre sin señal pero también sin estilos y sin
   * tipografías — en cuanto el navegador desaloje su propia caché. El worker no
   * puede adivinar cuáles son porque van con hash; la página que acaba de
   * cargarlos, sí.
   */
  const fijos = await caches.open(ESTATICO);
  for (const url of estaticos.slice(0, TOPE_ESTATICOS)) {
    if (await fijos.match(url)) continue;
    try {
      const r = await fetch(url);
      if (r.ok) await fijos.put(url, r);
    } catch {
      /* Sin red no se precachea. */
    }
  }

  const cache = await caches.open(RUTA);

  // Una ruta a la vez: un plan no se acumula, se reemplaza.
  const viejas = await cache.keys();
  await Promise.all(viejas.map((r) => cache.delete(r)));

  /*
   * Secuencial y no en paralelo. Dieciséis peticiones a la vez en 3G saturan el
   * enlace y compiten con lo que el visitante está mirando en ese momento — que
   * es justo la pantalla desde la que acaba de pulsar «guardar».
   */
  for (const url of urls.slice(0, TOPE_RUTA)) {
    try {
      const r = await fetch(url, { cache: "reload" });
      if (r.ok) await cache.put(url, r);
    } catch {
      /* Sin red no se precachea. Se reintenta la próxima vez que guarde. */
    }
  }
}
