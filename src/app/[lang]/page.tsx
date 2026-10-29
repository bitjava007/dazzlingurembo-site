import type { Metadata } from "next";
import Link from "next/link";
import { CatalogueCard, ModelCard, ThemeTile } from "@/components/site/cards";
import { ArrowIcon, ChatIcon, ImageIcon } from "@/components/site/icons";
import { PhotoPlaceholder } from "@/components/site/page-intro";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { plural } from "@/i18n/format";
import { getFeaturedCatalogues, getHomeModels, getThemes } from "@/lib/content";
import { pick } from "@/lib/content/localize";
import { RichText } from "@/components/site/rich-text";
import { alternates } from "@/lib/metadata";
import { getPage, getSiteSettings } from "@/lib/content/settings";
import { whatsappUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternates(await getLocale(), "home") };
}

export default async function HomePage() {
  const locale = await getLocale();
  const [dict, settings, catalogues, themes, models, homePage, craftPage] = await Promise.all([
    getDictionary(locale),
    getSiteSettings(),
    getFeaturedCatalogues(3),
    getThemes(),
    getHomeModels(4),
    getPage("home"),
    getPage("craftsmanship"),
  ]);
  const categories = themes.filter((t) => t.kind === "category");
  const intro = pick(homePage.body, locale);
  const craft = pick(craftPage.body, locale);
  const galleryHref = localePath(locale, "models");
  // Titre d'ouverture saisi dans l'administration (Pages > Accueil > titre), sinon la signature.
  // Pas de repli vers l'autre langue : sans traduction, la signature reste affichée.
  const heroTitle = homePage.title[locale]?.trim() || dict.meta.tagline;
  const [before, after] = splitTagline(heroTitle);

  return (
    <>
      {/* Ouverture : la grande photographie éditoriale remplacera ce fond. */}
      <section className="relative flex min-h-[78svh] items-end bg-ink-soft">
        <p className="absolute right-4 top-6 flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.18em] text-mist sm:right-8">
          <ImageIcon size={16} />
          {dict.content.photoPending}
        </p>
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-7 px-4 pb-16 sm:px-8 sm:pb-24">
          <span className="text-xs uppercase tracking-[0.32em] text-gold">{dict.home.heroEyebrow}</span>
          <h1 className="display max-w-4xl text-[2.75rem] text-ivory sm:text-7xl lg:text-[5.5rem]">
            {before} <em className="italic text-gold">{after}</em>
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link href={localePath(locale, "collections")} className="btn btn-light">
              {dict.actions.discoverCollections}
              <ArrowIcon size={16} />
            </Link>
            <Link href={localePath(locale, "showroom")} className="btn btn-outline text-ivory">
              {dict.actions.bookAppointment}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-12 px-4 py-24 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:py-32">
        <div className="flex flex-col gap-4">
          <span className="eyebrow">{dict.home.houseEyebrow}</span>
          <h2 className="display text-4xl sm:text-5xl">{dict.home.houseTitle}</h2>
        </div>
        <div className="flex flex-col gap-6 text-lg font-light leading-relaxed text-umber">
          {intro ? <RichText text={intro.text} lang={intro.isFallback ? "fr" : undefined} className="text-lg" /> : <p>{dict.content.pendingText}</p>}
          <Link href={localePath(locale, "story")} className="link-underline self-start text-sm uppercase tracking-[0.16em] text-ink">
            {dict.nav.story}
          </Link>
        </div>
      </section>

      {catalogues.length > 0 && (
        <section className="mx-auto flex max-w-[1320px] flex-col gap-12 px-4 pb-24 sm:px-8 lg:pb-32">
          <SectionHeading
            eyebrow={dict.home.collectionsEyebrow}
            title={dict.home.collectionsTitle}
            link={{ href: localePath(locale, "collections"), label: dict.catalogues.all }}
          />
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="bg-sand py-24 lg:py-32">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-12 px-4 sm:px-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="eyebrow">{dict.home.themesEyebrow}</span>
              <h2 className="display text-4xl sm:text-5xl">{dict.home.themesTitle}</h2>
            </div>
            <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6">
              {categories.map((theme) => (
                <ThemeTile
                  key={theme.id}
                  theme={theme}
                  locale={locale}
                  href={`${galleryHref}?theme=${encodeURIComponent(theme.slug[locale])}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {models.length > 0 && (
        <section className="mx-auto flex max-w-[1320px] flex-col gap-12 px-4 py-24 sm:px-8 lg:py-32">
          <SectionHeading
            eyebrow={dict.home.modelsEyebrow}
            title={dict.home.modelsTitle}
            link={{ href: galleryHref, label: dict.home.modelsCta }}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} locale={locale} themes={themes} pendingLabel={dict.content.photoPending} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-ink text-ivory">
        <div className="grid lg:grid-cols-2">
          <PhotoPlaceholder label={dict.content.photoPending} className="min-h-[360px] lg:min-h-[560px]" />
          <div className="flex max-w-[660px] flex-col justify-center gap-7 px-4 py-20 sm:px-8 lg:px-16">
            <span className="text-xs uppercase tracking-[0.28em] text-gold">{dict.home.bespokeEyebrow}</span>
            <h2 className="display text-4xl sm:text-5xl">{dict.home.bespokeTitle}</h2>
            <p className="line-clamp-6 whitespace-pre-line text-lg font-light leading-relaxed text-mist" lang={craft?.isFallback ? "fr" : undefined}>
              {craft ? craft.text.split(/\n{2,}/).find((b) => !b.startsWith("## ")) : dict.content.pendingText}
            </p>
            <Link href={localePath(locale, "craftsmanship")} className="btn btn-light self-start">
              {dict.actions.requestCreation}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1320px] flex-col items-center gap-7 px-4 py-24 text-center sm:px-8 lg:py-32">
        <h2 className="display max-w-3xl text-4xl sm:text-5xl">{dict.home.contactTitle}</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {settings.whatsappNumber && (
            <a href={whatsappUrl(settings.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
              <ChatIcon size={18} />
              {dict.actions.chatOnWhatsapp}
            </a>
          )}
          <Link href={localePath(locale, "contact")} className="btn btn-outline">
            {dict.nav.contact}
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, link }: { eyebrow: string; title: string; link: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-3">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="display text-4xl sm:text-5xl">{title}</h2>
      </div>
      <Link href={link.href} className="link-underline text-sm uppercase tracking-[0.16em]">
        {link.label}
      </Link>
    </div>
  );
}

/** Met en valeur la fin du titre (« modern elegance. », « vous ressemble. »). */
function splitTagline(tagline: string): [string, string] {
  const words = tagline.split(" ");
  return [words.slice(0, -2).join(" "), words.slice(-2).join(" ")];
}
