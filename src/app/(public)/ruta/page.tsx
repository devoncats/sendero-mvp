import { redirect } from "next/navigation";

import { ZONAS } from "@/data";

/**
 * Un redirector, no una pantalla.
 *
 * El planificador vive en `/zona/[id]/ruta`, y la zona va en la ruta y no en la
 * consulta — es lo correcto, porque un plan pertenece a un pueblo. Pero un
 * `<form method="get">` solo sabe armar `?clave=valor`: no puede escribir un
 * segmento de la dirección. Esto tiende ese puente en catorce líneas y sin un
 * byte de JavaScript, para que el selector de la portada siga siendo HTML.
 *
 * No se renderiza nunca: o redirige al planificador de la zona, o a la portada
 * si la zona no existe. Descartar y no fallar, igual que en `/buscar`.
 */
export default async function IrALaRuta({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string }>;
}) {
  const { zona } = await searchParams;
  const z = ZONAS.find((x) => x.id === zona);
  redirect(z ? `/zona/${z.id}/ruta` : "/");
}
