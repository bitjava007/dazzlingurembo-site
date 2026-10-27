import { mediaUrl } from "@/lib/supabase/env";
import type { TableRow } from "@/lib/supabase/database.types";
import type { Catalogue, Model, Picture, Theme } from "./types";

/** Sélections Supabase utilisées pour lire modèles et catalogues avec leurs liens. */
export const MODEL_SELECT = "*, model_images(*), model_themes(theme_id)" as const;
export const CATALOGUE_SELECT = "*, catalogue_models(model_id, position)" as const;

export type ModelRow = TableRow<"models"> & {
  model_images: TableRow<"model_images">[];
  model_themes: Pick<TableRow<"model_themes">, "theme_id">[];
};
export type CatalogueRow = TableRow<"catalogues"> & {
  catalogue_models: Pick<TableRow<"catalogue_models">, "model_id" | "position">[];
};

function picture(id: string, path: string | null, alt: { fr: string | null; en: string | null }, w?: number | null, h?: number | null): Picture | null {
  const src = mediaUrl(path);
  if (!src) return null;
  return { id, src, alt, width: w ?? 1200, height: h ?? 1500, tone: "deep" };
}

export function toTheme(row: TableRow<"themes">): Theme {
  return {
    id: row.id,
    slug: { fr: row.slug_fr, en: row.slug_en },
    name: { fr: row.name_fr, en: row.name_en },
    description: { fr: row.description_fr, en: row.description_en },
    cover: picture(`${row.id}-cover`, row.cover_path, { fr: null, en: null }),
    position: row.position,
  };
}

export function toModel(row: ModelRow): Model {
  const images = [...row.model_images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
  );
  return {
    id: row.id,
    slug: { fr: row.slug_fr, en: row.slug_en },
    reference: row.reference,
    name: { fr: row.name_fr, en: row.name_en },
    description: { fr: row.description_fr, en: row.description_en },
    material: { fr: row.material_fr, en: row.material_en },
    craftsmanship: { fr: row.craftsmanship_fr, en: row.craftsmanship_en },
    images: images
      .map((img) => picture(img.id, img.storage_path, { fr: img.alt_fr, en: img.alt_en }, img.width, img.height))
      .filter((p): p is Picture => Boolean(p)),
    themeIds: row.model_themes.map((t) => t.theme_id),
    isFeatured: row.is_featured,
    featuredOrder: row.featured_order,
    publishedAt: row.published_at ?? row.created_at,
  };
}

export function toCatalogue(row: CatalogueRow): Catalogue {
  return {
    id: row.id,
    slug: { fr: row.slug_fr, en: row.slug_en },
    title: { fr: row.title_fr, en: row.title_en },
    description: { fr: row.description_fr, en: row.description_en },
    cover: picture(`${row.id}-cover`, row.cover_path, { fr: null, en: null }),
    isFeatured: row.is_featured,
    featuredOrder: row.featured_order,
    modelIds: [...row.catalogue_models].sort((a, b) => a.position - b.position).map((cm) => cm.model_id),
    publishedAt: row.published_at ?? row.created_at,
  };
}

/** Identifiant réservé, volontairement invalide : ne correspond jamais à un contenu. */
export const EMPTY_SLUG = "_";

/** Un identifiant d'URL valide ne contient que minuscules, chiffres et tirets. */
export function isSlug(value: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) && value.length <= 120;
}
