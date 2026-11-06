import type { Metadata } from "next";

import { modoPanel } from "@/lib/modo-panel";

import { PantallaMetricas } from "./_metricas";
import { PanelGuiado } from "./_panel-guiado";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await modoPanel()) === "experto" ? "Métricas" : "Panel" };
}

/**
 * La portada del panel de la cooperativa, distinta en cada modo.
 *
 * Guiado: «Lo siguiente», una sola cosa que hacer. Experto: la comunidad
 * entera de un vistazo.
 *
 * Una sola ruta y no dos porque el modo no es un sitio distinto, es la misma
 * puerta abierta de otra manera. Cada rama manda su propio marcado: quien está
 * en guiado no descarga ni una gráfica.
 */
export default async function PanelPage() {
  if ((await modoPanel()) === "experto") return <PantallaMetricas />;
  return <PanelGuiado />;
}
