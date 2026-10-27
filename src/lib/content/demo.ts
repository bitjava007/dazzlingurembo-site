/**
 * CONTENU DE DÉMONSTRATION — à supprimer en Phase 4.
 *
 * Ces données servent uniquement à construire et tester les pages publiques.
 * Les noms portent la mention « exemple », aucune photographie n'est fournie
 * et aucune information sur la marque n'est inventée. Les thématiques reprennent
 * la liste initiale du cahier des charges.
 */
import type { Catalogue, Model, Picture, PlaceholderTone, Theme } from "./types";

const DEMO_DESCRIPTION = {
  fr: "Description de démonstration. Le texte officiel de ce modèle sera saisi dans l'administration.",
  en: "Demonstration description. The official text for this creation will be entered in the admin area.",
};

function photos(id: string, tones: PlaceholderTone[]): Picture[] {
  return tones.map((tone, i) => ({
    id: `${id}-img-${i + 1}`,
    src: null,
    alt: { fr: null, en: null },
    width: 1200,
    height: 1500,
    tone,
  }));
}

export const demoThemes: Theme[] = [
  { id: "t-bazin", slug: { fr: "bazin", en: "bazin" }, name: { fr: "Bazin", en: "Bazin" } },
  { id: "t-brocard", slug: { fr: "brocard", en: "brocade" }, name: { fr: "Brocard", en: "Brocade" } },
  { id: "t-robes", slug: { fr: "robes-et-tenues", en: "dresses-and-outfits" }, name: { fr: "Robes et tenues", en: "Dresses & outfits" } },
  { id: "t-sacs", slug: { fr: "sacs", en: "bags" }, name: { fr: "Sacs", en: "Bags" } },
  { id: "t-chaussures", slug: { fr: "chaussures", en: "shoes" }, name: { fr: "Chaussures", en: "Shoes" } },
  { id: "t-accessoires", slug: { fr: "accessoires", en: "accessories" }, name: { fr: "Accessoires", en: "Accessories" } },
].map((t, i): Theme => ({
  ...t,
  description: { fr: null, en: null },
  cover: { id: `${t.id}-cover`, src: null, alt: { fr: null, en: null }, width: 900, height: 1200, tone: (["umber", "linen", "night", "sand", "earth", "linen"] as const)[i] },
  position: i + 1,
}));

type DemoModelInput = {
  id: string;
  fr: string;
  en: string | null;
  slugEn: string;
  themes: string[];
  tones: PlaceholderTone[];
  material?: [string, string];
  featured?: boolean;
  day: number;
};

