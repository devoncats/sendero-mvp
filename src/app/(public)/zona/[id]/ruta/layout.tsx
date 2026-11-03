import type { ReactNode } from "react";

import { soloConDirectorio } from "@/lib/directorio";

/**
 * La puerta del directorio, aquí y no en la página: esta ruta tiene
 * `loading.tsx`, y un `notFound()` dentro del límite de carga llega cuando la
 * respuesta ya salió con 200. Desde el layout se decide antes, y el 404 es 404.
 */
export default function Layout({ children }: { children: ReactNode }) {
  soloConDirectorio();
  return children;
}
