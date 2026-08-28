import Link from "next/link";

/**
 * Marcador del dashboard. Existe para probar una sola cosa: que la densidad
 * operacional llega por la cascada desde el layout de ruta. El botón de aquí
 * mide 36 px con el mismo marcado que en el portal mide 48.
 */
export default function DashboardPage() {
  return (
    <main className="mx-auto flex max-w-prose flex-col gap-stack px-gutter py-section">
      <h1 className="text-heading-lg font-semibold">Panel</h1>
      <p className="text-body-lg text-content-secondary">
        Densidad operacional. Sin serif, ritmo de 1rem, controles de 36 px — heredado del layout de
        ruta, sin un solo prop.
      </p>
      <Link
        href="/tokens-preview"
        className="flex h-control-md w-fit items-center rounded-control bg-action-primary px-inset-lg text-body-md font-semibold text-action-primary-content"
      >
        Comparar con el portal
      </Link>
    </main>
  );
}
