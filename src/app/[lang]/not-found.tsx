import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export default async function NotFound() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return (
    <section className="mx-auto flex max-w-[1320px] flex-col items-start gap-6 px-4 py-32 sm:px-8">
      <span className="eyebrow">{dict.notFound.eyebrow}</span>
      <h1 className="display text-5xl sm:text-6xl">{dict.notFound.title}</h1>
      <p className="text-lg font-light text-umber">{dict.notFound.text}</p>
      <Link href={localePath(locale, "home")} className="btn btn-dark mt-4">
        {dict.actions.backHome}
      </Link>
    </section>
  );
}
