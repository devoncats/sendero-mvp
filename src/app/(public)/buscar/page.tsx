import type { Metadata } from "next";
import Link from "next/link";

import { Search, X } from "@/components/icons";
import { Container, Grid, Inline, Stack } from "@/components/layout";
import { BusinessCard, CategoryChip, EmptyState, FilterGroup, FilterSheet } from "@/components/patterns";
import { Text } from "@/components/ui";
import type { CategoriaId, Negocio, ZonaId } from "@/data";
import { CATEGORIAS, NEGOCIOS, ZONAS, buscar, categoria, zona } from "@/data";

import { resumir } from "../_resumen";

export const metadata: Metadata = { title: "Buscar" };

type Params = { q?: string; zona?: string; categoria?: string };

/**
 * Buscar y Resultados son la misma pantalla.
 *
 * En los artboards estaban separadas, pero al construirlas resultó que hacen lo
 * mismo: filtrar los treinta negocios y mostrarlos. Una sola ruta que lee `q`,
 * `zona` y `categoria` de la URL cubre las dos, y a cambio da algo que ninguna
 * de las dos tenía: el resultado se puede compartir, guardar en favoritos y
 * volver atrás. Todo en el servidor, sin un kilobyte de JavaScript.
 */
function enlaceCon(actual: Params, cambio: Partial<Params>): string {
  const p = new URLSearchParams();
  const final = { ...actual, ...cambio };
  if (final.q) p.set("q", final.q);
  if (final.zona) p.set("zona", final.zona);
  if (final.categoria) p.set("categoria", final.categoria);
  const s = p.toString();
  return s ? `/buscar?${s}` : "/buscar";
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const zonaId = ZONAS.some((z) => z.id === params.zona) ? (params.zona as ZonaId) : undefined;
  const catId = CATEGORIAS.some((c) => c.id === params.categoria)
    ? (params.categoria as CategoriaId)
    : undefined;

  const activos = [zonaId, catId].filter(Boolean).length;
  const hayCriterio = Boolean(q) || activos > 0;

  let resultados: Negocio[] = q ? buscar(q) : [...NEGOCIOS];
  if (zonaId) resultados = resultados.filter((n) => n.zona === zonaId);
  if (catId) resultados = resultados.filter((n) => n.categoria === catId);

  /**
   * El h1 describe lo que se está viendo, no la función de la página. "Artesanía
   * en Santa Fe" le dice a un lector de pantalla —y a quien llega desde un
   * enlace compartido— dónde está parado; "Buscar" no le dice nada.
   */
  const encabezado = q
    ? `Resultados para «${q}»`
    : catId && zonaId
      ? `${categoria(catId).nombre.es} en ${zona(zonaId).nombre}`
      : catId
        ? categoria(catId).nombre.es
        : zonaId
          ? `Negocios en ${zona(zonaId).nombre}`
          : "Buscar";

  const detalle = [
    catId && !q ? null : catId ? categoria(catId).nombre.es : null,
    zonaId && !q ? null : zonaId ? `en ${zona(zonaId).nombre}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      {/*
        En escritorio los filtros dejan de ser una hoja que hay que abrir y se
        quedan a la izquierda, permanentes: abrir, elegir, cerrar y volver a
        mirar el resultado es un peaje que solo tiene sentido cuando no hay
        sitio. El panel sigue siendo el mismo `<details>`.
      */}
      <Stack
        gap="loose"
        className="py-stack lg:grid lg:grid-cols-4 lg:items-start"
      >
        <Text
          as="h1"
          size="heading-lg"
          serif
          weight="semibold"
          className="lg:col-start-2 lg:col-span-3"
        >
          {encabezado}
        </Text>

        <form action="/buscar" method="get" className="lg:col-start-2 lg:col-span-3">
          {/* Los filtros activos viajan con la búsqueda, si no se perderían al enviar */}
          {zonaId ? <input type="hidden" name="zona" value={zonaId} /> : null}
          {catId ? <input type="hidden" name="categoria" value={catId} /> : null}
          <Inline gap="sm" wrap={false}>
            <label htmlFor="q" className="sr-only">
              Buscar zona, negocio o producto
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Buscar zona, negocio o producto"
              className="h-control-md w-full min-w-0 flex-1 rounded-control border border-border-default bg-surface px-inset-md text-body-md text-content-primary placeholder:text-content-tertiary"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex size-control-md shrink-0 items-center justify-center rounded-control bg-action-primary text-action-primary-content"
            >
              <Search className="size-icon-md" aria-hidden />
            </button>
          </Inline>
        </form>

        {/* Lo que está puesto ahora, y cómo quitarlo */}
        {activos > 0 || q ? (
          <Inline gap="sm" className="lg:col-start-2 lg:col-span-3">
            {q ? (
              <CategoryChip href={enlaceCon(params, { q: undefined })} activo={false}>
                «{q}»
                <X className="size-icon-sm" aria-label="Quitar la búsqueda" />
              </CategoryChip>
            ) : null}
            {zonaId ? (
              <CategoryChip href={enlaceCon(params, { zona: undefined })} activo={false}>
                {zona(zonaId).nombre}
                <X className="size-icon-sm" aria-label={`Quitar ${zona(zonaId).nombre}`} />
              </CategoryChip>
            ) : null}
            {catId ? (
              <CategoryChip href={enlaceCon(params, { categoria: undefined })} activo={false}>
                {categoria(catId).nombre.es}
                <X className="size-icon-sm" aria-label={`Quitar ${categoria(catId).nombre.es}`} />
              </CategoryChip>
            ) : null}
          </Inline>
        ) : null}

        {/*
          `abiertoPorDefecto` sigue decidiendo solo el teléfono: cerrado en
          cuanto hay un criterio puesto, que es cuando lo que se quiere ver son
          los resultados. En el monitor el panel está desplegado siempre, y eso
          lo resuelve el CSS y no este atributo.
        */}
        <FilterSheet
          activos={activos}
          resumen={hayCriterio ? `${resultados.length} negocios` : "Los 30 negocios"}
          abiertoPorDefecto={!hayCriterio}
          riel
          className="-mx-gutter sm:mx-0 lg:col-start-1 lg:row-start-1 lg:row-span-4"
        >
          <FilterGroup etiqueta="Zona">
            {ZONAS.map((z) => (
              <CategoryChip
                key={z.id}
                href={enlaceCon(params, { zona: zonaId === z.id ? undefined : z.id })}
                activo={zonaId === z.id}
              >
                {z.nombre}
              </CategoryChip>
            ))}
          </FilterGroup>
          <FilterGroup etiqueta="Categoría">
            {CATEGORIAS.map((c) => (
              <CategoryChip
                key={c.id}
                href={enlaceCon(params, { categoria: catId === c.id ? undefined : c.id })}
                activo={catId === c.id}
              >
                {c.nombre.es}
              </CategoryChip>
            ))}
          </FilterGroup>
        </FilterSheet>

        {resultados.length > 0 ? (
          <Stack className="lg:col-start-2 lg:col-span-3">
            <Text size="body-sm" tone="tertiary">
              {resultados.length} {resultados.length === 1 ? "negocio" : "negocios"}
              {detalle ? ` · ${detalle}` : ""}
            </Text>
            <Grid cols={2} movil={1} gap="lg" as="ul">
              {resultados.map((n) => (
                <li key={n.slug}>
                  <BusinessCard negocio={resumir(n)} orientacion="auto" />
                </li>
              ))}
            </Grid>
          </Stack>
        ) : (
          <div className="lg:col-start-2 lg:col-span-3">
            <EmptyState
              icono={Search}
              titulo={
                zonaId && catId
                  ? `Todavía no hay ${categoria(catId).nombre.es.toLowerCase()} en ${zona(zonaId).nombre}`
                  : "No encontramos nada con eso"
              }
              descripcion={
                zonaId
                  ? `Es una zona pequeña. Hay ${NEGOCIOS.filter((n) => n.zona === zonaId).length} negocios de otras categorías.`
                  : "Prueba con el nombre de una zona, un oficio o un producto — «sombrero», «café», «lancha»."
              }
              accion={
                <Link
                  href={zonaId ? enlaceCon({}, { zona: zonaId }) : "/buscar"}
                  className="inline-flex h-control-md items-center rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content"
                >
                  {zonaId ? `Ver todo en ${zona(zonaId).nombre}` : "Ver los 30 negocios"}
                </Link>
              }
            />
          </div>
        )}
      </Stack>
    </Container>
  );
}
