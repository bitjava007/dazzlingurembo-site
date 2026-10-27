import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { demoCatalogues, demoModels, demoThemes } from "./demo";
import { matchesSlug } from "./localize";
import type { Catalogue, Model, Theme } from "./types";

export type { Catalogue, Model, Picture, Theme } from "./types";

/**
 * Accès aux contenus publiés. Chaque lecture est mise en cache et étiquetée :
 * l'administration invalidera ces étiquettes (`updateTag`) à chaque publication,
 * ce qui rend les changements visibles sans reconstruire le site.
 *
 * Source actuelle : données de démonstration. En Phase 4, ces fonctions
 * interrogeront Supabase (contenus « publiés » uniquement, garantis par le RLS)
 * sans changer leur signature.
 */
export const isDemoContent = true;

export const tags = {
  themes: "themes",
  models: "models",
  catalogues: "catalogues",
  model: (id: string) => `model:${id}`,
  catalogue: (id: string) => `catalogue:${id}`,
} as const;

function byNewest(a: Model, b: Model) {
  return b.publishedAt.localeCompare(a.publishedAt);
}

export async function getThemes(): Promise<Theme[]> {
  "use cache";
  cacheTag(tags.themes);
  cacheLife("days");
  return [...demoThemes].sort((a, b) => a.position - b.position);
}

/** Thématique désignée par son identifiant d'URL, dans l'une ou l'autre langue. */
export async function getThemeBySlug(slug: string): Promise<Theme | null> {
  return (await getThemes()).find((t) => matchesSlug(t.slug, slug)) ?? null;
}

export async function getModels(options: { themeId?: string } = {}): Promise<Model[]> {
  "use cache";
  cacheTag(tags.models);
  cacheLife("days");
  return demoModels.filter((m) => !options.themeId || m.themeIds.includes(options.themeId)).sort(byNewest);
}

/** Modèles mis en avant sur l'accueil, à défaut les plus récents. */
export async function getHomeModels(limit = 4): Promise<Model[]> {
  const models = await getModels();
  const featured = models.filter((m) => m.isFeatured);
  return (featured.length ? featured : models).slice(0, limit);
}

export async function getModelBySlug(slug: string): Promise<Model | null> {
  "use cache";
  cacheTag(tags.models);
  cacheLife("days");
  const model = demoModels.find((m) => matchesSlug(m.slug, slug)) ?? null;
  if (model) cacheTag(tags.model(model.id));
  return model;
}

/** Autres modèles partageant au moins une thématique. */
export async function getRelatedModels(model: Model, limit = 4): Promise<Model[]> {
  const models = await getModels();
  return models.filter((m) => m.id !== model.id && m.themeIds.some((id) => model.themeIds.includes(id))).slice(0, limit);
}

export async function getCatalogues(): Promise<Catalogue[]> {
  "use cache";
  cacheTag(tags.catalogues);
  cacheLife("days");
  return [...demoCatalogues].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getFeaturedCatalogues(limit = 3): Promise<Catalogue[]> {
  return (await getCatalogues()).filter((c) => c.isFeatured).slice(0, limit);
}

export async function getCatalogueBySlug(slug: string): Promise<Catalogue | null> {
  "use cache";
  cacheTag(tags.catalogues);
  cacheLife("days");
  const catalogue = demoCatalogues.find((c) => matchesSlug(c.slug, slug)) ?? null;
  if (catalogue) cacheTag(tags.catalogue(catalogue.id));
  return catalogue;
}

/** Modèles publiés d'un catalogue, dans l'ordre défini pour ce catalogue. */
export async function getCatalogueModels(catalogue: Catalogue): Promise<Model[]> {
  const models = new Map((await getModels()).map((m) => [m.id, m]));
  return catalogue.modelIds.map((id) => models.get(id)).filter((m): m is Model => Boolean(m));
}

export async function getModelCatalogues(model: Model): Promise<Catalogue[]> {
  return (await getCatalogues()).filter((c) => c.modelIds.includes(model.id));
}
