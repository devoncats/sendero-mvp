import type { Metadata } from "next";
import type { ReactNode } from "react";

import { inter, sourceSerif } from "@/lib/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sendero",
    template: "%s · Sendero",
  },
  description:
    "Artesanos, fondas, hospedajes familiares y guías locales de las zonas turísticas no masificadas de Panamá. Los encuentras y les escribes directo.",
};

/**
 * Las variables de fuente van en <html> porque tokens.css las consume desde
 * :root. La densidad NO se pone aquí: la ponen los layouts de ruta, y los
 * componentes la heredan por la cascada.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
