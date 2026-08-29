"use client";

// Next exige que los límites de error sean componentes cliente: `reset` es un
// manejador. Es el precio de poder recuperarse sin recargar la página entera.
//
// Tercer y último "use client" del portal. Los tres tienen la misma excusa:
// hacen algo que el servidor no puede — leer el reloj del visitante, escuchar
// su conexión, y reintentar sin recargar.

import Link from "next/link";

import { AlertTriangle } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { EmptyState } from "@/components/patterns";
import { clasesDeBoton } from "@/components/ui";

export default function ErrorPortal({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container ancho="sm" as="main" className="flex min-h-dvh items-center">
      <Stack className="w-full">
        <EmptyState
          icono={AlertTriangle}
          titulo="No pudimos cargar esta página"
          descripcion="Puede ser tu conexión. Los negocios que ya viste siguen disponibles sin señal."
          accion={
            <Inline gap="sm" justify="center">
              {/* Botón con manejador: se usan las clases del primitivo para no
                  duplicar el vocabulario visual, y Button sigue sin aceptar
                  onClick. */}
              <button type="button" onClick={reset} className={clasesDeBoton({})}>
                Reintentar
              </button>
              <Link href="/" className={clasesDeBoton({ variante: "secondary" })}>
                Ir al inicio
              </Link>
            </Inline>
          }
        />
      </Stack>
    </Container>
  );
}
