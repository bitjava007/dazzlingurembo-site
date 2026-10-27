import type { Metadata, Viewport } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";
import { Footer } from "@/components/site/footer";
import { Header, type NavItem } from "@/components/site/header";
import { localePath, locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getSiteSettings, siteUrl, whatsappUrl } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${dict.meta.siteName} — ${dict.meta.tagline}`, template: `%s — ${dict.meta.siteName}` },
    description: dict.meta.defaultDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", en: "/en", "x-default": "/fr" },
    },
    openGraph: {
      siteName: dict.meta.siteName,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0e0d0b",
};

export default async function SiteLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const [dict, settings] = await Promise.all([getDictionary(locale), getSiteSettings()]);

  const items: NavItem[] = [
    { href: localePath(locale, "collections"), label: dict.nav.collections },
    { href: localePath(locale, "models"), label: dict.nav.models },
    { href: localePath(locale, "craftsmanship"), label: dict.nav.craftsmanship },
    { href: localePath(locale, "story"), label: dict.nav.story },
    { href: localePath(locale, "showroom"), label: dict.nav.showroom },
    { href: localePath(locale, "contact"), label: dict.nav.contact },
  ];

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-ivory"
        >
          {dict.nav.skipToContent}
        </a>
        <Header
          locale={locale}
          homeHref={localePath(locale, "home")}
          items={items}
          labels={{
            main: dict.nav.main,
            openMenu: dict.nav.openMenu,
            closeMenu: dict.nav.closeMenu,
            language: dict.language.label,
            switchTo: dict.language.switchTo,
            whatsapp: dict.actions.whatsapp,
          }}
          whatsappHref={settings.whatsappNumber ? whatsappUrl(settings.whatsappNumber) : null}
        />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} dict={dict} settings={settings} />
      </body>
    </html>
  );
}
