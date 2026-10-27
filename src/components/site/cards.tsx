import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import { ArrowIcon } from "./icons";
import { Photo } from "./photo";
import { pick, text } from "@/lib/content/localize";
import type { Catalogue, Model, Theme } from "@/lib/content/types";

export function ModelCard({
  model,
  locale,
  themes,
  pendingLabel,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  model: Model;
  locale: Locale;
  themes: Theme[];
  pendingLabel: string;
  sizes?: string;
}) {
  const name = pick(model.name, locale);
  const themeNames = themes.filter((t) => model.themeIds.includes(t.id)).map((t) => text(t.name, locale));
  return (
    <Link href={localePath(locale, "models", model.slug[locale])} className="group flex flex-col gap-4">
      <Photo
        picture={model.images[0] ?? null}
        alt={pick(model.images[0]?.alt ?? { fr: null, en: null }, locale)?.text ?? name.text}
        sizes={sizes}
        pendingLabel={pendingLabel}
        className="transition-opacity duration-300 group-hover:opacity-90"
      />
      <span className="flex flex-col gap-1.5">
        {themeNames.length > 0 && (
          <span className="text-[0.6875rem] uppercase tracking-[0.2em] text-taupe">{themeNames.join(" · ")}</span>
        )}
        <span className="font-serif text-2xl leading-tight" lang={name.isFallback ? "fr" : undefined}>
          {name.text}
        </span>
      </span>
    </Link>
  );
}

export function CatalogueCard({
  catalogue,
  locale,
  countLabel,
  pendingLabel,
}: {
  catalogue: Catalogue;
  locale: Locale;
  countLabel: string;
  pendingLabel: string;
}) {
  const title = pick(catalogue.title, locale);
  const description = pick(catalogue.description, locale);
  return (
    <Link href={localePath(locale, "collections", catalogue.slug[locale])} className="group flex flex-col gap-5">
      <Photo
        picture={catalogue.cover}
        alt={title.text}
        ratio="4 / 5"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        pendingLabel={pendingLabel}
        className="transition-opacity duration-300 group-hover:opacity-90"
      />
      <span className="flex flex-col gap-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.2em] text-taupe">{countLabel}</span>
        <span className="font-serif text-3xl leading-tight" lang={title.isFallback ? "fr" : undefined}>
          {title.text}
        </span>
        {description && (
          <span className="font-light leading-relaxed text-umber" lang={description.isFallback ? "fr" : undefined}>
            {description.text}
          </span>
        )}
      </span>
    </Link>
  );
}

export function ThemeTile({ theme, locale, href }: { theme: Theme; locale: Locale; href: string }) {
  const name = text(theme.name, locale);
  return (
    <Link href={href} className="group flex flex-col gap-3">
      <Photo picture={theme.cover} alt={name} sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw" />
      <span className="flex items-center justify-between text-sm uppercase tracking-[0.16em]">
        {name}
        <ArrowIcon size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/** Mention discrète affichée quand un texte anglais manque et que le français est montré. */
export function FrenchOnlyNote({ label, title }: { label: string; title: string }) {
  return (
    <span title={title} className="inline-flex w-fit items-center border border-line px-2 py-0.5 text-[0.6875rem] uppercase tracking-[0.14em] text-taupe">
      {label}
    </span>
  );
}
