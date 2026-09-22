# Sendero — MVP

Plataforma que da alcance digital a micro y pequeñas empresas de zonas turísticas
**no masificadas de Panamá**: artesanos, fondas, hospedajes familiares, guías locales,
productores del campo.

Proyecto independiente. Hereda las reglas de diseño de `sendero-frontend`, pero **no**
su maquinaria: aquí no hay pipeline de tokens, ni Storybook, ni tests, ni boundaries
por ESLint. La disciplina la sostiene este archivo.

---

## Qué es y qué no es

Es un **directorio de descubrimiento**. El visitante encuentra un negocio y contacta
directo por **WhatsApp o llamada**.

**No hay reservas, pagos, carrito, cuentas de usuario visitante ni backend.**
Los datos son estáticos y tipados, importados en build time. Esto es deliberado: los
negocios objetivo no están bancarizados ni tienen inventario digital. No lo "mejores".

Dos áreas:

| Ruta | Para | Densidad |
|---|---|---|
| `(public)` | Visitantes que descubren | `editorial` |
| `(dashboard)` | Dueños que gestionan su ficha | `operational` |

---

## Las dos personas

**Visitante.** Turista con datos móviles caros o roaming. De pie, una mano, sol en la pantalla.

**Dueño del negocio.** 45–65 años, Android de gama media (referencia: Moto G Power,
Android 11), conectividad intermitente, poca costumbre con interfaces. Nunca ha usado
un dashboard. Necesita que cada pantalla diga qué hacer ahora.

---

## Los dos modos del panel

El dashboard se ve de dos maneras, y la elige el dueño.

| | `guiado` | `experto` |
|---|---|---|
| Por defecto | **sí**, para todo el mundo | solo si se enciende |
| Navegación | cinco enlaces en el encabezado | barra lateral de siete secciones |
| Portada de `/dashboard` | «Lo siguiente»: una sola cosa que hacer | métricas del mes |
| Las cifras | una frase | tarjetas, serie diaria, orígenes y mapa de horas |

**El modo guiado no cambió ni un píxel, y esa es la condición de todo esto.** Quien nunca
pidió el otro modo ve el panel de siempre. Cada modo manda su propio marcado, así que el
guiado tampoco descarga la barra lateral ni las gráficas.

El modo vive en la cookie `sendero-modo`, que lee `modoPanel()` en el servidor y escribe la
Server Action `cambiarModo`. Es un formulario de verdad: funciona sin JavaScript, no pesa,
y el modo llega decidido en el HTML —sin parpadeo—. **A cambio, las rutas del dashboard
dejaron de ser estáticas.** Aquí no hay backend, así que ese precio son milisegundos, pero
está anotado a propósito: es lo único que la cookie se llevó por delante.

En el teléfono el modo experto es el mismo marcado con la barra lateral en un cajón detrás
de la hamburguesa. No hay una vista móvil aparte, ni un enlace duplicado.

Medido, brotli: **guiado 175,5 KB · experto 179,4 KB.** La diferencia son 3,9 KB de HTML
—la barra y los SVG—; los trozos de JavaScript son exactamente los mismos.

---

## El planificador de rutas

El directorio dice qué hay. El planificador dice **qué cabe en el tiempo que tienes, en qué
orden, y qué va a estar abierto cuando pases** — la pregunta que queda cuando el visitante
ya encontró los negocios.

Vive en `/zona/[id]/ruta`, y todo su estado está en la URL: `dias`, `intereses`, `ritmo`,
`desde`, `base` y `dia`. Los filtros son enlaces y los dos selectores un `<form method="get">`
nativo, así que la pantalla entera funciona sin JavaScript. La misma dirección da siempre el
mismo itinerario, hoy y dentro de un mes; por eso se puede compartir por WhatsApp y guardar
sin señal. **El orden de las claves en la URL es fijo a propósito**: dos filtros equivalentes
tienen que producir la misma cadena o el service worker guarda dos entradas para un solo plan.

A cambio, la ruta se renderiza por petición. Es la **segunda** del portal después de
`/buscar`, y está anotado igual que se anotó el precio de la cookie del panel.

### El punto en el mapa

