import type { Metadata } from "next";

import { Container, Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import { NEGOCIOS } from "@/data";

import { resumir } from "../_resumen";
import { ListaGuardados } from "./lista";

export const metadata: Metadata = { title: "Guardados" };

export default function GuardadosPage() {
  // Los treinta resúmenes viajan al cliente; él decide cuáles enseñar según lo
  // que haya en su propio teléfono. El servidor nunca sabe qué guardó nadie.
  const negocios = NEGOCIOS.map((n) => ({ ...resumir(n), slug: n.slug }));

  return (
    <Container ancho="sm" as="main">
      <Stack gap="loose" className="py-stack-loose">
        <Text as="h1" size="heading-lg" serif weight="semibold">
          Guardados
        </Text>
        <ListaGuardados negocios={negocios} />
      </Stack>
    </Container>
  );
}
