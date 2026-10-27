import Link from "next/link";
import { StatusBadge } from "./ui";
import type { ContentStatusValue } from "@/lib/supabase/database.types";

/** Bandeau de l'aperçu : rappelle le statut et permet de basculer de langue. */
export function PreviewBar({ status, basePath, locale, backHref }: { status: ContentStatusValue; basePath: string; locale: "fr" | "en"; backHref: string }) {
  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 bg-ink px-4 py-3 text-sm text-mist sm:px-8">
      <span className="flex flex-wrap items-center gap-3">
        <strong className="font-medium text-ivory">Aperçu</strong>
        <StatusBadge status={status} />
        {status !== "published" && <span>Non visible par les visiteurs.</span>}
      </span>
      <span className="flex items-center gap-4">
        <Link href={`${basePath}?lang=fr`} aria-current={locale === "fr" ? "page" : undefined} className={locale === "fr" ? "text-ivory underline" : "hover:text-ivory"}>
          Français
        </Link>
        <Link href={`${basePath}?lang=en`} aria-current={locale === "en" ? "page" : undefined} className={locale === "en" ? "text-ivory underline" : "hover:text-ivory"}>
          Anglais
        </Link>
        <Link href={backHref} className="border border-stone px-3 py-1.5 hover:text-ivory">
          Retour à l&apos;édition
        </Link>
      </span>
    </div>
  );
}
