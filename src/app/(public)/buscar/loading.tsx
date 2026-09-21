import { Container, Grid, Inline, Stack } from "@/components/layout";

/**
 * Esqueleto con la forma real del resultado, no un girador en el centro.
 * Así la página no salta cuando llegan los datos — que es medio CLS ahorrado
 * en una de las dos rutas del portal que se renderizan por petición — la otra
 * es el planificador de `/zona/[id]/ruta`, que llegó después y por el mismo
 * motivo: lee la URL para saber qué enseñar.
 *
 * En escritorio imita la misma repartición que la página: riel a la izquierda
 * y rejilla de dos a la derecha. Un esqueleto con otra forma que el resultado
 * es exactamente el salto que se quería evitar.
 *
 * La animación la desactiva sola `prefers-reduced-motion`, que está en globals.
 */
function Barra({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-control bg-surface-sunken ${className}`} />;
}

export default function CargandoBusqueda() {
  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      <Stack
        gap="loose"
        className="py-stack lg:grid lg:grid-cols-4 lg:items-start"
        aria-busy="true"
        aria-label="Cargando resultados"
      >
        <Stack gap="default" className="lg:col-start-1 lg:row-start-1 lg:row-span-3">
          <Barra className="h-icon-lg w-2/3" />
          <Barra className="h-icon-xl w-full" />
          <Barra className="h-icon-xl w-full" />
        </Stack>

        <Barra className="h-icon-xl w-1/2 lg:col-start-2 lg:col-span-3" />
        <Barra className="h-control-md w-full lg:col-start-2 lg:col-span-3" />

        <Grid cols={2} movil={1} gap="lg" className="lg:col-start-2 lg:col-span-3">
          {[0, 1, 2, 3].map((i) => (
            <Inline key={i} gap="md" align="start" wrap={false} className="sm:flex-col">
              <Barra className="h-avatar-xl w-avatar-xl shrink-0 sm:aspect-photo sm:h-auto sm:w-full" />
              <Stack gap="tight" className="flex-1">
                <Barra className="h-icon-sm w-1/3" />
                <Barra className="h-icon-sm w-4/5" />
                <Barra className="h-icon-sm w-2/3" />
              </Stack>
            </Inline>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
