import "server-only";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import type { AdminClient } from "./auth";
import { dbMessage, FormError, uuid } from "./form";

type CoverTable = "catalogues" | "themes";

/**
 * Remplace la couverture d'un catalogue ou d'une thématique par un fichier déjà
 * téléversé dans son dossier, puis supprime l'ancien fichier.
 */
export async function replaceCover(supabase: AdminClient, table: CoverTable, rawId: string, path: string | null) {
  const id = uuid(rawId);
  if (path !== null && !new RegExp(`^${table}/${id}/[0-9a-f-]{36}\\.webp$`).test(path)) throw new FormError("Chemin de fichier invalide.");
  const { data: current, error: readError } = await supabase.from(table).select("cover_path").eq("id", id).single();
  if (readError) throw new FormError(dbMessage(readError, `cover ${table}`));
  const { error } = await supabase.from(table).update({ cover_path: path }).eq("id", id);
  if (error) throw new FormError(dbMessage(error, `cover ${table}`));
  if (current.cover_path && current.cover_path !== path) {
    await supabase.storage.from(MEDIA_BUCKET).remove([current.cover_path]);
  }
  return id;
}
