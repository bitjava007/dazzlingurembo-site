"use client";

import { getBrowserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/supabase/env";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;
const MAX_SIDE = 2400;

/** Filigrane : logo blanc au centre, ≈ 30 % de la largeur de la photo, ≈ 15 % d'opacité. */
const WATERMARK_SRC = "/brand/logo-blanc.svg";
const WATERMARK_WIDTH = 0.3;
const WATERMARK_OPACITY = 0.15;

export const ACCEPT_ATTRIBUTE = ACCEPTED.join(",");

export class UploadError extends Error {}

export type Watermark = HTMLImageElement | null;

/**
 * Lit le réglage « filigrane » (Paramètres du site) au moment de l'envoi et charge le logo s'il est activé.
 * En cas d'échec, l'envoi est interrompu plutôt que de publier une photo sans le logo attendu.
 */
export async function loadWatermark(): Promise<Watermark> {
  const { data, error } = await getBrowserClient().from("site_settings").select("watermark_enabled").eq("id", 1).maybeSingle();
  if (error) throw new UploadError("Le réglage du filigrane n'a pas pu être lu. Vérifiez votre connexion et réessayez.");
  if (!data?.watermark_enabled) return null;
  const logo = new Image();
  logo.src = WATERMARK_SRC;
  try {
    await logo.decode();
  } catch {
    throw new UploadError("Le logo du filigrane n'a pas pu être chargé. Réessayez.");
  }
  return logo;
}

/**
 * Prépare une photo pour le site : contrôle du format et du poids, redimensionnement
 * (2400 px maximum), filigrane éventuel et conversion en WebP, directement dans le navigateur.
 */
export async function prepareImage(file: File, watermark: Watermark = null): Promise<{ blob: Blob; width: number; height: number }> {
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
  if (watermark) {
    const w = width * WATERMARK_WIDTH;
    const h = (w * watermark.naturalHeight) / watermark.naturalWidth;
    ctx.globalAlpha = WATERMARK_OPACITY;
    ctx.drawImage(watermark, (width - w) / 2, (height - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }
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
