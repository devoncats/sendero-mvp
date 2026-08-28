# Brief para Claude Design — Sendero MVP

> Pegar en `/design` (Claude Code) o en Claude Design web.
> Antes de pegarlo: adjuntar `seed/tokens.css` y `CLAUDE.md`. Son autónomos — no hacen
> falta el repo `sendero-frontend` ni su pipeline de tokens.

---

## Rol y objetivo

Eres el diseñador de producto de **Sendero**, una plataforma que da alcance digital a
micro y pequeñas empresas de zonas turísticas **no masificadas de Panamá**: artesanos,
fondas, hospedajes familiares, guías locales, productores del campo.

Diseña el MVP completo en artboards sobre un solo canvas. Dos áreas, **un mismo sistema
de diseño con dos densidades**.

No es un marketplace transaccional. **No hay reservas, pagos ni carrito.** El portal es un
directorio de descubrimiento y el cierre siempre es **contacto directo: WhatsApp o llamada.**
Esa decisión es deliberada — los negocios objetivo no están bancarizados ni tienen
inventario digital. Diseña para eso, no lo "mejores".

---

## Las dos personas, y por qué mandan sobre la estética

**Visitante.** Turista nacional o extranjero, ya en el país, con datos móviles caros o roaming.
Descubre una zona y quiere saber a quién comprarle, dónde comer, con quién ir.
Está de pie, con una mano, con sol en la pantalla.

**Dueño del negocio.** 45–65 años, Android de gama media (referencia: Moto G Power, Android 11),
conectividad intermitente, poca costumbre con interfaces. No va a "explorar" la app: necesita
que cada pantalla diga qué hacer ahora. Nunca ha usado un dashboard.

Consecuencias no negociables:

- Objetivos táctiles **mínimo 44 px**, en el portal 48 px. Nunca dos acciones pegadas.
- Texto de cuerpo **mínimo 16 px**. Nada de gris claro sobre blanco para información real.
- **Ninguna acción disponible solo en hover.** No hay hover en un teléfono.
- **Sin mapas interactivos JS.** Imagen estática del mapa + enlace que abre la app de mapas nativa.
- **Sin carruseles con autoplay**, sin parallax, sin animaciones de entrada al hacer scroll.
- Toda imagen con proporción declarada — cero saltos de layout al cargar.
- Cada pantalla necesita su **estado offline y su estado de carga lenta**, diseñados,
  no como nota al pie. Diseña asumiendo 3G, no wifi.
- Contraste WCAG 2.2 AA: 4.5:1 en texto, 3:1 en controles y bordes. Es un gate que rompe el build.
- El dueño del negocio nunca debe perder trabajo por una desconexión. Autoguardado visible.

---

## Sistema de diseño — usar exactamente esto

Los valores vienen del repo. **No inventes colores ni escalas.**

### Color (OKLCH)

| Rol | Valor |
|---|---|
| Marca (`brand-600`) | `oklch(0.52 0.1 182)` — verde azulado, agua y selva |
| Marca hover (`brand-700`) | `oklch(0.445 0.09 182)` |
| Superficie de marca (`brand-100`) | `oklch(0.96 0.028 182)` |
| Acento (`accent-600`) | `oklch(0.52 0.11 48)` — ámbar/tierra, artesanía |
| Superficie de acento (`accent-100`) | `oklch(0.96 0.028 48)` |
| Éxito / Aviso / Peligro / Info | hue 145 / 78 / 25 / 245 |
| Neutrales | hue 75, cálido, de `L=1.0` a `L=0.265` |

Semántica (tema claro): fondo `neutral-50`, superficie `neutral-0`, texto primario `neutral-900`,
secundario `neutral-700`, borde sutil `neutral-150`, borde por defecto `neutral-250`.

**El acento ámbar es acento.** Artesanía, destacados editoriales, etiquetas de categoría.
No es un segundo botón primario.

**Dark mode no es una inversión.** La elevación es sombra en claro y superficie más clara en
oscuro; el botón primario invierte la relación texto/relleno. Diseña ambos temas a conciencia
o no diseñes el oscuro.

### Tipografía

