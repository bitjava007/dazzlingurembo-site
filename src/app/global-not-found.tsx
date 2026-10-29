import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page introuvable — Dazzling Urembo",
  robots: { index: false },
};

/** 404 des adresses qui ne correspondent à aucune route (hors langue). Bilingue faute de langue connue. */
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={fontVariables}>
      <body>
        <main className="mx-auto flex min-h-dvh max-w-[1320px] flex-col justify-center gap-6 px-4 sm:px-8">
          <Link href="/fr" className="self-start text-ink"><Logo className="h-14" /></Link>
          <span className="eyebrow">Erreur 404 · Error 404</span>
          <h1 className="display text-5xl sm:text-6xl">Cette page est introuvable.</h1>
          <p lang="en" className="display text-3xl italic text-taupe">This page cannot be found.</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/fr" className="btn btn-dark">Accueil</Link>
            <Link href="/en" lang="en" className="btn btn-outline">Home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
