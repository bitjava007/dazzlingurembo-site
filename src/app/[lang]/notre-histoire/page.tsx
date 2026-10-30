import Image from "next/image";
import { InstitutionalPage, institutionalMetadata } from "@/components/site/institutional-page";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import portrait from "@/assets/christelle-matabaro-ndamuso.webp";

export const generateMetadata = () => institutionalMetadata("story");

export default async function Page() {
  const dict = await getDictionary(await getLocale());
  return (
    <InstitutionalPage page="story">
      {/* Portrait de la fondatrice, fourni par la maison, à la fin du texte. */}
      <figure className="flex max-w-md flex-col gap-3">
        <Image
          src={portrait}
          alt={dict.story.portraitAlt}
          sizes="(min-width: 640px) 448px, 100vw"
          placeholder="blur"
          className="h-auto w-full"
        />
        <figcaption className="text-sm text-taupe">{dict.story.portraitCaption}</figcaption>
      </figure>
    </InstitutionalPage>
  );
}
