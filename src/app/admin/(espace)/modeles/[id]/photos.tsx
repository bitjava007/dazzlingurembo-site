"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusMessage } from "@/components/admin/client";
import { ACCEPT_ATTRIBUTE, prepareImage, removeFromStorage, UploadError, uploadToStorage } from "@/lib/admin/image-upload";
import { deleteModelImage, registerModelImage, reorderModelImages, updateImageAlt } from "../actions";

export type AdminImage = { id: string; url: string; altFr: string; altEn: string; isPrimary: boolean };
type Status = { ok: boolean; message: string } | null;

export function PhotoManager({ modelId, images, modelName }: { modelId: string; images: AdminImage[]; modelName: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const done = (result: Status) => {
    setStatus(result);
    setBusy(null);
    startTransition(() => router.refresh());
  };

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    const errors: string[] = [];
    let added = 0;
    for (const [i, file] of list.entries()) {
      setBusy(`Envoi de la photo ${i + 1} sur ${list.length}…`);
      let path: string | null = null;
      try {
        const prepared = await prepareImage(file);
        path = await uploadToStorage(`models/${modelId}`, prepared.blob);
        const result = await registerModelImage({ modelId, path, width: prepared.width, height: prepared.height });
        if (!result?.ok) throw new UploadError(result?.message ?? "Enregistrement impossible.");
        added++;
      } catch (e) {
        if (path) await removeFromStorage(path).catch(() => undefined);
        errors.push(e instanceof UploadError ? e.message : `« ${file.name} » : envoi impossible.`);
      }
    }
    const summary = added ? `${added} photo${added > 1 ? "s ajoutées" : " ajoutée"}.` : "";
    done(errors.length ? { ok: false, message: [summary, ...errors].filter(Boolean).join(" ") } : { ok: true, message: summary });
  }

  async function move(index: number, delta: number) {
    const ids = images.map((img) => img.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusy("Enregistrement de l'ordre…");
    done(await reorderModelImages({ modelId, imageIds: ids }));
  }

  async function makePrimary(index: number) {
    const ids = images.map((img) => img.id);
    const [chosen] = ids.splice(index, 1);
    setBusy("Changement de la photo principale…");
    done(await reorderModelImages({ modelId, imageIds: [chosen, ...ids] }));
  }

  async function remove(image: AdminImage, index: number) {
    if (!window.confirm(`Supprimer définitivement la photo ${index + 1} ? Cette action est irréversible.`)) return;
    setBusy("Suppression…");
    done(await deleteModelImage({ modelId, imageId: image.id }));
  }

  async function saveAlt(image: AdminImage, form: HTMLFormElement) {
    const data = new FormData(form);
    setBusy("Enregistrement…");
    done(await updateImageAlt({ modelId, imageId: image.id, altFr: String(data.get("alt_fr") ?? ""), altEn: String(data.get("alt_en") ?? "") }));
  }

  return (
    <div className="flex flex-col gap-5">
      {images.length === 0 ? (
        <p className="text-sm text-taupe">Aucune photo pour l&apos;instant. Ajoutez-en au moins une avant de publier.</p>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.id} className="flex flex-col gap-3 border border-line p-3">
              <div className="relative aspect-[4/5] bg-sand">
                <Image src={image.url} alt={image.altFr || `${modelName} — photo ${index + 1}`} fill sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 90vw" className="object-cover" />
                {image.isPrimary && <span className="absolute left-2 top-2 bg-ivory px-2 py-0.5 text-xs">Photo principale</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button type="button" disabled={!!busy || index === 0} onClick={() => move(index, -1)} className="min-h-9 border border-mist px-2 disabled:opacity-40" aria-label={`Monter la photo ${index + 1}`}>
                  ↑ Avant
                </button>
                <button type="button" disabled={!!busy || index === images.length - 1} onClick={() => move(index, 1)} className="min-h-9 border border-mist px-2 disabled:opacity-40" aria-label={`Descendre la photo ${index + 1}`}>
                  ↓ Après
                </button>
                {!image.isPrimary && (
                  <button type="button" disabled={!!busy} onClick={() => makePrimary(index)} className="min-h-9 border border-mist px-2 disabled:opacity-40">
                    Définir comme principale
                  </button>
                )}
                <button type="button" disabled={!!busy} onClick={() => remove(image, index)} className="min-h-9 border border-[#b8584a] px-2 text-[#8a2f22] disabled:opacity-40">
                  Supprimer
                </button>
              </div>
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveAlt(image, e.currentTarget);
                }}
              >
                <label className="text-xs font-medium" htmlFor={`alt-fr-${image.id}`}>Description de la photo (accessibilité) — français</label>
                <input id={`alt-fr-${image.id}`} name="alt_fr" defaultValue={image.altFr} maxLength={300} className="min-h-9 border border-mist px-2 text-sm" />
                <label className="text-xs font-medium" htmlFor={`alt-en-${image.id}`}>— anglais</label>
                <input id={`alt-en-${image.id}`} name="alt_en" defaultValue={image.altEn} maxLength={300} lang="en" className="min-h-9 border border-mist px-2 text-sm" />
                <button type="submit" disabled={!!busy} className="min-h-9 self-start border border-mist px-3 text-xs disabled:opacity-40">
                  Enregistrer la description
                </button>
              </form>
            </li>
          ))}
        </ol>
      )}

      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-stone bg-ivory p-4 text-center text-sm hover:border-ink">
        <span className="font-medium">Ajouter des photos</span>
        <span className="text-xs text-taupe">JPEG, PNG ou WebP · plusieurs fichiers possibles · optimisées automatiquement</span>
        <input
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          disabled={!!busy}
          className="sr-only"
          onChange={(e) => {
            upload(e.currentTarget.files);
            e.currentTarget.value = "";
          }}
        />
      </label>
      {busy && <p role="status" className="text-sm text-taupe">{busy}</p>}
      <StatusMessage state={status} />
    </div>
  );
}
