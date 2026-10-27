"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getModelBySlug } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export type ContactState = { ok: boolean; message: string; submittedAt?: number } | null;

const MIN_FILL_MS = 3000;

const schema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.union([z.literal(""), z.email().max(200)]),
    phone: z.string().trim().max(40).regex(/^[0-9+().\s-]*$/),
    subject: z.string().trim().min(1).max(200),
    message: z.string().trim().min(1).max(5000),
  })
  .refine((v) => v.email !== "" || v.phone !== "", { path: ["email"] });

/** Empreinte non réversible de l'adresse IP, utilisée seulement pour limiter les envois. */
async function ipHash(): Promise<string | null> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip");
  if (!ip) return null;
  const salt = process.env.CONTACT_HASH_SALT ?? "dazzling-urembo-contact";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Enregistre un message de contact. Le succès n'est annoncé que si la base
 * a réellement enregistré le message.
 */
export async function submitContact(_: ContactState, form: FormData): Promise<ContactState> {
  const rawLocale = String(form.get("locale") ?? "fr");
  const locale = hasLocale(rawLocale) ? rawLocale : "fr";
  const dict = await getDictionary(locale);
  const errors = dict.contactForm.errors;

  // Piège à robots : champ invisible pour les personnes, rempli par les robots.
  if (String(form.get("website") ?? "") !== "") return { ok: false, message: errors.invalid };
  const started = Number(form.get("started"));
  if (!Number.isFinite(started) || started <= 0) return { ok: false, message: errors.invalid };
  if (Date.now() - started < MIN_FILL_MS) return { ok: false, message: errors.tooFast };

  const parsed = schema.safeParse({
    name: form.get("name") ?? "",
    email: String(form.get("email") ?? "").trim().toLowerCase(),
    phone: form.get("phone") ?? "",
    subject: form.get("subject") ?? "",
    message: form.get("message") ?? "",
  });
  if (!parsed.success) {
    const reach = parsed.error.issues.some((i) => i.path[0] === "email" && i.code === "custom");
    return { ok: false, message: reach ? errors.reach : errors.invalid };
  }
  if (!isSupabaseConfigured) return { ok: false, message: errors.unavailable };

  const slug = String(form.get("model") ?? "");
  const model = slug ? await getModelBySlug(slug).catch(() => null) : null;

  const { error } = await createPublicClient().rpc("submit_contact_message", {
    p_name: parsed.data.name,
    p_email: parsed.data.email || null,
    p_phone: parsed.data.phone || null,
    p_subject: parsed.data.subject,
    p_message: parsed.data.message,
    p_locale: locale,
    p_model_id: model?.id ?? null,
    p_ip_hash: await ipHash(),
  });
  if (error) {
    if (error.message.includes("rate_limited")) return { ok: false, message: errors.rateLimited };
    console.error("[contact]", error.code, error.message);
    return { ok: false, message: errors.unavailable };
  }
  return { ok: true, message: dict.contactForm.success, submittedAt: Date.now() };
}
