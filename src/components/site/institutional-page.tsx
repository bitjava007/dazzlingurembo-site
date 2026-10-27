import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { RouteKey } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { pick } from "@/lib/content/localize";
import { getPage, type PageKey } from "@/lib/content/settings";
import { alternates } from "@/lib/metadata";
import { FrenchOnlyNote } from "./cards";
import { PageIntro, PendingContent } from "./page-intro";
import { RichText } from "./rich-text";

type InstitutionalKey = Extract<RouteKey, Exclude<PageKey, "home">>;

export async function institutionalMetadata(page: InstitutionalKey): Promise<Metadata> {
  const locale = await getLocale();
  const [dict, content] = await Promise.all([getDictionary(locale), getPage(page)]);
  return {
    title: pick(content.title, locale)?.text ?? dict.pages[page].title,
    description: pick(content.seoDescription, locale)?.text,
    alternates: alternates(locale, page),
  };
}

/**
 * Page institutionnelle : texte saisi dans l'administration (Pages et contenus).
 * Sans texte, un bloc « contenu en préparation » est affiché — rien n'est inventé.
 * `aside` : informations complémentaires propres à la page (showroom, contact…).
 */
export async function InstitutionalPage({ page, aside, children }: { page: InstitutionalKey; aside?: ReactNode; children?: ReactNode }) {
  const locale = await getLocale();
  const [dict, content] = await Promise.all([getDictionary(locale), getPage(page)]);
  const title = pick(content.title, locale);
  const body = pick(content.body, locale);

  return (
    <>
      <PageIntro eyebrow={dict.pages[page].eyebrow} title={title?.text ?? dict.pages[page].title} />
      <div className="mx-auto flex max-w-[1320px] flex-wrap gap-x-24 gap-y-12 px-4 pb-24 sm:px-8">
        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-4">
          {body ? (
            <>
              {(body.isFallback || title?.isFallback) && <FrenchOnlyNote label={dict.model.frenchOnlyLabel} title={dict.model.frenchOnly} />}
              <RichText text={body.text} lang={body.isFallback ? "fr" : undefined} />
            </>
          ) : (
            !children && <PendingContent inline title={dict.content.pending} text={dict.content.pendingText} />
          )}
          {children && <div className="mt-8 max-w-2xl">{children}</div>}
        </div>
        {aside && <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-8">{aside}</div>}
      </div>
    </>
  );
}
