import "server-only";
import { updateTag } from "next/cache";
import { tags } from "@/lib/content/tags";

/**
 * Rend visibles immédiatement les modifications sur le site public (sans reconstruction).
 * Les listes publiques croisent modèles, catalogues et thématiques : on invalide
 * l'ensemble des contenus, ce qui reste léger pour un site de cette taille.
 */
export function refreshContent(...specific: string[]) {
  updateTag(tags.models);
  updateTag(tags.catalogues);
  updateTag(tags.themes);
  for (const tag of specific) updateTag(tag);
}
