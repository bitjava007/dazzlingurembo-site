"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { replaceCover } from "@/lib/admin/cover";
import { dbMessage, errorMessage, failure, integer, required, resolveSlug, success, text, uuid, type ActionState } from "@/lib/admin/form";
import { refreshContent } from "@/lib/admin/revalidate";
import { MEDIA_BUCKET } from "@/lib/supabase/env";

function themeFields(form: FormData) {
  return {
    name_fr: required(form, "name_fr", "Nom — français", 120),
    name_en: text(form, "name_en", 120),
    description_fr: text(form, "description_fr", 2000),
    description_en: text(form, "description_en", 2000),
    kind: form.get("kind") === "material" ? ("material" as const) : ("category" as const),
    position: integer(form, "position") ?? 0,
    // Une thématique est soit publiée, soit masquée (brouillon).
    status: form.get("visible") === "on" ? ("published" as const) : ("draft" as const),
  };
}

export async function createTheme(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  let id: string;
  try {
    const fields = themeFields(form);
    const slug_fr = await resolveSlug(supabase, "themes", "slug_fr", null, fields.name_fr);
    const slug_en = await resolveSlug(supabase, "themes", "slug_en", null, fields.name_en ?? fields.name_fr);
    const { data, error } = await supabase.from("themes").insert({ ...fields, slug_fr, slug_en }).select("id").single();
    if (error) return failure(dbMessage(error, "createTheme"));
    id = data.id;
    refreshContent();
  } catch (e) {
    return failure(errorMessage(e, "createTheme"));
  }
  redirect(`/admin/thematiques/${id}?ok=cree`);
}

export async function updateTheme(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = uuid(form.get("id"));
    const fields = themeFields(form);
    const slug_fr = await resolveSlug(supabase, "themes", "slug_fr", text(form, "slug_fr", 120), fields.name_fr, id);
    const slug_en = await resolveSlug(supabase, "themes", "slug_en", text(form, "slug_en", 120), fields.name_en ?? fields.name_fr, id);
    const { error } = await supabase.from("themes").update({ ...fields, slug_fr, slug_en }).eq("id", id);
    if (error) return failure(dbMessage(error, "updateTheme"));
    refreshContent();
    return success(fields.status === "published" ? "Thématique enregistrée et visible sur le site." : "Thématique enregistrée (masquée sur le site).");
  } catch (e) {
    return failure(errorMessage(e, "updateTheme"));
  }
}

/**
 * Suppression : refusée tant que des modèles utilisent la thématique (règle de la base).
 * Dans ce cas, l'administratrice peut la masquer.
 */
export async function deleteTheme(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = uuid(form.get("id"));
    const { count } = await supabase.from("model_themes").select("*", { count: "exact", head: true }).eq("theme_id", id);
    if (count) {
      return failure(`Cette thématique est utilisée par ${count} modèle(s) : retirez-la de ces modèles ou masquez-la plutôt que de la supprimer.`);
    }
    const { data, error } = await supabase.from("themes").delete().eq("id", id).select("cover_path").single();
    if (error) {
      if (error.code === "23503") return failure("Cette thématique est encore utilisée par des modèles : masquez-la plutôt.");
      return failure(dbMessage(error, "deleteTheme"));
    }
    if (data.cover_path) await supabase.storage.from(MEDIA_BUCKET).remove([data.cover_path]);
    refreshContent();
  } catch (e) {
    return failure(errorMessage(e, "deleteTheme"));
  }
  redirect("/admin/thematiques?ok=supprime");
}

export async function setThemeCover(themeId: string, path: string | null): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    await replaceCover(supabase, "themes", themeId, path);
    refreshContent();
    return success(path ? "Couverture enregistrée." : "Couverture retirée.");
  } catch (e) {
    return failure(errorMessage(e, "setThemeCover"));
  }
}
