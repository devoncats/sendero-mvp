import Link from "next/link";

import { Compass } from "@/components/icons";

/**
 * Marcador de la home. La pantalla real —"El Panamá que no sale en el
 * folleto"— se construye en la Fase 3, cuando existan los componentes.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-prose flex-col gap-stack px-gutter py-section">
      <span className="flex items-center gap-icon-gap text-overline uppercase text-content-tertiary">
        <Compass className="size-icon-sm text-brand" aria-hidden />
        Sendero
      </span>
      <h1 className="font-serif text-display-sm">El Panamá que no sale en el folleto</h1>
      <p className="text-body-lg text-content-secondary">
        Base lista. El portal todavía no está construido: los componentes llegan en la Fase 1 y las
        pantallas en la Fase 3.
      </p>
      <Link
        href="/tokens-preview"
        className="flex h-control-md w-fit items-center rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content"
      >
        Ver la vista de tokens
      </Link>
    </main>
  );
}
