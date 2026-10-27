import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentStatusValue } from "@/lib/supabase/database.types";

export const statusLabels: Record<ContentStatusValue, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

const statusStyles: Record<ContentStatusValue, string> = {
  draft: "bg-[#efe6d3] text-[#5c4a26]",
  published: "bg-[#e3eee0] text-[#24452a]",
  archived: "bg-[#e7e4df] text-[#4a443b]",
};

export function StatusBadge({ status, labels = statusLabels }: { status: ContentStatusValue; labels?: Record<ContentStatusValue, string> }) {
  return <span className={`inline-flex px-2.5 py-1 text-xs font-medium tracking-wide ${statusStyles[status]}`}>{labels[status]}</span>;
}

export function PageHeader({
  title,
  back,
  actions,
  children,
}: {
  title: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {back && (
        <Link href={back.href} className="text-sm text-taupe hover:text-ink">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl font-medium sm:text-4xl">{title}</h1>
          {children}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({ title, description, children, className = "" }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-5 border border-line bg-white p-5 sm:p-6 ${className}`}>
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <h2 className="text-base font-medium">{title}</h2>}
          {description && <p className="text-sm text-taupe">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

const inputClass =
  "w-full border border-mist bg-white px-3 py-2.5 text-[0.9375rem] focus:border-ink focus:outline-none disabled:bg-sand";

type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  type?: "text" | "email" | "url" | "tel" | "number";
  maxLength?: number;
  placeholder?: string;
  lang?: string;
};

export function Field({ label, name, defaultValue, hint, required, optional, type = "text", maxLength, placeholder, lang }: FieldProps) {
  const id = `f-${name}`;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label} {optional && <span className="font-light text-taupe">(facultatif)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        lang={lang}
        min={type === "number" ? 0 : undefined}
        className={`min-h-11 ${inputClass}`}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-taupe">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextArea({ label, name, defaultValue, hint, rows = 5, maxLength, optional, lang }: FieldProps & { rows?: number }) {
  const id = `f-${name}`;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label} {optional && <span className="font-light text-taupe">(facultatif)</span>}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        maxLength={maxLength}
        lang={lang}
        className={`resize-y ${inputClass}`}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-taupe">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Même champ en français et en anglais, côte à côte (empilés sur mobile). */
export function Bilingual({
  label,
  name,
  fr,
  en,
  multiline,
  rows,
  requiredFr,
  optional,
  maxLength,
}: {
  label: string;
  name: string;
  fr?: string | null;
  en?: string | null;
  multiline?: boolean;
  rows?: number;
  requiredFr?: boolean;
  optional?: boolean;
  maxLength?: number;
}) {
  const Input = multiline ? TextArea : Field;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label={`${label} — français`} name={`${name}_fr`} defaultValue={fr} required={requiredFr} optional={optional} rows={rows} maxLength={maxLength} lang="fr" />
      <Input
        label={`${label} — anglais`}
        name={`${name}_en`}
        defaultValue={en}
        optional
        rows={rows}
        maxLength={maxLength}
        lang="en"
        hint={requiredFr ? "Vide : le texte français s'affichera, signalé comme tel." : undefined}
      />
    </div>
  );
}

export function Checkbox({ label, name, defaultChecked, value, hint }: { label: string; name: string; defaultChecked?: boolean; value?: string; hint?: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-[0.9375rem]">
      <input type="checkbox" name={name} value={value ?? "on"} defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-ink" />
      <span className="flex flex-col">
        {label}
        {hint && <span className="text-xs text-taupe">{hint}</span>}
      </span>
    </label>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-mist bg-white p-6 text-center text-sm text-taupe">{children}</p>;
}

export function ButtonLink({ href, children, variant = "dark", external }: { href: string; children: ReactNode; variant?: "dark" | "outline"; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      className={`inline-flex min-h-11 items-center justify-center px-4 text-sm ${
        variant === "dark" ? "bg-ink text-ivory hover:bg-umber" : "border border-mist bg-white hover:border-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Kinshasa" }).format(new Date(value));
}
