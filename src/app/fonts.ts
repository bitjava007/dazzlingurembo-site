import { Cormorant_Garamond, Manrope } from "next/font/google";

/** Titres : Cormorant Garamond. Textes : Manrope (choix de la fondatrice). */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

export const fontVariables = `${cormorant.variable} ${manrope.variable}`;
