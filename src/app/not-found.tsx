import Link from "next/link";

import { Compass, MapPin } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { EmptyState } from "@/components/patterns";
import { Text, clasesDeBoton } from "@/components/ui";

/**
 * Un solo 404 para todo. Next lo usa tanto para las URL que no existen como
 * para los notFound() de /negocio y /zona, así que pone su propia densidad:
 * vive fuera del layout del portal.
 *
 * No dice "error 404". Dice qué pasó y ofrece por dónde seguir, que es lo que
 * necesita alguien que llegó desde un enlace viejo compartido por WhatsApp.
 */
export default function NoEncontrado() {
  return (
    <div data-density="editorial" className="flex min-h-dvh flex-col">
      <header className="border-b border-border-subtle bg-surface">
        <Container ancho="sm">
          <Inline wrap={false} className="h-control-md">
            <Link href="/" className="flex min-h-control-sm items-center gap-icon-gap">
              <Compass className="size-icon-md text-brand" aria-hidden />
              <Text as="span" size="heading-sm" serif weight="semibold">
                Sendero
              </Text>
            </Link>
          </Inline>
        </Container>
      </header>

      <Container ancho="sm" as="main" className="flex flex-1 items-center">
        <Stack className="w-full">
          <EmptyState
            icono={MapPin}
            titulo="Esta página ya no está"
            descripcion="Puede que el negocio se haya dado de baja, o que el enlace venga con un error. Los treinta que sí están se encuentran por zona."
            accion={
              <Link href="/" className={clasesDeBoton({})}>
                Ver las nueve zonas
              </Link>
            }
          />
        </Stack>
      </Container>
    </div>
  );
}
