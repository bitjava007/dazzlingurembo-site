import type { Metadata } from "next";
import { localePath, type Locale, type RouteKey } from "@/i18n/config";
import type { Slugs } from "@/lib/content/types";

/** URL canonique et équivalents linguistiques (hreflang) d'une page publique. */
export function alternates(locale: Locale, route: RouteKey, ...rest: string[]): Metadata["alternates"] {
  return {
    canonical: localePath(locale, route, ...rest),
    languages: {
      fr: localePath("fr", route, ...rest),
      en: localePath("en", route, ...rest),
      "x-default": localePath("fr", route, ...rest),
    },
  };
}

/** Variante pour une page de contenu dont l'identifiant d'URL change selon la langue. */
export function alternatesFor(locale: Locale, route: RouteKey, slugs: Slugs): Metadata["alternates"] {
  return {
    canonical: localePath(locale, route, slugs[locale]),
    languages: {
      fr: localePath("fr", route, slugs.fr),
      en: localePath("en", route, slugs.en),
      "x-default": localePath("fr", route, slugs.fr),
    },
  };
}
