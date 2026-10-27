import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { supabaseKey, supabaseUrl } from "./env";

/**
 * Client lié à la session de l'utilisateur (cookies). Toutes ses requêtes passent
 * par le RLS avec l'identité de la personne connectée.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appel depuis un Server Component : le proxy se charge de rafraîchir la session.
        }
      },
    },
  });
}