`Negocio.coordenadas` es **opcional y va a seguir siéndolo**. Lo pone el dueño desde
`/dashboard/horario`, con un botón de geolocalización —se pulsa estando parado en el
negocio—, pegando un enlace de Google Maps, o a mano. Un directorio nuevo está lleno de
gente que todavía no lo ha hecho: **sin punto, el negocio sale en las listas igual y solo
queda fuera del orden del recorrido**, en una lista aparte que dice por qué. De los treinta
negocios de ejemplo, tres no lo tienen, y eso es deliberado — uno es el del panel, para que
el pendiente se vea, y los otros para que la degradación no sea código muerto.

La referencia escrita **sigue mandando**. A la casa de zinc verde se llega preguntando; el
punto sirve para ordenar un recorrido, que es otra cosa. Por eso el campo va debajo del
textarea de `referencia` y no encima, y `enlaceMapa` por nombre sigue siendo lo correcto
para una zona y para quien no tiene punto.

### Qué se puede prometer y qué no

No hay API de direcciones ni backend, así que las distancias son **línea recta por un factor
de rodeo de 1.35** (`lib/geo.ts`) y el orden sale de vecino cercano más 2-opt sobre doce
paradas como máximo: cincuenta líneas de aritmética, cero librerías. **La pantalla lo dice
dos veces** —«aproximados, en línea recta»— porque una cifra que parece precisa y no lo es
hace más daño que una redonda.

Las duraciones por parada (`lib/itinerario.ts`) son convenciones del planificador, no datos:
nadie ha cronometrado treinta talleres. Están en `lib/` y no en `data/` por eso mismo.
El **hospedaje es ancla, no parada**: de él se sale y a él se vuelve, y nunca entra en el
orden. Un negocio `sinConfirmar` **sí entra**, marcado — no es lo mismo que cerrado, y
dejarlo fuera sería castigarlo desde el producto.

Y si un negocio abre **más tarde** ese mismo día, el planificador **espera**: no lo descarta.
Descartarlo sería decirle al visitante que no puede comer ahí cuando lo único que pasa es
que la cocina abre a las once. Se prefiere siempre una parada que ya esté abierta —para no
romper el orden geográfico— y solo si ninguna lo está se acepta la espera, tomando la que
abra antes. Este caso existe de verdad en los datos: Fonda La Ensenada cierra los lunes y
abre a las 11:00 los martes, y sin esta regla se caía del plan los dos días.

El esquema SVG del recorrido dibuja el **orden**, que es lo único que una lista no enseña.
No es un mapa y su pie lo dice: sin costa, sin carreteras, sin norte y sin escala.

---

## Reglas duras

Estas no son preferencias. Rompen la propuesta del proyecto si se ignoran.

### Rendimiento

- Presupuesto: **≤ 250 KB de peso total transferido** por ruta pública — HTML, CSS, JS y
  fuentes, comprimido en brotli. No solo JavaScript: contar únicamente el JS dejaba fuera
  97 KB de tipografía, que es el 41 % de una página del portal.
  Medido en la Fase 4: **portal 235,6 KB · dashboard 183,5 KB**. Ambos cumplen.
  El planificador de rutas midió **242,2 KB en su peor caso** (`/zona/santa-fe/ruta?dias=3`,
  que es la zona con más negocios y el HTML máximo). Cabe, con 7,9 KB de margen, y es
  desde el primer día **la página más pesada del portal**: +2,3 KB sobre la portada, todo
  HTML de itinerario. Los trozos de JavaScript son exactamente los mismos.
  Esa ruta ya está en `scripts/medir.mjs`: una ruta pública sin medir no cumple nada.
- **LCP objetivo < 2.5 s en 4G lenta; el portal está en 2,65 s y se acepta.**
  Esos 150 ms son el precio de Source Serif en los titulares, y esa identidad editorial
  se decidió a conciencia. El dashboard, que no la usa, cumple con 2,34 s.
  Si algún día hay que recuperarlos, la vía es un subconjunto de glifos con
  `next/font/local`, no quitar el serif.
- CLS **0** y TBT por debajo de 25 ms en las ocho rutas medidas. Eso no se negocia:
  si una sesión los empeora, se arregla en esa sesión.
