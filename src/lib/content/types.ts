import type { Locale } from "@/i18n/config";

/**
 * Types des contenus publics. Ils reflètent le schéma prévu dans Supabase
 * (docs/PHASE-1-PLAN.md §4) : un texte français obligatoire, un texte anglais facultatif.
 */
export type Localized = { fr: string; en: string | null };
export type OptionalLocalized = { fr: string | null; en: string | null };
export type Slugs = Record<Locale, string>;

/** Teinte d'attente utilisée tant qu'aucune photographie n'est fournie. */
export type PlaceholderTone = "deep" | "umber" | "earth" | "sand" | "linen" | "night";

export type Picture = {
  id: string;
  /** URL publique de l'image (Supabase Storage) ; null = photographie à venir. */
  src: string | null;
  alt: OptionalLocalized;
  width: number;
  height: number;
  tone: PlaceholderTone;
};

export type Theme = {
  id: string;
  slug: Slugs;
  name: Localized;
  description: OptionalLocalized;
  cover: Picture | null;
  position: number;
};

export type Model = {
  id: string;
  slug: Slugs;
  reference: string | null;
  name: Localized;
  description: OptionalLocalized;
  material: OptionalLocalized;
  craftsmanship: OptionalLocalized;
  /** Photos dans l'ordre d'affichage ; la première est la photo principale. */
  images: Picture[];
  themeIds: string[];
  isFeatured: boolean;
  /** Ordre de mise en avant sur l'accueil (plus petit = premier). */
  featuredOrder: number | null;
  publishedAt: string;
};

export type Catalogue = {
  id: string;
  slug: Slugs;
  title: Localized;
  description: OptionalLocalized;
  cover: Picture | null;
  isFeatured: boolean;
  featuredOrder: number | null;
  /** Modèles dans l'ordre défini par l'administratrice pour ce catalogue. */
  modelIds: string[];
  publishedAt: string;
};
