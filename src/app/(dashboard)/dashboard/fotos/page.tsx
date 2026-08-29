import type { Metadata } from "next";
import Link from "next/link";

import { AlertTriangle, ArrowLeft, Info, Plus, Spinner, Trash, WifiOff } from "@/components/icons";
import { Container, Grid, Inline, Stack } from "@/components/layout";
import { Badge, Media, Surface, Text } from "@/components/ui";
import { COLA_DEMO, type Foto, negocioDelDueno } from "@/data/panel";

export const metadata: Metadata = { title: "Fotos" };

/**
 * Una foto lista. La primera es la portada de la ficha, y se dice.
 */
function FotoLista({ foto, portada }: { foto: Foto; portada: boolean }) {
  return (
    <Stack gap="tight">
      <div className="relative">
        <Media proporcion="4/3" etiqueta={foto.etiqueta} alt={foto.etiqueta} sizes="(min-width: 768px) 300px, 45vw" />
        {portada ? (
          <span className="absolute left-inset-sm top-inset-sm">
            <Badge tono="neutral">Portada</Badge>
          </span>
        ) : null}
        {/* Botón y no span: un span con icono no lo alcanza el teclado, y una
            acción destructiva invisible para quien no usa ratón no existe. */}
        <button
          type="button"
          aria-label={`Quitar la foto: ${foto.etiqueta}`}
          className="absolute right-inset-sm top-inset-sm flex size-control-md items-center justify-center rounded-full bg-surface shadow-raised"
        >
          <Trash className="size-icon-sm" aria-hidden />
        </button>
      </div>
      <Text size="caption" tone="tertiary">
        {foto.etiqueta}
      </Text>
    </Stack>
  );
}

/**
 * Subiendo. Lo importante no es el porcentaje: es que se puede cerrar la página.
 * En una conexión de montaña una foto de 2 MB tarda minutos, y nadie se queda
 * mirando una barra durante minutos.
 */
function FotoSubiendo({ foto }: { foto: Foto }) {
  return (
    <Stack gap="tight">
      <Stack
        gap="default"
        align="center"
        className="aspect-photo justify-center rounded-media bg-surface-sunken p-inset-lg"
      >
        <Spinner className="size-icon-lg text-brand" aria-hidden />
        <div
          className="h-icon-sm w-full overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-valuenow={foto.progreso}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Subiendo ${foto.etiqueta}`}
        >
          <div className="h-full bg-brand" style={{ width: `${foto.progreso ?? 0}%` }} />
        </div>
        <Text size="body-md" tone="secondary">
          Subiendo… {foto.progreso} %
        </Text>
      </Stack>
      <Text size="caption" tone="tertiary">
        {foto.archivo} · {foto.peso}
      </Text>
    </Stack>
  );
}

/**
 * Falló. El mensaje dice primero lo que la persona necesita saber —que la foto
 * no se perdió— y después qué hacer. Nunca «Error 500».
 */
function FotoFallida({ foto }: { foto: Foto }) {
  return (
    <Stack gap="tight">
      <Stack
        gap="default"
        align="center"
        className="aspect-photo justify-center rounded-media border border-danger-border bg-danger-surface p-inset-lg text-center"
      >
        <AlertTriangle className="size-icon-lg text-danger" aria-hidden />
        <Text size="body-md" className="text-danger-content">
          Se cortó la subida. La foto no se perdió.
        </Text>
        <button
          type="button"
          className="inline-flex h-control-md items-center rounded-control border border-border-default bg-action-secondary px-inset-lg text-body-md font-semibold text-action-secondary-content"
        >
          Reintentar
        </button>
      </Stack>
      <Text size="caption" tone="tertiary">
        {foto.archivo} · {foto.peso}
      </Text>
    </Stack>
  );
}

export default function FotosPage() {
  const negocio = negocioDelDueno();
  const subiendo = COLA_DEMO.filter((f) => f.estado === "subiendo");
  const listas = COLA_DEMO.filter((f) => f.estado === "lista");

  return (
    <Container ancho="lg" as="main">
      <Stack gap="loose" className="py-inset-xl">
        <Stack gap="default">
          <Link
            href="/dashboard"
            className="inline-flex min-h-control-md w-fit items-center gap-icon-gap text-body-md font-medium text-brand"
          >
            <ArrowLeft className="size-icon-sm" aria-hidden />
            Volver al panel
          </Link>
          <Stack gap="tight">
            <Text as="h1" size="heading-lg" weight="semibold">
              Fotos
            </Text>
            <Text size="body-lg" tone="secondary">
              La primera es la portada de tu ficha. Tienes {listas.length}{" "}
              {listas.length === 1 ? "lista" : "listas"}.
            </Text>
          </Stack>
        </Stack>

        {/* El mismo aviso que en Horario: sin servidor no hay dónde subir. */}
        <Surface relleno="lg" radio="control" className="border-info-border bg-info-surface">
          <Inline gap="md" align="start" wrap={false}>
            <Info className="size-icon-md shrink-0 text-info" aria-hidden />
            <Text size="body-md" className="text-info-content">
              En este MVP las fotos todavía no se suben: no hay servidor detrás. El botón abre la
              cámara o la galería del teléfono, y lo que se ve abajo son los tres estados por los que
              pasa una foto de verdad.
            </Text>
          </Inline>
        </Surface>

        {/* Solo cuando de verdad hay algo en vuelo */}
        {subiendo.length > 0 ? (
          <Surface relleno="lg" radio="control" className="border-warning-border bg-warning-surface">
            <Inline gap="md" align="start" wrap={false}>
              <WifiOff className="size-icon-md shrink-0 text-warning" aria-hidden />
              <Text size="body-md" className="text-warning-content">
                Tu conexión va lenta. Puedes cerrar esta página: la foto sigue subiendo y la
                encuentras aquí cuando vuelvas.
              </Text>
            </Inline>
          </Surface>
        ) : null}

        <Grid cols={3} movil={2} gap="lg">
          {COLA_DEMO.map((foto, i) =>
            foto.estado === "lista" ? (
              <FotoLista key={foto.id} foto={foto} portada={i === 0} />
            ) : foto.estado === "subiendo" ? (
              <FotoSubiendo key={foto.id} foto={foto} />
            ) : (
              <FotoFallida key={foto.id} foto={foto} />
            ),
          )}

          {/*
            Input de archivo nativo. En un Android abre la cámara o la galería
            directamente — nada que construir y nada que pese.
          */}
          <label
            htmlFor="nuevas-fotos"
            className="flex aspect-photo cursor-pointer flex-col items-center justify-center gap-inset-sm rounded-media border-2 border-dashed border-border-default p-inset-lg text-center text-content-tertiary"
          >
            <Plus className="size-icon-lg" aria-hidden />
            <span className="text-body-md font-medium">Agregar foto</span>
            <span className="text-caption">desde la cámara o la galería</span>
            <input
              id="nuevas-fotos"
              name="nuevas-fotos"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
            />
          </label>
        </Grid>

        <Surface relleno="lg">
          <Inline gap="md" align="start" wrap={false}>
            <Info className="size-icon-md shrink-0 text-content-tertiary" aria-hidden />
            <Stack gap="tight">
              <Text size="body-lg" weight="medium">
                Con tres fotos basta
              </Text>
              <Text size="body-md" tone="secondary">
                Una del producto, una de {negocio.persona.nombre.split(" ")[0]} trabajando y una del
                local. Tomadas con el teléfono están bien — no hace falta fotógrafo.
              </Text>
            </Stack>
          </Inline>
        </Surface>
      </Stack>
    </Container>
  );
}
