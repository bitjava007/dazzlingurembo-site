"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ACCEPT_ATTRIBUTE, prepareImage, removeFromStorage, UploadError, uploadToStorage } from "@/lib/admin/image-upload";
import { StatusMessage } from "./client";

type Result = { ok: boolean; message: string } | null;

/** Couverture facultative d'un catalogue ou d'une thématique. */
export function CoverUploader({
  folder,
  currentUrl,
  label,
  setCover,
}: {
  folder: string;
  currentUrl: string | null;
  label: string;
  setCover: (path: string | null) => Promise<Result>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Result>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    let path: string | null = null;
    try {
      const prepared = await prepareImage(file);
      path = await uploadToStorage(folder, prepared.blob);
      const result = await setCover(path);
      if (!result?.ok) throw new UploadError(result?.message ?? "Enregistrement impossible.");
      setStatus(result);
    } catch (e) {
      if (path) await removeFromStorage(path).catch(() => undefined);
      setStatus({ ok: false, message: e instanceof UploadError ? e.message : "L'envoi a échoué." });
    }
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Retirer la photo de couverture ? Le fichier sera supprimé.")) return;
    setBusy(true);
    setStatus(await setCover(null));
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="relative aspect-[4/5] w-40 shrink-0 bg-sand">
        {currentUrl ? (
          <Image src={currentUrl} alt={label} fill sizes="160px" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center p-3 text-center text-xs text-taupe">Aucune couverture</span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <label className="inline-flex min-h-11 cursor-pointer items-center border border-mist bg-white px-4 text-sm hover:border-ink">
          {currentUrl ? "Remplacer la couverture" : "Ajouter une couverture"}
          <input type="file" accept={ACCEPT_ATTRIBUTE} disabled={busy} className="sr-only" onChange={(e) => { upload(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
        </label>
        {currentUrl && (
          <button type="button" onClick={remove} disabled={busy} className="min-h-11 self-start border border-[#b8584a] px-4 text-sm text-[#8a2f22] disabled:opacity-40">
            Retirer la couverture
          </button>
        )}
        {busy && <p role="status" className="text-sm text-taupe">Envoi en cours…</p>}
        <StatusMessage state={status} />
      </div>
    </div>
  );
}