const demoModelInputs: DemoModelInput[] = [
  { id: "m-01", fr: "Robe longue", en: "Long dress", slugEn: "long-dress", themes: ["t-bazin", "t-robes"], tones: ["deep", "umber", "sand", "linen"], material: ["Bazin (exemple)", "Bazin (example)"], featured: true, day: 20 },
  { id: "m-02", fr: "Ensemble deux pièces", en: "Two-piece set", slugEn: "two-piece-set", themes: ["t-brocard", "t-robes"], tones: ["sand", "deep", "linen"], material: ["Brocard (exemple)", "Brocade (example)"], featured: true, day: 19 },
  { id: "m-03", fr: "Boubou brodé", en: "Embroidered boubou", slugEn: "embroidered-boubou", themes: ["t-bazin"], tones: ["umber", "sand"], featured: true, day: 18 },
  { id: "m-04", fr: "Sac structuré", en: "Structured bag", slugEn: "structured-bag", themes: ["t-sacs"], tones: ["earth", "linen"], featured: true, day: 17 },
  { id: "m-05", fr: "Escarpins", en: "Pumps", slugEn: "pumps", themes: ["t-chaussures"], tones: ["linen", "earth"], day: 16 },
  { id: "m-06", fr: "Pochette du soir", en: "Evening clutch", slugEn: "evening-clutch", themes: ["t-sacs", "t-accessoires"], tones: ["night", "sand"], day: 15 },
  { id: "m-07", fr: "Robe de cérémonie", en: "Ceremony gown", slugEn: "ceremony-gown", themes: ["t-brocard", "t-robes"], tones: ["night", "umber", "linen"], day: 14 },
  { id: "m-08", fr: "Foulard", en: "Scarf", slugEn: "scarf", themes: ["t-accessoires"], tones: ["sand"], day: 13 },
  { id: "m-09", fr: "Mules", en: "Mules", slugEn: "mules", themes: ["t-chaussures"], tones: ["umber"], day: 12 },
  // Traduction anglaise volontairement absente : montre l'affichage « version française ».
  { id: "m-10", fr: "Tunique", en: null, slugEn: "tunique", themes: ["t-bazin", "t-robes"], tones: ["linen", "deep"], day: 11 },
  { id: "m-11", fr: "Cabas", en: "Tote", slugEn: "tote", themes: ["t-sacs"], tones: ["earth"], day: 10 },
  { id: "m-12", fr: "Bijou de tête", en: "Headpiece", slugEn: "headpiece", themes: ["t-accessoires"], tones: ["deep"], day: 9 },
];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const demoModels: Model[] = demoModelInputs.map((m) => ({
  id: m.id,
  slug: { fr: `${slugify(m.fr)}-exemple`, en: `${m.slugEn}-example` },
  reference: `DEMO-${m.id.slice(2)}`,
  name: { fr: `${m.fr} — exemple`, en: m.en ? `${m.en} — example` : null },
  description: m.en ? DEMO_DESCRIPTION : { fr: DEMO_DESCRIPTION.fr, en: null },
  material: m.material ? { fr: m.material[0], en: m.material[1] } : { fr: null, en: null },
  craftsmanship: { fr: null, en: null },
  images: photos(m.id, m.tones),
  themeIds: m.themes,
  isFeatured: m.featured ?? false,
  publishedAt: `2026-10-${String(m.day).padStart(2, "0")}T10:00:00Z`,
}));

export const demoCatalogues: Catalogue[] = [
  {
    id: "c-heritage",
    slug: { fr: "collection-heritage-exemple", en: "heritage-collection-example" },
    title: { fr: "Collection Héritage — exemple", en: "Heritage Collection — example" },
    description: {
      fr: "Catalogue de démonstration : titre, description et sélection seront définis dans l'administration.",
      en: "Demonstration catalogue: title, description and selection will be set in the admin area.",
    },
    modelIds: ["m-01", "m-03", "m-07", "m-10", "m-06"],
    tone: "deep" as PlaceholderTone,
  },
  {
    id: "c-ceremonies",
    slug: { fr: "grandes-ceremonies-exemple", en: "grand-ceremonies-example" },
    title: { fr: "Grandes cérémonies — exemple", en: "Grand ceremonies — example" },
    description: {
      fr: "Catalogue de démonstration : un même modèle peut figurer dans plusieurs catalogues.",
      en: "Demonstration catalogue: the same creation can appear in several catalogues.",
    },
    modelIds: ["m-07", "m-02", "m-01", "m-06", "m-12"],
    tone: "sand" as PlaceholderTone,
  },
  {
    id: "c-accessoires",
    slug: { fr: "selection-accessoires-exemple", en: "accessories-selection-example" },
    title: { fr: "Sélection accessoires — exemple", en: "Accessories selection — example" },
    description: {
      fr: "Catalogue de démonstration consacré aux sacs, chaussures et accessoires.",
      en: "Demonstration catalogue dedicated to bags, shoes and accessories.",
    },
    modelIds: ["m-04", "m-06", "m-05", "m-11", "m-08", "m-09"],
    tone: "umber" as PlaceholderTone,
  },
].map(({ tone, ...c }, i) => ({
  ...c,
  cover: { id: `${c.id}-cover`, src: null, alt: { fr: null, en: null }, width: 1200, height: 1500, tone },
  isFeatured: true,
  publishedAt: `2026-10-0${i + 1}T10:00:00Z`,
}));
