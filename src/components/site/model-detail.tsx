import Link from "next/link";
import type { ReactNode } from "react";
import { FrenchOnlyNote, ModelCard } from "@/components/site/cards";
import { ChatIcon } from "@/components/site/icons";
import { ModelGallery } from "@/components/site/model-gallery";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { format } from "@/i18n/format";
import { pick, text, type LocalizedText } from "@/lib/content/localize";
import type { Catalogue, Model, Theme } from "@/lib/content/types";
import { whatsappUrl } from "@/lib/site";

type ModelDetailProps = {
  locale: Locale;
  dict: Dictionary;
  model: Model;
  themes: Theme[];
  catalogues: Catalogue[];
  related: Model[];
  settings: { whatsappNumber: string | null };
};

/** Fiche détaillée d'un modèle : utilisée par le site public et par l'aperçu de l'administration. */
export function ModelDetail({ locale, dict, model, themes, catalogues, related, settings }: ModelDetailProps) {
  const name = pick(model.name, locale);
  const description = pick(model.description, locale);
  const material = pick(model.material, locale);
  const craftsmanship = pick(model.craftsmanship, locale);
  const modelThemes = themes.filter((t) => model.themeIds.includes(t.id));
  const hasFallback = [name, description, material, craftsmanship].some((v) => v?.isFallback);

  const message = format(dict.model.whatsappMessage, {
    name: name.text,
    ref: model.reference ? ` (${dict.model.reference} ${model.reference})` : "",
  });

  const slides = model.images.map((picture, i) => ({
    picture,
    alt: pick(picture.alt, locale)?.text ?? `${name.text} — ${format(dict.model.photo, { i: i + 1, n: model.images.length })}`,
  }));

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[1320px] px-4 pt-8 sm:px-8">
        <ol className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-taupe">
          <li>
            <Link href={localePath(locale, "home")} className="hover:text-ink">{dict.nav.home}</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={localePath(locale, "models")} className="hover:text-ink">{dict.nav.models}</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">{name.text}</li>
        </ol>
      </nav>

      <section className="mx-auto flex max-w-[1320px] flex-wrap gap-10 px-4 pb-24 pt-6 sm:px-8 lg:gap-16">
        <div className="min-w-0 flex-[999_1_520px]">
          <ModelGallery slides={slides} photoLabel={dict.model.photo} pendingLabel={dict.content.photoPending} />
        </div>

        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-8 self-start lg:sticky lg:top-28">
          {modelThemes.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label={dict.model.themes}>
              {modelThemes.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`${localePath(locale, "models")}?theme=${encodeURIComponent(t.slug[locale])}`}
                    className="inline-flex border border-mist px-3 py-1.5 text-[0.6875rem] uppercase tracking-[0.16em] hover:border-ink"
                  >
                    {text(t.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-3">
            <h1 className="display text-5xl sm:text-[3.25rem]" lang={name.isFallback ? "fr" : undefined}>{name.text}</h1>
            {model.reference && (
              <p className="text-xs uppercase tracking-[0.16em] text-taupe">
                {dict.model.reference} {model.reference}
              </p>
            )}
            {hasFallback && <FrenchOnlyNote label={dict.model.frenchOnlyLabel} title={dict.model.frenchOnly} />}
          </div>

          {description && <Paragraph value={description} />}

          <Details
            rows={[
              material && { label: dict.model.material, value: <Localized value={material} /> },
              craftsmanship && { label: dict.model.craftsmanship, value: <Localized value={craftsmanship} /> },
              catalogues.length > 0 && {
                label: dict.model.catalogues,
                value: (
                  <span className="flex flex-wrap gap-x-4 gap-y-1">
                    {catalogues.map((c) => (
                      <Link key={c.id} href={localePath(locale, "collections", c.slug[locale])} className="link-underline">
                        {pick(c.title, locale).text}
                      </Link>
                    ))}
                  </span>
                ),
              },
            ]}
          />

          <div className="flex flex-col gap-3">
            {settings.whatsappNumber && (
              <a
                href={whatsappUrl(settings.whatsappNumber, message)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark w-full"
              >
                <ChatIcon size={18} />
                {dict.model.requestBespoke}
              </a>
            )}
            <Link
              href={`${localePath(locale, "contact")}?modele=${encodeURIComponent(model.slug[locale])}`}
              className={`btn w-full ${settings.whatsappNumber ? "btn-outline" : "btn-dark"}`}
            >
              {settings.whatsappNumber ? dict.model.contactForm : dict.model.requestBespoke}
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && <Related locale={locale} title={dict.model.related} models={related} themes={themes} pending={dict.content.photoPending} />}
    </>
  );
}

function Paragraph({ value }: { value: LocalizedText }) {
  return (
    <p className="whitespace-pre-line text-lg font-light leading-relaxed text-umber" lang={value.isFallback ? "fr" : undefined}>
      {value.text}
    </p>
  );
}

function Localized({ value }: { value: LocalizedText }) {
  return <span lang={value.isFallback ? "fr" : undefined} className="whitespace-pre-line">{value.text}</span>;
}

/** Caractéristiques : seules les informations renseignées sont affichées. */
function Details({ rows }: { rows: Array<{ label: string; value: ReactNode } | false | null> }) {
  const filled = rows.filter((r): r is { label: string; value: ReactNode } => Boolean(r));
  if (filled.length === 0) return null;
  return (
    <dl className="border-t border-line">
      {filled.map((row) => (
        <div key={row.label} className="flex flex-wrap gap-x-6 gap-y-1 border-b border-line py-4">
          <dt className="w-40 shrink-0 text-[0.6875rem] uppercase tracking-[0.2em] text-taupe">{row.label}</dt>
          <dd className="min-w-0 flex-1 text-[0.9375rem]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Related({
  locale,
  title,
  models,
  themes,
  pending,
}: {
  locale: Locale;
  title: string;
  models: Model[];
  themes: Theme[];
  pending: string;
}) {
  return (
    <section className="bg-sand py-20 sm:py-24">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-10 px-4 sm:px-8">
        <h2 className="display text-4xl">{title}</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {models.map((m) => (
            <ModelCard key={m.id} model={m} locale={locale} themes={themes} pendingLabel={pending} />
          ))}
        </div>
      </div>
    </section>
  );
}
