import Link from "next/link";

import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import { cuentasDe } from "@/data";
import { cn } from "@/lib/cn";
import { mesCorto, mesLargo, precio } from "@/lib/formato";
import { ingresos } from "@/lib/salud";

import { AvisoMvp } from "../_aviso-mvp";
import { cooperativa } from "../_cooperativa";
import { Barras } from "../_graficas";
import { Cabecera, Cifra, NUM, Semaforo, TD, TH, Tarjeta } from "../_piezas";

/**
 * La portada del modo experto: la comunidad entera de un vistazo.
 *
 * Antes eran las métricas de una ficha —visitas, contactos, horas—. Ahora el
 * panel es de la cooperativa, y lo que quiere ver quien pidió este modo es el
 * estado de todo a la vez: cuánta gente llegó, cuánto les llegó a las familias,
 * quién necesita apoyo y qué está pendiente.
 *
 * Mismo contrato que antes: SVG desde el servidor, tablas de HTML, cero
 * JavaScript de cliente.
 */
export async function PantallaMetricas() {
  const c = await cooperativa();
  const { coop, socios } = c;
  const mes = c.ultimoMes();
  const resumen = c.resumenDelMes(mes);
  const lista = c.sociosPorSalud();
  const nuevas = c.solicitudes().filter((s) => s.estado === "nueva").length;
  const enApoyo = lista.filter((x) => x.salud.nivel === "riesgo").length;
  const enAtencion = lista.filter((x) => x.salud.nivel === "atencion").length;

  // Lo que llegó por la experiencia, mes a mes, sumando a todas las familias.
  const meses = cuentasDe(socios[0].slug).map((m) => m.mes);
  const porMes = meses.map((m) =>
    socios.reduce((t, n) => t + (cuentasDe(n.slug).find((x) => x.mes === m)?.ingresosRuta ?? 0), 0),
  );

  return (
    <main className="p-gutter">
      <Stack gap="default">
        <Cabecera titulo="Métricas" apunte={`${mesLargo(mes)} · ${coop.nombre}`} />

        <AvisoMvp>
          Las cifras son de muestra: no hay servidor detrás todavía. Están cuadradas entre sí para
          que se vea cómo se leerán cuando las reporten las familias.
        </AvisoMvp>

        <ul className="grid grid-cols-2 gap-inset-md lg:grid-cols-4">
          <Cifra etiqueta="Visitantes" valor={resumen.visitantes} nota={`en ${resumen.grupos} grupos atendidos`} />
          <Cifra etiqueta="Llegó a las familias" valor={precio(resumen.recibido)} nota="por la experiencia" />
          <Cifra
            etiqueta="Necesitan apoyo"
            valor={enApoyo}
            tono={enApoyo > 0 ? "danger" : "success"}
            nota={enAtencion > 0 ? `y ${enAtencion} en atención` : "de las familias socias"}
          />
          <Cifra
            etiqueta="Solicitudes nuevas"
            valor={nuevas}
            tono={nuevas > 0 ? "warning" : undefined}
            nota="esperando respuesta"
          />
        </ul>

        <div className="grid items-start gap-inset-md lg:grid-cols-3">
          <div className="grid gap-inset-md lg:col-span-2">
            <Tarjeta titulo="Lo que llegó por la experiencia" apunte="por mes, a todas las familias">
              <Barras
                serie={porMes}
                ejes={meses.map(mesCorto)}
                etiqueta={`Ingresos por la experiencia de ${mesLargo(meses[0])} a ${mesLargo(meses.at(-1)!)}: de ${precio(Math.min(...porMes))} a ${precio(Math.max(...porMes))}.`}
              />
            </Tarjeta>

            <Tarjeta titulo="Las familias" apunte={mesLargo(mes)}>
              {/* En el teléfono se apaga la columna de caja: quedan tres, que caben. */}
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th scope="col" className={TH}>
                      Emprendimiento
                    </th>
                    <th scope="col" className={TH}>
                      Estado
                    </th>
                    <th scope="col" className={cn(TH, NUM)}>
                      Ingresos
                    </th>
                    <th scope="col" className={cn(TH, NUM, "hidden md:table-cell")}>
                      Caja
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map(({ negocio, salud }) => {
                    const m = cuentasDe(negocio.slug).at(-1);
                    return (
                      <tr key={negocio.slug}>
                        <th scope="row" className={cn(TD, "text-left font-normal")}>
                          <Link href={`/dashboard/emprendimientos/${negocio.slug}`} className="font-medium text-brand hover:underline">
                            {negocio.nombre}
                          </Link>
                          <span className="block text-body-sm text-content-tertiary">{negocio.persona.nombre}</span>
                        </th>
                        <td className={TD}>
                          <Semaforo nivel={salud.nivel} />
                        </td>
                        <td className={cn(TD, NUM)}>{m ? precio(ingresos(m)) : "—"}</td>
                        <td className={cn(TD, NUM, "hidden md:table-cell")}>{m ? precio(m.caja) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Tarjeta>
          </div>

          <div className="grid gap-inset-md">
            <Tarjeta titulo="Insumos por debajo del mínimo">
              {c.insumosBajos().length > 0 ? (
                <ul className="grid gap-inset-sm">
                  {c.insumosBajos().map((i) => (
                    <li key={i.emprendimiento + i.nombre}>
                      <Text size="body-md">{i.nombre}</Text>
                      <Text size="caption" tone="tertiary">
                        {socios.find((n) => n.slug === i.emprendimiento)?.nombre} · {i.existencias} de {i.minimo} {i.unidad}
                      </Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text size="body-sm" tone="tertiary">
                  A nadie le falta nada.
                </Text>
              )}
              <Link href="/dashboard/proveedores" className="mt-inset-md inline-flex min-h-control-sm items-center text-body-sm font-medium text-brand">
                Ver proveedores
              </Link>
            </Tarjeta>
          </div>
        </div>
      </Stack>
    </main>
  );
}
