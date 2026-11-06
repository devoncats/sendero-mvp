import type { Metadata } from "next";

import { MessageCircle } from "@/components/icons";
import { Container, Inline, Stack } from "@/components/layout";
import { Badge, ButtonLink, Surface, Text } from "@/components/ui";
import { INSUMOS, PROVEEDORES, negocioPorSlug } from "@/data";
import { enlaceWhatsApp } from "@/lib/formato";

import { Cabecera, Nota } from "../../_piezas";

export const metadata: Metadata = { title: "Proveedores" };

/**
 * A quién le compran las familias, y qué les falta.
 *
 * Los proveedores van ordenados por lo urgente: primero los que tienen un
 * pedido pendiente, después el resto. Si un proveedor es del propio valle se
 * dice, porque comprarle a él también es derrame — la plata se queda en la
 * comunidad una vuelta más.
 */
export default function ProveedoresPage() {
  const lista = PROVEEDORES.map((p) => {
    const insumos = INSUMOS.filter((i) => i.proveedor === p.id);
    const faltan = insumos.filter((i) => i.existencias < i.minimo);
    return { p, insumos, faltan };
  }).sort((a, b) => b.faltan.length - a.faltan.length);
  const locales = PROVEEDORES.filter((p) => p.local).length;

  return (
    <Container ancho="md" as="main" className="py-stack lg:max-w-page-lg">
      <Stack gap="default">
        <Cabecera
          titulo="Proveedores"
          apunte={`${locales} de ${PROVEEDORES.length} son del propio valle`}
        />

        <ul className="grid gap-inset-md lg:grid-cols-2">
          {lista.map(({ p, insumos, faltan }) => (
            <li key={p.id}>
              <Surface relleno="md" className={faltan.length > 0 ? "h-full border-warning-border" : "h-full"}>
                <Stack gap="tight">
                  <Inline justify="between" align="start" gap="sm" wrap={false}>
                    <Stack gap="none" className="min-w-0">
                      <Text as="h2" size="body-md" weight="semibold">
                        {p.nombre}
                      </Text>
                      <Text size="body-sm" tone="tertiary">
                        {p.rubro} · {p.lugar}
                      </Text>
                    </Stack>
                    {p.local ? <Badge tono="brand">Del valle</Badge> : null}
                  </Inline>

                  <ul className="grid gap-inset-xs">
                    {insumos.map((i) => {
                      const n = negocioPorSlug(i.emprendimiento);
                      const falta = i.existencias < i.minimo;
                      return (
                        <li key={i.emprendimiento + i.nombre} className="text-body-sm">
                          <span className={falta ? "font-semibold text-warning-content" : "text-content-secondary"}>
                            {i.nombre}
                          </span>{" "}
                          <span className="text-content-tertiary">
                            para {n?.nombre} · {i.existencias} de {i.minimo} {i.unidad}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {faltan.length > 0 ? (
                    <ButtonLink
                      href={enlaceWhatsApp(
                        p.whatsapp,
                        [
                          "Hola. Le escribe la cooperativa de El Valle. Queremos hacer un pedido:",
                          ...faltan.map(
                            (i) => `• ${i.minimo - i.existencias} ${i.unidad} de ${i.nombre.toLowerCase()}, para ${negocioPorSlug(i.emprendimiento)?.nombre}`,
                          ),
                        ].join("\n"),
                      )}
                      externo
                      tamano="sm"
                      className="self-start"
                    >
                      <MessageCircle className="size-icon-sm" aria-hidden />
                      Hacer el pedido
                    </ButtonLink>
                  ) : null}
                </Stack>
              </Surface>
            </li>
          ))}
        </ul>

        <Nota>
          Un insumo «falta» cuando hay menos de lo que hace falta para atender un fin de semana lleno.
          El pedido se arma con lo que falta a cada familia, en un solo mensaje.
        </Nota>
      </Stack>
    </Container>
  );
}
