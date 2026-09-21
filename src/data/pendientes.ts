import type { Dia, Negocio } from "./tipos";

/**
 * Qué le falta a una ficha, en orden de cuánto le cuesta al dueño no tenerlo.
 *
 * Se calcula de los datos, no se escribe a mano. Ese es el punto del Panel:
 * no es una lista de tareas que alguien mantiene, es lo que la propia ficha
 * dice de sí misma.
 *
 * Cada pendiente trae su `porque`. Un dueño que nunca usó un panel no obedece
 * una instrucción sin razón — y tiene toda la razón en no obedecerla.
 */
export type Pendiente = {
  id: string;
  titulo: string;
  porque: string;
  accion: string;
  href: string;
};

const NOMBRE_DIA: Record<Dia, string> = {
  lun: "los lunes",
  mar: "los martes",
  mie: "los miércoles",
  jue: "los jueves",
  vie: "los viernes",
  sab: "los sábados",
  dom: "los domingos",
};

const DIAS: readonly Dia[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

/** Cuántos días pasaron desde la última confirmación. Sin fecha, infinito. */
function diasDesde(iso: string | undefined, ahora: Date): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return Math.floor((ahora.getTime() - new Date(iso).getTime()) / 86_400_000);
}

export function pendientes(n: Negocio, ahora: Date): Pendiente[] {
  const lista: Pendiente[] = [];

  // 1. Las fotos son lo que más mueve la aguja: casi nadie escribe sin ver.
  if (n.fotos < 3) {
    const faltan = 3 - n.fotos;
    lista.push({
      id: "fotos",
      titulo: faltan === 1 ? "Agrega una foto más" : `Agrega ${faltan} fotos de tus productos`,
      porque:
        n.fotos === 0
          ? "Tu ficha no tiene ninguna foto. La gente casi nunca escribe sin ver el producto."
          : `Ahora tienes ${n.fotos}. La gente casi nunca escribe sin ver el producto.`,
      accion: "Subir fotos",
      href: "/dashboard/fotos",
    });
  }

  // 2. Un día sin confirmar deja la ficha con un aviso a la vista del visitante.
  const sinConfirmar = DIAS.filter((d) => n.horario[d] === "sinConfirmar");
  if (sinConfirmar.length > 0) {
    const cuales = sinConfirmar.map((d) => NOMBRE_DIA[d]).join(", ");
    lista.push({
      id: "horario",
      titulo:
        sinConfirmar.length === 1
          ? `Dinos si abres ${cuales}`
          : `Dinos qué días abres (faltan ${sinConfirmar.length})`,
      porque: "Sin ese dato tu ficha aparece con un aviso de «horario sin confirmar».",
      accion: "Completar",
      href: "/dashboard/horario",
    });
  }

  // 3. Una referencia escrita sirve más que un punto en el mapa.
  if (n.referencia.trim().length < 40) {
    lista.push({
      id: "referencia",
      titulo: "Explica cómo llegar a tu negocio",
      porque: "Una referencia del pueblo sirve más que un punto en el mapa.",
      accion: "Completar",
      href: "/dashboard/horario",
    });
  }

  // 3 bis. El punto no reemplaza a la referencia: la referencia es para llegar
  // y el punto es para entrar en el orden de una ruta. Va después a propósito.
  if (!n.coordenadas) {
    lista.push({
      id: "punto",
      titulo: "Pon tu punto en el mapa",
      porque:
        "Sin él tu negocio queda fuera de las rutas que los visitantes arman para tu pueblo. Sales en la lista, pero no en el recorrido.",
      accion: "Poner el punto",
      href: "/dashboard/horario",
    });
  }

  // 4. Un producto sin precio hace que la gente no pregunte, por no incomodar.
  const sinPrecio = n.productos.filter((p) => p.precio === undefined);
  if (sinPrecio.length > 0) {
    lista.push({
      id: "precios",
      titulo:
        sinPrecio.length === 1
          ? `Ponle precio a «${sinPrecio[0].nombre}»`
          : `Ponle precio a ${sinPrecio.length} productos`,
      porque: "Sin precio mucha gente no pregunta, por no incomodar.",
      accion: "Poner precio",
      href: "/dashboard/productos",
    });
  }

  // 5. Cada 30 días se pregunta si todo sigue igual.
  const dias = diasDesde(n.confirmadoEl, ahora);
  if (dias > 30) {
    lista.push({
      id: "confirmar",
      titulo: "Confirma que todo sigue igual",
      porque:
        dias === Number.POSITIVE_INFINITY
          ? "Nunca has confirmado tus datos. Los visitantes ven cuándo fue la última vez."
          : `La última vez fue hace ${Math.floor(dias / 30)} ${Math.floor(dias / 30) === 1 ? "mes" : "meses"}. Los visitantes ven esa fecha.`,
      accion: "Confirmar",
      href: "/dashboard/negocio",
    });
  }

  return lista;
}

/** Siempre disponibles, tenga o no pendientes. No son tareas, son puertas. */
export const ACCIONES: readonly { titulo: string; href: string }[] = [
  { titulo: "Cambiar la descripción de tu negocio", href: "/dashboard/negocio" },
  { titulo: "Agregar o quitar un producto", href: "/dashboard/productos" },
  { titulo: "Cambiar tus fotos", href: "/dashboard/fotos" },
];

/** Cuán completa está la ficha, de 0 a 1. Seis cosas posibles por revisar. */
export function completitud(n: Negocio, ahora: Date): number {
  // Este número tiene que ir de la mano con cuántos `if` hay en `pendientes`.
  // Si se añade uno y esto no sube, la barra del modo guiado no falla: miente,
  // que es peor.
  const total = 6;
  return (total - pendientes(n, ahora).length) / total;
}
