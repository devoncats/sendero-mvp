import type { Categoria, CategoriaId } from "./tipos";

export const CATEGORIAS: readonly Categoria[] = [
  { id: "artesania", nombre: { es: "Artesanía", en: "Crafts" } },
  { id: "comida", nombre: { es: "Comida", en: "Food" } },
  { id: "hospedaje", nombre: { es: "Hospedaje", en: "Lodging" } },
  { id: "experiencias", nombre: { es: "Experiencias", en: "Experiences" } },
  { id: "transporte", nombre: { es: "Transporte local", en: "Local transport" } },
  { id: "campo", nombre: { es: "Productos del campo", en: "Farm produce" } },
] as const;

const POR_ID = new Map(CATEGORIAS.map((c) => [c.id, c]));

export function categoria(id: CategoriaId): Categoria {
  const c = POR_ID.get(id);
  // Con CategoriaId como unión cerrada esto no puede pasar, pero si alguien
  // añade un id al tipo y olvida la entrada, es mejor romper que dibujar vacío.
  if (!c) throw new Error(`Categoría desconocida: ${id}`);
  return c;
}
