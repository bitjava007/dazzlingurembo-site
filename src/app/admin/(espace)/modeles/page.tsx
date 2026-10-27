import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Flash } from "@/components/admin/client";
import { ButtonLink, EmptyState, formatDate, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { mediaUrl } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Modèles" };

const filters = [
  { key: "actifs", label: "En cours" },
  { key: "published", label: "Publiés" },
  { key: "draft", label: "Brouillons" },
  { key: "archived", label: "Archivés" },
] as const;

export default async function ModelsPage({ searchParams }: PageProps<"/admin/modeles">) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const filter = filters.find((f) => f.key === params.statut)?.key ?? "actifs";
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";

  let query = supabase
    .from("models")
    .select("id, name_fr, name_en, reference, status, updated_at, model_images(storage_path, is_primary), catalogue_models(catalogue_id)")
    .order("updated_at", { ascending: false })
    .limit(200);
  query = filter === "actifs" ? query.neq("status", "archived") : query.eq("status", filter);
  if (search) query = query.or(`name_fr.ilike.%${search.replace(/[%,()]/g, " ")}%,reference.ilike.%${search.replace(/[%,()]/g, " ")}%`);
  const { data: models, error } = await query;

  return (
    <>
      <PageHeader title="Modèles" actions={<ButtonLink href="/admin/modeles/nouveau">Nouveau modèle</ButtonLink>} />
      <Flash />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={`/admin/modeles?statut=${f.key}`}
              aria-current={filter === f.key ? "page" : undefined}
              className={`inline-flex min-h-10 items-center border px-3 text-sm ${filter === f.key ? "border-ink bg-ink text-ivory" : "border-mist bg-white"}`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" action="/admin/modeles">
          <input type="hidden" name="statut" value={filter} />
          <label htmlFor="q" className="sr-only">Rechercher un modèle</label>
          <input id="q" name="q" defaultValue={search} placeholder="Nom ou référence" className="min-h-10 border border-mist bg-white px-3 text-sm" />
          <button type="submit" className="min-h-10 border border-mist bg-white px-3 text-sm">Rechercher</button>
        </form>
      </div>

      {error ? (
        <EmptyState>La liste n&apos;a pas pu être chargée. Rechargez la page.</EmptyState>
      ) : !models.length ? (
        <EmptyState>Aucun modèle dans cette vue.</EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {models.map((m) => {
            const primary = m.model_images.find((i) => i.is_primary) ?? m.model_images[0];
            const thumb = mediaUrl(primary?.storage_path);
            return (
              <li key={m.id}>
                <Link href={`/admin/modeles/${m.id}`} className="flex items-center gap-4 p-3 hover:bg-ivory">
                  <span className="relative h-16 w-12 shrink-0 bg-sand">
                    {thumb && <Image src={thumb} alt="" fill sizes="48px" className="object-cover" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{m.name_fr}</span>
                    <span className="text-xs text-taupe">
                      {[m.reference, `${m.model_images.length} photo(s)`, `${m.catalogue_models.length} catalogue(s)`, !m.name_en && "anglais à compléter"]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="hidden text-xs text-taupe sm:block">{formatDate(m.updated_at)}</span>
                  <StatusBadge status={m.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
