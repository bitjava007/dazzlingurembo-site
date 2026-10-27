import { Suspense } from "react";
import { ContactDetails } from "@/components/site/contact-details";
import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { getModelBySlug } from "@/lib/content";
import { pick } from "@/lib/content/localize";
import { getSiteSettings } from "@/lib/content/settings";
import { ContactForm } from "./contact-form";

export const generateMetadata = () => institutionalMetadata("contact");

export default async function ContactPage({ searchParams }: PageProps<"/[lang]/contact">) {
  const locale = await getLocale();
  const [dict, settings] = await Promise.all([getDictionary(locale), getSiteSettings()]);
  return (
    <InstitutionalPage page="contact" aside={<ContactDetails locale={locale} dict={dict} settings={settings} />}>
      {/* Le modèle concerné (?modele=…) dépend de l'adresse : rendu à la demande. */}
      <Suspense fallback={<ContactForm locale={locale} labels={dict.contactForm} model={null} />}>
        <FormWithModel locale={locale} dict={dict} searchParams={searchParams} />
      </Suspense>
    </InstitutionalPage>
  );
}

async function FormWithModel({ locale, dict, searchParams }: { locale: Locale; dict: Dictionary; searchParams: PageProps<"/[lang]/contact">["searchParams"] }) {
  const { modele } = await searchParams;
  // Le formulaire doit rester utilisable même si le modèle ne peut pas être retrouvé.
  const model = typeof modele === "string" && modele ? await getModelBySlug(modele).catch(() => null) : null;
  return (
    <ContactForm
      locale={locale}
      labels={dict.contactForm}
      model={model ? { slug: model.slug[locale], name: pick(model.name, locale).text } : null}
    />
  );
}
