import { Inter, Source_Serif_4 } from "next/font/google";

/**
 * Las dos familias del sistema. `variable` expone exactamente los nombres que
 * tokens.css espera: --font-inter y --font-source-serif.
 *
 * next/font descarga y autoaloja las fuentes en build, así que en producción
 * no se pide nada a Google. Es lo que mantiene el presupuesto de red.
 */

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Interfaz y cuerpo: se necesita en el primer pintado de todas las rutas.
  preload: true,
});

export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  // Solo titulares editoriales del portal. Nunca en el dashboard, así que
  // no vale la pena precargarla en todas las rutas.
  preload: false,
});
