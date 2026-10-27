import type { ReactNode } from "react";

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 pb-10 pt-16 sm:px-8 sm:pt-24">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="display max-w-4xl text-5xl sm:text-6xl">{title}</h1>
      {children && <div className="max-w-2xl text-lg font-light leading-relaxed text-umber">{children}</div>}
    </section>
  );
}

/** Bloc affiché tant qu'un contenu officiel n'a pas été fourni par la marque. */
export function PendingContent({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto max-w-[1320px] px-4 pb-24 sm:px-8">
      <div className="flex max-w-2xl flex-col gap-2 border-l border-gold py-2 pl-6">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-taupe">{title}</p>
        <p className="font-light leading-relaxed text-umber">{text}</p>
      </div>
    </section>
  );
}

/** Emplacement d'image en attendant les photographies réelles. */
export function PhotoPlaceholder({
  label,
  tone = "dark",
  className = "",
}: {
  label: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const colors = tone === "dark" ? "bg-[#2b2622] text-mist" : "bg-[#d6cab5] text-umber";
  return (
    <div className={`flex items-end p-4 ${colors} ${className}`} role="img" aria-label={label}>
      <span className="text-[0.6875rem] uppercase tracking-[0.18em]" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
