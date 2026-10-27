import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { Bilingual, PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { editablePages, isPageKey } from "@/lib/admin/pages";
import { updatePage } from "../actions";

export const metadata: Metadata = { title: "Modifier une page" };

export default async function EditPage({ params }: PageProps<"/admin/pages/[key]">) {
  const { key } = await params;
  if (!isPageKey(key)) notFound();
  const { supabase } = await requireAdmin();
  const { data: page } = await supabase.from("pages").select("*").eq("key", key).maybeSingle();

  return (
    <>
      <PageHeader title={editablePages[key].label} back={{ href: "/admin/pages", label: "Pages et contenus" }} />
      <ActionForm action={updatePage} hidden={{ key }} className="flex flex-col gap-6">
        <Panel
          title="Texte"
          description="Séparez les paragraphes par une ligne vide. Une ligne commençant par « ## » devient un intertitre. Un texte anglais vide affiche le français, signalé comme tel."
        >
          <Bilingual label="Titre de la page" name="title" fr={page?.title_fr} en={page?.title_en} optional maxLength={200} />
          <Bilingual label="Texte" name="body" fr={page?.body_fr} en={page?.body_en} multiline rows={16} optional maxLength={20000} />
        </Panel>
        <Panel title="Référencement" description="Résumé affiché par les moteurs de recherche (environ 150 caractères).">
          <Bilingual label="Description" name="seo_description" fr={page?.seo_description_fr} en={page?.seo_description_en} multiline rows={2} optional maxLength={300} />
        </Panel>
        <div>
          <SubmitButton>Enregistrer la page</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
