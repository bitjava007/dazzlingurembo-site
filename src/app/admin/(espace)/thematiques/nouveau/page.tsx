import type { Metadata } from "next";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { createTheme } from "../actions";
import { ThemeFields } from "../theme-fields";

export const metadata: Metadata = { title: "Nouvelle thématique" };

export default async function NewThemePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Nouvelle thématique" back={{ href: "/admin/thematiques", label: "Thématiques" }} />
      <Panel>
        <ActionForm action={createTheme}>
          <ThemeFields />
          <div>
            <SubmitButton pendingLabel="Création…">Créer la thématique</SubmitButton>
          </div>
        </ActionForm>
      </Panel>
    </>
  );
}
