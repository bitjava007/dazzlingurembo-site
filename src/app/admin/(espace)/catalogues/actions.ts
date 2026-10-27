"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { replaceCover } from "@/lib/admin/cover";
import { checkbox, dbMessage, errorMessage, failure, FormError, integer, required, resolveSlug, success, text, uuid, type ActionState } from "@/lib/admin/form";
import { refreshContent } from "@/lib/admin/revalidate";
import { tags } from "@/lib/content/tags";
import { MEDIA_BUCKET } from "@/lib/supabase/env";

const STATUSES = ["draft", "published", "archived"] as const;
type Status = (typeof STATUSES)[number];

function catalogueFields(form: FormData) {
  return {
    title_fr: required(form, "title_fr", "Titre — français", 160),
    title_en: text(form, "title_en", 160),
    description_fr: text(form, "description_fr", 3000),
    description_en: text(form, "description_en", 3000),
    is_featured: checkbox(form, "is_featured"),
    featured_order: integer(form, "featured_order"),
  };
}

export async function createCatalogue(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  let id: string;
  try {
    const fields = catalogueFields(form);
    const slug_fr = await resolveSlug(supabase, "catalogues", "slug_fr", null, fields.title_fr);
    const slug_en = await resolveSlug(supabase, "catalogues", "slug_en", null, fields.title_en ?? fields.title_fr);
    const { data, error } = await supabase.from("catalogues").insert({ ...fields, slug_fr, slug_en, status: "draft" }).select("id").single();
    if (error) return failure(dbMessage(error, "createCatalogue"));
    id = data.id;
  } catch (e) {
    return failure(errorMessage(e, "createCatalogue"));
  }
  redirect(`/admin/catalogues/${id}?ok=cree`);
}

export async function updateCatalogue(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = uuid(form.get("id"));
    const fields = catalogueFields(form);
    const slug_fr = await resolveSlug(supabase, "catalogues", "slug_fr", text(form, "slug_fr", 120), fields.title_fr, id);
    const slug_en = await resolveSlug(supabase, "catalogues", "slug_en", text(form, "slug_en", 120), fields.title_en ?? fields.title_fr, id);
    const { error } = await supabase.from("catalogues").update({ ...fields, slug_fr, slug_en }).eq("id", id);
    if (error) return failure(dbMessage(error, "updateCatalogue"));
    refreshContent(tags.catalogue(id));
    return success("Modifications enregistrées.");
  } catch (e) {
    return failure(errorMessage(e, "updateCatalogue"));
  }
}

const statusMessages: Record<Status, string> = {
  published: "Catalogue publié : il est visible sur le site.",
  draft: "Catalogue repassé en brouillon : il n'est plus visible. Ses modèles restent intacts.",
  archived: "Catalogue archivé : il n'est plus visible. Ses modèles restent intacts.",
};

export async function setCatalogueStatus(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = uuid(form.get("id"));
    const status = form.get("status") as Status;
    if (!STATUSES.includes(status)) throw new FormError("Statut inconnu.");
    const { error } = await supabase.from("catalogues").update({ status }).eq("id", id);
    if (error) return failure(dbMessage(error, "setCatalogueStatus"));
    refreshContent(tags.catalogue(id));
    return success(statusMessages[status]);
  } catch (e) {
    return failure(errorMessage(e, "setCatalogueStatus"));
  }
}

/** Supprime le catalogue et ses liens ; les modèles ne sont jamais supprimés. */
export async function deleteCatalogue(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = uuid(form.get("id"));
    const { data, error } = await supabase.from("catalogues").delete().eq("id", id).select("cover_path").single();
    if (error) return failure(dbMessage(error, "deleteCatalogue"));
    if (data.cover_path) await supabase.storage.from(MEDIA_BUCKET).remove([data.cover_path]);
    refreshContent(tags.catalogue(id));
  } catch (e) {
    return failure(errorMessage(e, "deleteCatalogue"));
  }
  redirect("/admin/catalogues?ok=supprime");
}

/** Sélection et ordre des modèles du catalogue, enregistrés en une transaction. */
export async function saveCatalogueModels(input: { catalogueId: string; modelIds: string[] }): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const catalogueId = uuid(input.catalogueId);
    const modelIds = [...new Set(input.modelIds.map(uuid))];
    const { error } = await supabase.rpc("set_catalogue_models", { p_catalogue_id: catalogueId, p_model_ids: modelIds });
    if (error) return failure(dbMessage(error, "saveCatalogueModels"));
    refreshContent(tags.catalogue(catalogueId));
    return success("Sélection et ordre des modèles enregistrés.");
  } catch (e) {
    return failure(errorMessage(e, "saveCatalogueModels"));
  }
}

export async function setCatalogueCover(catalogueId: string, path: string | null): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = await replaceCover(supabase, "catalogues", catalogueId, path);
    refreshContent(tags.catalogue(id));
    return success(path ? "Couverture enregistrée." : "Couverture retirée.");
  } catch (e) {
    return failure(errorMessage(e, "setCatalogueCover"));
  }
}
