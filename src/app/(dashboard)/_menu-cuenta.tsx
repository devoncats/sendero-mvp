import Link from "next/link";

import {
  Ajustes,
  CerrarSesion,
  CheckCircle,
  ExternalLink,
  Idioma,
  MessageCircle,
  Metricas,
} from "@/components/icons";
import { Stack } from "@/components/layout";
import { Badge, Text } from "@/components/ui";
import { SOPORTE_WHATSAPP } from "@/data/panel";
import { ENTES, zona } from "@/data";
import { cn } from "@/lib/cn";
import { enlaceWhatsApp } from "@/lib/formato";
import type { ModoPanel } from "@/lib/modo-panel";

import { cambiarEnte, cambiarModo } from "./_acciones";
import { cooperativa } from "./_cooperativa";

/**
 * El contenido del menú de cuenta. Server Component: aquí está todo el texto,
 * los enlaces y el formulario que cambia de modo. Lo único que corre en el
 * cliente es abrirlo y cerrarlo.
 *
 * El nombre del ente vive aquí y no en el encabezado. Ahí era una
 * etiqueta que no hacía nada y que además desaparecía a partir de `md` para
 * dejar sitio a los enlaces; aquí es el título de la sesión, y debajo están
 * las cosas que se pueden hacer con ella.
 */

const FILA =
  "flex w-full min-h-control-md items-center gap-icon-gap rounded-control px-inset-sm text-left text-body-md text-content-primary transition-colors hover:bg-action-secondary-hover motion-reduce:transition-none";

const ICONO = "size-icon-sm shrink-0 text-content-tertiary";

function Separador() {
  return <div className="my-inset-xs h-px bg-border-subtle" aria-hidden />;
}

export async function ContenidoMenuCuenta({ modo }: { modo: ModoPanel }) {
  const { coop, experiencias, socios } = await cooperativa();
  const z = zona(coop.zona);
  const experto = modo === "experto";

  return (
    <>
      <Stack gap="tight" className="px-inset-sm pb-inset-sm">
        <Text size="body-md" weight="semibold">
          {coop.nombre}
        </Text>
        <Text size="caption" tone="tertiary">
          {coop.contacto.nombre} · {z.nombre}, {z.provincia}
        </Text>
        <Badge tono="brand" className="self-start">
          <CheckCircle className="size-icon-sm" aria-hidden />
          {socios.length} familias socias
        </Badge>
      </Stack>

      {experiencias.map((e) => (
        <Link key={e.id} href={`/experiencia/${e.id}`} className={FILA}>
          <ExternalLink className={ICONO} aria-hidden />
          <span className="flex-1">
            Ver «{e.nombre}»
            <span className="block text-caption text-content-tertiary">Como la ven los visitantes</span>
          </span>
        </Link>
      ))}

      <Separador />

      {/*
        Un formulario, no un manejador: cambiar de modo es una acción de
        servidor que escribe una cookie y devuelve el panel ya renderizado en
        el otro modo. Funciona sin JavaScript y no pesa nada.

        La línea de debajo no es decoración. Un interruptor sin explicación es
        una trampa para quien nunca usó un panel: se toca por curiosidad y la
        herramienta se vuelve otra sin avisar.
      */}
      <form action={cambiarModo}>
        <input type="hidden" name="modo" value={experto ? "guiado" : "experto"} />
        <button type="submit" aria-pressed={experto} className={cn(FILA, "items-start py-inset-xs")}>
          <Metricas className={cn(ICONO, "mt-inset-xs")} aria-hidden />
          <span className="flex-1">
            Modo experto
            <span className="block text-caption text-content-tertiary">
              Barra lateral, métricas por día y configuración completa.
            </span>
          </span>
          <span
            aria-hidden
            className={cn(
              "mt-inset-xs flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none",
              experto ? "bg-action-primary" : "bg-border-default",
            )}
          >
            <span
              className={cn(
                "size-4 rounded-full transition-transform motion-reduce:transition-none",
                experto
                  ? "translate-x-4 bg-action-primary-content"
                  : "translate-x-0 bg-surface",
              )}
            />
          </span>
        </button>
      </form>

      <Link href="/dashboard/configuracion" className={FILA}>
        <Ajustes className={ICONO} aria-hidden />
        Configuración
      </Link>

      <Link href="/dashboard/configuracion" className={FILA}>
        <Idioma className={ICONO} aria-hidden />
        <span className="flex-1">Idioma</span>
        <Text as="span" size="caption" tone="tertiary">
          Español
        </Text>
      </Link>

      {/* Para esta persona el soporte no es un centro de ayuda con artículos:
          es escribirle a alguien. El mensaje va escrito con el nombre del
          ente, para que no tenga que explicar quién es. */}
      <a
        href={enlaceWhatsApp(
          SOPORTE_WHATSAPP,
          `Hola, soy ${coop.contacto.nombre}, de ${coop.nombre}. Necesito ayuda con el panel.`,
        )}
        rel="noopener noreferrer"
        className={FILA}
      >
        <MessageCircle className={ICONO} aria-hidden />
        Ayuda por WhatsApp
      </a>

      <Separador />

      {/*
        Solo para el demo. Sin cuentas no hay otra manera de ver el panel de
        otro ente; el día que haya autenticación esto se borra con
        `cambiarEnte`. La versalita dice que no es parte del producto.
      */}
      <Text size="overline" tone="tertiary" className="px-inset-sm pt-inset-xs">
        Demostración: ver el panel de
      </Text>
      {ENTES.map((x) => (
        <form key={x.id} action={cambiarEnte}>
          <input type="hidden" name="ente" value={x.id} />
          <button type="submit" aria-current={x.id === coop.id ? "true" : undefined} className={FILA}>
            <span className="flex-1 truncate">{x.nombre}</span>
            {x.id === coop.id ? <CheckCircle className="size-icon-sm shrink-0 text-brand" aria-label="Es el actual" /> : null}
          </button>
        </form>
      ))}

      <Separador />

      <Link href="/acceso" className={cn(FILA, "text-danger-content")}>
        <CerrarSesion className="size-icon-sm shrink-0" aria-hidden />
        Cerrar sesión
      </Link>
    </>
  );
}
