import type { Metadata } from "next";
import Link from "next/link";
import { Flash } from "@/components/admin/client";
import { ButtonLink, EmptyState, formatDate, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Catalogues" };

export default async function CataloguesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("catalogues")
    .select("id, title_fr, title_en, status, is_featured, featured_order, updated_at, catalogue_models(model_id)")
    .order("status")
    .order("updated_at", { ascending: false });

  return (
    <>
      <PageHeader title="Catalogues" actions={<ButtonLink href="/admin/catalogues/nouveau">Nouveau catalogue</ButtonLink>} />
      <Flash />
      {error ? (
        <EmptyState>La liste n&apos;a pas pu être chargée. Rechargez la page.</EmptyState>
      ) : !data.length ? (
        <EmptyState>Aucun catalogue. Créez le premier : saison, cérémonie, sélection…</EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {data.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/catalogues/${c.id}`} className="flex flex-wrap items-center gap-3 p-4 hover:bg-ivory">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{c.title_fr}</span>
                  <span className="text-xs text-taupe">
                    {[`${c.catalogue_models.length} modèle(s)`, c.is_featured && `à la une${c.featured_order ? ` (n° ${c.featured_order})` : ""}`, !c.title_en && "anglais à compléter"]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="hidden text-xs text-taupe sm:block">{formatDate(c.updated_at)}</span>
                <StatusBadge status={c.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
