import type { ContentStatusValue } from "@/lib/supabase/database.types";
import { ActionForm, SubmitButton } from "./client";

type FormAction = (state: { ok: boolean; message: string } | null, form: FormData) => Promise<{ ok: boolean; message: string } | null>;

/**
 * Boutons de cycle de vie : publier, dépublier (brouillon), archiver, restaurer, supprimer.
 * Chaque bouton est un petit formulaire distinct, avec confirmation quand c'est utile.
 */
export function StatusControls({
  id,
  status,
  setStatus,
  remove,
  noun,
  deleteHint,
}: {
  id: string;
  status: ContentStatusValue;
  setStatus: FormAction;
  remove?: FormAction;
  noun: string;
  deleteHint?: string;
}) {
  const button = (target: ContentStatusValue, label: string, variant: "dark" | "outline", confirm?: string) => (
    <ActionForm action={setStatus} hidden={{ id, status: target }} confirm={confirm} className="contents">
      <SubmitButton variant={variant} pendingLabel="…">{label}</SubmitButton>
    </ActionForm>
  );
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "published" && button("published", "Publier", "dark")}
      {status === "published" && button("draft", "Dépublier", "outline", `Retirer ce ${noun} du site ? Il restera enregistré en brouillon.`)}
      {status !== "archived" && button("archived", "Archiver", "outline", `Archiver ce ${noun} ? Il ne sera plus visible sur le site, mais rien n'est supprimé.`)}
      {status === "archived" && button("draft", "Restaurer en brouillon", "outline")}
      {status === "archived" && remove && (
        <ActionForm
          action={remove}
          hidden={{ id }}
          className="contents"
          confirm={`Supprimer définitivement ce ${noun} ? ${deleteHint ?? ""} Cette action est irréversible.`}
        >
          <SubmitButton variant="danger" pendingLabel="Suppression…">Supprimer définitivement</SubmitButton>
        </ActionForm>
      )}
    </div>
  );
}
