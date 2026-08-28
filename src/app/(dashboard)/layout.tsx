import type { ReactNode } from "react";

/**
 * El dashboard. Mismos componentes, otra densidad: controles de 36 px, ritmo
 * de 1rem, herramienta de trabajo. El serif no entra aquí — no por una regla
 * de CSS, sino porque no se usa.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div data-density="operational" className="min-h-dvh">
      {children}
    </div>
  );
}
