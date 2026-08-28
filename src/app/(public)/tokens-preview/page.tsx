import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AlertCircle, Bookmark, CheckCircle, Compass, MapPin, MessageCircle } from "@/components/icons";

export const metadata: Metadata = { title: "Vista de tokens" };

/* ---------------------------------------------------------------- piezas */

function Muestra({ clase, token, rol }: { clase: string; token: string; rol: string }) {
  return (
    <div className="flex items-center gap-inset-md">
      <div className={`size-icon-xl rounded-control border border-border-subtle ${clase}`} />
      <div className="flex min-w-0 flex-col">
        <span className="text-label font-medium">{rol}</span>
        <span className="truncate font-mono text-caption text-content-tertiary">{token}</span>
      </div>
    </div>
  );
}

function Paleta() {
  return (
    <div className="grid grid-cols-2 gap-inset-lg">
      <Muestra clase="bg-background" token="--sd-color-background" rol="Fondo" />
      <Muestra clase="bg-surface" token="--sd-color-surface" rol="Superficie" />
      <Muestra clase="bg-surface-sunken" token="--sd-color-surface-sunken" rol="Superficie hundida" />
      <Muestra clase="bg-content-primary" token="--sd-color-content-primary" rol="Texto primario" />
      <Muestra clase="bg-content-secondary" token="--sd-color-content-secondary" rol="Texto secundario" />
      <Muestra clase="bg-border-default" token="--sd-color-border-default" rol="Borde" />
      <Muestra clase="bg-brand" token="--sd-color-brand" rol="Marca" />
      <Muestra clase="bg-brand-surface" token="--sd-color-brand-surface" rol="Marca, superficie" />
      <Muestra clase="bg-accent" token="--sd-color-accent" rol="Acento" />
      <Muestra clase="bg-accent-surface" token="--sd-color-accent-surface" rol="Acento, superficie" />
      <Muestra clase="bg-success" token="--sd-color-feedback-success" rol="Éxito" />
      <Muestra clase="bg-warning" token="--sd-color-feedback-warning" rol="Aviso" />
      <Muestra clase="bg-danger" token="--sd-color-feedback-danger" rol="Peligro" />
      <Muestra clase="bg-info" token="--sd-color-feedback-info" rol="Información" />
    </div>
  );
}

function Elevacion() {
  return (
    <div className="flex flex-col gap-inset-md rounded-surface bg-background p-inset-lg">
      <div className="rounded-surface bg-surface p-inset-lg shadow-raised">
        <span className="text-body-md">Tarjeta elevada sobre el fondo</span>
      </div>
      <p className="text-body-sm text-content-secondary">
        En claro, la elevación es sombra sobre una superficie del mismo tono. En oscuro, la sombra
        desaparece y la superficie se aclara. No es una inversión.
      </p>
    </div>
  );
}

function Confianza() {
  return (
    <div className="flex flex-col gap-inset-sm">
      <span className="flex items-center gap-icon-gap rounded-control bg-trust-verified-surface px-inset-md py-inset-sm text-body-sm text-success-content">
        <CheckCircle className="size-icon-sm" aria-hidden />
        Datos confirmados hace 3 días
      </span>
      <span className="flex items-center gap-icon-gap rounded-control bg-trust-stale-surface px-inset-md py-inset-sm text-body-sm text-warning-content">
        <AlertCircle className="size-icon-sm" aria-hidden />
        Horario sin confirmar
      </span>
      <span className="flex items-center gap-icon-gap rounded-control bg-trust-unconfirmed-surface px-inset-md py-inset-sm text-body-sm text-content-secondary">
        <AlertCircle className="size-icon-sm" aria-hidden />
        Este negocio todavía no ha entrado
      </span>
    </div>
  );
}

/** Lo mismo, dibujado dos veces. Lo único que cambia es el atributo del padre. */
function PiezaDeDensidad() {
  return (
    <div className="flex flex-col gap-stack rounded-surface border border-border-subtle bg-surface p-inset-lg">
      {/* Sin serif: la densidad gobierna medidas, no familias. El serif es una
          regla de uso —solo titulares del portal— y se demuestra más abajo. */}
      <p className="text-heading-lg font-semibold">Sombreros pintaos</p>
      <div className="flex flex-col gap-stack-tight">
        <div className="h-icon-sm rounded-control bg-surface-sunken" />
        <div className="h-icon-sm rounded-control bg-surface-sunken" />
      </div>
      <div className="flex items-center gap-inset-sm">
        <span className="flex h-control-md items-center gap-icon-gap rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content">
          <MessageCircle className="size-icon-md" aria-hidden />
          Escribir
        </span>
        <span className="flex h-control-md items-center justify-center rounded-control border border-border-default bg-action-secondary px-inset-md text-action-secondary-content">
          <Bookmark className="size-icon-md" aria-hidden />
        </span>
      </div>
    </div>
  );
}

