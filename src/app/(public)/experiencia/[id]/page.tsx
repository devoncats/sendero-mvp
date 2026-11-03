import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AlertCircle, ArrowLeft, Check, MapPin, MessageCircle, X } from "@/components/icons";
import { Container, Inline, Section, Stack } from "@/components/layout";
import { EncabezadoSeccion } from "@/components/patterns";
import { Badge, Button, Input, Media, Surface, Text } from "@/components/ui";
import type { TipoBloque } from "@/data";
import {
  EXPERIENCIAS,
  ente,
  experiencia,
  negocioPorSlug,
  plazasOcupadas,
  precioPorPersona,
  zona,
} from "@/data";
import { enlaceRuta, fechaConDia, hora, precio } from "@/lib/formato";
import { proximosSabados } from "@/lib/reparto";
import { ahoraEnPanama } from "@/lib/reloj";

import { solicitar } from "./_acciones";

export function generateStaticParams() {
  return EXPERIENCIAS.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const e = experiencia((await params).id);
  if (!e) return {};
  return { title: e.nombre, description: e.lema.es };
}

const TIPO: Record<TipoBloque, { etiqueta: string; tono: "brand" | "accent" | "success" | "neutral" | "info" }> = {
  natural: { etiqueta: "Naturaleza", tono: "success" },
  cultural: { etiqueta: "Cultura", tono: "accent" },
  gastronomia: { etiqueta: "Comida", tono: "accent" },
  alojamiento: { etiqueta: "Alojamiento", tono: "brand" },
  traslado: { etiqueta: "Traslado", tono: "neutral" },
};

const ERRORES: Record<string, string> = {
  fecha: "Elige una fecha de llegada.",
  personas: "Tiene que ir al menos una persona adulta.",
  cupo: "No quedan tantas plazas para esa fecha. Elige otra o reduce el grupo.",
  nombre: "Escribe tu nombre: es lo primero que va a ver la cooperativa.",
};

/** Cuántas salidas se ofrecen. Seis sábados son mes y medio: lo que se planea. */
const SALIDAS = 6;

/**
 * La experiencia entera: el recorrido, qué incluye, y la solicitud.
 *
 * Se renderiza por petición, como el planificador, porque las salidas son «los
 * próximos sábados» y el cupo de cada una depende de lo ya confirmado. Es la
 * tercera ruta del portal que lo hace, y la única forma de no ofrecer una fecha
 * que ya pasó.
 */
