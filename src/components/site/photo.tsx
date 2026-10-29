import Image from "next/image";
import type { Picture, PlaceholderTone } from "@/lib/content/types";

const toneClasses: Record<PlaceholderTone, string> = {
  deep: "bg-[#5a463a] text-mist",
  night: "bg-[#3a2c24] text-mist",
  umber: "bg-[#6b5446] text-mist",
  earth: "bg-[#5e5b47] text-mist",
  sand: "bg-[#d8c8b5] text-umber",
  linen: "bg-[#e8ded1] text-umber",
};

type PhotoProps = {
  picture: Picture | null;
  alt: string;
  /** Rapport largeur / hauteur du cadre, ex. "3 / 4". */
  ratio?: string;
  sizes: string;
  priority?: boolean;
  /** Mention affichée sur l'emplacement tant que la photographie n'existe pas. */
  pendingLabel?: string;
  className?: string;
};

/**
 * Photographie dans un cadre de proportions fixes (pas de décalage de mise en page).
 * Sans image fournie, affiche un aplat de teinte neutre clairement identifié.
 */
export function Photo({ picture, alt, ratio = "3 / 4", sizes, priority, pendingLabel, className = "" }: PhotoProps) {
  if (picture?.src) {
    return (
      <div className={`relative overflow-hidden bg-sand ${className}`} style={{ aspectRatio: ratio }}>
        <Image
          src={picture.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex items-end p-4 ${toneClasses[picture?.tone ?? "deep"]} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {pendingLabel && (
        <span aria-hidden="true" className="text-[0.625rem] uppercase tracking-[0.18em] opacity-80">
          {pendingLabel}
        </span>
      )}
    </div>
  );
}
