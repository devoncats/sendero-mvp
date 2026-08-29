"use client";

// Límite de error del dashboard. Copy propio a propósito: aquí no hay un
// turista curioseando, hay alguien que estaba editando su negocio y necesita
// saber, antes que nada, que no perdió lo que había escrito.

import Link from "next/link";

import { AlertTriangle } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { EmptyState } from "@/components/patterns";
import { clasesDeBoton } from "@/components/ui";

export default function ErrorDashboard({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container ancho="md" as="main" className="flex min-h-dvh items-center">
      <Stack className="w-full">
        <EmptyState
          icono={AlertTriangle}
          titulo="Algo falló al cargar"
          descripcion="Tus datos están guardados; no se perdió nada. Vuelve a intentarlo y si sigue igual, escríbenos."
          accion={
            <Inline gap="sm" justify="center">
              <button type="button" onClick={reset} className={clasesDeBoton({})}>
                Reintentar
              </button>
              <Link href="/dashboard" className={clasesDeBoton({ variante: "secondary" })}>
                Volver al panel
              </Link>
            </Inline>
          }
        />
      </Stack>
    </Container>
  );
}
