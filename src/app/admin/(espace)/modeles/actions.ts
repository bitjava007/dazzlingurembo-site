"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  checkbox,
  dbMessage,
  errorMessage,
  failure,
  FormError,
  integer,
  required,
  resolveSlug,
  success,
  text,
  uuid,
  uuids,
  type ActionState,
} from "@/lib/admin/form";
import { refreshContent } from "@/lib/admin/revalidate";
import { tags } from "@/lib/content/tags";
import { MEDIA_BUCKET } from "@/lib/supabase/env";

const STATUSES = ["draft", "published", "archived"] as const;
type Status = (typeof STATUSES)[number];

function modelFields(form: FormData) {
  return {
    name_fr: required(form, "name_fr", "Nom — français", 160),
    name_en: text(form, "name_en", 160),
    reference: text(form, "reference", 60),
    description_fr: text(form, "description_fr", 5000),
    description_en: text(form, "description_en", 5000),
    material_fr: text(form, "material_fr", 300),
    material_en: text(form, "material_en", 300),
    craftsmanship_fr: text(form, "craftsmanship_fr", 3000),
    craftsmanship_en: text(form, "craftsmanship_en", 3000),
    is_featured: checkbox(form, "is_featured"),
    featured_order: integer(form, "featured_order"),
  };
}

/** Création : le modèle naît en brouillon, invisible du public. */
export async function createModel(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  let id: string;
  try {
    const fields = modelFields(form);
    const slug_fr = await resolveSlug(supabase, "models", "slug_fr", null, fields.name_fr);
    const slug_en = await resolveSlug(supabase, "models", "slug_en", null, fields.name_en ?? fields.name_fr);
    const { data, error } = await supabase.from("models").insert({ ...fields, slug_fr, slug_en, status: "draft" }).select("id").single();
    if (error) return failure(dbMessage(error, "createModel"));
    id = data.id;
  } catch (e) {
    return failure(errorMessage(e, "createModel"));
  }
  redirect(`/admin/modeles/${id}?ok=cree`);
}

/** Enregistre le contenu, les identifiants d'URL, les thématiques et les catalogues. */
export async function updateModel(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = uuid(form.get("id"));
    const fields = modelFields(form);
    const slug_fr = await resolveSlug(supabase, "models", "slug_fr", text(form, "slug_fr", 120), fields.name_fr, id);
    const slug_en = await resolveSlug(supabase, "models", "slug_en", text(form, "slug_en", 120), fields.name_en ?? fields.name_fr, id);

    const { error } = await supabase.from("models").update({ ...fields, slug_fr, slug_en }).eq("id", id);
    if (error) return failure(dbMessage(error, "updateModel"));

    const themes = await supabase.rpc("set_model_themes", { p_model_id: id, p_theme_ids: uuids(form, "themes") });
    if (themes.error) return failure(dbMessage(themes.error, "set_model_themes"));
    const catalogues = await supabase.rpc("set_model_catalogues", { p_model_id: id, p_catalogue_ids: uuids(form, "catalogues") });
    if (catalogues.error) return failure(dbMessage(catalogues.error, "set_model_catalogues"));

    refreshContent(tags.model(id));
    return success("Modifications enregistrées.");
  } catch (e) {
    return failure(errorMessage(e, "updateModel"));
  }
}

const statusMessages: Record<Status, string> = {
  published: "Modèle publié : il est maintenant visible sur le site.",
  draft: "Modèle repassé en brouillon : il n'est plus visible sur le site.",
  archived: "Modèle archivé : il n'est plus visible sur le site, ses photos et liens sont conservés.",
};

export async function setModelStatus(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = uuid(form.get("id"));
    const status = form.get("status") as Status;
    if (!STATUSES.includes(status)) throw new FormError("Statut inconnu.");
    const { error } = await supabase.from("models").update({ status }).eq("id", id);
    if (error) return failure(dbMessage(error, "setModelStatus"));
    refreshContent(tags.model(id));
    return success(statusMessages[status]);
  } catch (e) {
    return failure(errorMessage(e, "setModelStatus"));
  }
}

/**
 * Suppression définitive : réservée aux modèles archivés et retirés de tous les catalogues
 * (règles imposées aussi par la base). Les photos sont supprimées du stockage.
 */
