import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { experiencia } from "@/data";

/**
 * Si la experiencia existe se decide aquí y no en la página: esta ruta tiene
 * `loading.tsx`, y un `notFound()` dentro del límite de carga llega con la
 * respuesta ya enviada como 200. Desde el layout, el 404 es 404.
 */
export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  if (!experiencia((await params).id)) notFound();
  return children;
}
