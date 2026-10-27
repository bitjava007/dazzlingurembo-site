import type { OptionalLocalized } from "@/lib/content/types";

/**
 * Paramètres publics du site, modifiables dans l'administration (Paramètres du site).
 * Aucune coordonnée n'est inventée : un élément non renseigné n'est pas affiché.
 * Lecture : `getSiteSettings()` dans `@/lib/content/settings`.
 */
export type SiteSettings = {
  whatsappNumber: string | null;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  openingHours: OptionalLocalized;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
};

export const emptySettings: SiteSettings = {
  whatsappNumber: null,
  contactEmail: null,
  phone: null,
  address: null,
  openingHours: { fr: null, en: null },
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

/** Lien wa.me ; `message` est prérempli dans la conversation. */
export function whatsappUrl(number: string, message?: string): string {
  const digits = number.replace(/[^\d]/g, "");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}