export async function deleteModel(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = uuid(form.get("id"));
    const { data: images } = await supabase.from("model_images").select("storage_path").eq("model_id", id);
    const { error } = await supabase.from("models").delete().eq("id", id);
    if (error) {
      if (error.code === "23503") return failure("Retirez d'abord ce modèle de tous ses catalogues, puis supprimez-le.");
      return failure(dbMessage(error, "deleteModel"));
    }
    if (images?.length) await supabase.storage.from(MEDIA_BUCKET).remove(images.map((i) => i.storage_path));
    refreshContent(tags.model(id));
  } catch (e) {
    return failure(errorMessage(e, "deleteModel"));
  }
  redirect("/admin/modeles?ok=supprime");
}

// ─── Photos ──────────────────────────────────────────────────────────────────

/**
 * Enregistre une photo déjà téléversée dans Storage par le navigateur de l'administratrice.
 * Le chemin doit appartenir au dossier du modèle. La première photo devient la principale.
 */
export async function registerModelImage(input: { modelId: string; path: string; width: number; height: number }): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const modelId = uuid(input.modelId);
    if (!new RegExp(`^models/${modelId}/[0-9a-f-]{36}\\.(webp|jpg|png)$`).test(input.path)) throw new FormError("Chemin de fichier invalide.");
    const width = Math.round(Number(input.width));
    const height = Math.round(Number(input.height));
    const { data: existing, error: readError } = await supabase.from("model_images").select("position").eq("model_id", modelId).order("position", { ascending: false }).limit(1);
    if (readError) return failure(dbMessage(readError, "registerModelImage"));
    const { error } = await supabase.from("model_images").insert({
      model_id: modelId,
      storage_path: input.path,
      width: width > 0 ? width : null,
      height: height > 0 ? height : null,
      position: existing.length ? existing[0].position + 1 : 0,
      is_primary: existing.length === 0,
    });
    if (error) return failure(dbMessage(error, "registerModelImage"));
    refreshContent(tags.model(modelId));
    return success("Photo ajoutée.");
  } catch (e) {
    return failure(errorMessage(e, "registerModelImage"));
  }
}

/** Nouvel ordre des photos ; la première devient la photo principale. */
export async function reorderModelImages(input: { modelId: string; imageIds: string[] }): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const modelId = uuid(input.modelId);
    const ids = input.imageIds.map(uuid);
    const { error } = await supabase.rpc("set_model_images_order", { p_model_id: modelId, p_image_ids: ids });
    if (error) return failure(dbMessage(error, "reorderModelImages"));
    refreshContent(tags.model(modelId));
    return success("Ordre des photos enregistré.");
  } catch (e) {
    return failure(errorMessage(e, "reorderModelImages"));
  }
}

export async function updateImageAlt(input: { modelId: string; imageId: string; altFr: string; altEn: string }): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const modelId = uuid(input.modelId);
    const clean = (v: string) => v.trim().slice(0, 300) || null;
    const { error } = await supabase
      .from("model_images")
      .update({ alt_fr: clean(input.altFr), alt_en: clean(input.altEn) })
      .eq("id", uuid(input.imageId))
      .eq("model_id", modelId);
    if (error) return failure(dbMessage(error, "updateImageAlt"));
    refreshContent(tags.model(modelId));
    return success("Description de la photo enregistrée.");
  } catch (e) {
    return failure(errorMessage(e, "updateImageAlt"));
  }
}

/** Supprime une photo (après confirmation dans l'interface) : base puis fichier. */
export async function deleteModelImage(input: { modelId: string; imageId: string }): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const modelId = uuid(input.modelId);
    const { data, error } = await supabase
      .from("model_images")
      .delete()
      .eq("id", uuid(input.imageId))
      .eq("model_id", modelId)
      .select("storage_path, is_primary")
      .single();
    if (error) return failure(dbMessage(error, "deleteModelImage"));
    await supabase.storage.from(MEDIA_BUCKET).remove([data.storage_path]);

    // Si la photo principale a été supprimée, la suivante prend sa place.
    if (data.is_primary) {
      const { data: rest } = await supabase.from("model_images").select("id").eq("model_id", modelId).order("position");
      if (rest?.length) await supabase.rpc("set_model_images_order", { p_model_id: modelId, p_image_ids: rest.map((r) => r.id) });
    }
    refreshContent(tags.model(modelId));
    return success("Photo supprimée.");
  } catch (e) {
    return failure(errorMessage(e, "deleteModelImage"));
  }
}
