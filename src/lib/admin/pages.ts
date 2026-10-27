/** Pages institutionnelles éditables et leur nom dans l'administration. */
export const editablePages = {
  home: { label: "Accueil — présentation de la maison", hint: "Texte de la section « La maison » de l'accueil." },
  story: { label: "Notre histoire", hint: "Fondatrice ou fondateur, origine, valeurs." },
  craftsmanship: { label: "Savoir-faire et confection sur mesure", hint: "Tissus, techniques, déroulement d'une commande sur mesure." },
  showroom: { label: "Showroom", hint: "Description du lieu et prise de rendez-vous. Adresse et horaires : Paramètres du site." },
  contact: { label: "Contact", hint: "Phrase d'introduction au-dessus du formulaire." },
  legal: { label: "Mentions légales", hint: "Raison sociale, siège, immatriculation, responsable de publication, hébergeur." },
  privacy: { label: "Politique de confidentialité", hint: "Données collectées, finalités, durée de conservation, droits." },
} as const;

export type PageKey = keyof typeof editablePages;

export function isPageKey(value: string): value is PageKey {
  return value in editablePages;
}
