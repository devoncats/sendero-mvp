import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft, Check, CheckCircle, Metricas } from "@/components/icons";
import { Inline, Stack } from "@/components/layout";
import { Input, Surface, Text } from "@/components/ui";
import { negocioDelDueno } from "@/data/panel";
import { cn } from "@/lib/cn";
import { modoPanel, type ModoPanel } from "@/lib/modo-panel";

import { cambiarModo } from "../../_acciones";
import { AvisoMvp } from "../../_aviso-mvp";

export const metadata: Metadata = { title: "Configuración" };

/**
 * La configuración, deliberadamente aburrida.
 *
 * Secciones apiladas y un índice de anclas al lado en pantallas anchas. No hay
 * pestañas con estado ni rutas hijas: son cinco bloques cortos, y cinco rutas
 * para cinco párrafos serían maquinaria por adelantado. El índice hace el mismo
 * trabajo con enlaces, que funcionan sin JavaScript y se pueden compartir.
 *
 * Existe en los dos modos. Es la única pantalla nueva que también ve el modo
 * guiado, porque «dónde cambio mi número» es una pregunta que no depende de
 * cuánto sabe usar un panel.
 */

const SECCIONES = [
  { id: "cuenta", titulo: "Cuenta" },
  { id: "avisos", titulo: "Avisos" },
  { id: "idioma", titulo: "Idioma y región" },
  { id: "modo", titulo: "Modo del panel" },
  { id: "datos", titulo: "Tus datos" },
] as const;

function Seccion({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <Surface relleno="lg" as="section" className="scroll-mt-inset-lg" >
      <Stack gap="default">
        <Text as="h2" id={id} size="heading-xs" weight="semibold">
          {titulo}
        </Text>
        {children}
      </Stack>
    </Surface>
  );
}

/** Una fila de formulario: etiqueta a la izquierda, control a la derecha. */
function Fila({
  htmlFor,
  etiqueta,
  ayuda,
  children,
}: {
  htmlFor: string;
  etiqueta: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-inset-sm border-b border-border-subtle pb-inset-md last:border-0 last:pb-0 md:grid-cols-3 md:items-center">
      <Stack gap="tight">
        <Text as="label" htmlFor={htmlFor} size="label" weight="medium">
          {etiqueta}
        </Text>
        {ayuda ? (
          <Text size="caption" tone="tertiary">
            {ayuda}
          </Text>
        ) : null}
      </Stack>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

/** Una casilla con su etiqueta entera como objetivo táctil. */
function Casilla({ id, texto, marcada }: { id: string; texto: string; marcada?: boolean }) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-control-md cursor-pointer items-center gap-inset-sm text-body-md"
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        defaultChecked={marcada}
        className="size-icon-md shrink-0 accent-brand"
      />
      {texto}
    </label>
  );
}

/**
 * Las dos tarjetas del modo, cada una un botón de envío del mismo formulario.
 *
 * Sin JavaScript y sin radios que luego haya que guardar: tocar una tarjeta
 * cambia el modo y devuelve el panel ya renderizado en el otro. El que está
 * activo lleva el visto, no solo el borde — el color nunca es la única señal.
 */
function TarjetaModo({
  valor,
  actual,
  titulo,
  descripcion,
}: {
  valor: ModoPanel;
  actual: ModoPanel;
  titulo: string;
  descripcion: string;
}) {
  const activo = valor === actual;
  return (
    <button
      type="submit"
      name="modo"
      value={valor}
      aria-current={activo ? "true" : undefined}
      className={cn(
        "flex w-full items-start gap-inset-md rounded-control border p-inset-md text-left transition-colors motion-reduce:transition-none",
        activo
          ? "border-brand bg-brand-surface"
          : "border-border-default bg-surface hover:bg-action-secondary-hover",
      )}
    >
      <span className="mt-inset-xs size-icon-md shrink-0 text-brand">
        {activo ? <CheckCircle className="size-icon-md" aria-hidden /> : null}
      </span>
      <Stack gap="tight">
        <Text as="span" size="body-md" weight="semibold">
          {titulo}
          {activo ? <span className="sr-only"> — el que usas ahora</span> : null}
        </Text>
        <Text as="span" size="body-sm" tone="secondary">
          {descripcion}
        </Text>
      </Stack>
    </button>
  );
}

