import type { Locale } from "@/i18n/config";
import type { Localized, OptionalLocalized, Slugs } from "./types";

export type LocalizedText = {
  text: string;
  /** Vrai quand le texte anglais manque et que le français est affiché à sa place. */
  isFallback: boolean;
};

/**
 * Texte dans la langue demandée. Une traduction anglaise manquante n'est jamais
 * générée automatiquement : on affiche le français, signalé comme tel.
 */
export function pick(value: Localized, locale: Locale): LocalizedText;
export function pick(value: OptionalLocalized, locale: Locale): LocalizedText | null;
export function pick(value: OptionalLocalized, locale: Locale): LocalizedText | null {
  const own = value[locale]?.trim();
  if (own) return { text: own, isFallback: false };
  const fr = value.fr?.trim();
  if (locale !== "fr" && fr) return { text: fr, isFallback: true };
  return null;
}

export function text(value: Localized, locale: Locale): string {
  return pick(value, locale).text;
}

export function slugOf(slugs: Slugs, locale: Locale): string {
  return slugs[locale];
}

export function matchesSlug(slugs: Slugs, slug: string): boolean {
  return slugs.fr === slug || slugs.en === slug;
}
