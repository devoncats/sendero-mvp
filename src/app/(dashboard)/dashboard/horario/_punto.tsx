"use client";

// Séptimo "use client" del proyecto, y el primero del panel que no es un panel
// desplegable. Se justifica así: `navigator.geolocation` es un permiso del
// navegador y no existe en el servidor; y pegar un enlace y ver salir de él un
// punto es un ciclo de escribir y responder que no cabe en un formulario sin
// JavaScript. Todo lo demás de esta pantalla sigue siendo HTML nativo.
//
// Quien lo usa tiene entre 45 y 65 años, un Android de gama media y nunca ha
// oído la palabra «latitud». Por eso el camino principal es un botón que se
// pulsa estando parado en el negocio, y los números están abajo, visibles, para
// quien ya sabe o para cuando el GPS no coopera.

import { useState } from "react";

import { AlertCircle, CheckCircle, ExternalLink, MiUbicacion, Spinner } from "@/components/icons";
import { Inline, Stack } from "@/components/layout";
import { Text, clasesDeBoton } from "@/components/ui";
import { enlaceMapa } from "@/lib/formato";
import { enPanama, esEnlaceCorto, pareceInvertido, puntoDeEnlace, redondear } from "@/lib/punto";

const CLASES_CAMPO =
  "h-control-md w-full rounded-control border bg-surface px-inset-md text-body-md text-content-primary placeholder:text-content-tertiary";

type Aviso = { tono: "error" | "ok" | "trabajando"; texto: string; invertido?: boolean };

const MENSAJE_CORTO =
  "Ese es un enlace corto y no trae el punto dentro. Ábrelo en el navegador, espera a que cargue el mapa, y copia la dirección de arriba — esa sí lo trae. O párate en tu negocio y usa el botón de arriba.";

