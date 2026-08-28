import type { ReactNode } from "react";

/**
 * El portal. `data-density="editorial"` es todo el mecanismo: de aquí para
 * abajo los tokens semánticos valen lo que valen en revista de viaje —
 * controles de 48 px, ritmo de 1.5rem, serif permitido en titulares.
 *
 * Ningún componente sabe que está aquí.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div data-density="editorial" className="min-h-dvh">
      {children}
    </div>
  );
}
