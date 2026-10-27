import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Flash, SubmitButton } from "@/components/admin/client";
import { CoverUploader } from "@/components/admin/cover-uploader";
import { Field, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { mediaUrl } from "@/lib/supabase/env";
import { deleteTheme, setThemeCover, updateTheme } from "../actions";
import { ThemeFields } from "../theme-fields";

export const metadata: Metadata = { title: "Modifier une thématique" };

export default async function EditThemePage({ params }: PageProps<"/admin/thematiques/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: theme } = await supabase.from("themes").select("*, model_themes(model_id, models(id, name_fr))").eq("id", id).maybeSingle();
  if (!theme) notFound();
  const models = theme.model_themes.map((mt) => mt.models).filter((m) => m !== null);

  return (
    <>
      <PageHeader title={theme.name_fr} back={{ href: "/admin/thematiques", label: "Thématiques" }}>
        <StatusBadge status={theme.status} labels={{ published: "Visible", draft: "Masquée", archived: "Masquée" }} />
      </PageHeader>
      <Flash />

      <ActionForm action={updateTheme} hidden={{ id: theme.id }} className="flex flex-col gap-6">
        <Panel title="Thématique">
          <ThemeFields theme={theme} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Identifiant d'URL — français" name="slug_fr" defaultValue={theme.slug_fr} hint={`/fr/modeles?theme=${theme.slug_fr}`} maxLength={120} />
            <Field label="Identifiant d'URL — anglais" name="slug_en" defaultValue={theme.slug_en} hint={`/en/models?theme=${theme.slug_en}`} maxLength={120} />
          </div>
          <div>
            <SubmitButton>Enregistrer</SubmitButton>
          </div>
        </Panel>
      </ActionForm>

      <Panel title="Couverture" description="Facultative : illustre la thématique sur l'accueil.">
        <CoverUploader folder={`themes/${theme.id}`} currentUrl={mediaUrl(theme.cover_path)} label={`Couverture — ${theme.name_fr}`} setCover={setThemeCover.bind(null, theme.id)} />
      </Panel>

      <Panel title={`Modèles associés (${models.length})`} description="Les associations se modifient depuis la fiche de chaque modèle.">
        {models.length === 0 ? (
          <p className="text-sm text-taupe">Aucun modèle.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {models.map((m) => (
              <li key={m.id}>
                <Link href={`/admin/modeles/${m.id}`} className="inline-flex min-h-9 items-center border border-mist px-3 text-sm hover:border-ink">{m.name_fr}</Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Supprimer la thématique" description={models.length ? "Impossible tant que des modèles l'utilisent : masquez-la plutôt." : "Aucun modèle ne l'utilise : elle peut être supprimée."}>
        <ActionForm action={deleteTheme} hidden={{ id: theme.id }} confirm="Supprimer définitivement cette thématique ?" className="flex flex-col gap-3">
          <div>
            <SubmitButton variant="danger" pendingLabel="Suppression…">Supprimer</SubmitButton>
          </div>
        </ActionForm>
      </Panel>
    </>
  );
}