export default async function ExperienciaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  const e = experiencia((await params).id);
  if (!e) notFound();
  const { error } = await searchParams;
  const mensajeError = error ? ERRORES[error] : undefined;

  const z = zona(e.zona);
  const coop = ente(e.ente);
  const total = precioPorPersona(e);
  const salidas = proximosSabados(ahoraEnPanama(), SALIDAS).map((fecha) => ({
    fecha,
    quedan: Math.max(0, e.cupo - plazasOcupadas(e.id, fecha)),
  }));
  const primeraLibre = salidas.find((s) => s.quedan >= e.minimo)?.fecha;

  const dias = Array.from({ length: e.dias }, (_, i) => i + 1);
  const puntos = e.bloques
    .map((b) => negocioPorSlug(b.emprendimiento)?.coordenadas)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      <Stack gap="loose" className="py-stack">
        <Link
          href="/"
          className="inline-flex min-h-touch-min items-center gap-icon-gap self-start text-body-md font-medium text-brand"
        >
          <ArrowLeft className="size-icon-md" aria-hidden />
          Experiencias
        </Link>

        <Stack gap="default">
          <Stack gap="tight">
            <Text size="overline" tone="brand">
              {z.nombre} · {e.dias} días, {e.noches} noche
            </Text>
            <Text as="h1" size="display-sm" serif weight="semibold" className="text-balance lg:text-display-md">
              {e.nombre}
            </Text>
          </Stack>
          <Text size="body-lg" tone="secondary" className="max-w-prose">
            {e.descripcion.es}
          </Text>
          <Text size="body-md" tone="secondary">
            <strong className="font-semibold text-content-primary">{precio(total)} por persona</strong> ·
            de {e.minimo} a {e.cupo} personas · organiza {coop.nombre.split(",")[0]}
          </Text>
        </Stack>

        {/*
          En escritorio, el recorrido a la izquierda y la solicitud fija a la
          derecha, como la tarjeta de contacto de una ficha. El orden del DOM es
          el del teléfono: primero qué se hace, después pedirlo.
        */}
        <div className="flex flex-col gap-stack-loose lg:grid lg:grid-cols-3 lg:items-start">
          <Stack gap="loose" className="lg:col-span-2">
            {/* El recorrido, día por día */}
            <Section espaciado="none">
              <Stack>
                <EncabezadoSeccion kicker="El recorrido">Qué se hace, y con quién</EncabezadoSeccion>
                {dias.map((dia) => (
                  <Stack key={dia} gap="tight">
                    <Text as="h3" size="overline" tone="tertiary">
                      Día {dia}
                    </Text>
                    <ol className="divide-y divide-border-subtle overflow-hidden rounded-control bg-surface-sunken">
                      {e.bloques
                        .filter((b) => b.dia === dia)
                        .map((b) => {
                          const n = negocioPorSlug(b.emprendimiento)!;
                          const t = TIPO[b.tipo];
                          return (
                            <li key={`${b.dia}-${b.hora}`} className="px-inset-md py-inset-sm">
                              {/* La hora encima y no en una columna: «8:30 a.m.» y
                                  «12:45 p.m.» no miden lo mismo, y un ancho fijo
                                  sería un valor inventado. */}
                              <Stack gap="tight">
                                <Text as="span" size="body-sm" weight="semibold" tone="brand" className="tabular-nums">
                                  {hora(b.hora)}
                                </Text>
                                <Text size="body-md">{b.actividad.es}</Text>
                                <Inline gap="sm" align="center">
                                  <Badge tono={t.tono}>{t.etiqueta}</Badge>
                                  <Text as="span" size="body-sm" tone="tertiary">
                                    {n.persona.nombre} · {n.nombre}
                                  </Text>
                                </Inline>
                              </Stack>
                            </li>
                          );
                        })}
                    </ol>
                  </Stack>
                ))}
                {puntos.length >= 2 ? (
                  <a
                    href={enlaceRuta(puntos)}
                    rel="noopener noreferrer"
                    className="inline-flex min-h-touch-min items-center gap-icon-gap self-start text-body-md font-medium text-brand"
                  >
                    <MapPin className="size-icon-md" aria-hidden />
                    Ver las paradas en la app de mapas
                  </a>
                ) : null}
              </Stack>
            </Section>

            {/* Incluye, no incluye, qué llevar */}
            <Section espaciado="none">
              <Stack>
                <EncabezadoSeccion kicker="Antes de ir">Lo que entra en el precio</EncabezadoSeccion>
                <div className="grid gap-stack sm:grid-cols-2">
                  <Stack gap="tight">
                    <Text as="h3" size="overline" tone="tertiary">
                      Incluye
                    </Text>
                    <ul className="flex flex-col gap-inset-xs">
                      {e.incluye.map((x) => (
                        <li key={x} className="flex items-start gap-icon-gap text-body-md">
                          <Check className="mt-0.5 size-icon-md shrink-0 text-success-content" aria-hidden />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </Stack>
                  <Stack gap="tight">
                    <Text as="h3" size="overline" tone="tertiary">
                      No incluye
                    </Text>
                    <ul className="flex flex-col gap-inset-xs">
                      {e.noIncluye.map((x) => (
                        <li key={x} className="flex items-start gap-icon-gap text-body-md text-content-secondary">
                          <X className="mt-0.5 size-icon-md shrink-0 text-content-tertiary" aria-hidden />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </Stack>
                </div>
                <Stack gap="tight">
                  <Text as="h3" size="overline" tone="tertiary">
                    Qué llevar
                  </Text>
                  <ul className="list-disc pl-inset-lg text-body-md text-content-secondary">
                    {e.llevar.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </Stack>
              </Stack>
            </Section>
          </Stack>

          {/*
            La solicitud. Un formulario de verdad con Server Action: sin
            JavaScript, sin cuenta y sin pago. Lo que sale es un WhatsApp a la
            cooperativa con todo ya escrito.
          */}
          <Surface as="section" relleno="lg" nivel="raised" className="scroll-mt-stack lg:sticky lg:top-stack">
            <form action={solicitar} id="solicitar" className="flex flex-col gap-stack">
              <input type="hidden" name="experiencia" value={e.id} />
              <Stack gap="tight">
                <Text as="h2" size="heading-md" serif weight="semibold">
                  Solicitar
                </Text>
                <Text size="body-sm" tone="secondary">
                  No pagas nada ahora. {coop.contacto.nombre}, de la cooperativa, te confirma por
                  WhatsApp y te dice cómo pagar a cada familia.
                </Text>
              </Stack>

              {mensajeError ? (
                <div
                  role="alert"
                  className="flex items-start gap-icon-gap rounded-control border border-danger-border bg-danger-surface p-inset-sm text-body-sm text-danger-content"
                >
                  <AlertCircle className="size-icon-md shrink-0" aria-hidden />
                  {mensajeError}
                </div>
              ) : null}

              <fieldset className="flex flex-col gap-inset-xs">
                <legend className="mb-inset-xs text-label font-medium">Llegada</legend>
                {salidas.map((s) => {
                  const lleno = s.quedan === 0;
                  return (
                    <label
                      key={s.fecha}
                      className={
                        lleno
                          ? "flex min-h-touch-min items-center gap-inset-sm rounded-control border border-border-subtle px-inset-sm text-content-disabled"
                          : "flex min-h-touch-min cursor-pointer items-center gap-inset-sm rounded-control border border-border-default px-inset-sm has-checked:border-brand has-checked:bg-brand-surface"
                      }
                    >
                      <input
                        type="radio"
                        name="fecha"
                        value={s.fecha}
                        required
                        disabled={lleno}
                        defaultChecked={s.fecha === primeraLibre}
                        className="size-icon-md accent-brand"
                      />
                      <span className="flex-1 text-body-md first-letter:uppercase">{fechaConDia(s.fecha)}</span>
                      <span className="text-body-sm text-content-tertiary">
                        {lleno ? "Lleno" : s.quedan === e.cupo ? "Libre" : `Quedan ${s.quedan}`}
                      </span>
                    </label>
                  );
                })}
                <Text size="caption" tone="tertiary">
                  ¿Otro día? Pídelo en la nota y la cooperativa te dice si se puede.
                </Text>
              </fieldset>

              <div className="grid grid-cols-2 gap-inset-sm">
                <Stack gap="tight">
                  <Text as="label" htmlFor="adultos" size="label" weight="medium">
                    Adultos
                  </Text>
                  <input
                    id="adultos"
                    name="adultos"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={e.cupo}
                    defaultValue={2}
                    required
                    className="h-control-md w-full rounded-control border border-border-default bg-surface px-inset-md text-body-md"
                  />
                </Stack>
                <Stack gap="tight">
                  <Text as="label" htmlFor="ninos" size="label" weight="medium">
                    Niños
                  </Text>
                  <input
                    id="ninos"
                    name="ninos"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={e.cupo - 1}
                    defaultValue={0}
                    className="h-control-md w-full rounded-control border border-border-default bg-surface px-inset-md text-body-md"
                  />
                </Stack>
              </div>

              <Stack gap="tight">
                <Text as="label" htmlFor="nombre" size="label" weight="medium">
                  Tu nombre
                </Text>
                <Input id="nombre" requerido invalido={error === "nombre"} />
              </Stack>

              <Stack gap="tight">
                <Text as="label" htmlFor="procedencia" size="label" weight="medium">
                  De dónde vienes <span className="font-normal text-content-tertiary">(opcional)</span>
                </Text>
                <Input id="procedencia" placeholder="País o ciudad" />
              </Stack>

              <Stack gap="tight">
                <Text as="label" htmlFor="idioma" size="label" weight="medium">
                  Idioma
                </Text>
                <select
                  id="idioma"
                  name="idioma"
                  defaultValue="Español"
                  className="h-control-md w-full rounded-control border border-border-default bg-surface px-inset-md text-body-md"
                >
                  <option>Español</option>
                  <option>Inglés</option>
                </select>
              </Stack>

              <Stack gap="tight">
                <Text as="label" htmlFor="nota" size="label" weight="medium">
                  Nota <span className="font-normal text-content-tertiary">(opcional)</span>
                </Text>
                <textarea
                  id="nota"
                  name="nota"
                  rows={3}
                  maxLength={400}
                  placeholder="Alergias, otra fecha, alguien con movilidad reducida…"
                  className="w-full rounded-control border border-border-default bg-surface px-inset-md py-inset-sm text-body-md placeholder:text-content-tertiary"
                />
              </Stack>

              <Button type="submit" tamano="lg" anchoCompleto>
                <MessageCircle className="size-icon-md" aria-hidden />
                Enviar por WhatsApp
              </Button>
            </form>
          </Surface>
        </div>

        {/* Quien organiza, al pie */}
        <Surface relleno="lg" borde={false} className="bg-surface-sunken">
          <Inline gap="md" align="center" wrap={false}>
            <Media
              proporcion="1/1"
              radio="full"
              semilla={coop.contacto.nombre}
              alt={`Retrato de ${coop.contacto.nombre}`}
              sizes="64px"
              className="size-avatar-lg shrink-0"
            />
            <Stack gap="none" className="min-w-0">
              <Text size="body-md" weight="semibold">
                {coop.contacto.nombre}
              </Text>
              <Text size="body-sm" tone="tertiary">
                {coop.contacto.oficio} · {coop.nombre}
              </Text>
              <Link href="/comunidad" className="mt-inset-xs inline-flex min-h-touch-min items-center text-body-sm font-medium text-brand">
                Quién organiza y cómo se reparte
              </Link>
            </Stack>
          </Inline>
        </Surface>
      </Stack>
    </Container>
  );
}