- Cada `"use client"` se descuenta del presupuesto. Los ocho que hay suman < 9 KB.
  El quinto es `Navegacion`, que marca la sección activa en el encabezado de escritorio:
  +0,8 KB de JS por ruta, medido.
  El sexto es `patterns/panel.tsx`, y es uno solo para las dos cosas del dashboard que
  se abren y se cierran: el menú de cuenta y el cajón de la barra lateral del modo
  experto. Comparten exactamente lo que justifica el JavaScript —Esc, toque fuera y
  devolver el foco—, así que comparten archivo y directiva.
  Los dos últimos los trajo el planificador de rutas. `patterns/ruta-guardada.tsx`
  guarda el plan en `localStorage` y le avisa al service worker qué precachear.
  `dashboard/horario/_punto.tsx` captura la coordenada del dueño: `navigator.geolocation`
  es un permiso del navegador y no existe en el servidor, y ver salir un punto de un
  enlace pegado es un ciclo de escribir y responder que no cabe en un formulario sin JS.
  El registro del service worker **no** añadió un noveno: vive dentro de
  `aviso-sin-conexion.tsx`, que ya era cliente y ya trataba de este mismo asunto.
- **Server Components por defecto.** `"use client"` solo con estado o evento, y cuando
  se añada, justificarlo en una línea.
- **Cero librerías nuevas sin pedir permiso.** Cada dependencia es peso en un Moto G Power.
  Están Next, Tailwind y Lucide. **Radix no está y no hizo falta**: la hoja de filtros
  se resolvió con `<details>` nativo, que ya es accesible por teclado y cuesta 0 KB.
  Antes de instalar un diálogo, pregúntate si de verdad necesitas que sea modal.
  **Tampoco hay librería de gráficas.** Las del modo experto son SVG en línea servido desde
  el servidor (`app/(dashboard)/_graficas.tsx`): barras, sparklines y mapa de horas, con
  `role="img"` y un `aria-label` que dice el dato en palabras. Las tablas se quedan en HTML,
  que es lo que un lector de pantalla recorre por filas y columnas.
- **Sin mapas interactivos JS.** Imagen estática + enlace que abre la app de mapas nativa.
  El esquema del recorrido en `/zona/[id]/ruta` no es una excepción: es SVG servido desde
  el servidor, sin costa, sin carreteras, sin norte y sin escala, y su pie dice que no es
  un mapa. Dibuja el **orden** de las paradas, que es lo único que una lista no enseña.
- Sin librerías de animación, sin carruseles con autoplay, sin parallax, sin animación al scroll.
- Toda imagen con `next/image` y proporción declarada. Cero saltos de layout.

### Accesibilidad — WCAG 2.2 AA

- Objetivos táctiles **mínimo 44 px** en el portal, 32 px en el dashboard.
- Texto de cuerpo **mínimo 16 px** en el portal.
- **Ninguna acción disponible solo en hover.** No hay hover en un teléfono.
- Contraste 4.5:1 en texto, 3:1 en controles y bordes.
- Un solo `h1` por página, orden de encabezados correcto, foco visible siempre,
  cada control con nombre accesible.
- Respetar `prefers-reduced-motion`.

### Estados

Cada pantalla necesita, diseñados y no como nota al pie: **carga, vacío, error y sin conexión.**
Se asume 3G, no wifi. El dueño del negocio nunca debe perder trabajo por una desconexión.

Y «sin conexión» dejó de ser solo un aviso. Hay un **service worker escrito a mano** en
`public/sw.js` —sin next-pwa, sin workbox— que precachea la portada, los guardados y
`/sin-conexion`; sirve `/_next/static/**` desde caché sin revalidar, porque va con hash;
y resuelve las navegaciones con red primero y una carrera de 3 segundos, que es el techo
de paciencia en 3G. Al guardar una ruta, la página le manda al worker el plan, su zona,
las fichas de sus paradas **y la lista de estáticos que acaba de usar** — sin eso el HTML
se guarda y abre sin estilos en cuanto el navegador desaloja su propia caché.

**El panel nunca se sirve de caché, y eso es obligatorio, no una precaución.** El modo vive
en la cookie `sendero-modo`: servir una copia le enseñaría al dueño el modo equivocado.
Si algún día `/dashboard` abre sin red, la exclusión está rota.

Hueco reconocido y aceptado: quien pierde la señal *durante* su primerísima carga no queda
cubierto. Precachear los assets con hash desde un manifiesto escrito a mano se queda
obsoleto en el primer despliegue y sirve el CSS de la versión anterior, que es peor.

