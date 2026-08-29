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

## Reglas duras

Estas no son preferencias. Rompen la propuesta del proyecto si se ignoran.

### Rendimiento

- Presupuesto: **≤ 170 KB de JS transferido en brotli** por ruta pública, **LCP < 2.5 s en 4G**.
  Línea base medida en la Fase 0, con cero componentes propios: **115,3 KB**. Quedan
  **54,7 KB** para todo el producto. Cada `"use client"` se descuenta de ahí.
- **Server Components por defecto.** `"use client"` solo con estado o evento, y cuando
  se añada, justificarlo en una línea.
- **Cero librerías nuevas sin pedir permiso.** Cada dependencia es peso en un Moto G Power.
  Están Next, Tailwind y Lucide. **Radix no está y no hizo falta**: la hoja de filtros
  se resolvió con `<details>` nativo, que ya es accesible por teclado y cuesta 0 KB.
  Antes de instalar un diálogo, pregúntate si de verdad necesitas que sea modal.
- **Sin mapas interactivos JS.** Imagen estática + enlace que abre la app de mapas nativa.
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
