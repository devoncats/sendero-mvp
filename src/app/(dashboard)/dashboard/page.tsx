import type { Metadata } from "next";

import { modoPanel } from "@/lib/modo-panel";

import { PantallaMetricas } from "./_metricas";
import { PanelGuiado } from "./_panel-guiado";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await modoPanel()) === "experto" ? "Métricas" : "Panel" };
}

/**
 * La portada del panel, que es distinta en cada modo.
 *
 * Guiado: «Lo siguiente», una sola cosa que hacer. Experto: las métricas.
 *
 * Una sola ruta y no dos porque el modo no es un sitio distinto, es la misma
 * puerta abierta de otra manera: el logo, los enlaces de vuelta y los favoritos
 * del navegador siguen apuntando a `/dashboard` sea cual sea el modo.
 *
 * Cada rama manda su propio marcado. Quien está en guiado no descarga ni una
 * gráfica.
 */
export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  if ((await modoPanel()) === "experto") {
    return <PantallaMetricas searchParams={searchParams} />;
  }
  return <PanelGuiado />;
}
