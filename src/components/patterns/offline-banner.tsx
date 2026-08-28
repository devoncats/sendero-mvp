import { WifiOff } from "@/components/icons";
import { Inline } from "@/components/layout";
import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * La franja de sin conexión. Presentacional a propósito: detectar el estado real
 * de la red necesita `navigator.onLine` y por tanto un componente cliente, y esa
 * es una decisión que se toma —y se paga en kilobytes— al armar el layout del
 * portal, no aquí.
 *
 * `role="status"` para que un lector de pantalla lo anuncie sin robar el foco.
 * El mensaje por defecto no dice "error": dice qué se puede seguir haciendo.
 */
export function OfflineBanner({
  mensaje = "Sin señal. Ves los negocios que guardaste, con su teléfono y su dirección.",
  className,
}: {
  mensaje?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "border-b border-warning-border bg-warning-surface px-gutter py-inset-sm",
        className,
      )}
    >
      <Inline gap="icon" wrap={false}>
        <WifiOff className="size-icon-sm shrink-0 text-warning-content" aria-hidden />
        <Text size="body-sm" tone="warning" weight="medium">
          {mensaje}
        </Text>
      </Inline>
    </div>
  );
}
