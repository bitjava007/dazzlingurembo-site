import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { editablePages, isPageKey } from "@/lib/admin/pages";

export const metadata: Metadata = { title: "Pages et contenus" };

export default async function PagesList() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("pages").select("key, body_fr, body_en, updated_at");
  const byKey = new Map((data ?? []).map((p) => [p.key, p]));

  return (
    <>
      <PageHeader title="Pages et contenus" />
      <p className="text-sm text-taupe">
        Textes institutionnels du site. Une page sans texte affiche « Contenu en cours de préparation ».
      </p>
      <ul className="divide-y divide-line border border-line bg-white">
        {Object.entries(editablePages).map(([key, page]) => {
          if (!isPageKey(key)) return null;
          const row = byKey.get(key);
          const state = !row?.body_fr ? "À rédiger" : !row.body_en ? "Anglais à compléter" : "Complète";
          return (
            <li key={key}>
              <Link href={`/admin/pages/${key}`} className="flex flex-wrap items-center gap-3 p-4 hover:bg-ivory">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{page.label}</span>
                  <span className="text-xs text-taupe">{page.hint}</span>
                </span>
                <span className="text-xs text-taupe">{row?.body_fr ? formatDate(row.updated_at) : ""}</span>
                <span className={`px-2.5 py-1 text-xs ${state === "Complète" ? "bg-[#e3eee0] text-[#24452a]" : "bg-[#efe6d3] text-[#5c4a26]"}`}>{state}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
