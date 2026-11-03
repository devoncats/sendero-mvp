import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AlertTriangle, ArrowLeft, CheckCircle, MessageCircle } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { Badge, ButtonLink, Surface, Text } from "@/components/ui";
import { INSUMOS, cuentasDe, proveedor } from "@/data";
import { cn } from "@/lib/cn";
import { enlaceWhatsApp, fechaConDia, hora, mesCorto, mesLargo, precio } from "@/lib/formato";
import { ahoraEnPanama } from "@/lib/reloj";
import { gastos, ingresos, resultado } from "@/lib/salud";

import { AvisoMvp } from "../../../_aviso-mvp";
import { porAtender, saludDe, sesion } from "../../../_cooperativa";
import { Barras } from "../../../_graficas";
import { Cabecera, NUM, TD, TH, Tarjeta } from "../../../_piezas";

function socio(slug: string) {
  return sesion().socios.find((n) => n.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return { title: socio((await params).slug)?.nombre ?? "Emprendimiento" };
}

/**
 * Un emprendimiento, visto por la cooperativa.
 *
 * Responde, en este orden, las cuatro preguntas del PO: cómo está (la
 * alerta), a quién tiene que atender, cómo le fue (las cuentas) y qué le hace
 * falta (insumos y proveedores). La alerta va primero porque es lo único de la
 * pantalla que pide hacer algo.
 *
 * Esto **no** lo ve la familia ni el visitante. Las cuentas de una casa son
 * suyas, y la cooperativa las tiene porque la familia se las reporta.
 */
export default async function EmprendimientoPage({ params }: { params: Promise<{ slug: string }> }) {
  const n = socio((await params).slug);
  if (!n) notFound();

  const s = saludDe(n.slug);
  const cuentas = cuentasDe(n.slug);
  const m = cuentas.at(-1);
  const tareas = porAtender(n.slug, ahoraEnPanama());
  const insumos = INSUMOS.filter((i) => i.emprendimiento === n.slug);

  return (
    <Container ancho="md" as="main" className="py-stack lg:max-w-page-lg">
      <Stack gap="default">
        <Link
          href="/dashboard/emprendimientos"
          className="inline-flex min-h-control-md items-center gap-icon-gap self-start text-body-sm font-medium text-brand"
        >
          <ArrowLeft className="size-icon-sm" aria-hidden />
          Emprendimientos
        </Link>

        <Cabecera
          titulo={n.nombre}
          apunte={`${n.persona.nombre} · ${n.persona.oficio} · ${n.plazas ?? "—"} ${n.unidadPlazas ?? "plazas"}`}
        >
          <ButtonLink
            href={enlaceWhatsApp(n.whatsapp, `Hola, ${n.persona.nombre.split(" ")[0]}. Le escribe la cooperativa.`)}
            externo
            variante="secondary"
            tamano="sm"
          >
            <MessageCircle className="size-icon-sm" aria-hidden />
            Escribirle
          </ButtonLink>
        </Cabecera>

        {/* La alerta. Nunca dice «quiebra»: dice qué pasa y qué hacer. */}
        {s.nivel === "estable" ? (
          <Surface nivel="none" relleno="md" className="border-success-border bg-success-surface" as="section">
            <Inline gap="md" align="center" wrap={false}>
              <CheckCircle className="size-icon-md shrink-0 text-success-content" aria-hidden />
              <Text size="body-md" className="text-success-content">
                Sus cuentas están bien: tiene caja para {Number.isFinite(s.mesesDeCaja) ? Math.floor(s.mesesDeCaja) : "varios"} meses de gastos fijos y va al día con sus proveedores.
              </Text>
            </Inline>
          </Surface>
        ) : (
          <Surface nivel="none"
            relleno="md"
            as="section"
            className={s.nivel === "riesgo" ? "border-danger-border bg-danger-surface" : "border-warning-border bg-warning-surface"}
          >
            <Stack gap="tight">
              <Inline gap="sm" align="center">
                <AlertTriangle
                  className={cn("size-icon-md shrink-0", s.nivel === "riesgo" ? "text-danger-content" : "text-warning-content")}
                  aria-hidden
                />
                <Text as="h2" size="body-md" weight="semibold" tone={s.nivel === "riesgo" ? "danger" : "warning"}>
                  {s.nivel === "riesgo" ? "Necesita apoyo" : "Hay algo que vigilar"}
                </Text>
              </Inline>
              <ul className="grid gap-inset-sm">
                {s.senales.map((x) => (
                  <li key={x.id}>
                    <Text size="body-md">{x.que}</Text>
                    <Text size="body-sm" tone="secondary">
                      Qué hacer: {x.accion}
                    </Text>
                  </li>
                ))}
              </ul>
            </Stack>
          </Surface>
        )}

        <div className="grid items-start gap-inset-md lg:grid-cols-3">
          <div className="grid gap-inset-md lg:col-span-2">
            {m ? (
              <Tarjeta titulo="Cómo le fue" apunte={mesLargo(m.mes)}>
                <dl className="grid grid-cols-2 gap-inset-md sm:grid-cols-3">
                  {[
                    { t: "Por la experiencia", v: precio(m.ingresosRuta) },
                    { t: "Por su cuenta", v: precio(m.ingresosPropios) },
                    { t: "Gastos", v: precio(gastos(m)) },
                    { t: resultado(m) >= 0 ? "Le quedó" : "Perdió", v: precio(Math.abs(resultado(m))) },
                    { t: "En caja", v: precio(m.caja) },
                    { t: "Debe", v: m.deuda > 0 ? `${precio(m.deuda)} · ${m.diasAtraso} días` : "Nada" },
                  ].map((c) => (
                    <div key={c.t}>
                      <dt className="text-overline uppercase text-content-tertiary">{c.t}</dt>
                      <dd className="text-body-lg font-semibold tabular-nums">{c.v}</dd>
                    </div>
                  ))}
                </dl>
              </Tarjeta>
            ) : null}

            {cuentas.length > 0 ? (
              <Tarjeta titulo="Ingresos por mes" apunte="experiencia y por su cuenta">
                <Barras
                  serie={cuentas.map(ingresos)}
                  ejes={cuentas.map((c) => mesCorto(c.mes))}
                  etiqueta={`Ingresos de ${n.nombre} de ${mesLargo(cuentas[0].mes)} a ${mesLargo(cuentas.at(-1)!.mes)}: ${cuentas.map((c) => precio(ingresos(c))).join(", ")}.`}
                />
                <details className="mt-inset-md">
                  <summary className="min-h-control-sm cursor-pointer text-body-sm font-medium text-brand">
                    Ver la tabla de cuentas
                  </summary>
                  <div className="mt-inset-sm overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th scope="col" className={TH}>Mes</th>
                          <th scope="col" className={cn(TH, NUM)}>Ingresos</th>
                          <th scope="col" className={cn(TH, NUM)}>Gastos</th>
                          <th scope="col" className={cn(TH, NUM)}>Caja</th>
                          <th scope="col" className={cn(TH, NUM)}>Ocupación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cuentas.map((c) => (
                          <tr key={c.mes}>
                            <th scope="row" className={cn(TD, "text-left font-normal")}>{mesCorto(c.mes)}</th>
                            <td className={cn(TD, NUM)}>{precio(ingresos(c))}</td>
                            <td className={cn(TD, NUM)}>{precio(gastos(c))}</td>
                            <td className={cn(TD, NUM)}>{precio(c.caja)}</td>
                            <td className={cn(TD, NUM)}>{Math.round(c.ocupacion * 100)} %</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </Tarjeta>
            ) : null}
          </div>

          <div className="grid gap-inset-md">
            <Tarjeta titulo="Por atender" apunte="próximas cuatro semanas">
              {tareas.length > 0 ? (
                <ul className="grid gap-inset-sm">
                  {tareas.map((t) => (
                    <li key={`${t.fecha}-${t.indice}-${t.personas}`}>
                      <Text size="body-md" className="first-letter:uppercase">
                        {fechaConDia(t.fecha)}, {hora(t.bloque.hora)}
                      </Text>
                      <Text size="body-sm" tone="tertiary">
                        {t.personas} personas · {t.bloque.actividad.es} · {precio(t.monto)}
                      </Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text size="body-sm" tone="tertiary">
                  Nadie por atender todavía.
                </Text>
              )}
            </Tarjeta>

            <Tarjeta titulo="Insumos">
              {insumos.length > 0 ? (
                <ul className="grid gap-inset-sm">
                  {insumos.map((i) => {
                    const p = proveedor(i.proveedor);
                    const falta = i.existencias < i.minimo;
                    return (
                      <li key={i.nombre}>
                        <Inline justify="between" gap="sm" align="baseline" wrap={false}>
                          <Text as="span" size="body-md">
                            {i.nombre}
                          </Text>
                          {falta ? <Badge tono="warning">Falta</Badge> : null}
                        </Inline>
                        <Text size="body-sm" tone="tertiary">
                          {i.existencias} de {i.minimo} {i.unidad} · {p?.nombre ?? "sin proveedor"}
                        </Text>
                        {falta && p ? (
                          <a
                            href={enlaceWhatsApp(p.whatsapp, `Hola. Le escribe la cooperativa de El Valle por ${n.nombre}. Necesitamos ${i.minimo - i.existencias} ${i.unidad} de ${i.nombre.toLowerCase()}.`)}
                            rel="noopener noreferrer"
                            className="inline-flex min-h-control-sm items-center text-body-sm font-medium text-brand"
                          >
                            Pedir a {p.nombre.split(" — ")[0]}
                          </a>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Text size="body-sm" tone="tertiary">
                  No ha reportado insumos.
                </Text>
              )}
            </Tarjeta>
          </div>
        </div>

        <AvisoMvp>
          Las cuentas son de muestra. Cuando haya servidor, cada familia las reportará desde su
          teléfono y la cooperativa las verá aquí.
        </AvisoMvp>
      </Stack>
    </Container>
  );
}
