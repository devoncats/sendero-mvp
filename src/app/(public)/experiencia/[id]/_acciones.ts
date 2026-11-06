"use server";

import { redirect } from "next/navigation";

import { ente, experiencia, plazasOcupadas } from "@/data";
import { enlaceWhatsApp, fechaConDia } from "@/lib/formato";

/**
 * La solicitud de un visitante, de formulario a WhatsApp de la cooperativa.
 *
 * Server Action y no manejador de cliente: funciona sin JavaScript y no suma
 * un `"use client"`. No se guarda nada —no hay dónde—; el mensaje se compone
 * aquí y se manda al WhatsApp del ente económico, que es quien confirma y
 * reparte. Que el visitante no tenga que redactar nada es medio contacto
 * ganado, igual que en la ficha de un negocio.
 *
 * Los errores vuelven como `?error=` con un código y nada más: ni el nombre ni
 * la procedencia viajan en la dirección.
 */

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function entero(v: FormDataEntryValue | null, porDefecto: number): number {
  const n = Number(v);
  return Number.isInteger(n) ? n : porDefecto;
}

function texto(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function solicitar(datos: FormData) {
  const id = texto(datos.get("experiencia"), 80);
  const e = experiencia(id);
  if (!e) redirect("/");

  const volver = (codigo: string) => redirect(`/experiencia/${e.id}?error=${codigo}#solicitar`);

  const fecha = texto(datos.get("fecha"), 10);
  const adultos = entero(datos.get("adultos"), 0);
  const ninos = entero(datos.get("ninos"), 0);
  const nombre = texto(datos.get("nombre"), 80);
  const procedencia = texto(datos.get("procedencia"), 80);
  const idioma = texto(datos.get("idioma"), 20) || "Español";
  const nota = texto(datos.get("nota"), 400);

  if (!FECHA.test(fecha)) volver("fecha");
  if (adultos < 1 || ninos < 0) volver("personas");
  const quedan = e.cupo - plazasOcupadas(e.id, fecha);
  if (adultos + ninos > quedan) volver("cupo");
  if (!nombre) volver("nombre");

  const coop = ente(e.ente);
  const quienes =
    `${adultos} ${adultos === 1 ? "adulto" : "adultos"}` +
    (ninos > 0 ? ` y ${ninos} ${ninos === 1 ? "niño" : "niños"}` : "");

  const mensaje = [
    `Hola, ${coop.contacto.nombre.split(" ")[0]}. Quiero solicitar «${e.nombre}».`,
    `Llegada: ${fechaConDia(fecha)}`,
    `Personas: ${quienes}`,
    `Nombre: ${nombre}`,
    procedencia ? `Vengo de: ${procedencia}` : "",
    `Idioma: ${idioma}`,
    nota ? `Nota: ${nota}` : "",
    "Lo vi en Sendero.",
  ]
    .filter(Boolean)
    .join("\n");

  redirect(enlaceWhatsApp(coop.whatsapp, mensaje));
}
