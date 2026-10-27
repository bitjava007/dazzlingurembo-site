import Image from "next/image";
import type { Picture, PlaceholderTone } from "@/lib/content/types";

const toneClasses: Record<PlaceholderTone, string> = {
  deep: "bg-[#2b2622] text-mist",
  night: "bg-[#1c1915] text-mist",
  umber: "bg-[#3b342d] text-mist",
  earth: "bg-[#4a4138] text-mist",
  sand: "bg-[#d6cab5] text-umber",
  linen: "bg-[#e4dbcc] text-umber",
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
