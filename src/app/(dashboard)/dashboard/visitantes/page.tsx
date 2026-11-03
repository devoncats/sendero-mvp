import type { Metadata } from "next";

import { Visitantes } from "@/components/icons";
import { Container, Stack } from "@/components/layout";
import { EmptyState } from "@/components/patterns";
import { personas } from "@/data";
import { cn } from "@/lib/cn";
import { fechaLarga } from "@/lib/formato";

import { solicitudesDeLaCooperativa } from "../../_cooperativa";
import { Cabecera, Cifra, EstadoBadge, NUM, TD, TH, Tarjeta } from "../../_piezas";

export const metadata: Metadata = { title: "Visitantes" };

/**
 * El registro de visitantes que pidió el PO: quién vino, cuántos, de dónde y
 * en qué idioma. Sale de las solicitudes —atendidas y por delante—, no de un
 * segundo libro que alguien tenga que llevar a mano.
 *
 * Tabla de HTML: se recorre por filas con lector de pantalla y se puede copiar
 * a una hoja de cálculo, que es lo primero que va a querer hacer una
 * cooperativa que rinde cuentas a sus socios.
 */
export default function VisitantesPage() {
  const registro = solicitudesDeLaCooperativa()
    .filter((s) => s.estado !== "nueva" && s.estado !== "cancelada")
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (registro.length === 0) {
    return (
      <Container ancho="md" as="main" className="py-section">
        <EmptyState
          icono={Visitantes}
          titulo="Todavía no hay visitantes registrados"
          descripcion="Cada grupo que confirmes queda anotado aquí, con su procedencia y su idioma."
        />
      </Container>
    );
  }

  const atendidos = registro.filter((s) => s.estado === "atendida");
  const total = atendidos.reduce((t, s) => t + personas(s), 0);
  const procedencias = new Set(atendidos.map((s) => s.procedencia.split(",").at(-1)!.trim()));
  const enIngles = atendidos.filter((s) => s.idioma === "Inglés").length;

  return (
    <Container ancho="md" as="main" className="py-stack lg:max-w-page-lg">
      <Stack gap="default">
        <Cabecera titulo="Visitantes" apunte="El registro de quién ha venido y quién viene" />

        <ul className="grid grid-cols-2 gap-inset-md lg:grid-cols-3">
          <Cifra etiqueta="Atendidos" valor={total} nota={`en ${atendidos.length} grupos`} />
          <Cifra etiqueta="Lugares de origen" valor={procedencias.size} />
          <Cifra etiqueta="Grupos en inglés" valor={enIngles} nota={`de ${atendidos.length}`} />
        </ul>

        <Tarjeta titulo="Registro">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th scope="col" className={TH}>Llegada</th>
                  <th scope="col" className={TH}>Grupo</th>
                  <th scope="col" className={cn(TH, NUM)}>Personas</th>
                  <th scope="col" className={cn(TH, "hidden md:table-cell")}>Idioma</th>
                  <th scope="col" className={TH}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {registro.map((s) => (
                  <tr key={s.id}>
                    <td className={cn(TD, "whitespace-nowrap")}>{fechaLarga(s.fecha).replace(/ de \d{4}$/, "")}</td>
                    <th scope="row" className={cn(TD, "text-left font-normal")}>
                      <span className="block">{s.nombre}</span>
                      <span className="block text-body-sm text-content-tertiary">{s.procedencia}</span>
                    </th>
                    <td className={cn(TD, NUM)}>{personas(s)}</td>
                    <td className={cn(TD, "hidden md:table-cell")}>{s.idioma}</td>
                    <td className={TD}>
                      <EstadoBadge estado={s.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tarjeta>
      </Stack>
    </Container>
  );
}
