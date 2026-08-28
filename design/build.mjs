// Inyecta los tokens, la base compartida y el sprite de iconos en cada plantilla.
// Los artboards no comparten nada en tiempo de ejecución: cada uno lleva su copia.
// Se edita _tpl/, nunca los .dc.html generados.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "_tpl");

const tokens = readFileSync(join(here, "..", "seed", "canvas-tokens.css"), "utf8");
const base = readFileSync(join(src, "_base.css"), "utf8");
const sprite = readFileSync(join(src, "_sprite.html"), "utf8");

for (const f of readdirSync(src).filter((f) => f.endsWith(".dc.html") && !f.startsWith("_"))) {
  const tpl = readFileSync(join(src, f), "utf8");
  if (!tpl.includes("/*__TOKENS__*/")) throw new Error(`${f}: falta /*__TOKENS__*/`);
  const out = tpl
    .replace("/*__TOKENS__*/", tokens)
    .replace("/*__BASE__*/", base)
    .replace("<!--__SPRITE__-->", sprite);
  writeFileSync(join(here, f), out);
  console.log("build", f);
}
