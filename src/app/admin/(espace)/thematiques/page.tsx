import type { Metadata } from "next";
import Link from "next/link";
import { Flash } from "@/components/admin/client";
import { ButtonLink, EmptyState, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Thématiques" };

const themeLabels = { published: "Visible", draft: "Masquée", archived: "Masquée" } as const;

export default async function ThemesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("themes").select("id, name_fr, name_en, status, position, model_themes(model_id)").order("position").order("name_fr");

  return (
    <>
      <PageHeader title="Thématiques" actions={<ButtonLink href="/admin/thematiques/nouveau">Nouvelle thématique</ButtonLink>} />
      <Flash />
      <p className="text-sm text-taupe">Les thématiques organisent la galerie (Bazin, Sacs…). Un modèle peut appartenir à plusieurs thématiques.</p>
      {error ? (
        <EmptyState>La liste n&apos;a pas pu être chargée. Rechargez la page.</EmptyState>
      ) : !data.length ? (
        <EmptyState>Aucune thématique.</EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {data.map((t) => (
            <li key={t.id}>
              <Link href={`/admin/thematiques/${t.id}`} className="flex flex-wrap items-center gap-3 p-4 hover:bg-ivory">
                <span className="w-8 text-sm text-taupe">{t.position}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{t.name_fr}</span>
                  <span className="text-xs text-taupe">
                    {[t.name_en && `EN : ${t.name_en}`, `${t.model_themes.length} modèle(s)`].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <StatusBadge status={t.status} labels={themeLabels} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
