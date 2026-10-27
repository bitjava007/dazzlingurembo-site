import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseKey, supabaseUrl } from "./env";

/**
 * Client « visiteur » sans session ni cookie : il ne voit que ce que le RLS autorise
 * au rôle anon (contenus publiés). Utilisable dans les fonctions mises en cache.
 */
export function createPublicClient() {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
