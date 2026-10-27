import { ContactDetails } from "@/components/site/contact-details";
import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getSiteSettings } from "@/lib/content/settings";

export const generateMetadata = () => institutionalMetadata("showroom");

export default async function ShowroomPage() {
  const locale = await getLocale();
  const [dict, settings] = await Promise.all([getDictionary(locale), getSiteSettings()]);
  return <InstitutionalPage page="showroom" aside={<ContactDetails locale={locale} dict={dict} settings={settings} />} />;
}
