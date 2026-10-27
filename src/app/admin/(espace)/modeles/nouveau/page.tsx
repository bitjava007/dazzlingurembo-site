import type { Metadata } from "next";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { Bilingual, Field, PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { createModel } from "../actions";

export const metadata: Metadata = { title: "Nouveau modèle" };

export default async function NewModelPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Nouveau modèle" back={{ href: "/admin/modeles", label: "Modèles" }} />
      <Panel description="Le modèle est créé en brouillon : il reste invisible sur le site jusqu'à sa publication. Vous ajouterez ensuite photos, thématiques et catalogues.">
        <ActionForm action={createModel}>
          <Bilingual label="Nom" name="name" requiredFr maxLength={160} />
          <Field label="Référence" name="reference" optional maxLength={60} />
          <div>
            <SubmitButton pendingLabel="Création…">Créer le brouillon</SubmitButton>
          </div>
        </ActionForm>
      </Panel>
    </>
  );
}
