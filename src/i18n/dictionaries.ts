import "server-only";
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";
import type fr from "./dictionaries/fr.json";

export type Dictionary = typeof fr;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

/** Langue de la requête en cours, lue depuis le segment racine `[lang]`. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!value || !hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())]();
}
