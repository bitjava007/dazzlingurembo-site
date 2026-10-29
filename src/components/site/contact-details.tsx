import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { pick } from "@/lib/content/localize";
import { whatsappUrl, type SiteSettings } from "@/lib/site";
import { ChatIcon, PinIcon } from "./icons";

/** Coordonnées renseignées dans l'administration ; les champs vides ne s'affichent pas. */
export function ContactDetails({ locale, dict, settings }: { locale: Locale; dict: Dictionary; settings: SiteSettings }) {
  const hours = pick(settings.openingHours, locale);
  type Row = { label: string; value: ReactNode };
  const rows = ([
    settings.address && { label: dict.details.address, value: <span className="whitespace-pre-line">{settings.address}</span> },
    hours && { label: dict.details.hours, value: <span className="whitespace-pre-line" lang={hours.isFallback ? "fr" : undefined}>{hours.text}</span> },
    settings.phone && { label: dict.details.phone, value: <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="link-underline">{settings.phone}</a> },
    settings.contactEmail && { label: dict.details.email, value: <a href={`mailto:${settings.contactEmail}`} className="link-underline">{settings.contactEmail}</a> },
  ] as Array<Row | null | false | "">).filter((r): r is Row => Boolean(r));

  return (
    <section className="flex flex-col gap-5 border-t border-line pt-6">
      <h2 className="eyebrow">{dict.details.title}</h2>
      {rows.length === 0 && !settings.whatsappNumber && !settings.mapsUrl ? (
        <p className="font-light text-umber">{dict.details.none}</p>
      ) : (
        <dl className="flex flex-col gap-4">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-col gap-1">
              <dt className="text-[0.6875rem] uppercase tracking-[0.2em] text-taupe">{r.label}</dt>
              <dd className="text-[0.9375rem]">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {settings.mapsUrl && (
        <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline self-start">
          <PinIcon size={18} />
          {dict.details.map}
        </a>
      )}
      {settings.whatsappNumber && (
        <a href={whatsappUrl(settings.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn btn-dark self-start">
          <ChatIcon size={18} />
          {dict.actions.chatOnWhatsapp}
        </a>
      )}
    </section>
  );
}
