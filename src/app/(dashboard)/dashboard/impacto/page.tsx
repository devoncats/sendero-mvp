import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import type { ActividadMensual, Combustible } from "@/data";
import { cn } from "@/lib/cn";
import { emisionesDelMes, factoresEnUso, porFuente, sumar } from "@/lib/emisiones";
import { kilos, mesCorto, mesLargo } from "@/lib/formato";
import { modoPanel } from "@/lib/modo-panel";

import { AvisoMvp } from "../../_aviso-mvp";
import { cooperativa } from "../../_cooperativa";
import { BarrasApiladas, MuestraCapa } from "../../_graficas";
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
  const porSocio = c.actividadPorSocio();
  const filas = porSocio.map(({ negocio, meses }) => {
    const m = meses.find((x) => x.mes === mes);
    return { negocio, m, e: m ? emisionesDelMes(m) : undefined };
  });
  const total = sumar(filas.flatMap((f) => (f.e ? [f.e] : [])));

  /*
    Los seis meses, en el orden de los datos. `comprobar()` en data/ambiente.ts
    garantiza que todos los socios tienen los mismos y que son los de las
    cuentas, así que basta con los del primero.
  */
  const meses = porSocio[0]?.meses.map((m) => m.mes) ?? [];
  const delMes = (aaaamm: string) =>
    sumar(porSocio.flatMap(({ meses: ms }) => ms.filter((m) => m.mes === aaaamm).map(emisionesDelMes)));
  const serie = meses.map(delMes);
  const seisMeses = sumar(serie);
  const capas = [
    { nombre: "Alcance 1", que: "lo que queman", valores: serie.map((e) => e.alcance1), suma: seisMeses.alcance1 },
    { nombre: "Alcance 2", que: "luz de la red", valores: serie.map((e) => e.alcance2), suma: seisMeses.alcance2 },
    { nombre: "Alcance 3", que: "trayectos ajenos", valores: serie.map((e) => e.alcance3), suma: seisMeses.alcance3 },
  ];
  const minimo = Math.min(...serie.map((e) => e.total));
  const maximo = Math.max(...serie.map((e) => e.total));

  /*
    Quién carga la huella, en seis meses, de más a menos. Casi siempre es una
    sola fuente por socio, y es la que vale la pena mirar primero.
  */
  const ranking = porSocio
    .map(({ negocio, meses: ms }) => {
      const fuentes = porFuente(ms);
      const kg = fuentes.reduce((t, f) => t + f.kg, 0);
      return { negocio, kg, principal: fuentes[0] };
    })
    .sort((a, b) => b.kg - a.kg);
  /** «12 %», o «<1 %» para lo que existe pero no llega a uno: un 0 diría que no emitió nada. */
  const parte = (kg: number) => {
    const p = seisMeses.total > 0 ? Math.round((kg / seisMeses.total) * 100) : 0;
    return p === 0 && kg > 0 ? "<1 %" : `${p} %`;
  };
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

        {seisMeses.sinFactor.length > 0 ? (
          <Text size="body-sm" tone="secondary">
            Falta en los totales, por no tener factor publicado: {seisMeses.sinFactor.join("; ")}.
          </Text>
        ) : null}

        {meses.length > 0 ? (
          <Tarjeta
            titulo="Seis meses"
            apunte={`${mesLargo(meses[0])} a ${mesLargo(meses.at(-1)!)} · ${kilos(seisMeses.total)} CO₂e`}
          >
            {/* La leyenda va antes que la gráfica: dice qué es cada tono antes de verlo. */}
            <ul className="mb-inset-md flex flex-wrap gap-x-inset-lg gap-y-inset-xs">
              {capas.map((capa, i) => (
                <li key={capa.nombre} className="flex items-center gap-inset-xs text-body-sm">
                  <MuestraCapa capa={i} />
                  <span className="text-content-primary">{capa.nombre}</span>
                  <span className="text-content-tertiary">
                    {capa.que} · {kilos(capa.suma)}
                  </span>
                </li>
              ))}
            </ul>
            <BarrasApiladas
              capas={capas}
              ejes={meses.map(mesCorto)}
              unidad="kg"
              etiqueta={`Emisiones de los socios por mes, de ${mesLargo(meses[0])} a ${mesLargo(meses.at(-1)!)}: entre ${kilos(minimo)} y ${kilos(maximo)} de CO₂e. El alcance 1 suma ${kilos(seisMeses.alcance1)}, el 2 ${kilos(seisMeses.alcance2)} y el 3 ${kilos(seisMeses.alcance3)}.`}
            />
            <Text size="caption" tone="tertiary" className="mt-inset-sm">
              El alcance 3 casi no se ve porque pesa muy poco; su cifra está en la leyenda. Al pasar el
              puntero sobre una barra sale el valor de cada parte.
            </Text>
          </Tarjeta>
        ) : null}

        <Tarjeta titulo="Dónde está la huella" apunte="seis meses, de más a menos">
          {/* En el teléfono se apaga la columna de la parte: quedan tres, que caben. */}
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={TH}>
                  Emprendimiento
                </th>
                <th scope="col" className={cn(TH, NUM)}>
                  CO₂e
                </th>
                <th scope="col" className={cn(TH, NUM, "hidden md:table-cell")}>
                  Parte del total
                </th>
                <th scope="col" className={TH}>
                  Lo que más pesa
                </th>
              </tr>
            </thead>
            <tbody>
              {ranking.map(({ negocio, kg, principal }) => (
                <tr key={negocio.slug}>
                  <th scope="row" className={cn(TD, "text-left font-normal")}>
                    <Link
                      href={`/dashboard/emprendimientos/${negocio.slug}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {negocio.nombre}
                    </Link>
                  </th>
                  <td className={cn(TD, NUM, "font-medium")}>{kg > 0 ? kilos(kg) : "—"}</td>
                  <td className={cn(TD, NUM, "hidden md:table-cell")}>{kg > 0 ? parte(kg) : "—"}</td>
                  <td className={TD}>
                    {principal ? (
                      <>
                        {principal.fuente}
                        <span className="text-content-tertiary">
                          {" "}
                          · {Math.round((principal.kg / kg) * 100)}&nbsp;% de lo suyo
                        </span>
                      </>
                    ) : (
                      "Sin consumo"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>

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