function Escala({ serif }: { serif: boolean }) {
  const familia = serif ? "font-serif" : "font-sans";
  return (
    <div className="flex flex-col gap-inset-md">
      <p className={`${familia} text-display-sm`}>Display sm</p>
      <p className={`${familia} text-heading-lg`}>Heading lg</p>
      <p className={`${familia} text-heading-md`}>Heading md</p>
      <p className="text-heading-sm">Heading sm</p>
      <p className="text-body-lg text-content-secondary">Body lg — el cuerpo nunca baja de 16 px en el portal.</p>
      <p className="text-body-md text-content-secondary">Body md</p>
      <p className="text-body-sm text-content-tertiary">Body sm</p>
      <p className="text-overline uppercase text-content-tertiary">Overline</p>
    </div>
  );
}

function Seccion({ titulo, nota, children }: { titulo: string; nota?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-stack border-t border-border-subtle pt-stack-loose">
      <div className="flex flex-col gap-stack-tight">
        <h2 className="font-serif text-heading-lg">{titulo}</h2>
        {nota ? <p className="max-w-prose text-body-md text-content-secondary">{nota}</p> : null}
      </div>
      {children}
    </section>
  );
}

/* ----------------------------------------------------------------- página */

export default function TokensPreviewPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-section px-gutter py-section">
      <header className="flex flex-col gap-stack-tight">
        <span className="flex items-center gap-icon-gap text-overline uppercase text-content-tertiary">
          <Compass className="size-icon-sm text-brand" aria-hidden />
          Sendero
        </span>
        <h1 className="font-serif text-display-sm">Vista de tokens</h1>
        <p className="max-w-prose text-body-lg text-content-secondary">
          La verificación de la Fase 0. Si esto se ve bien en claro y en oscuro, y las dos densidades
          miden distinto, la base está correcta y se puede construir encima. Si no, cualquier pantalla
          que hagamos después hereda el error.
        </p>
      </header>

      <Seccion
        titulo="Color"
        nota="La misma rejilla, dos veces. La segunda vive dentro de un data-theme=&quot;dark&quot; y no tiene una sola clase distinta."
      >
        <div className="grid gap-stack md:grid-cols-2">
          <div className="flex flex-col gap-inset-md rounded-surface border border-border-subtle bg-surface p-inset-lg">
            <span className="text-label text-content-tertiary">Claro</span>
            <Paleta />
          </div>
          <div
            data-theme="dark"
            className="flex flex-col gap-inset-md rounded-surface border border-border-subtle bg-surface p-inset-lg text-content-primary"
          >
            <span className="text-label text-content-tertiary">Oscuro</span>
            <Paleta />
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Elevación" nota="Sombra en claro, superficie más clara en oscuro. Está resuelto en tokens.css.">
        <div className="grid gap-stack md:grid-cols-2">
          <Elevacion />
          <div data-theme="dark" className="text-content-primary">
            <Elevacion />
          </div>
        </div>
      </Seccion>

      <Seccion
        titulo="Confianza"
        nota="Tres estados que el visitante ve en la ficha y en los listados: confirmado, viejo, sin confirmar."
      >
        <div className="grid gap-stack md:grid-cols-2">
          <Confianza />
          <div data-theme="dark" className="rounded-surface bg-background p-inset-lg text-content-primary">
            <Confianza />
          </div>
        </div>
      </Seccion>

      <Seccion
        titulo="Densidad"
        nota="El mismo marcado exacto, dos veces. Lo único distinto es el data-density del padre: el botón mide 48 px a la izquierda y 36 px a la derecha, y el ritmo vertical pasa de 1.5rem a 1rem."
      >
        <div className="grid gap-stack md:grid-cols-2">
          <div data-density="editorial" className="flex flex-col gap-inset-sm">
            <span className="text-label text-content-tertiary">editorial · portal</span>
            <PiezaDeDensidad />
          </div>
          <div data-density="operational" className="flex flex-col gap-inset-sm">
            <span className="text-label text-content-tertiary">operational · dashboard</span>
            <PiezaDeDensidad />
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Tipografía" nota="Source Serif 4 solo en titulares del portal. Inter en todo lo demás, siempre.">
        <div className="grid gap-stack md:grid-cols-2">
          <div data-density="editorial" className="flex flex-col gap-inset-sm">
            <span className="text-label text-content-tertiary">editorial · con serif</span>
            <Escala serif />
          </div>
          <div data-density="operational" className="flex flex-col gap-inset-sm">
            <span className="text-label text-content-tertiary">operational · nunca serif</span>
            <Escala serif={false} />
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Iconos" nota="Las 27 entradas del set curado. Solo src/components/icons.ts importa lucide-react.">
        <div className="flex flex-wrap gap-inset-lg text-content-secondary">
          <MapPin className="size-icon-lg" aria-label="MapPin" />
          <Bookmark className="size-icon-lg" aria-label="Bookmark" />
          <MessageCircle className="size-icon-lg" aria-label="MessageCircle" />
          <CheckCircle className="size-icon-lg" aria-label="CheckCircle" />
          <AlertCircle className="size-icon-lg" aria-label="AlertCircle" />
          <Compass className="size-icon-lg" aria-label="Compass" />
        </div>
      </Seccion>
    </main>
  );
}
