/**
 * El reloj, aparte de todo lo demás.
 *
 * `formato.ts` dice con todas sus letras que ningún formateador lee la hora por
 * su cuenta: la fecha entra por parámetro. Esa regla sigue en pie y este archivo
 * no la rompe — la sostiene, dándole a la pantalla un sitio del que sacar el
 * `ahora` sin que ningún módulo de abajo tenga que saber qué hora es.
 *
 * Quien planifica una ruta por Santa Fe está en Panamá o va a estarlo. El
 * servidor puede estar en cualquier parte, así que la hora se fija a la del
 * país. Panamá no tiene horario de verano desde siempre, de modo que no hay
 * caso raro que cubrir. `Intl` viene en Node, cuesta 0 KB y no llega al cliente.
 */

const FORMATO = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Panama",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/**
 * El ahora en hora de Panamá, como un `Date` cuyos `getHours()` y `getDay()`
 * locales ya dan el valor panameño. Eso es justo lo que `apertura()` lee, así
 * que el horario de un negocio se evalúa contra el reloj de su pueblo y no
 * contra el del centro de datos que sirvió la página.
 */
export function ahoraEnPanama(): Date {
  const p = Object.fromEntries(
    FORMATO.formatToParts(new Date())
      .filter((x) => x.type !== "literal")
      .map((x) => [x.type, x.value]),
  );
  // `hour` sale "24" a medianoche en el ciclo h23/h24 de algunos entornos.
  const hora = p.hour === "24" ? "00" : p.hour;
  return new Date(`${p.year}-${p.month}-${p.day}T${hora}:${p.minute}:${p.second}`);
}
