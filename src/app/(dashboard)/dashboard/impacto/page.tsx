import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import type { ActividadMensual, Combustible } from "@/data";
import { cn } from "@/lib/cn";
import { emisionesDelMes, factoresEnUso, sumar } from "@/lib/emisiones";
import { kilos, mesLargo } from "@/lib/formato";
import { modoPanel } from "@/lib/modo-panel";

import { AvisoMvp } from "../../_aviso-mvp";
import { cooperativa } from "../../_cooperativa";
import { Cabecera, Cifra, NUM, TD, TH, Tarjeta } from "../../_piezas";

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

/** «0,1501» — el factor con coma decimal y cuatro cifras significativas. */
function decimal(v: number): string {
  return v.toPrecision(4).replace(".", ",");
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
 * Las emisiones salen de `lib/emisiones.ts`: actividad × factor, por alcance.
 * Son de todo lo que gastó cada socio, no solo de lo que gastó atendiendo la
 * experiencia, y la pantalla lo dice. Qué parte se le atribuye a la experiencia
 * es una decisión de método que todavía no se ha tomado.
 */
export default async function ImpactoPage() {
  if ((await modoPanel()) !== "experto") redirect("/dashboard");

  const c = await cooperativa();
  const { coop } = c;
  const mes = c.ultimoMes();
  const filas = c.actividadPorSocio().map(({ negocio, meses }) => {
    const m = meses.find((x) => x.mes === mes);
    return { negocio, m, e: m ? emisionesDelMes(m) : undefined };
  });
  const total = sumar(filas.flatMap((f) => (f.e ? [f.e] : [])));
  /** «Lo que queman · 66 % del total», o solo la primera parte si no hubo emisiones. */
  const nota = (que: string, v: number) =>
    total.total > 0 ? `${que} · ${Math.round((v / total.total) * 100)} % del total` : que;

  return (
    <main className="p-gutter">
      <Stack gap="default">
        <Cabecera titulo="Huella de carbono" apunte={`${mesLargo(mes)} · ${coop.nombre}`} />

        <AvisoMvp>
          Las cifras son de muestra: el equipo que recoge los datos todavía no ha entregado los de
          verdad. El cálculo sí es el de verdad: cada consumo por su factor publicado, que está al pie
          con su fuente.
        </AvisoMvp>

        <ul className="grid grid-cols-2 gap-inset-md lg:grid-cols-4">
          <Cifra etiqueta="Emisiones del mes" valor={kilos(total.total)} nota="CO₂e, de todos los socios" />
          <Cifra etiqueta="Alcance 1" valor={kilos(total.alcance1)} nota={nota("Lo que queman", total.alcance1)} />
          <Cifra etiqueta="Alcance 2" valor={kilos(total.alcance2)} nota={nota("Luz de la red", total.alcance2)} />
          <Cifra etiqueta="Alcance 3" valor={kilos(total.alcance3)} nota={nota("Trayectos ajenos", total.alcance3)} />
        </ul>

        <Text size="body-sm" tone="tertiary">
          Es lo que emitió todo lo que gastaron los socios en el mes, no solo lo que gastaron
          atendiendo la experiencia: una fonda también cocina para su propia clientela.
        </Text>

        {total.sinFactor.length > 0 ? (
          <Text size="body-sm" tone="secondary">
            Falta en el total, por no tener factor publicado: {total.sinFactor.join("; ")}.
          </Text>
        ) : null}

        <div className="grid items-start gap-inset-md lg:grid-cols-2">
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
          {/* En el teléfono se apaga la columna de trayectos: quedan cuatro, que caben. */}
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
                <th scope="col" className={cn(TH, NUM)}>
                  CO₂e
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ negocio, m, e }) => (
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
                  <td className={cn(TD, NUM, "font-medium")}>{e && e.total > 0 ? kilos(e.total) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Text size="caption" tone="tertiary" className="mt-inset-md">
            Una raya es que no gastó nada de eso en el mes. Quien no tiene red y saca la luz de una
            planta eléctrica la reporta como combustible, no como electricidad.
          </Text>
        </Tarjeta>

        <Tarjeta titulo="Factores de emisión" apunte="de dónde sale cada número">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={TH}>
                  Consumo
                </th>
                <th scope="col" className={cn(TH, NUM)}>
                  Factor
                </th>
                <th scope="col" className={cn(TH, "hidden md:table-cell")}>
                  Fuente
                </th>
              </tr>
            </thead>
            <tbody>
              {factoresEnUso().map(({ que, factor }) => (
                <tr key={que}>
                  <th scope="row" className={cn(TD, "text-left font-normal")}>
                    {que}
                    <span className="block text-body-sm text-content-tertiary md:hidden">{factor.fuente}</span>
                  </th>
                  <td className={cn(TD, NUM)}>
                    {decimal(factor.kgPorUnidad)} kg {factor.gases}/{factor.unidad}
                    <span className="block text-body-sm text-content-tertiary">{factor.original}</span>
                  </td>
                  <td className={cn(TD, "hidden md:table-cell")}>
                    <a href={factor.url} className="text-brand hover:underline" rel="noreferrer">
                      {factor.fuente}
                    </a>
                    <span className="block text-body-sm text-content-tertiary">Datos de {factor.anio}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Text size="caption" tone="tertiary" className="mt-inset-md">
            Los factores de combustibles y de la red cuentan solo CO₂. El metano y el óxido nitroso de
            la combustión suman poco: en la tabla de combustión estacionaria de la EPA, menos del 1 %. Los de bus y auto son del parque de Estados Unidos y
            probablemente se quedan cortos para Panamá. La lancha todavía no tiene factor.
          </Text>
        </Tarjeta>
      </Stack>
    </main>
  );
}
