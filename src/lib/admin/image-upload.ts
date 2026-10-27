"use client";

import { getBrowserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/supabase/env";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;
const MAX_SIDE = 2400;

export const ACCEPT_ATTRIBUTE = ACCEPTED.join(",");

export class UploadError extends Error {}

/**
 * Prépare une photo pour le site : contrôle du format et du poids, redimensionnement
 * (2400 px maximum) et conversion en WebP, directement dans le navigateur.
 */
export async function prepareImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  if (!ACCEPTED.includes(file.type)) {
    throw new UploadError(`« ${file.name} » n'est pas au format JPEG, PNG ou WebP.`);
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new UploadError(`« ${file.name} » pèse plus de 25 Mo. Exportez-la dans une taille plus raisonnable.`);
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new UploadError(`« ${file.name} » ne peut pas être lue : le fichier est peut-être endommagé.`);
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UploadError("Votre navigateur ne permet pas de préparer la photo.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  if (!blob) throw new UploadError(`La conversion de « ${file.name} » a échoué.`);
  if (blob.size > MAX_OUTPUT_BYTES) throw new UploadError(`« ${file.name} » reste trop lourde après optimisation.`);
  return { blob, width, height };
}

/** Téléverse un fichier préparé dans le bucket `media` (droits vérifiés par Storage). */
export async function uploadToStorage(folder: string, blob: Blob): Promise<string> {
  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await getBrowserClient()
    .storage.from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (error) {
    const status = "statusCode" in error ? String(error.statusCode) : "";
    if (status === "403" || /row-level security|unauthorized/i.test(error.message)) {
      throw new UploadError("Envoi refusé : votre session a peut-être expiré. Reconnectez-vous.");
    }
    if (status === "413" || /size/i.test(error.message)) throw new UploadError("Fichier trop volumineux (10 Mo maximum).");
    throw new UploadError("L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez.");
  }
  return path;
}

/** Retire un fichier envoyé dont l'enregistrement a échoué. */
export async function removeFromStorage(path: string) {
  await getBrowserClient().storage.from(MEDIA_BUCKET).remove([path]);
}
