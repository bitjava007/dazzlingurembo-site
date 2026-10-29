import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { emptySettings, type SiteSettings } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { tags } from "./tags";
import type { OptionalLocalized } from "./types";

/** Paramètres du site (coordonnées, WhatsApp, réseaux), mis en cache et invalidés à l'enregistrement. */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(tags.settings);
  cacheLife("days");
  if (!isSupabaseConfigured) return emptySettings;
  const { data, error } = await createPublicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) {
    console.error("[content] settings:", error.message);
    return emptySettings;
  }
  if (!data) return emptySettings;
  return {
    whatsappNumber: data.whatsapp_number,
    contactEmail: data.contact_email,
    phone: data.phone,
    address: data.address,
    mapsUrl: data.maps_url,
    openingHours: { fr: data.opening_hours_fr, en: data.opening_hours_en },
    instagramUrl: data.instagram_url,
    facebookUrl: data.facebook_url,
    tiktokUrl: data.tiktok_url,
  };
}

export type PageKey = "home" | "story" | "craftsmanship" | "showroom" | "contact" | "legal" | "privacy";

export type PageContent = {
  title: OptionalLocalized;
  body: OptionalLocalized;
  seoDescription: OptionalLocalized;
};

const emptyPage: PageContent = {
  title: { fr: null, en: null },
  body: { fr: null, en: null },
  seoDescription: { fr: null, en: null },
};

/** Texte institutionnel saisi dans l'administration (Pages et contenus). */
export async function getPage(key: PageKey): Promise<PageContent> {
  "use cache";
  cacheTag(tags.page(key));
  cacheLife("days");
  if (!isSupabaseConfigured) return emptyPage;
  const { data, error } = await createPublicClient().from("pages").select("*").eq("key", key).maybeSingle();
  if (error) {
    console.error(`[content] page ${key}:`, error.message);
    return emptyPage;
  }
  if (!data) return emptyPage;
  return {
    title: { fr: data.title_fr, en: data.title_en },
    body: { fr: data.body_fr, en: data.body_en },
    seoDescription: { fr: data.seo_description_fr, en: data.seo_description_en },
  };
}
