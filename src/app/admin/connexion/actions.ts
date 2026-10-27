"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export type LoginState = { ok: boolean; message: string } | null;

const emailSchema = z.email().max(200);

/** Origine du site pour le lien envoyé par e-mail (domaine de production ou local). */
async function origin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return configured ?? "http://localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Envoie un lien de connexion à usage unique. Aucun compte n'est créé ici :
 * seuls les comptes existants le reçoivent. La réponse est identique dans tous
 * les cas pour ne pas révéler quelles adresses sont enregistrées.
 */
export async function sendLoginLink(_: LoginState, form: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(String(form.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { ok: false, message: "Saisissez une adresse e-mail valide." };
  if (!isSupabaseConfigured) return { ok: false, message: "La base de données n'est pas configurée." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { shouldCreateUser: false, emailRedirectTo: `${await origin()}/admin/auth/confirm` },
  });

  if (error?.status === 429) {
    return { ok: false, message: "Trop de demandes rapprochées. Patientez quelques minutes avant de réessayer." };
  }
  if (error && error.status !== 400 && error.status !== 422) {
    console.error("[admin] login link:", error.status, error.message);
    return { ok: false, message: "L'envoi du lien a échoué. Réessayez dans un instant." };
  }
  return {
    ok: true,
    message: "Si cette adresse est autorisée, un lien de connexion vient de lui être envoyé. Ouvrez-le depuis ce même navigateur.",
  };
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/connexion?message=deconnecte");
}
