"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { submitContact, type ContactState } from "./actions";

type Labels = Dictionary["contactForm"];

const input =
  "w-full border border-mist bg-white px-4 py-3 text-base focus:border-ink focus:outline-none aria-[invalid=true]:border-[#b8584a]";

export function ContactForm({ locale, labels, model }: { locale: Locale; labels: Labels; model: { slug: string; name: string } | null }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, null);
  const started = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Heure d'ouverture du formulaire (contrôle anti-robots). Après un envoi réussi, le formulaire
  // est vidé et le chronomètre repart ; après un échec, la saisie est conservée.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
    if (!state || state.ok) started.current = Date.now();
  }, [state]);

  const field = (name: "name" | "email" | "phone" | "subject", type: string, required: boolean, autoComplete?: string, defaultValue?: string) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`contact-${name}`} className="text-sm font-medium">
        {labels[name]} {required && <span className="text-taupe">({labels.required})</span>}
      </label>
      <input id={`contact-${name}`} name={name} type={type} required={required} autoComplete={autoComplete} defaultValue={defaultValue} maxLength={name === "subject" ? 200 : 120} className={input} />
    </div>
  );

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        // Envoi manuel : contrairement à `action={…}`, React ne vide pas le formulaire en cas d'erreur.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        data.set("started", String(started.current));
        startTransition(() => action(data));
      }}
    >
      <h2 className="display text-3xl">{labels.title}</h2>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="model" value={model?.slug ?? ""} />
      {/* Piège à robots : invisible et ignoré par les lecteurs d'écran. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {model && (
        <p className="border-l border-gold py-1 pl-4 text-sm text-umber">
          {labels.model} : <strong className="font-medium">{model.name}</strong>
        </p>
      )}
      {field("name", "text", true, "name")}
      <div className="grid gap-5 sm:grid-cols-2">
        {field("email", "email", false, "email")}
        {field("phone", "tel", false, "tel")}
      </div>
      <p className="-mt-2 text-xs text-taupe">{labels.reachHint}</p>
      {field("subject", "text", true, undefined, model?.name)}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium">
          {labels.message} <span className="text-taupe">({labels.required})</span>
        </label>
        <textarea id="contact-message" name="message" required rows={6} maxLength={5000} className={input} />
      </div>
      <p className="text-xs text-taupe">{labels.privacy}</p>
      <button type="submit" disabled={pending} className="btn btn-dark self-start disabled:opacity-60">
        {pending ? labels.sending : labels.submit}
      </button>
      {state && (
        <p role="status" aria-live="polite" className={`p-4 text-sm ${state.ok ? "bg-[#e8f0e6] text-[#24452a]" : "bg-[#f6e5e1] text-[#7a2a1d]"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
