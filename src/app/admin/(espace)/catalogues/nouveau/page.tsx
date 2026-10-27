import type { Metadata } from "next";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { Bilingual, PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { createCatalogue } from "../actions";

export const metadata: Metadata = { title: "Nouveau catalogue" };

export default async function NewCataloguePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Nouveau catalogue" back={{ href: "/admin/catalogues", label: "Catalogues" }} />
      <Panel description="Le catalogue est créé en brouillon. Vous choisirez ensuite ses modèles, leur ordre et sa couverture.">
        <ActionForm action={createCatalogue}>
          <Bilingual label="Titre" name="title" requiredFr maxLength={160} />
          <Bilingual label="Description" name="description" multiline rows={4} optional maxLength={3000} />
          <div>
            <SubmitButton pendingLabel="Création…">Créer le brouillon</SubmitButton>
          </div>
        </ActionForm>
      </Panel>
    </>
  );
}
