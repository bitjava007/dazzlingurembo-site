import type { Metadata } from "next";
import { localePath, type Locale, type RouteKey } from "@/i18n/config";

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
