import type { Locale } from "./config";

/** Remplace les {variables} d'un libellé. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

/** Choisit la forme singulier / pluriel d'un libellé `x_one` / `x_other`. */
export function plural(locale: Locale, n: number, forms: { one: string; other: string }): string {
  const rule = new Intl.PluralRules(locale).select(n);
  return format(rule === "one" ? forms.one : forms.other, { n });
}
