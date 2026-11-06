import { redirect } from "next/navigation";

/**
 * `/comunidad` era la página de la única comunidad. Con varias, es la lista
 * (`/comunidades`) o la de cada ente (`/comunidad/[id]`). Se queda esta
 * redirección para los enlaces que ya se compartieron por WhatsApp.
 */
export default function ComunidadAntigua() {
  redirect("/comunidades");
}
