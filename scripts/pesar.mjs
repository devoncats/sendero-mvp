/**
 * Pesa las rutas con la vara de CLAUDE.md: el HTML más todo lo de `/_next/` que
 * la página referencia, comprimido con brotli 11. Las fuentes (.woff2) cuentan
 * tal cual, porque ya vienen comprimidas y el servidor no las vuelve a comprimir.
 *
 * Es la cuenta determinista: no depende del navegador ni de la red, así que el
 * mismo código da el mismo número en cualquier máquina. Lighthouse (medir.mjs)
 * es para LCP, CLS y TBT; esto es para el presupuesto de 250 KB.
 *
 * Requiere el servidor de PRODUCCIÓN levantado y un .next limpio:
 *   rm -rf .next && pnpm build && pnpm start --port 3001
 *
 * Uso: node scripts/pesar.mjs [puerto]
 */
import { brotliCompressSync, constants } from "node:zlib";

const PUERTO = process.argv[2] ?? "3001";
const BASE = `http://localhost:${PUERTO}`;
const PRESUPUESTO_KB = 250;

const EXPERTO = "sendero-modo=experto";
const PORTOBELO = "sendero-ente=consorcio-portobelo";

/*
 * El panel en sus dos modos y la página del impacto en los dos entes. La
 * portada del portal va de referencia: es la ruta pública que más se visita.
 */
const RUTAS = [
  { ruta: "/" },
  { ruta: "/dashboard", nombre: "/dashboard (guiado)" },
  { ruta: "/dashboard", cookie: EXPERTO, nombre: "/dashboard (experto)" },
  { ruta: "/dashboard/impacto", cookie: EXPERTO, nombre: "/dashboard/impacto (El Valle)" },
  { ruta: "/dashboard/impacto", cookie: `${EXPERTO}; ${PORTOBELO}`, nombre: "/dashboard/impacto (Portobelo)" },
];

const brotli = (buf) =>
  brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;

async function traer(url, cookie) {
  const r = await fetch(url, { headers: cookie ? { Cookie: cookie } : {}, redirect: "manual" });
  return { estado: r.status, cuerpo: Buffer.from(await r.arrayBuffer()) };
}

const filas = [];
for (const { ruta, cookie, nombre } of RUTAS) {
  const pagina = await traer(BASE + ruta, cookie);
  if (pagina.estado !== 200) {
    // Una redirección pesaría la página equivocada: mejor decirlo que dar un número.
    filas.push({ ruta: nombre ?? ruta, "KB total": `respondió ${pagina.estado}` });
    continue;
  }

  const html = pagina.cuerpo.toString("utf8");
  const recursos = [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? [])];

  let kb = { html: brotli(pagina.cuerpo), js: 0, css: 0, fuentes: 0 };
  for (const r of recursos) {
    const { estado, cuerpo } = await traer(BASE + r);
    if (estado !== 200) continue;
    if (r.endsWith(".woff2")) kb.fuentes += cuerpo.length;
    else if (r.endsWith(".css")) kb.css += brotli(cuerpo);
    else if (r.endsWith(".js")) kb.js += brotli(cuerpo);
  }

  const k = (b) => Number((b / 1024).toFixed(1));
  const total = kb.html + kb.js + kb.css + kb.fuentes;
  filas.push({
    ruta: nombre ?? ruta,
    "HTML KB": k(kb.html),
    "JS KB": k(kb.js),
    "CSS KB": k(kb.css),
    "Fuentes KB": k(kb.fuentes),
    "KB total": k(total),
    presupuesto: total / 1024 <= PRESUPUESTO_KB ? "ok" : "SE PASA",
  });
}

console.log(`Peso transferido, brotli 11 (fuentes tal cual). Presupuesto: ${PRESUPUESTO_KB} KB por ruta.\n`);
console.table(filas);
