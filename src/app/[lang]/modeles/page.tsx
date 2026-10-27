import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ModelCard } from "@/components/site/cards";
import { PageIntro } from "@/components/site/page-intro";
import { localePath, type Locale } from "@/i18n/config";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { plural } from "@/i18n/format";
import { getModels, getThemeBySlug, getThemes, type Theme } from "@/lib/content";
import { text } from "@/lib/content/localize";
import { alternates } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return { title: dict.pages.models.title, description: dict.gallery.intro, alternates: alternates(locale, "models") };
}

export default async function GalleryPage({ searchParams }: PageProps<"/[lang]/modeles">) {
  const locale = await getLocale();
  const [dict, themes] = await Promise.all([getDictionary(locale), getThemes()]);

  return (
    <>
      <PageIntro eyebrow={dict.pages.models.eyebrow} title={dict.pages.models.title}>
        <p>{dict.gallery.intro}</p>
      </PageIntro>
      {/* Le filtre dépend de l'adresse (?theme=…) : il est rendu à la demande, les données restent en cache. */}
      <Suspense fallback={<Filters locale={locale} dict={dict} themes={themes} active={null} />}>
        <FilteredGallery locale={locale} dict={dict} themes={themes} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function FilteredGallery({
  locale,
  dict,
  themes,
  searchParams,
}: {
  locale: Locale;
  dict: Dictionary;
  themes: Theme[];
  searchParams: PageProps<"/[lang]/modeles">["searchParams"];
}) {
  const { theme: requested } = await searchParams;
  const slug = typeof requested === "string" ? requested : null;
  const theme = slug ? await getThemeBySlug(slug) : null;
  const models = await getModels({ themeId: theme?.id });

  return (
    <>
      <Filters locale={locale} dict={dict} themes={themes} active={theme} />
      <section aria-live="polite" className="mx-auto flex max-w-[1320px] flex-col gap-8 px-4 pb-28 pt-10 sm:px-8">
        <p className="text-sm text-taupe">
          {plural(locale, models.length, { one: dict.gallery.count_one, other: dict.gallery.count_other })}
        </p>
        {models.length === 0 ? (
          <p className="font-light text-umber">{dict.gallery.empty}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} locale={locale} themes={themes} pendingLabel={dict.content.photoPending} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Filters({ locale, dict, themes, active }: { locale: Locale; dict: Dictionary; themes: Theme[]; active: Theme | null }) {
  const base = localePath(locale, "models");
  const items = [
    { key: "all", label: dict.gallery.all, href: base, current: active === null },
    ...themes.map((t) => ({
      key: t.id,
      label: text(t.name, locale),
      href: `${base}?theme=${encodeURIComponent(t.slug[locale])}`,
      current: active?.id === t.id,
    })),
  ];
  return (
    <nav aria-label={dict.gallery.filterLabel} className="sticky top-16 z-30 border-y border-line bg-ivory lg:top-20">
      <ul className="mx-auto flex max-w-[1320px] gap-2 overflow-x-auto px-4 py-3 sm:flex-wrap sm:px-8">
        {items.map((item) => (
          <li key={item.key} className="shrink-0">
            <Link
              href={item.href}
              scroll={false}
              aria-current={item.current ? "page" : undefined}
              className={`inline-flex min-h-11 items-center border px-5 text-xs uppercase tracking-[0.16em] transition-colors ${
                item.current ? "border-ink bg-ink text-ivory" : "border-mist hover:border-ink"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
