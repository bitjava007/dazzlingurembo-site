import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewBar } from "@/components/admin/preview-bar";
import { CatalogueDetail } from "@/components/site/catalogue-detail";
import { getDictionary } from "@/i18n/dictionaries";
import { requireAdmin } from "@/lib/admin/auth";
import { CATALOGUE_SELECT, MODEL_SELECT, toCatalogue, toModel, toTheme, type CatalogueRow, type ModelRow } from "@/lib/content/mappers";

export const metadata: Metadata = { title: "Aperçu d'un catalogue", robots: { index: false } };

export default async function CataloguePreview({ params, searchParams }: PageProps<"/admin/apercu/catalogues/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const locale = query.lang === "en" ? "en" : "fr";
  const { supabase } = await requireAdmin();

  const { data: row } = await supabase.from("catalogues").select(CATALOGUE_SELECT).eq("id", id).returns<CatalogueRow[]>().maybeSingle();
  if (!row) notFound();
  const catalogue = toCatalogue(row);

  // Comme sur le site : seuls les modèles publiés du catalogue apparaissent.
  const [dict, modelsRes, themesRes] = await Promise.all([
    getDictionary(locale),
    catalogue.modelIds.length
      ? supabase.from("models").select(MODEL_SELECT).in("id", catalogue.modelIds).eq("status", "published").returns<ModelRow[]>()
      : Promise.resolve({ data: [] as ModelRow[] }),
    supabase.from("themes").select("*").eq("status", "published").order("position"),
  ]);
  const byId = new Map((modelsRes.data ?? []).map((m) => [m.id, toModel(m)]));
  const models = catalogue.modelIds.map((mid) => byId.get(mid)).filter((m) => m !== undefined);

  return (
    <div lang={locale}>
      <PreviewBar status={row.status} basePath={`/admin/apercu/catalogues/${id}`} locale={locale} backHref={`/admin/catalogues/${id}`} />
      <CatalogueDetail locale={locale} dict={dict} catalogue={catalogue} models={models} themes={(themesRes.data ?? []).map(toTheme)} />
    </div>
  );
}
