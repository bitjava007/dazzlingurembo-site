"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { dbMessage, errorMessage, failure, FormError, success, text, type ActionState } from "@/lib/admin/form";
import { isPageKey } from "@/lib/admin/pages";
import { tags } from "@/lib/content/tags";

export async function updatePage(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const key = String(form.get("key") ?? "");
    if (!isPageKey(key)) throw new FormError("Page inconnue.");
    const { error } = await supabase
      .from("pages")
      .update({
        title_fr: text(form, "title_fr", 200),
        title_en: text(form, "title_en", 200),
        body_fr: text(form, "body_fr", 20000),
        body_en: text(form, "body_en", 20000),
        seo_description_fr: text(form, "seo_description_fr", 300),
        seo_description_en: text(form, "seo_description_en", 300),
      })
      .eq("key", key);
    if (error) return failure(dbMessage(error, "updatePage"));
    updateTag(tags.page(key));
    return success("Page enregistrée : le site est à jour.");
  } catch (e) {
    return failure(errorMessage(e, "updatePage"));
  }
}
