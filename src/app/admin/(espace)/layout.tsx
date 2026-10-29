import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "../connexion/actions";
import { AdminNav } from "@/components/admin/client";
import { Logo } from "@/components/brand/logo";
import { requireAdmin } from "@/lib/admin/auth";

/**
 * Espace d'administration. Tout le contenu passe derrière `requireAdmin()` (session +
 * liste des administrateurs) avant d'être rendu ; la lecture de session se fait
 * dans une zone <Suspense>, comme l'exige le rendu avec Cache Components.
 */
export default function AdminSpaceLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 bg-ink px-4 py-5 text-mist lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:py-8">
        <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start">
          <Link href="/admin" className="flex flex-col gap-2">
            <Logo className="h-10 self-start text-ivory lg:h-12" title="Dazzling Urembo — tableau de bord" />
            <span className="text-[0.6875rem] uppercase tracking-[0.2em] text-stone">Administration</span>
          </Link>
        </div>
        <AdminNav />
        <div className="mt-auto hidden flex-col gap-3 border-t border-[#2e2a24] pt-5 text-xs lg:flex">
          <span className="truncate" title={email}>{email}</span>
          <a href="/fr" target="_blank" rel="noopener" className="hover:text-ivory">Voir le site ↗</a>
          <form action={signOut}>
            <button type="submit" className="min-h-11 text-left hover:text-ivory">Déconnexion</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">{children}</div>
        <div className="mx-auto mt-12 flex max-w-6xl flex-wrap gap-4 border-t border-line pt-5 text-sm text-taupe lg:hidden">
          <span className="truncate">{email}</span>
          <a href="/fr" target="_blank" rel="noopener">Voir le site ↗</a>
          <form action={signOut}>
            <button type="submit" className="min-h-11 underline">Déconnexion</button>
          </form>
        </div>
      </main>
    </div>
  );
}
