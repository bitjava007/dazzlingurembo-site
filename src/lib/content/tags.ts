/**
 * Étiquettes de cache des contenus publics. Les lectures publiques les posent
 * (`cacheTag`) ; les actions de l'administration les invalident (`updateTag`).
 */
export const tags = {
  themes: "themes",
  models: "models",
  catalogues: "catalogues",
  settings: "settings",
  model: (id: string) => `model:${id}`,
  catalogue: (id: string) => `catalogue:${id}`,
  page: (key: string) => `page:${key}`,
} as const;
