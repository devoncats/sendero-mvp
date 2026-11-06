import Link from "next/link";

import { AlertTriangle, CheckCircle, ChevronRight, ExternalLink, Proveedor, Solicitud } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { Badge, ButtonLink, Surface, Text } from "@/components/ui";
import { personas } from "@/data";
import { fechaConDia, mesLargo, precio } from "@/lib/formato";
import { iso } from "@/lib/reparto";
import { ahoraEnPanama } from "@/lib/reloj";

import { loSiguiente, resumenDelMes, sesion, solicitudesDeLaCooperativa, ultimoMes } from "../_cooperativa";

/**
 * La portada del modo guiado, para quien administra la cooperativa.
 *
 * El mismo trato que tenía con el dueño: una sola cosa que hacer, lo demás en
 * voz baja, y las cifras como frase. Lo que cambió es de quién es el panel —
 * ya no de una familia, sino del ente que reparte el trabajo entre todas— y
 * con eso, qué es «lo siguiente»: una solicitud que espera, un socio que
 * necesita apoyo, un insumo que falta.
 */

/** Nunca un check para algo pendiente: un visto significa hecho. */
const ICONO = {
  solicitud: Solicitud,
  apoyo: AlertTriangle,
  insumo: Proveedor,
} as const;

const ACCIONES = [
  { href: "/dashboard/solicitudes", titulo: "Ver todas las solicitudes" },
  { href: "/dashboard/emprendimientos", titulo: "Ver cómo están las familias" },
] as const;

export function PanelGuiado() {
  const { coop, experiencia: e } = sesion();
  const [siguiente, ...resto] = loSiguiente();
  const nombre = coop.contacto.nombre.split(" ")[0];
  const Icono = siguiente ? ICONO[siguiente.tipo] : CheckCircle;
  const mes = ultimoMes();
  const resumen = resumenDelMes(mes);

  const hoy = iso(ahoraEnPanama());
  const proximos = solicitudesDeLaCooperativa()
    .filter((s) => (s.estado === "confirmada" || s.estado === "repartida") && s.fecha >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 4);

  return (
    <Container ancho="md" as="main" className="lg:max-w-page-lg">
      <Stack gap="loose" className="items-center py-section lg:grid lg:grid-cols-3 lg:items-start">
        {siguiente ? (
          <Surface
            relleno="xl"
            radio="overlay"
            className={
              siguiente.tipo === "apoyo"
                ? "w-full max-w-page-sm border-warning-border text-center lg:col-span-2 lg:max-w-none"
                : "w-full max-w-page-sm border-brand-border text-center lg:col-span-2 lg:max-w-none"
            }
          >
            <Stack gap="default" align="center">
              <span
                className={
                  siguiente.tipo === "apoyo"
                    ? "flex size-avatar-lg items-center justify-center rounded-full bg-warning-surface text-warning-content"
                    : "flex size-avatar-lg items-center justify-center rounded-full bg-brand-surface text-brand"
                }
                aria-hidden
              >
                <Icono className="size-icon-lg" />
              </span>
              <Stack gap="tight" align="center">
                <Text size="overline" tone="tertiary">
                  Lo siguiente
                </Text>
                <Text as="h1" size="heading-lg" weight="semibold" className="text-balance">
                  {siguiente.titulo}
                </Text>
              </Stack>
              <Text size="body-lg" tone="secondary" className="max-w-prose">
                {siguiente.porque}
              </Text>
              <ButtonLink href={siguiente.href} tamano="lg">
                {siguiente.accion}
              </ButtonLink>
            </Stack>
          </Surface>
        ) : (
          <Surface
            relleno="xl"
            radio="overlay"
            className="w-full max-w-page-sm border-success-border text-center lg:col-span-2 lg:max-w-none"
          >
            <Stack gap="default" align="center">
              <span
                className="flex size-avatar-lg items-center justify-center rounded-full bg-success-surface text-success"
                aria-hidden
              >
                <CheckCircle className="size-icon-lg" />
              </span>
              <Stack gap="tight" align="center">
                <Text size="overline" tone="tertiary">
                  Todo al día
                </Text>
                <Text as="h1" size="heading-lg" weight="semibold">
                  No hay nada pendiente, {nombre}
                </Text>
              </Stack>
              <Text size="body-lg" tone="secondary" className="max-w-prose">
                Ninguna solicitud espera respuesta y todas las familias están bien de cuentas.
              </Text>
              <ButtonLink href={`/experiencia/${e.id}`} variante="secondary" tamano="lg">
                Ver la experiencia como la ven ellos
                <ExternalLink className="size-icon-md" aria-hidden />
              </ButtonLink>
            </Stack>
          </Surface>
        )}

        {/* Todo lo demás, en voz baja */}
        <Stack gap="default" className="w-full max-w-page-sm lg:col-span-2 lg:max-w-none">
          <Text size="overline" tone="tertiary">
            {resto.length > 0 ? `Después, ${resto.length === 1 ? "una cosa más" : `${resto.length} cosas más`}` : "También puedes"}
          </Text>
          <Stack gap="none" as="ul">
            {[...resto.map((p) => ({ href: p.href, titulo: p.titulo })), ...ACCIONES].map((a) => (
              <li key={a.href + a.titulo}>
                <Link
                  href={a.href}
                  className="flex min-h-control-lg items-center gap-inset-md border-b border-border-subtle px-inset-lg text-body-lg text-content-secondary"
                >
                  <span className="flex-1">{a.titulo}</span>
                  <ChevronRight className="size-icon-sm shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </Stack>
        </Stack>

        {/* Las cifras como frase, no como widgets */}
        <Text
          size="body-lg"
          tone="secondary"
          className="max-w-page-sm text-center lg:col-span-2 lg:max-w-none lg:text-left"
        >
          En {mesLargo(mes).split(" ")[0]} llegaron{" "}
          <strong className="font-semibold text-content-primary">
            {resumen.visitantes} visitantes en {resumen.grupos} grupos
          </strong>
          , y las familias recibieron{" "}
          <strong className="font-semibold text-brand">{precio(resumen.recibido)}</strong> por la
          experiencia.
        </Text>

        {/* Lo único que añade el escritorio: quién viene */}
        <aside className="hidden w-full lg:sticky lg:top-inset-lg lg:col-start-3 lg:row-start-1 lg:row-span-3 lg:block">
          <Stack gap="tight">
            <Text size="overline" tone="tertiary">
              Próximos grupos
            </Text>
            {proximos.length > 0 ? (
              <Surface relleno="none" className="overflow-hidden">
                <ul className="divide-y divide-border-subtle">
                  {proximos.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/dashboard/solicitudes/${s.id}`}
                        className="flex flex-col gap-inset-xs p-inset-md hover:bg-action-secondary-hover"
                      >
                        <Inline justify="between" gap="sm" wrap={false}>
                          <Text as="span" size="body-md" weight="semibold" truncate>
                            {s.nombre}
                          </Text>
                          <Badge tono={s.estado === "repartida" ? "success" : "brand"}>
                            {s.estado === "repartida" ? "Repartida" : "Confirmada"}
                          </Badge>
                        </Inline>
                        <Text as="span" size="body-sm" tone="tertiary" className="first-letter:uppercase">
                          {fechaConDia(s.fecha)} · {personas(s)} personas
                        </Text>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Surface>
            ) : (
              <Text size="body-sm" tone="tertiary">
                No hay grupos confirmados todavía.
              </Text>
            )}
          </Stack>
        </aside>
      </Stack>
    </Container>
  );
}
