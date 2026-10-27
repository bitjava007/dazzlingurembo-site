"use client";

import { useState } from "react";
import { Photo } from "./photo";
import type { Picture } from "@/lib/content/types";

type Slide = { picture: Picture; alt: string };

/** Photo principale et miniatures d'une fiche modèle. */
export function ModelGallery({ slides, photoLabel, pendingLabel }: { slides: Slide[]; photoLabel: string; pendingLabel: string }) {
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];
  if (!current) return null;

  const label = (i: number) => photoLabel.replace("{i}", String(i + 1)).replace("{n}", String(slides.length));

  return (
    <div className="flex flex-col gap-4">
      <Photo
        picture={current.picture}
        alt={current.alt}
        ratio="4 / 5"
        sizes="(min-width: 1024px) 55vw, 100vw"
        priority={index === 0}
        pendingLabel={`${pendingLabel} · ${label(index)}`}
      />
      {slides.length > 1 && (
        <ul className="grid grid-cols-4 gap-3 sm:gap-4">
          {slides.map((slide, i) => (
            <li key={slide.picture.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={label(i)}
                aria-pressed={i === index}
                className={`block w-full border transition-colors ${i === index ? "border-ink" : "border-transparent hover:border-stone"}`}
              >
                <Photo picture={slide.picture} alt="" ratio="1 / 1" sizes="(min-width: 1024px) 12vw, 25vw" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
