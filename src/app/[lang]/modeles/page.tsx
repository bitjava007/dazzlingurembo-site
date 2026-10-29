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
      {/* Les filtres dépendent de l'adresse (?theme=…&material=…) : rendus à la demande, données en cache. */}
      <Suspense fallback={<Filters locale={locale} dict={dict} themes={themes} category={null} material={null} materials={[]} />}>
        <FilteredGallery locale={locale} dict={dict} themes={themes} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function param(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
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
  const params = await searchParams;
  const [requestedCategory, requestedMaterial] = await Promise.all([
    param(params.theme) ? getThemeBySlug(param(params.theme)!) : null,
    param(params.material) ? getThemeBySlug(param(params.material)!) : null,
  ]);
  // Une ancienne adresse ?theme=bazin désigne une matière : elle est traitée comme telle.
  const category = requestedCategory?.kind === "category" ? requestedCategory : null;
  const material = requestedMaterial?.kind === "material" ? requestedMaterial : requestedCategory?.kind === "material" ? requestedCategory : null;

  const inCategory = await getModels({ themeId: category?.id });
  const models = material ? inCategory.filter((m) => m.themeIds.includes(material.id)) : inCategory;
  // Seules les matières présentes dans la catégorie choisie sont proposées.
  const materials = themes.filter((t) => t.kind === "material" && inCategory.some((m) => m.themeIds.includes(t.id)));

  return (
    <>
      <Filters locale={locale} dict={dict} themes={themes} category={category} material={material} materials={materials} />
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

type FilterItem = { key: string; label: string; href: string; current: boolean };

function Filters({
  locale,
  dict,
  themes,
  category,
  material,
  materials,
}: {
  locale: Locale;
  dict: Dictionary;
  themes: Theme[];
  category: Theme | null;
  material: Theme | null;
  materials: Theme[];
}) {
  const base = localePath(locale, "models");
  const href = (c: Theme | null, m: Theme | null) => {
    const query = new URLSearchParams();
    if (c) query.set("theme", c.slug[locale]);
    if (m) query.set("material", m.slug[locale]);
    const qs = query.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const categories: FilterItem[] = [
    { key: "all", label: dict.gallery.all, href: href(null, material), current: category === null },
    ...themes
      .filter((t) => t.kind === "category")
      .map((t) => ({ key: t.id, label: text(t.name, locale), href: href(t, material), current: category?.id === t.id })),
  ];
  const materialItems: FilterItem[] = materials.length
    ? [
        { key: "all-materials", label: dict.gallery.allMaterials, href: href(category, null), current: material === null },
        ...materials.map((t) => ({ key: t.id, label: text(t.name, locale), href: href(category, t), current: material?.id === t.id })),
      ]
    : [];

  return (
    <nav aria-label={dict.gallery.filterLabel} className="sticky top-16 z-30 border-y border-line bg-ivory lg:top-20">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-4 py-3 sm:px-8">
        <FilterRow items={categories} />
        {materialItems.length > 0 && <FilterRow items={materialItems} label={dict.gallery.materialLabel} small />}
      </div>
    </nav>
  );
}

function FilterRow({ items, label, small }: { items: FilterItem[]; label?: string; small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="shrink-0 text-[0.6875rem] uppercase tracking-[0.16em] text-taupe">{label}</span>}
      <ul className="flex gap-2 overflow-x-auto sm:flex-wrap">
        {items.map((item) => (
          <li key={item.key} className="shrink-0">
            <Link
              href={item.href}
              scroll={false}
              aria-current={item.current ? "page" : undefined}
              className={`inline-flex items-center border uppercase transition-colors ${
                small ? "min-h-9 px-4 text-[0.6875rem] tracking-[0.14em]" : "min-h-11 px-5 text-xs tracking-[0.16em]"
              } ${item.current ? "border-ink bg-ink text-ivory" : "border-mist hover:border-ink"}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
