export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Pages publiques et leur segment d'URL dans chaque langue.
 * Les dossiers de `src/app/[lang]` portent le segment français ; le proxy
 * réécrit les URL anglaises vers ces dossiers (ex. /en/models -> /en/modeles).
 */
export const routes = {
  home: { fr: "", en: "" },
  collections: { fr: "collections", en: "collections" },
  models: { fr: "modeles", en: "models" },
  story: { fr: "notre-histoire", en: "our-story" },
  craftsmanship: { fr: "savoir-faire", en: "craftsmanship" },
  showroom: { fr: "showroom", en: "showroom" },
  contact: { fr: "contact", en: "contact" },
  legal: { fr: "mentions-legales", en: "legal-notice" },
  privacy: { fr: "confidentialite", en: "privacy" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

/** Construit une URL publique localisée : localePath("en", "models", "robe") -> /en/models/robe */
export function localePath(locale: Locale, route: RouteKey, ...rest: string[]): string {
  const segments = [locale, routes[route][locale], ...rest.map(encodeURIComponent)].filter(Boolean);
  return "/" + segments.join("/");
}

/** Segment public -> clé de route, pour une langue donnée. */
export function routeFromSegment(locale: Locale, segment: string): RouteKey | undefined {
  return (Object.keys(routes) as RouteKey[]).find(
    (key) => key !== "home" && routes[key][locale] === segment,
  );
}

/**
 * Traduit un chemin public d'une langue vers l'autre (sélecteur de langue).
 * Les identifiants de contenus (slugs) sont conservés tels quels ; les pages
 * de contenu fournissent leurs propres équivalents quand ils diffèrent.
 */
export function translatePath(pathname: string, target: Locale): string {
  const [, current, segment, ...rest] = pathname.split("/");
  if (!current || !hasLocale(current)) return `/${target}`;
  if (!segment) return `/${target}`;
  const route = routeFromSegment(current, segment);
  if (!route) return `/${target}`;
  return ["", target, routes[route][target], ...rest].join("/");
}
