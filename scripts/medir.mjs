/**
 * Mide las rutas con Lighthouse en perfil móvil.
 *
 * El preset móvil de Lighthouse ya trae lo que este proyecto necesita probar:
 * 4G lenta (1,6 Mbps, 150 ms) y la CPU estrangulada 4x, que es lo más parecido
 * a un Moto G Power que se puede simular desde un portátil.
 *
 * Requiere el servidor de PRODUCCIÓN levantado y un .next limpio:
 *   rm -rf .next && pnpm build && pnpm start --port 3001
 *
 * Uso: node scripts/medir.mjs [puerto]
 */
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const PUERTO = process.argv[2] ?? "3001";
const BASE = `http://localhost:${PUERTO}`;

const RUTAS = [
  "/",
  "/buscar",
  "/ruta",
  "/zona/santa-fe",
  // El peor caso del planificador: la zona con más negocios y tres días, que es
  // el HTML máximo. Medir el caso por defecto daría un número bonito y falso.
  "/zona/santa-fe/ruta?dias=3",
  "/negocio/artesanias-delia-quintero",
  "/guardados",
  "/para-tu-negocio",
  "/dashboard",
  "/dashboard/fotos",
];

/** Umbrales de las Core Web Vitals, en «bueno». */
const META = { lcp: 2500, cls: 0.1, tbt: 200 };

const veredicto = (v, max) => (v <= max ? "ok" : "SE PASA");

const chrome = await launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const filas = [];
const detalles = new Map();
try {
  for (const ruta of RUTAS) {
    const { lhr } = await lighthouse(
      BASE + ruta,
      { port: chrome.port, output: "json", logLevel: "error" },
      // Preset móvil por defecto: 4G lenta + CPU 4x.
      undefined,
    );

    const a = lhr.audits;
    const ms = (id) => Math.round(a[id]?.numericValue ?? 0);
    const lcp = ms("largest-contentful-paint");
    const cls = Number((a["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(3));
    const tbt = ms("total-blocking-time");

    filas.push({
      ruta,
      "LCP ms": lcp,
      LCP: veredicto(lcp, META.lcp),
      CLS: cls,
      "CLS ok": veredicto(cls, META.cls),
      "TBT ms": tbt,
      "FCP ms": ms("first-contentful-paint"),
      Rendimiento: Math.round((lhr.categories.performance?.score ?? 0) * 100),
    });
    detalles.set(ruta, a);
    process.stderr.write(`  medido ${ruta}\n`);
  }
} finally {
  /*
   * En Windows, borrar el perfil temporal del navegador falla con EPERM si el
   * proceso todavía no lo ha soltado. Es ruido de limpieza: perder por eso ocho
   * mediciones que ya están hechas sería absurdo.
   */
  try {
    await chrome.kill();
  } catch {
    process.stderr.write("  (aviso: no se pudo borrar el perfil temporal del navegador)\n");
  }
}

console.log("Lighthouse, preset móvil: 4G lenta (1,6 Mbps · 150 ms) y CPU 4x.");
console.log(`Metas: LCP < ${META.lcp} ms · CLS < ${META.cls} · TBT < ${META.tbt} ms\n`);
console.table(filas);

/* Y el detalle de la peor: saber el número no sirve si no se sabe la causa. */
const peor = [...filas].sort((a, b) => b["LCP ms"] - a["LCP ms"])[0];
console.log(`\nPor qué ${peor.ruta} tarda lo que tarda:\n`);
const a = detalles.get(peor.ruta);

const el = a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0];
console.log("  Elemento LCP:", el?.node?.snippet?.slice(0, 80) ?? "—");
for (const f of a["largest-contentful-paint-element"]?.details?.items?.[1]?.items ?? []) {
  console.log(`    ${f.phase}: ${Math.round(f.timing)} ms`);
}

const bloq = a["render-blocking-resources"]?.details?.items ?? [];
console.log(`  Bloquean el primer pintado: ${bloq.length}`);
for (const b of bloq) {
  console.log(
    `    ${b.url.split("/").pop().slice(0, 36)} — ${Math.round(b.totalBytes / 1024)} KB, ahorro ${Math.round(b.wastedMs)} ms`,
  );
}

const opor = Object.values(a)
  .filter((x) => x.details?.type === "opportunity" && (x.numericValue ?? 0) > 50)
  .map((x) => `${x.title}: ${Math.round(x.numericValue)} ms`);
console.log("  Oportunidades sobre 50 ms:", opor.length ? opor.join(" · ") : "ninguna");
