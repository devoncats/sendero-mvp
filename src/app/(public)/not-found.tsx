import Link from "next/link";

import { MapPin } from "@/components/icons";
import { Container, Stack } from "@/components/layout";
import { EmptyState } from "@/components/patterns";
import { clasesDeBoton } from "@/components/ui";

/**
 * El 404 del portal. Sin cabecera propia: `notFound()` desde /negocio o /zona
 * renderiza dentro del layout del grupo, que ya la trae. El de app/not-found.tsx
 * sí la lleva, porque a él se llega por URL suelta y no tiene layout encima.
 */
export default function NoEncontradoPortal() {
  return (
    <Container ancho="sm" as="main" className="flex min-h-dvh items-center">
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
  );
}
