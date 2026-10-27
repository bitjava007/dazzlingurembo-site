"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseKey, supabaseUrl } from "./env";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Client navigateur de l'administration (téléversement direct des photos vers Storage). */
export function getBrowserClient() {
  client ??= createBrowserClient<Database>(supabaseUrl, supabaseKey);
  return client;
}
