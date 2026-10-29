import { Bilingual, Checkbox, Field } from "@/components/admin/ui";
import type { TableRow } from "@/lib/supabase/database.types";

const kinds = [
  { value: "category", label: "Catégorie", hint: "Grande rubrique de la galerie et de l'accueil (Vêtements, Sacs, Chaussures…)." },
  { value: "material", label: "Matière", hint: "Filtre affiché à l'intérieur des catégories (Bazin, Brocard…)." },
] as const;

/** Champs communs à la création et à la modification d'une thématique. */
export function ThemeFields({ theme }: { theme?: TableRow<"themes"> }) {
  return (
    <>
      <Bilingual label="Nom" name="name" fr={theme?.name_fr} en={theme?.name_en} requiredFr maxLength={120} />
      <Bilingual label="Description" name="description" fr={theme?.description_fr} en={theme?.description_en} multiline rows={3} optional maxLength={2000} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Type</legend>
        {kinds.map((k) => (
          <label key={k.value} className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-[0.9375rem]">
            <input type="radio" name="kind" value={k.value} defaultChecked={(theme?.kind ?? "category") === k.value} className="mt-1 h-4 w-4 accent-ink" />
            <span className="flex flex-col">
              {k.label}
              <span className="text-xs text-taupe">{k.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ordre d'affichage" name="position" type="number" defaultValue={theme?.position ?? 0} hint="Les thématiques s'affichent de la plus petite à la plus grande valeur." />
        <Checkbox name="visible" label="Visible sur le site" defaultChecked={theme ? theme.status === "published" : true} hint="Décochée : la thématique est masquée, sans rien supprimer." />
      </div>
    </>
  );
}
