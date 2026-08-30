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
import { SLUG_DEMO, SOPORTE_WHATSAPP, negocioDelDueno } from "@/data/panel";
import { zona } from "@/data";
import { cn } from "@/lib/cn";
import { enlaceWhatsApp, fechaLarga } from "@/lib/formato";
import type { ModoPanel } from "@/lib/modo-panel";

import { cambiarModo } from "./_acciones";

/**
 * El contenido del menú de cuenta. Server Component: aquí está todo el texto,
 * los enlaces y el formulario que cambia de modo. Lo único que corre en el
 * cliente es abrirlo y cerrarlo.
 *
 * El nombre del negocio vive aquí y ya no en el encabezado. Ahí era una
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

export function ContenidoMenuCuenta({ modo }: { modo: ModoPanel }) {
  const negocio = negocioDelDueno();
  const z = zona(negocio.zona);
  const experto = modo === "experto";

  return (
    <>
      <Stack gap="tight" className="px-inset-sm pb-inset-sm">
        <Text size="body-md" weight="semibold">
          {negocio.nombre}
        </Text>
        <Text size="caption" tone="tertiary">
          {negocio.persona.nombre} · {z.nombre}, {z.provincia}
        </Text>
        <Badge
          tono={negocio.estadoDato === "verificado" ? "verificado" : "sinConfirmar"}
          className="self-start"
        >
          {negocio.estadoDato === "verificado" && negocio.confirmadoEl ? (
            <>
              <CheckCircle className="size-icon-sm" aria-hidden />
              Confirmada el {fechaLarga(negocio.confirmadoEl)}
            </>
          ) : (
            "Ficha sin confirmar"
          )}
        </Badge>
      </Stack>

      <Link href={`/negocio/${SLUG_DEMO}`} className={FILA}>
        <ExternalLink className={ICONO} aria-hidden />
        Ver mi ficha como la ven ellos
      </Link>

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
          negocio, para que no tenga que explicar quién es. */}
      <a
        href={enlaceWhatsApp(
          SOPORTE_WHATSAPP,
          `Hola, soy ${negocio.persona.nombre}, de ${negocio.nombre}. Necesito ayuda con mi panel.`,
        )}
        rel="noopener noreferrer"
        className={FILA}
      >
        <MessageCircle className={ICONO} aria-hidden />
        Ayuda por WhatsApp
      </a>

      <Separador />

      <Link href="/acceso" className={cn(FILA, "text-danger-content")}>
        <CerrarSesion className="size-icon-sm shrink-0" aria-hidden />
        Cerrar sesión
      </Link>
    </>
  );
}
