import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionForm, Flash, SubmitButton } from "@/components/admin/client";
import { StatusControls } from "@/components/admin/status-controls";
import { Bilingual, ButtonLink, Checkbox, Field, formatDate, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { localePath } from "@/i18n/config";
import { requireAdmin } from "@/lib/admin/auth";
import { mediaUrl } from "@/lib/supabase/env";
import { deleteModel, setModelStatus, updateModel } from "../actions";
import { PhotoManager } from "./photos";

export const metadata: Metadata = { title: "Modifier un modèle" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditModelPage({ params }: PageProps<"/admin/modeles/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();

  const [modelRes, themesRes, cataloguesRes] = await Promise.all([
    supabase.from("models").select("*, model_images(*), model_themes(theme_id), catalogue_models(catalogue_id)").eq("id", id).maybeSingle(),
    supabase.from("themes").select("id, name_fr, status").order("position"),
    supabase.from("catalogues").select("id, title_fr, status").order("title_fr"),
  ]);
  const model = modelRes.data;
  if (!model) notFound();

  const themeIds = model.model_themes.map((t) => t.theme_id);
  const catalogueIds = model.catalogue_models.map((c) => c.catalogue_id);
  const images = [...model.model_images]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
    .map((img) => ({ id: img.id, url: mediaUrl(img.storage_path) ?? "", altFr: img.alt_fr ?? "", altEn: img.alt_en ?? "", isPrimary: img.is_primary }));
  const catalogues = (cataloguesRes.data ?? []).filter((c) => c.status !== "archived" || catalogueIds.includes(c.id));

  return (
    <>
      <PageHeader
        title={model.name_fr}
        back={{ href: "/admin/modeles", label: "Modèles" }}
        actions={
          <>
            <ButtonLink href={`/admin/apercu/modeles/${model.id}`} variant="outline" external>Aperçu ↗</ButtonLink>
            {model.status === "published" && (
              <ButtonLink href={localePath("fr", "models", model.slug_fr)} variant="outline" external>Voir sur le site ↗</ButtonLink>
            )}
          </>
        }
      >
        <StatusBadge status={model.status} />
      </PageHeader>
      <Flash />

      <Panel title="Publication" description={`Dernière modification : ${formatDate(model.updated_at)}${model.published_at ? ` · première publication : ${formatDate(model.published_at)}` : ""}`}>
        <StatusControls
          id={model.id}
          status={model.status}
          setStatus={setModelStatus}
          remove={deleteModel}
          noun="modèle"
          deleteHint={catalogueIds.length ? "Il doit d'abord être retiré de tous ses catalogues." : "Ses photos seront supprimées."}
        />
      </Panel>

      <Panel title="Photographies" description="La première photo est la photo principale. Une même photo sert dans tous les catalogues du modèle.">
        <PhotoManager modelId={model.id} images={images} modelName={model.name_fr} />
      </Panel>

      <ActionForm
        action={updateModel}
        hidden={{ id: model.id }}
        className="flex flex-col gap-6"
        guard={[
          { field: "themes", initial: themeIds, message: "Vous avez décoché {n} thématique(s) : le modèle n'y apparaîtra plus. Continuer ?" },
          { field: "catalogues", initial: catalogueIds, message: "Vous avez décoché {n} catalogue(s) : le modèle en sera retiré (il n'est pas supprimé). Continuer ?" },
        ]}
      >
        <Panel title="Description">
          <Bilingual label="Nom" name="name" fr={model.name_fr} en={model.name_en} requiredFr maxLength={160} />
          <Bilingual label="Description" name="description" fr={model.description_fr} en={model.description_en} multiline rows={6} optional maxLength={5000} />
          <Bilingual label="Tissu / matière" name="material" fr={model.material_fr} en={model.material_en} optional maxLength={300} />
          <Bilingual label="Détails de confection" name="craftsmanship" fr={model.craftsmanship_fr} en={model.craftsmanship_en} multiline rows={4} optional maxLength={3000} />
          <Field label="Référence" name="reference" defaultValue={model.reference} optional maxLength={60} />
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Thématiques" description="Un modèle peut appartenir à plusieurs thématiques.">
            <fieldset className="flex flex-col">
              <legend className="sr-only">Thématiques du modèle</legend>
              {(themesRes.data ?? []).map((t) => (
                <Checkbox key={t.id} name="themes" value={t.id} label={t.name_fr} hint={t.status !== "published" ? "Thématique masquée" : undefined} defaultChecked={themeIds.includes(t.id)} />
              ))}
            </fieldset>
          </Panel>
          <Panel title="Catalogues" description="L'ordre dans chaque catalogue se règle depuis la page du catalogue.">
            {catalogues.length === 0 ? (
              <p className="text-sm text-taupe">Aucun catalogue pour l&apos;instant.</p>
            ) : (
              <fieldset className="flex flex-col">
                <legend className="sr-only">Catalogues du modèle</legend>
                {catalogues.map((c) => (
                  <Checkbox key={c.id} name="catalogues" value={c.id} label={c.title_fr} hint={c.status !== "published" ? (c.status === "draft" ? "Brouillon" : "Archivé") : undefined} defaultChecked={catalogueIds.includes(c.id)} />
                ))}
              </fieldset>
            )}
          </Panel>
        </div>

        <Panel title="Accueil et adresse web">
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <Checkbox name="is_featured" label="Mettre en avant sur l'accueil" defaultChecked={model.is_featured} />
            <Field label="Ordre de mise en avant" name="featured_order" type="number" defaultValue={model.featured_order} optional hint="1 = en premier" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Identifiant d'URL — français" name="slug_fr" defaultValue={model.slug_fr} hint={`/fr/modeles/${model.slug_fr}`} maxLength={120} />
            <Field label="Identifiant d'URL — anglais" name="slug_en" defaultValue={model.slug_en} hint={`/en/models/${model.slug_en}`} maxLength={120} />
          </div>
        </Panel>

        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-[#f6f3ee]/95 px-4 py-3 sm:mx-0 sm:px-0">
          <SubmitButton>Enregistrer les modifications</SubmitButton>
          <span className="text-xs text-taupe">L&apos;enregistrement ne change pas le statut de publication.</span>
        </div>
      </ActionForm>
    </>
  );
}
