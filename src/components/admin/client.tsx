"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ActionState = { ok: boolean; message: string } | null;
type FormAction = (state: ActionState, form: FormData) => Promise<ActionState>;

export function StatusMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p role="status" aria-live="polite" className={`p-3 text-sm ${state.ok ? "bg-[#e8f0e6] text-[#24452a]" : "bg-[#f6e5e1] text-[#7a2a1d]"}`}>
      {state.message}
    </p>
  );
}

/**
 * Formulaire relié à une action serveur, avec message de résultat.
 * `confirm` : demande une confirmation avant l'envoi (suppressions, retraits).
 */
export function ActionForm({
  action,
  children,
  className = "flex flex-col gap-5",
  confirm,
  hidden,
  guard,
}: {
  action: FormAction;
  children: ReactNode;
  className?: string;
  confirm?: string;
  hidden?: Record<string, string>;
  /** Demande confirmation si des cases initialement cochées (associations) ont été décochées. */
  guard?: { field: string; initial: string[]; message: string }[];
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) return e.preventDefault();
        const data = new FormData(e.currentTarget);
        for (const g of guard ?? []) {
          const kept = new Set(data.getAll(g.field).map(String));
          const removed = g.initial.filter((id) => !kept.has(id)).length;
          if (removed && !window.confirm(g.message.replace("{n}", String(removed)))) return e.preventDefault();
        }
      }}
    >
      {hidden && Object.entries(hidden).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
      {children}
      <StatusMessage state={state} />
    </form>
  );
}

export function SubmitButton({ children, variant = "dark", pendingLabel = "Enregistrement…" }: { children: ReactNode; variant?: "dark" | "outline" | "danger"; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  const styles = {
    dark: "bg-ink text-ivory hover:bg-umber",
    outline: "border border-mist bg-white hover:border-ink",
    danger: "border border-[#b8584a] bg-white text-[#8a2f22] hover:bg-[#f6e5e1]",
  }[variant];
  return (
    <button type="submit" disabled={pending} className={`inline-flex min-h-11 items-center justify-center px-4 text-sm disabled:opacity-60 ${styles}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}

const flashMessages: Record<string, string> = {
  cree: "Créé. Vous pouvez compléter la fiche, puis la publier.",
  supprime: "Supprimé.",
};

/** Message transmis après une redirection (?ok=…). */
export function Flash() {
  const params = useSearchParams();
  const message = flashMessages[params.get("ok") ?? ""];
  return message ? <StatusMessage state={{ ok: true, message }} /> : null;
}

const navItems = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/modeles", label: "Modèles" },
  { href: "/admin/catalogues", label: "Catalogues" },
  { href: "/admin/thematiques", label: "Thématiques" },
  { href: "/admin/pages", label: "Pages et contenus" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/parametres", label: "Paramètres du site" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center px-3 text-sm ${active ? "bg-ivory text-ink" : "text-mist hover:text-ivory"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
