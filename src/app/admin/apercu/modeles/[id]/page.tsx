import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewBar } from "@/components/admin/preview-bar";
import { ModelDetail } from "@/components/site/model-detail";
import { getDictionary } from "@/i18n/dictionaries";
import { requireAdmin } from "@/lib/admin/auth";
import { CATALOGUE_SELECT, MODEL_SELECT, toCatalogue, toModel, toTheme, type CatalogueRow, type ModelRow } from "@/lib/content/mappers";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = { title: "Aperçu d'un modèle", robots: { index: false } };

export default async function ModelPreview({ params, searchParams }: PageProps<"/admin/apercu/modeles/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const locale = query.lang === "en" ? "en" : "fr";
  const { supabase } = await requireAdmin();

  const { data: row } = await supabase.from("models").select(MODEL_SELECT).eq("id", id).returns<ModelRow[]>().maybeSingle();
  if (!row) notFound();
  const model = toModel(row);

  const [dict, themesRes, cataloguesRes, settings] = await Promise.all([
    getDictionary(locale),
    supabase.from("themes").select("*").neq("status", "archived").order("position"),
    supabase.from("catalogues").select(CATALOGUE_SELECT).neq("status", "archived").returns<CatalogueRow[]>(),
    getSiteSettings(),
  ]);
  const catalogues = (cataloguesRes.data ?? []).map(toCatalogue).filter((c) => c.modelIds.includes(model.id));

  return (
    <div lang={locale}>
      <PreviewBar status={row.status} basePath={`/admin/apercu/modeles/${id}`} locale={locale} backHref={`/admin/modeles/${id}`} />
      <ModelDetail
        locale={locale}
        dict={dict}
        model={model}
        themes={(themesRes.data ?? []).map(toTheme)}
        catalogues={catalogues}
        related={[]}
        settings={settings}
      />
    </div>
  );
}
