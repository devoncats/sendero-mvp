import { cn } from "@/lib/cn";

const TAMANOS = {
  md: "h-control-md",
  lg: "h-control-lg",
} as const;

/**
 * Campo de texto. El foco se ve siempre (regla global) y el estado inválido
 * nunca depende solo del color: quien lo use debe acompañarlo de un mensaje.
 *
 * Es un Server Component: renderiza un <input> sin manejadores. Para un
 * formulario que envía, se usa una Server Action; para uno que valida al
 * escribir, el "use client" se justifica en esa pantalla.
 */
export function Input({
  id,
  name,
  type = "text",
  placeholder,
  defaultValue,
  tamano = "md",
  invalido = false,
  requerido = false,
  describedBy,
  className,
}: {
  id: string;
  name?: string;
  type?: "text" | "tel" | "email" | "search" | "number" | "url";
  placeholder?: string;
  defaultValue?: string;
  tamano?: keyof typeof TAMANOS;
  invalido?: boolean;
  requerido?: boolean;
  describedBy?: string;
  className?: string;
}) {
  return (
    <input
      id={id}
      name={name ?? id}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      required={requerido}
      aria-invalid={invalido || undefined}
      aria-describedby={describedBy}
      className={cn(
        "w-full rounded-control border bg-surface px-inset-md text-body-md text-content-primary",
        "placeholder:text-content-tertiary",
        TAMANOS[tamano],
        invalido ? "border-danger" : "border-border-default",
        className,
      )}
    />
  );
}
