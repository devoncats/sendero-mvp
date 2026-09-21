import { Container, Inline, Stack } from "@/components/layout";

/**
 * Esqueleto con la forma real del itinerario: el riel a la izquierda, el título,
 * y tres paradas con su columna de hora. Un esqueleto con otra forma que el
 * resultado es exactamente el salto de layout que se quería evitar.
 *
 * La animación la desactiva sola `prefers-reduced-motion`, que está en globals.
 */
function Barra({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-control bg-surface-sunken ${className}`} />;
}

export default function ArmandoRuta() {
  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      <Stack
        gap="loose"
        className="py-stack lg:grid lg:grid-cols-4 lg:items-start"
        aria-busy="true"
        aria-label="Armando la ruta"
      >
        <Stack gap="default" className="lg:col-start-1 lg:row-start-1 lg:row-span-4">
          <Barra className="h-icon-lg w-2/3" />
          <Barra className="h-icon-xl w-full" />
          <Barra className="h-icon-xl w-full" />
          <Barra className="h-control-md w-full" />
        </Stack>

        <Stack gap="tight" className="lg:col-start-2 lg:col-span-2">
          <Barra className="h-icon-xl w-3/5" />
          <Barra className="h-icon-md w-4/5" />
        </Stack>

        <Stack gap="loose" className="lg:col-start-2 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <Inline key={i} gap="md" align="start" wrap={false}>
              <Barra className="h-icon-md w-avatar-md shrink-0" />
              <Inline gap="md" align="start" wrap={false} className="min-w-0 flex-1">
                <Barra className="h-avatar-xl w-avatar-xl shrink-0" />
                <Stack gap="tight" className="flex-1">
                  <Barra className="h-icon-sm w-1/3" />
                  <Barra className="h-icon-sm w-4/5" />
                  <Barra className="h-icon-sm w-2/3" />
                </Stack>
              </Inline>
            </Inline>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
