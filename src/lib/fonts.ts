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
  /*
   * Sin precargar, y está medido.
   *
   * Se probó `preload: true` con la hipótesis de que llegar antes adelantaría
   * el LCP del portal, donde esta fuente pinta el titular. Resultado: el FCP
   * mejoró mucho (1208 → 758 ms) pero **el LCP no se movió**, y el dashboard
   * pasó de 2344 a 2656 ms — porque un `<link rel=preload>` fuerza la descarga
   * en todas las rutas, incluidas las seis que no usan serif.
   *
   * Sin precarga, sus @font-face con unicode-range solo se piden cuando hay un
   * glifo que los active. El dashboard no paga por una familia que no usa.
   */
  preload: false,
});
