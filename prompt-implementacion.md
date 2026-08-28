# Prompt de implementación — proyecto nuevo, desde cero

> Proyecto **independiente** de `sendero-frontend`. Hereda sus reglas de diseño, no su maquinaria.
> Las reglas viven en `CLAUDE.md` y Claude Code las lee solas en cada sesión: no hace falta
> repetirlas en cada prompt.
>
> Los tokens ya están descargados en `seed/tokens.css` — el proyecto es autónomo desde el minuto uno.

---

## Fase 0 — andamiaje

Una sola sesión. Pega esto:

```
Crea un proyecto Next.js en este directorio (ya contiene CLAUDE.md, seed/ y los prompts —
no los toques):

  pnpm create next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*"

Después:

1. Mueve seed/tokens.css a src/styles/tokens.css e impórtalo desde globals.css antes que
   cualquier otra cosa. No edites su contenido.
2. Configura next/font para Inter variable y Source Serif 4 variable, exponiéndolas como
   --font-inter y --font-source-serif, que es lo que tokens.css espera. Aplícalas en el
   layout raíz con display: swap y preload solo de Inter.
3. Mapea los tokens al @theme de Tailwind v4 en globals.css: colores semánticos, espaciado
   semántico, tamaños de control, radios y tipografía. Quiero escribir bg-surface,
   text-content-secondary, p-inset-md, h-control-md — no bg-[var(--sd-...)].
4. Crea los dos route groups con su densidad y su tema:
   src/app/(public)/layout.tsx  → data-density="editorial"
   src/app/(dashboard)/layout.tsx → data-density="operational"
5. Crea src/components/icons.ts con el re-export curado de Lucide, y src/lib/cn.ts.
6. Una página /tokens-preview que muestre paleta, escala tipográfica y ambas densidades
   lado a lado. Es mi verificación de que la base está bien antes de construir nada.

Al terminar: pnpm lint && pnpm build, arregla lo que falle, y muéstrame /tokens-preview.
```

**No sigas hasta que `/tokens-preview` se vea correcto en claro y en oscuro.** Si la base
de tokens está mal, cada pantalla posterior hereda el error.

---

## Fase 1 — componentes, de abajo hacia arriba

Una sesión por capa. No las mezcles.

```
Construye src/components/layout: Container, Stack, Inline, Grid, Section.
Solo tokens semánticos de densidad — nunca primitivos, o rompes el mecanismo de densidad.
Ningún prop de densidad, ninguna variante "editorial"/"operational".
Server Components. Sin tests ni stories.
Al terminar: pnpm lint && pnpm build.
```

Repite para:

- **`components/ui`** — `Button`, `Text`, `Surface`, `Media`, `Badge`, `Input`
- **`components/patterns`** — `BusinessCard`, `CategoryChip`, `EmptyState`, `OfflineBanner`,
  `FilterSheet` (hoja inferior, con Radix Dialog)

Después de `ui`, pide una página `/components-preview` con todos los primitivos en sus
estados. Es tu red de seguridad: sin Storybook, esa página es la única forma de ver
regresiones antes de que aparezcan dentro de una pantalla.

---

## Fase 2 — datos

```
Crea src/data/ con datos estáticos tipados: las 9 zonas y ~30 negocios repartidos entre
ellas, con las 6 categorías.

- TypeScript strict. Nada de any, nada de as.
- Copy real en español de Panamá, estructurado por claves (no strings sueltos), para que
  el toggle a inglés sea añadir un catálogo y no reescribir componentes.
- Cada negocio con: persona detrás, categoría, zona, descripción, horarios, teléfono,
  referencia de ubicación, y 3-5 fotos.
- Importados en build time. Sin fetch, sin API routes, sin estado global.
- Placeholders de imagen locales en public/, con proporción declarada en cada uso.
```

---

## Fase 3 — pantallas

Una por sesión, empezando por la ficha de negocio en móvil. Plantilla:

```
Implementa [PANTALLA] siguiendo el artboard adjunto.

- Solo con componentes de src/components. Si falta uno, PARA y dime cuál en vez de
  escribir markup suelto en la página.
- Estados obligatorios: carga, vacío, error, sin conexión.
- El CTA de WhatsApp es un enlace wa.me con mensaje prellenado. No un widget de chat.
- Al terminar: pnpm lint && pnpm build, y dime el peso de JS de esta ruta.
```

Orden sugerido — el que deja algo presentable antes:

1. Ficha de negocio (móvil) · 2. Descubrir/home · 3. Zona · 4. Resultados con filtros
5. Estados del sistema · 6. Panel del dashboard · 7. Mi negocio · 8. Fotos
9. Para tu negocio · 10. Acceso

Si el tiempo aprieta, Buscar, Guardados, Productos y Horarios se quedan como artboard
sin implementar. Nadie lo nota en una sustentación.

---

## Fase 4 — el número que sustenta tu proyecto

```
Build de producción. Dame por ruta: JS transferido, LCP estimado y CLS.
Presupuesto: 170 KB de JS, LCP < 2.5 s en 4G.
Para cada ruta que se pase, la causa concreta y la corrección más barata.
Primero el diagnóstico — no optimices todavía.
```

Ese cuadro, con antes y después, vale más en tu sustentación que cualquier captura bonita.

---

## Reglas para ti, no para Claude

- **Una sesión por fase o pantalla.** Contextos largos degradan justo cuando el código se
  vuelve delicado.
- **`pnpm lint && pnpm build` al cierre de cada sesión.** Aquí no hay boundaries por ESLint
  ni tests que te avisen: el build es tu único guardián.
- **Commit por fase**, para poder volver atrás sin perder un día.
- **Cuando proponga instalar una librería, di que no** por defecto.
- **Revisa cada `"use client"` que aparezca.** Es la fuga de rendimiento más común, y tu
  argumento entero es el rendimiento.
