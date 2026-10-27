import Link from "next/link";
import { FrenchOnlyNote, ModelCard } from "@/components/site/cards";
import { PendingContent } from "@/components/site/page-intro";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { plural } from "@/i18n/format";
import { pick } from "@/lib/content/localize";
import type { Catalogue, Model, Theme } from "@/lib/content/types";

/** Page d'un catalogue : utilisée par le site public et par l'aperçu de l'administration. */
export function CatalogueDetail({ locale, dict, catalogue, models, themes }: { locale: Locale; dict: Dictionary; catalogue: Catalogue; models: Model[]; themes: Theme[] }) {
  const title = pick(catalogue.title, locale);
  const description = pick(catalogue.description, locale);

  return (
    <>
      <section className="mx-auto flex max-w-[1320px] flex-col gap-5 px-4 pb-14 pt-10 sm:px-8 sm:pt-16">
        <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.14em] text-taupe">
          <Link href={localePath(locale, "collections")} className="hover:text-ink">
            ← {dict.catalogues.back}
          </Link>
        </nav>
        <span className="eyebrow">
          {plural(locale, models.length, { one: dict.catalogues.models_one, other: dict.catalogues.models_other })}
        </span>
        <h1 className="display max-w-4xl text-5xl sm:text-6xl" lang={title.isFallback ? "fr" : undefined}>
          {title.text}
        </h1>
        {(title.isFallback || description?.isFallback) && (
          <FrenchOnlyNote label={dict.model.frenchOnlyLabel} title={dict.model.frenchOnly} />
        )}
        {description && (
          <p className="max-w-2xl text-lg font-light leading-relaxed text-umber" lang={description.isFallback ? "fr" : undefined}>
            {description.text}
          </p>
        )}
      </section>

      {models.length === 0 ? (
        <PendingContent title={dict.content.pending} text={dict.catalogues.emptyModels} />
      ) : (
        <section className="mx-auto grid max-w-[1320px] grid-cols-2 gap-x-4 gap-y-12 px-4 pb-28 sm:gap-x-6 sm:px-8 lg:grid-cols-4">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} locale={locale} themes={themes} pendingLabel={dict.content.photoPending} />
          ))}
        </section>
      )}
    </>
  );
}