export default async function ConfiguracionPage() {
  const modo = await modoPanel();
  const negocio = negocioDelDueno();

  return (
    <main className="p-gutter">
      <Stack gap="loose" className="mx-auto w-full max-w-page-lg">
        <Stack gap="default">
          {/* En modo experto la barra lateral ya dice dónde estás; en guiado,
              este enlace es la única salida. Se muestra solo donde hace falta. */}
          {modo === "guiado" ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-control-md w-fit items-center gap-icon-gap text-body-md font-medium text-brand"
            >
              <ArrowLeft className="size-icon-sm" aria-hidden />
              Volver al panel
            </Link>
          ) : null}
          <Stack gap="tight">
            <Text as="h1" size="heading-md" weight="semibold">
              Configuración
            </Text>
            <Text size="body-md" tone="secondary">
              {negocio.nombre}
            </Text>
          </Stack>
        </Stack>

        <AvisoMvp>
          En este MVP los cambios todavía no se guardan: no hay servidor detrás. La única excepción
          es el modo del panel, que sí se recuerda.
        </AvisoMvp>

        <div className="grid gap-stack lg:grid-cols-4 lg:items-start">
          <nav aria-label="Secciones de la configuración" className="hidden lg:block lg:sticky lg:top-inset-lg">
            <Stack gap="none">
              {SECCIONES.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex min-h-control-md items-center rounded-control px-inset-sm text-body-md text-content-secondary hover:bg-action-secondary-hover"
                >
                  {s.titulo}
                </a>
              ))}
            </Stack>
          </nav>

          <Stack gap="default" className="lg:col-span-3">
            <Seccion id="cuenta" titulo="Cuenta">
              <Stack gap="default">
                <Fila htmlFor="nombre" etiqueta="Tu nombre">
                  <Input id="nombre" defaultValue={negocio.persona.nombre} />
                </Fila>
                <Fila
                  htmlFor="whatsapp"
                  etiqueta="WhatsApp"
                  ayuda="Por aquí te escriben los visitantes"
                >
                  <Input id="whatsapp" type="tel" defaultValue={`+${negocio.whatsapp}`} />
                </Fila>
                <Fila htmlFor="correo" etiqueta="Correo" ayuda="Opcional">
                  <Input
                    id="correo"
                    type="email"
                    placeholder="Sin correo. Te avisamos por WhatsApp."
                  />
                </Fila>
              </Stack>
            </Seccion>

            <Seccion id="avisos" titulo="Avisos">
              <Stack gap="tight">
                <Casilla id="aviso-contacto" texto="Cuando alguien te escriba" marcada />
                <Casilla id="aviso-resumen" texto="Resumen del mes, el día 1" marcada />
                <Casilla id="aviso-novedades" texto="Novedades de Sendero" />
              </Stack>
            </Seccion>

            <Seccion id="idioma" titulo="Idioma y región">
              <Stack gap="default">
                <Fila htmlFor="idioma" etiqueta="Idioma del panel">
                  <select
                    id="idioma"
                    name="idioma"
                    defaultValue="es"
                    className="h-control-md w-full rounded-control border border-border-default bg-surface px-inset-md text-body-md text-content-primary"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </Fila>
                <Text size="caption" tone="tertiary">
                  Los precios se muestran siempre en balboas. Tu ficha se traduce al inglés solo si
                  escribes tú la traducción: lo que dices de tu negocio es tuyo.
                </Text>
              </Stack>
            </Seccion>

            <Seccion id="modo" titulo="Modo del panel">
              <form action={cambiarModo}>
                <Stack gap="tight">
                  <TarjetaModo
                    valor="guiado"
                    actual={modo}
                    titulo="Guiado"
                    descripcion="Una sola cosa a la vez, con el paso siguiente escrito. Es como empieza todo el mundo."
                  />
                  <TarjetaModo
                    valor="experto"
                    actual={modo}
                    titulo="Experto"
                    descripcion="Barra lateral, métricas por día y esta configuración. En el teléfono es el mismo panel, con la barra en un cajón."
                  />
                </Stack>
              </form>
            </Seccion>

            <Seccion id="datos" titulo="Tus datos">
              <Stack gap="tight">
                <Inline gap="icon" align="start" wrap={false}>
                  <Check className="mt-inset-xs size-icon-sm shrink-0 text-success" aria-hidden />
                  <Text size="body-md" tone="secondary">
                    Es público lo que se ve en tu ficha: nombre, descripción, productos, horario,
                    zona y tu WhatsApp.
                  </Text>
                </Inline>
                <Inline gap="icon" align="start" wrap={false}>
                  <Metricas className="mt-inset-xs size-icon-sm shrink-0 text-content-tertiary" aria-hidden />
                  <Text size="body-md" tone="secondary">
                    Las visitas y los contactos que ves en Métricas son cuentas, no personas.
                    Sendero no sabe quién miró tu ficha, y nunca vas a poder saberlo tú tampoco.
                  </Text>
                </Inline>
              </Stack>
            </Seccion>
          </Stack>
        </div>
      </Stack>
    </main>
  );
}
