import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Vérification centrale de l'administration (côté serveur).
 * Utilisée par chaque page et chaque action : une personne non connectée, ou connectée
 * sans figurer dans la liste des administrateurs, n'obtient rien. Le RLS applique
 * de toute façon les mêmes règles à chaque requête vers la base.
 */
export async function requireAdmin() {
  const supabase = await createSessionClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/connexion");
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) redirect("/admin/connexion?erreur=acces");
  return { supabase, email: auth.user.email ?? "" };
}

export type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];
