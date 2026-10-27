import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { pick } from "@/lib/content/localize";
import type { SiteSettings } from "@/lib/site";

type FooterProps = { locale: Locale; dict: Dictionary; settings: SiteSettings };

export function Footer({ locale, dict, settings }: FooterProps) {
  const social = [
    { label: "Instagram", href: settings.instagramUrl },
    { label: "Facebook", href: settings.facebookUrl },
    { label: "TikTok", href: settings.tiktokUrl },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  const showroom = [settings.address, pick(settings.openingHours, locale)?.text, settings.phone, settings.contactEmail].filter(
    (v): v is string => Boolean(v),
  );

  return (
    <footer className="bg-ink text-mist">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-14 px-4 pb-10 pt-20 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="font-serif text-xl tracking-[0.26em] text-ivory">DAZZLING UREMBO</span>
            <span className="font-serif text-lg italic text-gold">{dict.meta.tagline}</span>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-stone">{dict.footer.house}</span>
            <Link href={localePath(locale, "story")} className="hover:text-ivory">{dict.nav.story}</Link>
            <Link href={localePath(locale, "craftsmanship")} className="hover:text-ivory">{dict.nav.craftsmanship}</Link>
            <Link href={localePath(locale, "collections")} className="hover:text-ivory">{dict.nav.collections}</Link>
            <Link href={localePath(locale, "models")} className="hover:text-ivory">{dict.nav.models}</Link>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-stone">{dict.footer.showroom}</span>
            {showroom.map((line) => (
              <span key={line} className="whitespace-pre-line">{line}</span>
            ))}
            <Link href={localePath(locale, "showroom")} className="hover:text-ivory">{dict.nav.showroom}</Link>
            <Link href={localePath(locale, "contact")} className="hover:text-ivory">{dict.nav.contact}</Link>
          </div>

          {social.length > 0 && (
            <div className="flex flex-col gap-3 text-sm">
              <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-stone">{dict.footer.follow}</span>
              {social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-ivory">
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-[#2e2a24] pt-6 text-xs text-stone">
          <span>© Dazzling Urembo. {dict.footer.rights}</span>
          <span className="flex flex-wrap gap-6">
            <Link href={localePath(locale, "legal")} className="hover:text-ivory">{dict.footer.legal}</Link>
            <Link href={localePath(locale, "privacy")} className="hover:text-ivory">{dict.footer.privacy}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