- **Inter variable** — interfaz y cuerpo, en todas partes.
- **Source Serif 4 variable** — **solo** titulares editoriales del portal. Nunca en el dashboard.
- Escala en rem: 0.75 / 0.875 / 1 / 1.125 / 1.25 / 1.5 / 1.875 …

### Densidad — la regla que define todo el layout

| | Portal (`editorial`) | Dashboard (`operational`) |
|---|---|---|
| Altura de control | 48 px (mín. 44) | 36 px |
| Ritmo vertical | espacioso, aire, fotografía protagonista | denso, tabular, escaneable |
| Serif | sí, en titulares | nunca |
| Sensación | revista de viaje | herramienta de trabajo |

Es el **mismo** botón: cambia el contexto, no el componente.

### Iconografía

Solo **Lucide**, y solo glifos que ya existan en el set curado del repo: `ArrowLeft`, `ArrowRight`,
`ChevronDown/Left/Right/Up`, `Menu`, `X`, `Bookmark`, `Check`, `Copy`, `Download`, `ExternalLink`,
`Filter`, `Pencil`, `Plus`, `Search`, `Share`, `Trash`, `Upload`, `AlertCircle`, `CheckCircle`,
`Info`, `Spinner`, `AlertTriangle`, `WifiOff`, `Calendar`, `Clock`, `Image`, `MapPin`, `Phone`.

Guardar es `Bookmark`, **nunca un corazón** — decisión de producto ya documentada.
Si una pantalla necesita un icono que no está en esa lista, **no lo uses**: anótalo al final
en una lista "iconos a añadir", con la razón.

### Referencias formales

Airbnb para el ritmo editorial y la jerarquía de la ficha. OfertaSimple para densidad de
listado y claridad de la propuesta. Apple HIG para el sistema: claridad sobre decoración,
un solo énfasis por pantalla, la tipografía haciendo el trabajo de la jerarquía, bordes y
sombras mínimos y consistentes. **Nada de glassmorphism, gradientes de moda ni sombras de color.**

---

## Requisitos técnicos del artboard

Esto es lo que hace que el diseño sea implementable en vez de una imagen bonita.

1. **Incluye `seed/canvas-tokens.css` en cada artboard**, íntegro y sin editar.
   Es el mismo archivo que corre en producción; solo cambian las familias tipográficas,
   que aquí vienen de Google Fonts.
2. **Todo valor de color, espacio, radio, tamaño de control y tipografía se escribe como
   `var(--sd-…)`.** Ni un hexadecimal, ni un píxel suelto. Si necesitas un valor que no
   existe como token, **no lo inventes**: anótalo en la lista de tokens faltantes y usa
   el más cercano mientras tanto.
3. **La raíz de cada artboard lleva sus atributos**, porque de ahí sale la densidad:
   `<div data-density="editorial" data-theme="light">` para el portal,
   `data-density="operational"` para el dashboard.
4. **Usa los tokens semánticos de densidad, no los primitivos.** `var(--sd-space-inset-md)`
   y `var(--sd-size-control-md)`, nunca `var(--sd-space-4)`. Los semánticos cambian solos
   entre las dos áreas; los primitivos no. Si te equivocas aquí, las dos densidades salen
   idénticas y se pierde la mitad del sistema.
5. **Un artboard por variante de tema**, no un toggle: portal en claro y portal en oscuro
   son dos láminas. Necesito compararlas lado a lado.

### Vocabulario de componentes

Todas las pantallas se construyen con este juego. **Si una pantalla necesita algo que no
está en la lista, párate y propónmelo como componente nuevo antes de dibujarlo** — de lo
contrario acabo con nueve tarjetas distintas y ningún sistema.

`Button` (primary · secondary · ghost · danger) · `Input` · `Field` (label + ayuda + error)
`Text` · `Surface` · `Media` · `Badge` · `CategoryChip` · `BusinessCard` · `EmptyState`
`OfflineBanner` · `FilterSheet` (hoja inferior) · `Dialog` · `Container` · `Stack` · `Inline` · `Grid`

---

## Artboards a producir

Portal a **390 px** (mobile-first); las marcadas ★ también a **1280 px**.
Dashboard a **1280 px**; las marcadas ★ también a **390 px**.

