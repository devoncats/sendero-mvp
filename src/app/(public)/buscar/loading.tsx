import { Container, Inline, Stack } from "@/components/layout";

/**
 * Esqueleto con la forma real del resultado, no un girador en el centro.
 * Así la página no salta cuando llegan los datos — que es medio CLS ahorrado
 * en la única ruta del portal que se renderiza por petición.
 *
 * La animación la desactiva sola `prefers-reduced-motion`, que está en globals.
 */
function Barra({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-control bg-surface-sunken ${className}`} />;
}

export default function CargandoBusqueda() {
  return (
    <Container ancho="sm" as="main">
      <Stack gap="loose" className="py-stack" aria-busy="true" aria-label="Cargando resultados">
        <Barra className="h-icon-xl w-1/2" />
        <Barra className="h-control-md w-full" />
        <Barra className="h-control-md w-full" />
        <Stack>
          {[0, 1, 2, 3].map((i) => (
            <Inline key={i} gap="md" align="start" wrap={false}>
              <Barra className="size-avatar-xl shrink-0" />
              <Stack gap="tight" className="flex-1">
                <Barra className="h-icon-sm w-1/3" />
                <Barra className="h-icon-sm w-4/5" />
                <Barra className="h-icon-sm w-2/3" />
              </Stack>
            </Inline>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
