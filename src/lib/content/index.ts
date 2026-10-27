import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { demoCatalogues, demoModels, demoThemes } from "./demo";
import { matchesSlug } from "./localize";
import { CATALOGUE_SELECT, isSlug, MODEL_SELECT, toCatalogue, toModel, toTheme, type CatalogueRow, type ModelRow } from "./mappers";
import { tags } from "./tags";
import type { Catalogue, Model, Theme } from "./types";

export type { Catalogue, Model, Picture, Theme } from "./types";
export { tags } from "./tags";

/**
 * Accès aux contenus publiés. Chaque lecture est mise en cache et étiquetée :
 * l'administration invalide ces étiquettes (`updateTag`) à chaque modification,
 * ce qui rend les changements visibles sans reconstruire le site.
 *
 * Source : Supabase avec le client visiteur (le RLS ne laisse passer que les contenus
 * publiés). Sans configuration Supabase, des données de démonstration prennent le relais.
 */
export const isDemoContent = !isSupabaseConfigured;

/** Erreur de lecture : on journalise côté serveur sans exposer le détail au visiteur. */
function fail(context: string, error: { message: string }): never {
  console.error(`[content] ${context}: ${error.message}`);
  throw new Error("Contenu momentanément indisponible.");
}

function byNewest(a: Model, b: Model) {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/** Ordre de mise en avant choisi par l'administratrice ; sans ordre, les plus récents d'abord. */
function byFeaturedOrder<T extends { featuredOrder: number | null; publishedAt: string }>(a: T, b: T) {
  return (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity) || b.publishedAt.localeCompare(a.publishedAt);
}

export async function getThemes(): Promise<Theme[]> {
  "use cache";
  cacheTag(tags.themes);
  cacheLife("days");
  if (isDemoContent) return [...demoThemes].sort((a, b) => a.position - b.position);
  const { data, error } = await createPublicClient()
    .from("themes")
    .select("*")
    .eq("status", "published")
    .order("position")
    .order("name_fr");
  if (error) fail("themes", error);
  return data.map(toTheme);
}

/** Thématique désignée par son identifiant d'URL, dans l'une ou l'autre langue. */
export async function getThemeBySlug(slug: string): Promise<Theme | null> {
  return (await getThemes()).find((t) => matchesSlug(t.slug, slug)) ?? null;
}

async function getAllModels(): Promise<Model[]> {
  "use cache";
  cacheTag(tags.models);
  cacheLife("days");
  if (isDemoContent) return [...demoModels].sort(byNewest);
  const { data, error } = await createPublicClient()
    .from("models")
    .select(MODEL_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<ModelRow[]>();
  if (error) fail("models", error);
  return data.map(toModel);
}

export async function getModels(options: { themeId?: string } = {}): Promise<Model[]> {
  const models = await getAllModels();
  return options.themeId ? models.filter((m) => m.themeIds.includes(options.themeId!)) : models;
}

/** Modèles mis en avant sur l'accueil, à défaut les plus récents. */
export async function getHomeModels(limit = 4): Promise<Model[]> {
  const models = await getAllModels();
  const featured = models.filter((m) => m.isFeatured).sort(byFeaturedOrder);
  return (featured.length ? featured : models).slice(0, limit);
}

export async function getModelBySlug(slug: string): Promise<Model | null> {
  "use cache";
  cacheTag(tags.models);
  cacheLife("days");
  if (isDemoContent) return demoModels.find((m) => matchesSlug(m.slug, slug)) ?? null;
  if (!isSlug(slug)) return null;
  const { data, error } = await createPublicClient()
    .from("models")
    .select(MODEL_SELECT)
    .eq("status", "published")
    .or(`slug_fr.eq.${slug},slug_en.eq.${slug}`)
    .limit(1)
    .returns<ModelRow[]>();
  if (error) fail("model", error);
  const model = data[0] ? toModel(data[0]) : null;
  if (model) cacheTag(tags.model(model.id));
  return model;
}

/** Autres modèles partageant au moins une thématique. */
export async function getRelatedModels(model: Model, limit = 4): Promise<Model[]> {
  const models = await getAllModels();
  return models.filter((m) => m.id !== model.id && m.themeIds.some((id) => model.themeIds.includes(id))).slice(0, limit);
}

export async function getCatalogues(): Promise<Catalogue[]> {
  "use cache";
  cacheTag(tags.catalogues);
  cacheLife("days");
  if (isDemoContent) return [...demoCatalogues].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const { data, error } = await createPublicClient()
    .from("catalogues")
    .select(CATALOGUE_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<CatalogueRow[]>();
  if (error) fail("catalogues", error);
  return data.map(toCatalogue);
}

/** Catalogues mis en avant, dans l'ordre choisi par l'administratrice. */
export async function getFeaturedCatalogues(limit = 3): Promise<Catalogue[]> {
  const catalogues = await getCatalogues();
  return catalogues.filter((c) => c.isFeatured).sort(byFeaturedOrder).slice(0, limit);
}

export async function getCatalogueBySlug(slug: string): Promise<Catalogue | null> {
  const catalogue = (await getCatalogues()).find((c) => matchesSlug(c.slug, slug)) ?? null;
  return catalogue;
}

/** Modèles publiés d'un catalogue, dans l'ordre défini pour ce catalogue. */
export async function getCatalogueModels(catalogue: Catalogue): Promise<Model[]> {
  const models = new Map((await getAllModels()).map((m) => [m.id, m]));
  return catalogue.modelIds.map((id) => models.get(id)).filter((m): m is Model => Boolean(m));
}

export async function getModelCatalogues(model: Model): Promise<Catalogue[]> {
  return (await getCatalogues()).filter((c) => c.modelIds.includes(model.id));
}
