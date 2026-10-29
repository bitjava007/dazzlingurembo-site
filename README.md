# Dazzling Urembo — site vitrine

> *Where African heritage meets modern elegance.*

Site officiel de la maison Dazzling Urembo : vitrine bilingue (français / anglais) et espace d'administration
pour gérer les modèles, catalogues, thématiques et textes du site sans toucher au code.

Projet indépendant de l'ERP de l'atelier : dépôt, base Supabase et hébergement Vercel distincts.

## Stack

| Rôle | Outil |
| --- | --- |
| Site public et administration (une seule application) | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Styles | Tailwind CSS 4, polices Cormorant Garamond et Jost servies par `next/font` |
| Langues | Routage natif `app/[lang]` + dictionnaires JSON, URL traduites par `src/proxy.ts` |
| Données, authentification, photos | Supabase (PostgreSQL + RLS, Auth par lien e-mail, Storage) |
| Hébergement | Vercel |

## Démarrer en local

Prérequis : Node.js 20.9 ou plus récent.

```bash
npm install
cp .env.example .env.local   # puis compléter les valeurs disponibles
npm run dev                  # http://localhost:3000
```

Vérifications :

```bash
npm run lint
npx tsc --noEmit
npm run build && npm start
```

## Organisation

```
src/
├── proxy.ts                  français par défaut et URL traduites (/en/models -> dossier /modeles)
├── i18n/
│   ├── config.ts             langues, table des routes FR/EN, helpers d'URL
│   ├── dictionaries.ts       chargement du dictionnaire de la langue courante
│   └── dictionaries/         textes d'interface fr.json / en.json
├── app/
│   ├── [lang]/               site public (layout racine, pages, 404 localisée)
│   ├── admin/                administration (layout racine séparé, non indexé)
│   ├── global-not-found.tsx  404 des adresses sans route
│   ├── robots.ts
│   └── globals.css           charte : couleurs, typographies, boutons
├── components/site/          en-tête, pied de page, cartes, galerie photo, blocs de page
└── lib/
    ├── content/              accès aux contenus publiés (cache + étiquettes), types, démo
    ├── site.ts               paramètres du site, lien WhatsApp
    └── metadata.ts           URL canoniques et hreflang
supabase/
├── migrations/               schéma, sécurité (RLS), stockage, fonctions, contenu initial
└── tests/rls_check.sql       vérification des droits visiteur / compte / administratrice
docs/
├── PHASE-1-PLAN.md           analyse, schéma de données et plan validé
└── INSTALLATION.md           base de données, réglages Supabase, variables, déploiement
```

### URL publiques

| Page | Français | Anglais |
| --- | --- | --- |
| Accueil | `/fr` | `/en` |
| Collections | `/fr/collections` | `/en/collections` |
| Modèles | `/fr/modeles` | `/en/models` |
| Notre histoire | `/fr/notre-histoire` | `/en/our-story` |
| Savoir-faire et sur mesure | `/fr/savoir-faire` | `/en/craftsmanship` |
| Showroom | `/fr/showroom` | `/en/showroom` |
| Contact | `/fr/contact` | `/en/contact` |
| Mentions légales | `/fr/mentions-legales` | `/en/legal-notice` |
| Confidentialité | `/fr/confidentialite` | `/en/privacy` |

`/` redirige toujours vers la version française ; l'anglais s'ouvre avec le sélecteur FR / EN. Une adresse dans la mauvaise langue
(ex. `/en/modeles`) redirige vers son équivalent canonique (`/en/models`).

## Contenus

Aucun texte officiel, coordonnée ou photo n'est inventé. Tant qu'un contenu n'est pas fourni :

- les pages affichent un bloc « Contenu en cours de préparation » ;
- les emplacements de photos sont marqués « Photographie à venir » ;
- un réseau social, un numéro WhatsApp ou une adresse non configurés ne s'affichent pas.

Textes des pages, coordonnées, WhatsApp et réseaux sociaux se règlent dans l'administration
(*Pages et contenus*, *Paramètres du site*).

### Contenus de démonstration

Les contenus viennent de Supabase. Si les variables Supabase sont absentes (développement hors ligne),
`src/lib/content/demo.ts` fournit 6 thématiques, 3 catalogues et 12 modèles marqués « exemple », et un bandeau
le signale en haut de chaque page (`isDemoContent`). Les pages ne lisent les contenus qu'à travers
`src/lib/content/index.ts`.

Chaque lecture est mise en cache (`"use cache"`) et étiquetée (`themes`, `models`, `catalogues`,
`model:<id>`, `catalogue:<id>`) pour que l'administration puisse publier sans reconstruction.

## Avancement

- [x] Phase 1 — Analyse et planification (`docs/PHASE-1-PLAN.md`)
- [x] Phase 2 — Fondation : Next.js, langues, charte, en-tête, pied de page, 404
- [x] Phase 3 — Site public : accueil, collections, galerie filtrable, fiches modèles (données de démonstration)
- [x] Phase 4 — Supabase (schéma, RLS, stockage) et administration (`/admin`)
- [x] Phase 5 — Pages et paramètres depuis la base, formulaire de contact protégé, sitemap (tests avec la base réelle à faire au déploiement)
- [ ] Phase 6 — Tests, déploiement, guides
