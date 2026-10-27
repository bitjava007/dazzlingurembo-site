import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { lang } from "next/root-params";
import { Suspense } from "react";
import { ModelDetail } from "@/components/site/model-detail";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getModelBySlug, getModelCatalogues, getModels, getRelatedModels, getThemes } from "@/lib/content";
import { pick } from "@/lib/content/localize";
import { alternatesFor } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/site";

export async function generateStaticParams() {
  const locale = await lang();
  if (!locale || !hasLocale(locale)) return [];
  return (await getModels()).map((m) => ({ slug: m.slug[locale] }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/modeles/[slug]">): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const model = await getModelBySlug(decodeURIComponent(slug));
  if (!model) return {};
  const name = pick(model.name, locale).text;
  const image = model.images[0]?.src;
  return {
    title: name,
    description: pick(model.description, locale)?.text,
    alternates: alternatesFor(locale, "models", model.slug),
    openGraph: { title: name, images: image ? [image] : undefined },
  };
}

export default function ModelPage(props: PageProps<"/[lang]/modeles/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" aria-busy="true" />}>
      <ModelContent params={props.params} />
    </Suspense>
  );
}

async function ModelContent({ params }: Pick<PageProps<"/[lang]/modeles/[slug]">, "params">) {
  const [{ slug: rawSlug }, locale] = await Promise.all([params, getLocale()]);
  const slug = decodeURIComponent(rawSlug);
  const model = await getModelBySlug(slug);
  if (!model) notFound();
  // Identifiant de l'autre langue (ex. après un changement de langue) : adresse canonique.
  if (model.slug[locale] !== slug) permanentRedirect(localePath(locale, "models", model.slug[locale]));

  const [dict, themes, catalogues, related, settings] = await Promise.all([
    getDictionary(locale),
    getThemes(),
    getModelCatalogues(model),
    getRelatedModels(model),
    getSiteSettings(),
  ]);

  return (
    <ModelDetail locale={locale} dict={dict} model={model} themes={themes} catalogues={catalogues} related={related} settings={settings} />
  );
}
