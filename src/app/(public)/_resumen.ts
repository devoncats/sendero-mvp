import type { NegocioResumen } from "@/components/patterns";
import type { Negocio } from "@/data";
import { categoria, zona } from "@/data";

/**
 * Adapta un Negocio del dominio a lo que necesita una BusinessCard.
 *
 * Vive en la capa de app a propósito: `patterns` no puede importar de `data`
 * —las dependencias apuntan hacia abajo— y `data` no puede saber de componentes.
 * El puente lo tiende quien conoce a los dos, que es la pantalla.
 */

const TEXTO_CONFIANZA = {
  verificado: "Datos confirmados",
  desactualizado: "Datos sin actualizar",
  sinConfirmar: "Sin confirmar todavía",
} as const;

/**
 * `conZona` en falso dentro de la página de una zona: repetir "Santa Fe,
 * Veraguas" en las cuatro tarjetas de Santa Fe no informa, solo alarga.
 */
export function resumir(n: Negocio, { conZona = true } = {}): NegocioResumen {
  const z = zona(n.zona);
  return {
    nombre: n.nombre,
    persona: `${n.persona.nombre} · ${n.persona.oficio.toLowerCase()}`,
    categoria: categoria(n.categoria).nombre.es,
    zona: conZona ? `${z.nombre}, ${z.provincia}` : undefined,
    href: `/negocio/${n.slug}`,
    confianza: n.estadoDato,
    confianzaTexto: TEXTO_CONFIANZA[n.estadoDato],
  };
}