---

## Sistema de diseño

### Tokens

`src/styles/tokens.css` es la **única** fuente de valores. Viene de `sendero-frontend`
y no se edita a mano salvo para añadir un token nuevo, deliberadamente.

**Prohibido:** valores mágicos, arbitrary values de Tailwind (`p-[13px]`, `text-[#0a7]`),
colores hexadecimales sueltos. Si un valor no existe como token, la respuesta correcta es
decirlo, no inventarlo.

Marca: `--sd-color-brand-600` = `oklch(0.52 0.1 182)`, verde azulado — agua y selva.
Acento: `--sd-color-accent-600` = `oklch(0.52 0.11 48)`, ámbar — tierra y artesanía.
**El acento es acento**: categorías, destacados editoriales. No es un segundo botón primario.

### Densidad — la regla que define el layout

El mismo componente mide distinto según el área. **Ningún prop causa esto.**
El layout de ruta pone `data-density="editorial"` o `"operational"` y el componente lo
hereda por la cascada CSS. Un componente nunca sabe en qué área está.

| | `editorial` | `operational` |
|---|---|---|
| Control medio | 48 px | 36 px |
| `--sd-space-stack` | 1.5rem | 1rem |
| Serif en titulares | sí | **nunca** |
| Sensación | revista de viaje | herramienta de trabajo |

Usa siempre los tokens semánticos de densidad (`--sd-space-inset-md`, `--sd-size-control-md`,
`--sd-font-size-heading-lg`), no los primitivos (`--sd-space-4`). Los primitivos no cambian
con la densidad; los semánticos sí. Ese es el mecanismo entero.

### Escritorio — lo que el ancho cambia y lo que no

El teléfono es la pantalla principal y su marcado es el que manda. El escritorio son
variantes `md:` y `lg:` sobre ese mismo marcado: **ningún componente nuevo, ninguna
librería, ningún JavaScript de layout.** Coste medido, gzip: **+1,5 a +2,4 KB por ruta.**

| Punto | Ancho | Qué se enciende |
|---|---|---|
| `md` | 768 px | Las pestañas inferiores se apagan y la navegación sube al encabezado. Zonas a 3 columnas. |
| `lg` | 1024 px | Riel de filtros en `/buscar`. Tarjeta de contacto fija en la ficha y barra inferior apagada. Columna de «Cómo llegar» en zona. Vista previa en el panel. |
| `xl` | 1280 px | El contenedor topa en 1200 px (`--sd-container-xl`). Más allá solo crece el margen. |

Lo que **no** cambia con el ancho:

- **La densidad.** Un monitor no convierte `editorial` en `operational`. Apretar el portal
  en escritorio sería una tercera densidad y rompería el mecanismo entero.
- **El orden del DOM.** Es el del teléfono en todas las pantallas. Lo que se recoloca se
  recoloca con `order` o con columnas explícitas de rejilla, nunca duplicando marcado —
  ni un `h1`, ni un horario, ni un bloque de texto aparecen dos veces en el HTML.
- **El panel guiado sigue sin barra lateral.** Sus cinco pantallas caben en el encabezado,
  y un ancho de sobra no es razón para añadirle un menú a quien nunca usó un panel. La
  barra lateral existe solo en el modo experto, que es otra cosa y se enciende a mano.
- **Los 48 px de control y los 44 de objetivo táctil.** Hay ratón, así que hay hover, pero
  el hover solo refuerza: ninguna acción vive únicamente ahí.

El riel de filtros merece una nota. Sin JavaScript el servidor no sabe el ancho, así que
el atributo `open` de `<details>` solo puede decir una cosa para los dos tamaños. Lo
resuelve `::details-content` en `globals.css`: el atributo sigue decidiendo el teléfono
—plegado en cuanto hay un filtro puesto— y a partir de `lg` el contenido se fuerza visible
y se esconde el resumen. Va bajo `@supports`, así que donde el pseudoelemento no exista
el panel sigue siendo la hoja plegable de siempre.

**El presupuesto de 250 KB es de viewport móvil.** Hoy se cumple a los dos anchos porque
todavía no hay fotos reales: `Media` sin `src` dibuja el marcador y no pesa. En cuanto
entren las fotos, el escritorio pedirá candidatos más grandes y hará falta un segundo
techo medido, no dar por bueno el de móvil.

