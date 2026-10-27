import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionForm, Flash, SubmitButton } from "@/components/admin/client";
import { CoverUploader } from "@/components/admin/cover-uploader";
import { StatusControls } from "@/components/admin/status-controls";
import { Bilingual, ButtonLink, Checkbox, Field, formatDate, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { localePath } from "@/i18n/config";
import { requireAdmin } from "@/lib/admin/auth";
import { mediaUrl } from "@/lib/supabase/env";
import { deleteCatalogue, setCatalogueCover, setCatalogueStatus, updateCatalogue } from "../actions";
import { CatalogueModelsEditor } from "./models-editor";

export const metadata: Metadata = { title: "Modifier un catalogue" };

export default async function EditCataloguePage({ params }: PageProps<"/admin/catalogues/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();

  const [catalogueRes, modelsRes] = await Promise.all([
    supabase.from("catalogues").select("*, catalogue_models(model_id, position)").eq("id", id).maybeSingle(),
    supabase.from("models").select("id, name_fr, status, reference").order("name_fr"),
  ]);
  const catalogue = catalogueRes.data;
  if (!catalogue) notFound();
  const initial = [...catalogue.catalogue_models].sort((a, b) => a.position - b.position).map((cm) => cm.model_id);

  return (
    <>
      <PageHeader
        title={catalogue.title_fr}
        back={{ href: "/admin/catalogues", label: "Catalogues" }}
        actions={
          <>
            <ButtonLink href={`/admin/apercu/catalogues/${catalogue.id}`} variant="outline" external>Aperçu ↗</ButtonLink>
            {catalogue.status === "published" && (
              <ButtonLink href={localePath("fr", "collections", catalogue.slug_fr)} variant="outline" external>Voir sur le site ↗</ButtonLink>
            )}
          </>
        }
      >
        <StatusBadge status={catalogue.status} />
      </PageHeader>
      <Flash />

      <Panel title="Publication" description={`Dernière modification : ${formatDate(catalogue.updated_at)}`}>
        <StatusControls
          id={catalogue.id}
          status={catalogue.status}
          setStatus={setCatalogueStatus}
          remove={deleteCatalogue}
          noun="catalogue"
          deleteHint="Les modèles qu'il contient ne seront pas supprimés."
        />
      </Panel>

      <Panel title="Modèles du catalogue" description="Seuls les modèles publiés apparaissent sur le site, dans l'ordre choisi ici.">
        <CatalogueModelsEditor
          catalogueId={catalogue.id}
          initial={initial}
          options={(modelsRes.data ?? []).map((m) => ({ id: m.id, name: m.name_fr, status: m.status, reference: m.reference }))}
        />
      </Panel>

      <Panel title="Couverture" description="Facultative. À défaut, un aplat neutre est affiché.">
        <CoverUploader
          folder={`catalogues/${catalogue.id}`}
          currentUrl={mediaUrl(catalogue.cover_path)}
          label={`Couverture — ${catalogue.title_fr}`}
          setCover={setCatalogueCover.bind(null, catalogue.id)}
        />
      </Panel>

      <ActionForm action={updateCatalogue} hidden={{ id: catalogue.id }} className="flex flex-col gap-6">
        <Panel title="Présentation">
          <Bilingual label="Titre" name="title" fr={catalogue.title_fr} en={catalogue.title_en} requiredFr maxLength={160} />
          <Bilingual label="Description" name="description" fr={catalogue.description_fr} en={catalogue.description_en} multiline rows={5} optional maxLength={3000} />
        </Panel>
        <Panel title="Accueil et adresse web">
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <Checkbox name="is_featured" label="Mettre en avant sur l'accueil" defaultChecked={catalogue.is_featured} hint="Les trois premiers catalogues publiés mis en avant sont affichés." />
            <Field label="Ordre de mise en avant" name="featured_order" type="number" defaultValue={catalogue.featured_order} optional hint="1 = en premier" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Identifiant d'URL — français" name="slug_fr" defaultValue={catalogue.slug_fr} hint={`/fr/collections/${catalogue.slug_fr}`} maxLength={120} />
            <Field label="Identifiant d'URL — anglais" name="slug_en" defaultValue={catalogue.slug_en} hint={`/en/collections/${catalogue.slug_en}`} maxLength={120} />
          </div>
        </Panel>
        <div>
          <SubmitButton>Enregistrer la présentation</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
