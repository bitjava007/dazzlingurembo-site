import { Bilingual, Checkbox, Field } from "@/components/admin/ui";
import type { TableRow } from "@/lib/supabase/database.types";

/** Champs communs à la création et à la modification d'une thématique. */
export function ThemeFields({ theme }: { theme?: TableRow<"themes"> }) {
  return (
    <>
      <Bilingual label="Nom" name="name" fr={theme?.name_fr} en={theme?.name_en} requiredFr maxLength={120} />
      <Bilingual label="Description" name="description" fr={theme?.description_fr} en={theme?.description_en} multiline rows={3} optional maxLength={2000} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ordre d'affichage" name="position" type="number" defaultValue={theme?.position ?? 0} hint="Les thématiques s'affichent de la plus petite à la plus grande valeur." />
        <Checkbox name="visible" label="Visible sur le site" defaultChecked={theme ? theme.status === "published" : true} hint="Décochée : la thématique est masquée, sans rien supprimer." />
      </div>
    </>
  );
}
