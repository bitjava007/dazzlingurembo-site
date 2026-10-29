"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { checkbox, dbMessage, errorMessage, failure, FormError, success, text, type ActionState } from "@/lib/admin/form";
import { tags } from "@/lib/content/tags";

function httpsUrl(form: FormData, name: string, label: string, max = 300) {
  const value = text(form, name, max);
  if (value && !/^https:\/\/[^\s]+$/.test(value)) throw new FormError(`${label} : saisissez une adresse complète commençant par https://`);
  return value;
}

export async function updateSettings(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const whatsapp = text(form, "whatsapp_number", 25);
    if (whatsapp && !/^\+?[0-9 ().-]{6,25}$/.test(whatsapp)) {
      throw new FormError("Numéro WhatsApp : utilisez le format international, par exemple +243 81 000 0000.");
    }
    const email = text(form, "contact_email", 200);
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new FormError("Adresse e-mail invalide.");

    const { error } = await supabase
      .from("site_settings")
      .update({
        whatsapp_number: whatsapp,
        contact_email: email,
        phone: text(form, "phone", 40),
        address: text(form, "address", 500),
        maps_url: httpsUrl(form, "maps_url", "Lien Google Maps", 500),
        opening_hours_fr: text(form, "opening_hours_fr", 500),
        opening_hours_en: text(form, "opening_hours_en", 500),
        instagram_url: httpsUrl(form, "instagram_url", "Instagram"),
        facebook_url: httpsUrl(form, "facebook_url", "Facebook"),
        tiktok_url: httpsUrl(form, "tiktok_url", "TikTok"),
        watermark_enabled: checkbox(form, "watermark_enabled"),
      })
      .eq("id", 1);
    if (error) return failure(dbMessage(error, "updateSettings"));
    updateTag(tags.settings);
    return success("Paramètres enregistrés : le site est à jour.");
  } catch (e) {
    return failure(errorMessage(e, "updateSettings"));
  }
}