### Portal público — densidad editorial

1. **Descubrir (home)** ★ — buscador por zona, zonas destacadas con fotografía, negocios
   recomendados, franja "cómo funciona" en tres pasos.
2. **Zona** ★ — p. ej. Pedasí: portada, qué encuentras aquí, negocios agrupados por categoría,
   mapa estático, cómo llegar.
3. **Resultados** ★ — listado con filtros por categoría, zona y "abierto ahora". Filtros como
   hoja inferior en móvil, nunca un desplegable diminuto.
4. **Ficha de negocio** ★ — galería, quién es (con nombre y cara de la persona), qué ofrece,
   horarios, ubicación, y **CTA fijo de WhatsApp** siempre visible al hacer scroll.
5. **Buscar** — estado inicial con sugerencias y búsquedas recientes, y estado con resultados.
6. **Guardados** — con su estado vacío bien resuelto, no un texto gris centrado.
7. **Para tu negocio** ★ — landing de captación dirigida al dueño: qué gana, qué cuesta (nada),
   qué necesita para empezar. Lenguaje llano, cero jerga.
8. **Estados del sistema** — un artboard con: sin conexión, sin resultados, error de carga,
   imagen que no cargó, contenido cargando (skeleton).

### Dashboard del negocio — densidad operacional

9. **Acceso** ★ — entrada por número de teléfono y código SMS. Sin contraseñas.
10. **Panel** ★ — qué pasó con mi negocio: visitas a la ficha, contactos recibidos, y sobre todo
    **qué me falta por completar**, con una acción concreta y única.
11. **Mi negocio** — formulario largo de la ficha, con autoguardado visible, progreso de
    completitud y ayuda en contexto para cada campo.
12. **Fotos** ★ — subir, reordenar, eliminar. Con el estado de subida lenta y el de subida
    fallida diseñados: es el punto exacto donde este usuario se pierde.
13. **Productos y servicios** — lista, y alta de un producto con foto, nombre, precio y descripción.
14. **Horarios y ubicación** — horario por día con opción de "cerrado", y ubicación mediante
    referencia escrita más punto en mapa estático.

### Además

- Una lámina de **fundamentos**: color en claro y oscuro, escala tipográfica, ambas densidades
  lado a lado.
- Una lámina de **componentes** derivados de las pantallas: botón, campo, tarjeta de negocio,
  chip de categoría, estado vacío, banner offline.

---

## Contenido de demostración

Español de Panamá, con toggle a inglés en la barra del portal. Nada de *lorem ipsum*:
escribe copy real y creíble, porque el copy es la mitad del diseño.

Zonas: **Pedasí** (Los Santos), **Santa Fe** (Veraguas), **Portobelo** (Colón), **Guna Yala**,
**Boquete** y **Volcán** (Chiriquí), **Isla Taboga**, **El Valle de Antón**, **Bastimentos**.

Categorías: Artesanía · Comida · Hospedaje · Experiencias · Transporte local · Productos del campo.

Negocios de ejemplo (inventados pero plausibles, con el nombre de la persona detrás):
molas guna, sombreros pinta'os, tallas ngäbe, fondas familiares, hospedajes de playa,
fincas de café, guías de senderismo, pescadores que llevan a la isla.

Fotografía: escenas reales de trabajo y de lugar — manos trabajando, el local, el producto,
la persona. **No** fotos de banco con turistas sonriendo genéricos.

---

## Cómo quiero que trabajes

1. Empieza por **Ficha de negocio (móvil)** y **Panel del dashboard**. Son las dos pantallas
   que definen cada área. Muéstramelas y espera mi reacción antes de seguir.
2. Después el resto del portal, luego el resto del dashboard, luego las láminas de sistema.
3. Cada decisión no obvia — jerarquía, qué queda fuera de pantalla, qué se corta en móvil —
   justifícala en una línea junto al artboard.
4. Si algo de este brief entra en conflicto con los tokens adjuntos, **gana el token**.
   Dímelo en vez de resolverlo en silencio.
5. Al terminar, entrega el handoff bundle para Claude Code y una lista de: iconos a añadir,
   tokens que faltaron, y las cinco decisiones que más deberíamos validar con un dueño real.
