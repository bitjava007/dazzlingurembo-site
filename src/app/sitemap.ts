import type { MetadataRoute } from "next";
import { localePath, routes, type RouteKey } from "@/i18n/config";
import { getCatalogues, getModels } from "@/lib/content";
import type { Slugs } from "@/lib/content/types";
import { siteUrl } from "@/lib/site";

/**
 * Plan du site bilingue : chaque page publiée y figure en français, avec son
 * équivalent anglais déclaré (hreflang). Mis à jour avec le cache des contenus.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [catalogues, models] = await Promise.all([getCatalogues(), getModels()]);

  const entry = (route: RouteKey, slugs?: Slugs, lastModified?: string): MetadataRoute.Sitemap[number] => {
    const fr = base + localePath("fr", route, ...(slugs ? [slugs.fr] : []));
    const en = base + localePath("en", route, ...(slugs ? [slugs.en] : []));
    return { url: fr, lastModified, alternates: { languages: { fr, en } } };
  };

  return [
    ...(Object.keys(routes) as RouteKey[]).map((route) => entry(route)),
    ...catalogues.map((c) => entry("collections", c.slug, c.publishedAt)),
    ...models.map((m) => entry("models", m.slug, m.publishedAt)),
  ];
}
