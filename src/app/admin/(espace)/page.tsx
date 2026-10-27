import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, formatDate, Panel, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const count = (table: "models" | "catalogues" | "themes" | "contact_messages", filter?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) query = filter(query);
    return query.then((r) => r.count ?? 0);
  };

  const [models, publishedModels, draftModels, publishedCatalogues, draftCatalogues, themes, unread, missingEn, latestModels, latestCatalogues] =
    await Promise.all([
      count("models", (q) => q.neq("status", "archived")),
      count("models", (q) => q.eq("status", "published")),
      count("models", (q) => q.eq("status", "draft")),
      count("catalogues", (q) => q.eq("status", "published")),
      count("catalogues", (q) => q.eq("status", "draft")),
      count("themes"),
      count("contact_messages", (q) => q.is("handled_at", null)),
      count("models", (q) => q.eq("status", "published").is("name_en", null)),
      supabase.from("models").select("id, name_fr, status, updated_at").order("updated_at", { ascending: false }).limit(5),
      supabase.from("catalogues").select("id, title_fr, status, updated_at").order("updated_at", { ascending: false }).limit(5),
    ]);

  const stats = [
    { label: "Modèles (hors archives)", value: models, href: "/admin/modeles" },
    { label: "Modèles publiés", value: publishedModels, href: "/admin/modeles?statut=published" },
    { label: "Brouillons (modèles et catalogues)", value: draftModels + draftCatalogues, href: "/admin/modeles?statut=draft" },
    { label: "Catalogues publiés", value: publishedCatalogues, href: "/admin/catalogues" },
    { label: "Thématiques", value: themes, href: "/admin/thematiques" },
    { label: "Messages à traiter", value: unread, href: "/admin/messages" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl font-medium">Tableau de bord</h1>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/admin/modeles/nouveau">Nouveau modèle</ButtonLink>
          <ButtonLink href="/admin/catalogues/nouveau" variant="outline">Nouveau catalogue</ButtonLink>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="flex h-full flex-col gap-1 border border-line bg-white p-5 hover:border-ink">
              <span className="font-serif text-4xl">{s.value}</span>
              <span className="text-sm text-taupe">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {missingEn > 0 && (
        <p className="border-l-2 border-gold bg-white p-4 text-sm">
          {missingEn} modèle{missingEn > 1 ? "s publiés n'ont" : " publié n'a"} pas encore de nom anglais : le français s&apos;affiche
          sur la version anglaise du site.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Derniers modèles modifiés">
          <Recent items={(latestModels.data ?? []).map((m) => ({ ...m, title: m.name_fr, href: `/admin/modeles/${m.id}` }))} empty="Aucun modèle pour l'instant." />
        </Panel>
        <Panel title="Derniers catalogues modifiés">
          <Recent items={(latestCatalogues.data ?? []).map((c) => ({ ...c, title: c.title_fr, href: `/admin/catalogues/${c.id}` }))} empty="Aucun catalogue pour l'instant." />
        </Panel>
      </div>
    </>
  );
}

function Recent({ items, empty }: { items: { id: string; title: string; href: string; status: "draft" | "published" | "archived"; updated_at: string }[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-taupe">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <Link href={item.href} className="font-medium hover:underline">{item.title}</Link>
          <span className="flex items-center gap-3 text-xs text-taupe">
            {formatDate(item.updated_at)} <StatusBadge status={item.status} />
          </span>
        </li>
      ))}
    </ul>
  );
}
