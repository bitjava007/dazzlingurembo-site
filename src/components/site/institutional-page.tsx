import type { Metadata } from "next";
import type { RouteKey } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { alternates } from "@/lib/metadata";
import { PageIntro, PendingContent } from "./page-intro";

type PageKey = Exclude<RouteKey, "home">;

export async function institutionalMetadata(page: PageKey): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return { title: dict.pages[page].title, alternates: alternates(locale, page) };
}

/**
 * Page institutionnelle en attente de ses textes officiels.
 * En Phase 4, le contenu viendra de la table `pages`, éditable dans l'administration.
 */
export async function InstitutionalPage({ page }: { page: PageKey }) {
  const dict = await getDictionary();
  return (
    <>
      <PageIntro eyebrow={dict.pages[page].eyebrow} title={dict.pages[page].title} />
      <PendingContent title={dict.content.pending} text={dict.content.pendingText} />
    </>
  );
}
