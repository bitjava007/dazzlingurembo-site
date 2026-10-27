import "server-only";
import { slugify } from "@/lib/slug";
import type { AdminClient } from "./auth";

/** Résultat d'une action d'administration, affiché à l'administratrice. */
export type ActionState = { ok: boolean; message: string } | null;

export const success = (message: string): ActionState => ({ ok: true, message });
export const failure = (message: string): ActionState => ({ ok: false, message });

/** Texte d'un champ de formulaire, nettoyé ; chaîne vide -> null. */
export function text(form: FormData, name: string, max = 20000): string | null {
  const value = form.get(name);
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return null;
  if (trimmed.length > max) throw new FormError(`Le champ « ${name} » dépasse ${max} caractères.`);
  return trimmed;
}

export function required(form: FormData, name: string, label: string, max = 300): string {
  const value = text(form, name, max);
  if (!value) throw new FormError(`Le champ « ${label} » est obligatoire.`);
  return value;
}

export function checkbox(form: FormData, name: string): boolean {
  return form.get(name) === "on" || form.get(name) === "true";
}

export function integer(form: FormData, name: string): number | null {
  const value = text(form, name, 12);
  if (value === null) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 100000) throw new FormError("Un ordre doit être un nombre entier positif.");
  return n;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID.test(value)) throw new FormError("Identifiant invalide.");
  return value;
}

export function uuids(form: FormData, name: string): string[] {
  return [...new Set(form.getAll(name).map(uuid))];
}

/** Erreur de saisie dont le message peut être montré tel quel. */
export class FormError extends Error {}

/**
 * Traduit une erreur de base de données en message compréhensible, sans divulguer
 * de détail technique (le détail part dans les journaux du serveur).
 */
export function dbMessage(error: { code?: string; message: string }, context: string): string {
  console.error(`[admin] ${context}: ${error.code ?? ""} ${error.message}`);
  switch (error.code) {
    case "23505":
      return "Cette valeur est déjà utilisée (identifiant d'URL ou référence en double).";
    case "23503":
      return "Impossible : cet élément est encore utilisé ailleurs (catalogue, thématique ou modèle).";
    case "23514":
      return "Une valeur ne respecte pas le format attendu.";
    case "42501":
      return "Action non autorisée pour ce compte.";
    case "P0001":
      return error.message;
    default:
      return "L'opération n'a pas pu être enregistrée. Réessayez ; si le problème persiste, contactez le support technique.";
  }
}

/** Message d'une erreur quelconque attrapée dans une action. */
export function errorMessage(error: unknown, context: string): string {
  if (error instanceof FormError) return error.message;
  console.error(`[admin] ${context}:`, error);
  return "L'opération n'a pas pu être enregistrée. Réessayez dans un instant.";
}

/**
 * Identifiant d'URL : celui saisi s'il est fourni, sinon dérivé du nom.
 * Ajoute un suffixe numérique si l'identifiant est déjà pris dans cette table.
 */
export async function resolveSlug(
  supabase: AdminClient,
  table: "models" | "catalogues" | "themes",
  column: "slug_fr" | "slug_en",
  wanted: string | null,
  fallback: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(wanted || fallback) || "sans-titre";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    let query = supabase.from(table).select("id").eq(column, candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error) throw new FormError(dbMessage(error, "slug"));
    if (!data.length) return candidate;
  }
  throw new FormError("Impossible de générer un identifiant d'URL unique ; saisissez-en un.");
}
