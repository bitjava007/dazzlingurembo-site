import type { Metadata } from "next";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { Bilingual, Checkbox, Field, PageHeader, Panel, TextArea } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { updateSettings } from "./actions";

export const metadata: Metadata = { title: "Paramètres du site" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data: s } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  return (
    <>
      <PageHeader title="Paramètres du site" />
      <p className="text-sm text-taupe">Un élément laissé vide n&apos;est pas affiché sur le site (aucune information n&apos;est inventée).</p>
      <ActionForm action={updateSettings} className="flex flex-col gap-6">
        <Panel title="Contact" description="Le numéro WhatsApp active les boutons « WhatsApp » et la demande sur mesure depuis les fiches modèles.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Numéro WhatsApp (format international)" name="whatsapp_number" type="tel" defaultValue={s?.whatsapp_number} placeholder="+243 …" optional />
            <Field label="E-mail public" name="contact_email" type="email" defaultValue={s?.contact_email} optional />
            <Field label="Téléphone public" name="phone" type="tel" defaultValue={s?.phone} optional />
          </div>
        </Panel>
        <Panel title="Showroom">
          <TextArea label="Adresse" name="address" defaultValue={s?.address} rows={3} optional maxLength={500} />
          <Bilingual label="Horaires" name="opening_hours" fr={s?.opening_hours_fr} en={s?.opening_hours_en} multiline rows={3} optional maxLength={500} />
        </Panel>
        <Panel title="Réseaux sociaux">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Instagram" name="instagram_url" type="url" defaultValue={s?.instagram_url} placeholder="https://instagram.com/…" optional />
            <Field label="Facebook" name="facebook_url" type="url" defaultValue={s?.facebook_url} placeholder="https://facebook.com/…" optional />
            <Field label="TikTok" name="tiktok_url" type="url" defaultValue={s?.tiktok_url} placeholder="https://tiktok.com/@…" optional />
          </div>
        </Panel>
        <Panel
          title="Photos"
          description="Cochée : chaque photo envoyée ensuite depuis l'administration (modèles, couvertures des catalogues et thématiques) reçoit le logo au centre, en transparence. Les photos déjà en ligne ne changent pas : renvoyez-les si elles doivent porter le logo."
        >
          <Checkbox label="Ajouter le logo Dazzling Urembo en filigrane sur les photos" name="watermark_enabled" defaultChecked={s?.watermark_enabled ?? false} />
        </Panel>
        <div>
          <SubmitButton>Enregistrer les paramètres</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
