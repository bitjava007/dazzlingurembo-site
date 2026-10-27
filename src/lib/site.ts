/**
 * Paramètres publics du site. En Phase 4, ces valeurs viendront de la table
 * `site_settings` (modifiable dans l'administration) ; d'ici là, elles sont lues
 * dans les variables d'environnement et restent vides si elles ne sont pas fournies.
 * Aucune coordonnée n'est inventée : un élément non configuré n'est pas affiché.
 */
export type SiteSettings = {
  whatsappNumber: string | null;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  openingHours: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
};

function env(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return {
    whatsappNumber: env("SITE_WHATSAPP_NUMBER"),
    contactEmail: env("SITE_CONTACT_EMAIL"),
    phone: env("SITE_PHONE"),
    address: env("SITE_ADDRESS"),
    openingHours: null,
    instagramUrl: env("SITE_INSTAGRAM_URL"),
    facebookUrl: env("SITE_FACEBOOK_URL"),
    tiktokUrl: env("SITE_TIKTOK_URL"),
  };
}

export function siteUrl(): string {
  return (env("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Lien wa.me ; `message` est prérempli dans la conversation. */
export function whatsappUrl(number: string, message?: string): string {
  const digits = number.replace(/[^\d]/g, "");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}
