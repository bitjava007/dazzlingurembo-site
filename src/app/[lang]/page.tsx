import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, ChatIcon, ImageIcon } from "@/components/site/icons";
import { PhotoPlaceholder } from "@/components/site/page-intro";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/metadata";
import { getSiteSettings, whatsappUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternates(await getLocale(), "home") };
}

export default async function HomePage() {
  const locale = await getLocale();
  const [dict, settings] = await Promise.all([getDictionary(locale), getSiteSettings()]);
  const [before, after] = splitTagline(dict.meta.tagline);

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
          <p>{dict.content.pendingText}</p>
          <Link href={localePath(locale, "story")} className="link-underline self-start text-sm uppercase tracking-[0.16em] text-ink">
            {dict.nav.story}
          </Link>
        </div>
      </section>

      <section className="bg-ink text-ivory">
        <div className="grid lg:grid-cols-2">
          <PhotoPlaceholder label={dict.content.photoPending} className="min-h-[360px] lg:min-h-[560px]" />
          <div className="flex max-w-[660px] flex-col justify-center gap-7 px-4 py-20 sm:px-8 lg:px-16">
            <span className="text-xs uppercase tracking-[0.28em] text-gold">{dict.home.bespokeEyebrow}</span>
            <h2 className="display text-4xl sm:text-5xl">{dict.home.bespokeTitle}</h2>
            <p className="text-lg font-light leading-relaxed text-mist">{dict.content.pendingText}</p>
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

/** Met en valeur la fin de la signature (« modern elegance. »). */
function splitTagline(tagline: string): [string, string] {
  const words = tagline.split(" ");
  return [words.slice(0, -2).join(" "), words.slice(-2).join(" ")];
}
