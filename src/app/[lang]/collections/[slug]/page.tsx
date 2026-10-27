import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { lang } from "next/root-params";
import { Suspense } from "react";
import { CatalogueDetail } from "@/components/site/catalogue-detail";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCatalogueBySlug, getCatalogueModels, getCatalogues, getThemes } from "@/lib/content";
import { pick } from "@/lib/content/localize";
import { alternatesFor } from "@/lib/metadata";

export async function generateStaticParams() {
  const locale = await lang();
  if (!locale || !hasLocale(locale)) return [];
  return (await getCatalogues()).map((c) => ({ slug: c.slug[locale] }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/collections/[slug]">): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const catalogue = await getCatalogueBySlug(decodeURIComponent(slug));
  if (!catalogue) return {};
  return {
    title: pick(catalogue.title, locale).text,
    description: pick(catalogue.description, locale)?.text,
    alternates: alternatesFor(locale, "collections", catalogue.slug),
  };
}

export default function CataloguePage(props: PageProps<"/[lang]/collections/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <CatalogueContent params={props.params} />
    </Suspense>
  );
}

async function CatalogueContent({ params }: Pick<PageProps<"/[lang]/collections/[slug]">, "params">) {
  const [{ slug: rawSlug }, locale] = await Promise.all([params, getLocale()]);
  const slug = decodeURIComponent(rawSlug);
  const catalogue = await getCatalogueBySlug(slug);
  if (!catalogue) notFound();
  if (catalogue.slug[locale] !== slug) permanentRedirect(localePath(locale, "collections", catalogue.slug[locale]));

  const [dict, models, themes] = await Promise.all([getDictionary(locale), getCatalogueModels(catalogue), getThemes()]);
  return <CatalogueDetail locale={locale} dict={dict} catalogue={catalogue} models={models} themes={themes} />;
}
