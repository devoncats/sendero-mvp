import { Container, Stack } from "@/components/layout";

/**
 * Esqueleto con la forma de la experiencia: titular, recorrido a la izquierda
 * y la solicitud a la derecha en escritorio. La página se renderiza por
 * petición —las salidas dependen de hoy y del cupo—, y en 3G eso se nota.
 *
 * La animación la desactiva sola `prefers-reduced-motion`, que está en globals.
 */
function Barra({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-control bg-surface-sunken ${className}`} />;
}

export default function CargandoExperiencia() {
  return (
    <Container ancho="sm" as="main" className="lg:max-w-page-xl">
      <Stack gap="loose" className="py-stack" aria-busy="true" aria-label="Cargando la experiencia">
        <Barra className="h-control-md w-1/3" />
        <Stack gap="default">
          <Barra className="h-icon-lg w-1/3" />
          <Barra className="h-icon-xl w-full" />
          <Barra className="h-icon-xl w-2/3" />
        </Stack>
        <div className="flex flex-col gap-stack-loose lg:grid lg:grid-cols-3 lg:items-start">
          <Stack gap="default" className="lg:col-span-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Barra key={i} className="h-control-lg w-full" />
            ))}
          </Stack>
          <Stack gap="default">
            {[0, 1, 2, 3].map((i) => (
              <Barra key={i} className="h-control-md w-full" />
            ))}
          </Stack>
        </div>
      </Stack>
    </Container>
  );
}