export function CapturarPunto({ lat, lng }: { lat?: number; lng?: number }) {
  const [punto, setPunto] = useState<{ lat: string; lng: string }>({
    lat: lat !== undefined ? String(lat) : "",
    lng: lng !== undefined ? String(lng) : "",
  });
  const [aviso, setAviso] = useState<Aviso | null>(null);

  // Se calcula en cada render en vez de guardarse: un estado que puede
  // contradecir a los campos es un estado que tarde o temprano los contradice.
  const numeros =
    punto.lat !== "" && punto.lng !== "" && Number.isFinite(Number(punto.lat)) && Number.isFinite(Number(punto.lng))
      ? { lat: Number(punto.lat), lng: Number(punto.lng) }
      : null;

  function aceptar(p: { lat: number; lng: number }, origen: string) {
    const r = redondear(p);
    setPunto({ lat: String(r.lat), lng: String(r.lng) });

    if (pareceInvertido(r)) {
      setAviso({
        tono: "error",
        invertido: true,
        texto:
          "Parece que están al revés: la latitud de Panamá es un número entre 7 y 10, y la longitud siempre es negativa.",
      });
      return;
    }
    if (!enPanama(r)) {
      setAviso({
        tono: "error",
        texto: "Ese punto cae fuera de Panamá. Revisa si el enlace era de otro sitio.",
      });
      return;
    }
    setAviso({ tono: "ok", texto: origen });
  }

  function pegar(texto: string) {
    if (!texto.trim()) return;
    if (esEnlaceCorto(texto)) {
      setAviso({ tono: "error", texto: MENSAJE_CORTO });
      return;
    }
    const p = puntoDeEnlace(texto);
    if (!p) {
      setAviso({
        tono: "error",
        texto:
          "No encontré un punto en eso. Pega la dirección completa que sale arriba en Google Maps, o usa el botón de tu ubicación.",
      });
      return;
    }
    aceptar(p, "Punto tomado del enlace. Ábrelo abajo para comprobar que es tu negocio.");
  }

  function ubicarme() {
    /*
     * Las dos comprobaciones van aquí, al pulsar, y no alrededor del botón.
     *
     * El plan decía esconder el botón cuando no hay `geolocation`, para no
     * dejar uno muerto. Pero `navigator` no existe en el servidor, así que
     * esconderlo significa que el servidor manda la pantalla sin botón y el
     * botón aparece al hidratar — un salto de layout en CADA carga, no solo en
     * el navegador raro. CLS 0 no se negocia en este proyecto.
     *
     * Así el marcado del servidor y el del cliente son el mismo, y el botón
     * tampoco queda muerto: pulsarlo siempre responde algo que se puede leer y
     * dice qué hacer en su lugar. Un botón muerto es el que no contesta.
     */
    if (!("geolocation" in navigator)) {
      setAviso({
        tono: "error",
        texto:
          "Este navegador no sabe dar tu ubicación. Escribe el punto abajo, o pega el enlace de Google Maps.",
      });
      return;
    }
    if (!window.isSecureContext) {
      setAviso({
        tono: "error",
        texto:
          "La conexión no es segura y el navegador no deja pedir la ubicación aquí. Escribe el punto abajo o pega el enlace.",
      });
      return;
    }

    setAviso({ tono: "trabajando", texto: "Buscando tu ubicación…" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        aceptar({ lat: pos.coords.latitude, lng: pos.coords.longitude }, "");
        const metros = Math.round(pos.coords.accuracy);
        setAviso(
          metros > 100
            ? {
                tono: "error",
                texto: `Te ubicó con un margen de ${metros} metros, que es mucho. Prueba otra vez al aire libre.`,
              }
            : { tono: "ok", texto: `Listo, con un margen de ${metros} metros.` },
        );
      },
      (e) => {
        const textos: Record<number, string> = {
          1: "Le dijiste que no al permiso de ubicación. Puedes escribir el punto abajo, o darle permiso desde el candado de la barra de direcciones y volver a intentar.",
          2: "El teléfono no pudo ubicarte. Sal al patio o a la calle: bajo techo el GPS no agarra.",
          3: "Tardó demasiado. Inténtalo otra vez, de preferencia al aire libre.",
        };
        setAviso({ tono: "error", texto: textos[e.code] ?? "No se pudo obtener tu ubicación." });
      },
      // `maximumAge: 0` a propósito: una posición de hace media hora es la del
      // sitio del que viene, no la del negocio donde está parado ahora.
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  const trabajando = aviso?.tono === "trabajando";

  return (
    <Stack gap="default">
      <Stack gap="tight">
        <button
          type="button"
          onClick={ubicarme}
          disabled={trabajando}
          aria-busy={trabajando}
          className={clasesDeBoton({ variante: "secondary", anchoCompleto: true })}
        >
          {trabajando ? (
            <Spinner className="size-icon-sm animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <MiUbicacion className="size-icon-sm" aria-hidden />
          )}
          {trabajando ? "Buscando tu ubicación…" : "Usar mi ubicación"}
        </button>
        <Text size="caption" tone="tertiary">
          Lo más fácil: párate en la puerta de tu negocio y pulsa aquí.
        </Text>
      </Stack>

      <Stack gap="tight">
        <Text as="label" htmlFor="punto-enlace" size="label" weight="medium">
          O pega el enlace de Google Maps
        </Text>
        <input
          id="punto-enlace"
          name="punto-enlace"
          type="url"
          inputMode="url"
          placeholder="https://www.google.com/maps/…"
          onPaste={(e) => pegar(e.clipboardData.getData("text"))}
          onChange={(e) => pegar(e.target.value)}
          className={`${CLASES_CAMPO} border-border-default`}
        />
      </Stack>

      <Inline gap="md" align="start" wrap={false}>
        <Stack gap="tight" className="min-w-0 flex-1">
          <Text as="label" htmlFor="punto-lat" size="label" weight="medium">
            Latitud
          </Text>
          <input
            id="punto-lat"
            name="lat"
            type="number"
            step="0.000001"
            inputMode="decimal"
            value={punto.lat}
            onChange={(e) => setPunto((p) => ({ ...p, lat: e.target.value }))}
            aria-invalid={aviso?.tono === "error" || undefined}
            aria-describedby={aviso ? "punto-aviso" : undefined}
            className={`${CLASES_CAMPO} ${aviso?.tono === "error" ? "border-danger" : "border-border-default"}`}
          />
        </Stack>
        <Stack gap="tight" className="min-w-0 flex-1">
          <Text as="label" htmlFor="punto-lng" size="label" weight="medium">
            Longitud
          </Text>
          <input
            id="punto-lng"
            name="lng"
            type="number"
            step="0.000001"
            inputMode="decimal"
            value={punto.lng}
            onChange={(e) => setPunto((p) => ({ ...p, lng: e.target.value }))}
            aria-invalid={aviso?.tono === "error" || undefined}
            aria-describedby={aviso ? "punto-aviso" : undefined}
            className={`${CLASES_CAMPO} ${aviso?.tono === "error" ? "border-danger" : "border-border-default"}`}
          />
        </Stack>
      </Inline>

      {/* El aviso nunca depende solo del color: lleva icono y texto. */}
      {aviso && aviso.texto ? (
        <Stack gap="tight">
          {/* Div y no `Inline`: esto necesita id, role y aria-live, y el
              primitivo no los acepta — ni debería, es de layout. */}
          <div
            id="punto-aviso"
            role="status"
            aria-live="polite"
            className="flex items-start gap-icon-gap"
          >
            {aviso.tono === "ok" ? (
              <CheckCircle className="size-icon-sm shrink-0 text-success" aria-hidden />
            ) : aviso.tono === "error" ? (
              <AlertCircle className="size-icon-sm shrink-0 text-warning-content" aria-hidden />
            ) : null}
            <Text size="caption" tone={aviso.tono === "ok" ? "success" : "warning"}>
              {aviso.texto}
            </Text>
          </div>
          {aviso.invertido ? (
            <button
              type="button"
              onClick={() => aceptar({ lat: Number(punto.lng), lng: Number(punto.lat) }, "Cambiados.")}
              className={clasesDeBoton({ variante: "secondary", tamano: "sm" })}
            >
              Cambiarlos
            </button>
          ) : null}
        </Stack>
      ) : null}

      {/*
        El único bucle de confirmación posible sin backend, y el dueño lo
        entiende de inmediato: abre el mapa y ve si es ahí donde está parado.
      */}
      {numeros ? (
        <a
          href={enlaceMapa(`${numeros.lat},${numeros.lng}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-control-md w-fit items-center gap-icon-gap text-body-md font-medium text-brand"
        >
          Ver este punto en el mapa
          <ExternalLink className="size-icon-sm" aria-hidden />
        </a>
      ) : null}
    </Stack>
  );
}