### Dark mode no es una inversión

La elevación es sombra en claro y superficie más clara en oscuro. El botón primario
invierte la relación texto/relleno. Está resuelto en `tokens.css` bajo `[data-theme='dark']`.
No lo "simplifiques".

### Tipografía

- **Inter** — interfaz y cuerpo, en todas partes.
- **Source Serif 4** — solo titulares editoriales del portal. Nunca en el dashboard.

### Iconos

Solo desde `src/components/icons.ts`, que es **el único archivo autorizado a importar
`lucide-react`**. Añadir un icono es una decisión: nómbralo por lo que significa, no por
lo que dibuja, y prefiere una entrada existente.

Guardar es `Bookmark`, **nunca un corazón**.

Son 35 entradas. Seis las trajo el modo experto —`Metricas`, `Ficha`, `Producto`,
`Ajustes`, `Idioma`, `CerrarSesion`—, y están renombradas por lo que significan en
este producto, no por lo que dibuja Lucide.

Las dos últimas son del planificador: `Ruta` (un recorrido ordenado; `Compass` ya
significa descubrir, que es salir sin plan) y `MiUbicacion` («dónde estoy yo», que no
es «dónde queda esto» — el dueño ve las dos en la misma pantalla). Guardar una ruta
sigue siendo `Bookmark`: no se añadió un glifo para eso.

---

## Estructura

```
src/
├─ app/
│  ├─ (public)/         portal — data-density="editorial"
│  └─ (dashboard)/      dashboard — data-density="operational"
├─ components/
│  ├─ ui/               primitivos: Button, Text, Surface, Media, Badge, Input
│  ├─ layout/           Container, Stack, Inline, Grid, Section
│  ├─ patterns/         BusinessCard, CategoryChip, EmptyState, OfflineBanner
│  └─ icons.ts          el re-export curado de Lucide
├─ data/                datos estáticos tipados — zonas, negocios, categorías
├─ lib/                 utilidades (cn, formatters)
└─ styles/
   ├─ tokens.css        GENERADO — no editar
   └─ globals.css       reset + reglas globales
```

**Las dependencias apuntan hacia abajo.** `components/ui` no importa de `patterns`,
`data` ni `app`. No hay lint que lo verifique aquí — verifícalo tú antes de proponer código.

---

## Contenido

Español de Panamá, con toggle a inglés. Nada de *lorem ipsum*: el copy es la mitad del diseño.

Zonas: Pedasí (Los Santos), Santa Fe (Veraguas), Portobelo (Colón), Guna Yala,
Boquete y Volcán (Chiriquí), Isla Taboga, El Valle de Antón, Bastimentos.

Categorías: Artesanía · Comida · Hospedaje · Experiencias · Transporte local · Productos del campo.

Los negocios son inventados pero plausibles, siempre **con el nombre de la persona detrás**.

---

## Comandos

| | |
|---|---|
| `pnpm dev` | desarrollo |
| `pnpm build` | build de producción — correr al final de cada sesión |
| `pnpm lint` | ESLint |

---

## Cómo medir

**Para y limpia antes de medir:** `pnpm dev` escribe dentro de `.next` mientras corre, y
deja HTML y tipos de una compilación anterior mezclados con los nuevos. Medir así da
números falsos que parecen buenos —o malos— sin razón.

```
# detén el servidor de desarrollo, y luego
rm -rf .next && pnpm build && pnpm start
```

Esto costó dos diagnósticos equivocados en la Fase 4: un build que no compilaba por tipos
corruptos, y un ahorro de 49,7 KB que se dio por fallido cuando había funcionado.

**Grepear el HTML no dice qué se renderiza.** Next serializa el árbol de React dentro de la
página, incluido el `not-found` de la raíz. Una clase puede aparecer en ese payload sin que
ningún elemento la lleve: `font-serif` sale en el HTML del dashboard y aun así ahí no hay
serif. Para saber qué se pinta de verdad, mira el DOM o `document.fonts`.

---

## Al terminar cualquier sesión

Corre `pnpm lint && pnpm build`. Si algo falla, arréglalo antes de entregar el trabajo.
Si añadiste `"use client"`, un icono nuevo o una dependencia, dilo explícitamente.
