/**
 * Configuration publique de Supabase. Seules l'URL du projet et la clé publiable
 * (anon / publishable) sont utilisées par l'application : elles sont faites pour
 * être exposées, la protection des données reposant sur le RLS.
 * La clé service_role n'est jamais utilisée ici.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const MEDIA_BUCKET = "media";

/** URL publique d'un fichier du bucket `media`. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path || !supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
