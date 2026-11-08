import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import type { ActividadMensual, Combustible } from "@/data";
import { cn } from "@/lib/cn";
import { mesLargo } from "@/lib/formato";
import { modoPanel } from "@/lib/modo-panel";

import { AvisoMvp } from "../../_aviso-mvp";
import { cooperativa } from "../../_cooperativa";
import { Cabecera, NUM, TD, TH, Tarjeta } from "../../_piezas";

export const metadata: Metadata = { title: "Huella de carbono" };

const NOMBRE_COMBUSTIBLE: Record<Combustible["tipo"], string> = {
  glp: "gas",
  gasolina: "gasolina",
  diesel: "diésel",
};

/** «50 kg de gas» · «365 L de diésel». La unidad va pegada al número, siempre. */
function combustible(c: Combustible): string {
  const cantidad = "kg" in c ? `${c.kg} kg` : `${c.litros} L`;
  return `${cantidad} de ${NOMBRE_COMBUSTIBLE[c.tipo]}`;
}

/** Los kilómetros en vehículo ajeno del mes, sumando todos los trayectos. */
function kmAjenos(m: ActividadMensual): number {
  return m.transporte.reduce((t, x) => t + x.km, 0);
}

/**
 * El impacto ambiental de las experiencias del ente: lo que emiten, la energía
 * que gastan y el riesgo climático al que están expuestas.
 *
 * Es solo del modo experto. La barra lateral ya solo existe ahí, pero la
 * dirección se puede escribir a mano: en guiado se vuelve a la portada, que
 * es lo que ese modo promete —una sola cosa que hacer—, en vez de abrir una
 * pantalla de cifras que nadie pidió.
 *
 * Hoy enseña la actividad que reportó cada socio —gas, combustible,
 * electricidad, kilómetros—, que es la materia prima. Las emisiones se
 * calculan de ella en el paso siguiente, con factores que dicen de dónde salen.
 */
export default async function ImpactoPage() {
  if ((await modoPanel()) !== "experto") redirect("/dashboard");

  const c = await cooperativa();
  const { coop } = c;
  const mes = c.ultimoMes();
  const filas = c
    .actividadPorSocio()
    .map(({ negocio, meses }) => ({ negocio, m: meses.find((x) => x.mes === mes) }));

  return (
    <main className="p-gutter">
      <Stack gap="default">
        <Cabecera titulo="Huella de carbono" apunte={`${mesLargo(mes)} · ${coop.nombre}`} />

        <AvisoMvp>
          Las cifras son de muestra: el equipo que recoge los datos todavía no ha entregado los de
          verdad. Por ahora se ve lo que gastó cada familia; las emisiones se calcularán de eso con
          un método publicado, y cada número dirá de dónde sale.
        </AvisoMvp>

        <div className="grid items-start gap-inset-md lg:grid-cols-3">
          <Tarjeta titulo="Emisiones" apunte="alcances 1, 2 y 3">
            <Text size="body-sm" tone="tertiary">
              Aquí irán las emisiones de gases de efecto invernadero de la experiencia, separadas por
              alcance, en kilos de CO₂ equivalente.
            </Text>
          </Tarjeta>

          <Tarjeta titulo="Energía" apunte="consumo y ahorro">
            <Text size="body-sm" tone="tertiary">
              Aquí irá la energía que consumen las familias para atender a los grupos, y aparte la que
              se ahorra al coordinar el reparto desde el portal.
            </Text>
          </Tarjeta>

          <Tarjeta titulo="Riesgo climático" apunte="por emprendimiento">
            <Text size="body-sm" tone="tertiary">
              Aquí irá la exposición de cada parada del recorrido a inundaciones, calor y lluvias
              fuertes.
            </Text>
          </Tarjeta>
        </div>

        <Tarjeta titulo="Lo que gastó cada familia" apunte={mesLargo(mes)}>
          {/* En el teléfono se apaga la columna de trayectos: quedan tres, que caben. */}
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={TH}>
                  Emprendimiento
                </th>
                <th scope="col" className={TH}>
                  Combustible
                </th>
                <th scope="col" className={cn(TH, NUM)}>
                  Electricidad
                </th>
                <th scope="col" className={cn(TH, NUM, "hidden md:table-cell")}>
                  En vehículo ajeno
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ negocio, m }) => (
                <tr key={negocio.slug}>
                  <th scope="row" className={cn(TD, "text-left font-normal")}>
                    <Link
                      href={`/dashboard/emprendimientos/${negocio.slug}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {negocio.nombre}
                    </Link>
                    <span className="block text-body-sm text-content-tertiary">{negocio.persona.nombre}</span>
                  </th>
                  <td className={TD}>
                    {m && m.combustibles.length > 0 ? (
                      <ul>
                        {m.combustibles.map((x) => (
                          <li key={x.tipo}>{combustible(x)}</li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={cn(TD, NUM)}>{m && m.electricidadKWh > 0 ? `${m.electricidadKWh} kWh` : "—"}</td>
                  <td className={cn(TD, NUM, "hidden md:table-cell")}>
                    {m && kmAjenos(m) > 0 ? (
                      <>
                        {kmAjenos(m)} km
                        <span className="block text-body-sm text-content-tertiary">
                          {m.transporte.map((t) => t.motivo).join(" · ")}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Text size="caption" tone="tertiary" className="mt-inset-md">
            Una raya es que no gastó nada de eso en el mes. Quien no tiene red y saca la luz de una
            planta eléctrica la reporta como combustible, no como electricidad.
          </Text>
        </Tarjeta>
      </Stack>
    </main>
  );
}
