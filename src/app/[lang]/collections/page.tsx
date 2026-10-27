import type { Metadata } from "next";
import { CatalogueCard } from "@/components/site/cards";
import { PageIntro, PendingContent } from "@/components/site/page-intro";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { plural } from "@/i18n/format";
import { getCatalogues } from "@/lib/content";
import { alternates } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return { title: dict.pages.collections.title, description: dict.catalogues.intro, alternates: alternates(locale, "collections") };
}

export default async function CollectionsPage() {
  const locale = await getLocale();
  const [dict, catalogues] = await Promise.all([getDictionary(locale), getCatalogues()]);

  return (
    <>
      <PageIntro eyebrow={dict.pages.collections.eyebrow} title={dict.pages.collections.title}>
        <p>{dict.catalogues.intro}</p>
      </PageIntro>
      {catalogues.length === 0 ? (
        <PendingContent title={dict.content.pending} text={dict.catalogues.empty} />
      ) : (
        <section className="mx-auto grid max-w-[1320px] gap-x-8 gap-y-16 px-4 pb-28 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {catalogues.map((catalogue) => (
            <CatalogueCard
              key={catalogue.id}
              catalogue={catalogue}
              locale={locale}
              pendingLabel={dict.content.photoPending}
              countLabel={plural(locale, catalogue.modelIds.length, {
                one: dict.catalogues.models_one,
                other: dict.catalogues.models_other,
              })}
            />
          ))}
        </section>
      )}
    </>
  );
}
