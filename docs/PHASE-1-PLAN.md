# Site vitrine Dazzling Urembo — Phase 1 : analyse et planification

> *Where African heritage meets modern elegance.*

Statut : **proposition à valider**. Rien n'a encore été développé.

---

## 1. État actuel du projet

Le dépôt `bitjava007/dazzsoftware` **n'est pas vide** : il contient l'**ERP interne « Dazzling Tailor ERP »**, une application en production.

| Élément | Constat |
|---|---|
| Framework | Next.js 15.5 (App Router), React 19.1, TypeScript 5 (`tsc --noEmit` : OK) |
| Styles | Tailwind CSS 4, composants shadcn/ui (Radix) |
| Données | Supabase (Auth, PostgreSQL, Storage), accès via **Prisma 5** (rôle `postgres`, contourne le RLS) |
| i18n | `next-intl` 4, **français uniquement**, sans segment de langue dans les URL |
| Auth | `src/middleware.ts` redirige **toute** route non connectée vers `/connexion` ; `/` redirige vers `/dashboard` |
| PWA | `@ducanh2912/next-pwa` avec `aggressiveFrontEndNavCaching` |
| Modules | Clients, mesures, commandes, paiements, factures, dépenses, stocks, utilisateurs (RBAC fin), paramètres |
| Hébergement | `vercel.json` (région `fra1`) et `render.yaml` |
| Données sensibles | Mesures des clients, finances, factures, paiements, fournisseurs |

### Constat de sécurité sur l'ERP existant (indépendant du site vitrine)

- Les migrations `003`, `004_user_module_permissions` et `005` créent **environ 18 tables sans RLS** (`invoice_items`, `user_module_permissions`, `suppliers`, `supplies`, `stock_*`, `inventory_*`, etc.). Sur Supabase, une table du schéma `public` sans RLS est **lisible et modifiable par l'API REST avec la clé anonyme**, qui est publique par nature.
- Les politiques existantes sont du type `FOR ALL TO authenticated USING (true)` : tout compte authentifié peut lire et modifier les clients, commandes et factures par l'API. Si les inscriptions publiques sont activées dans Supabase Auth, n'importe qui peut créer un compte.

À vérifier dans le tableau de bord Supabase puis à corriger dans une intervention séparée, quelle que soit la décision prise pour le site vitrine.

---

## 2. Décision structurante : où placer le site vitrine ?

> **Décision (validée)** : nouveau projet dans un dépôt dédié, avec son propre projet Supabase et son propre projet Vercel, sans lien avec l'ERP.

Le cahier des charges impose **une seule application pour le site public et son administration**. Il n'impose pas de la fusionner avec l'ERP. Trois options :

| Option | Description | Avantages | Inconvénients |
|---|---|---|---|
| **A. Intégration dans l'ERP** | Ajouter `/fr`, `/en` et le module vitrine à l'application actuelle | Un seul déploiement | Le site public partagerait la base qui contient les données clients ; il faudrait réécrire le middleware, la PWA, le layout racine et l'i18n de l'ERP ; tout incident côté vitrine touche l'ERP ; le design de l'ERP et celui de la vitrine sont incompatibles |
| **B. Application indépendante dans ce dépôt** *(recommandée)* | Dossier `site/` contenant une application Next.js autonome, avec **son propre projet Supabase** et **son propre projet Vercel** (Root Directory = `site`) | Isolation totale des données sensibles ; aucun risque de régression sur l'ERP ; architecture simple ; reste sur la branche demandée | Deux `package.json` dans le même dépôt |
| **C. Nouveau dépôt** | Dépôt dédié, par exemple `dazzlingurembo-site` | Séparation la plus nette | Nécessite de créer et d'autoriser un nouveau dépôt |

**Recommandation : option B.** Le site vitrine est public et l'ERP contient des données personnelles et financières. Les isoler dans deux projets Supabase distincts est la mesure de sécurité la plus simple et la plus efficace. On ne réutilise de l'ERP que les choix techniques déjà éprouvés (Next.js 15, Tailwind 4, `next-intl`, `@supabase/ssr`, `zod`) ; on ne reprend ni Prisma, ni la PWA, ni shadcn.

---

## 3. Architecture minimale recommandée

```
site/                              ← application Next.js autonome (Vercel Root Directory)
├── supabase/
│   ├── migrations/                ← SQL versionné : schéma, RLS, Storage
│   └── seed.sql                   ← thématiques initiales et contenu de démonstration marqué
├── messages/                      ← interface traduite : fr.json, en.json
├── src/
│   ├── i18n/                      ← routing next-intl (chemins localisés)
│   ├── middleware.ts              ← langue + session Supabase ; protège /admin
│   ├── app/
│   │   ├── [locale]/              ← site public (Server Components, ISR)
│   │   │   ├── page.tsx                       accueil
│   │   │   ├── collections/[slug]/            catalogues
│   │   │   ├── modeles/ | models/ [slug]      galerie et fiches
│   │   │   ├── notre-histoire | our-story
│   │   │   ├── savoir-faire | craftsmanship
│   │   │   ├── showroom, contact
│   │   │   ├── mentions-legales | legal-notice
│   │   │   ├── confidentialite | privacy
│   │   │   └── not-found.tsx
│   │   ├── admin/                 ← administration (FR), Server Components + Server Actions
│   │   │   ├── connexion/
│   │   │   ├── modeles/  catalogues/  thematiques/
│   │   │   ├── pages/  messages/  parametres/
│   │   │   └── page.tsx                       tableau de bord
│   │   ├── sitemap.ts, robots.ts
│   ├── lib/
│   │   ├── supabase/              ← clients serveur / navigateur (clé anonyme uniquement)
│   │   ├── data/                  ← requêtes publiques mises en cache (tags de revalidation)
│   │   └── validation/            ← schémas zod partagés
│   └── components/{public,admin,ui}/
├── .env.example
└── README.md
```

**Principes :**

- **Supabase en direct, sans ORM.** Le site lit avec la clé anonyme et l'administration écrit avec la session de l'utilisatrice : le **RLS est la barrière réelle**, et chaque Server Action vérifie en plus `is_admin()` côté serveur. La clé `service_role` n'est **pas nécessaire** au fonctionnement normal (elle pourra servir pour un script ponctuel, jamais dans le navigateur).
- **Fraîcheur sans reconstruction** : les pages publiques sont rendues statiquement et mises en cache avec des *tags* (`model:<id>`, `catalogue:<id>`, `themes`, `settings`). Chaque action d'administration appelle `revalidateTag`, donc une publication est visible en quelques secondes sans redéploiement.
- **Langues** : `next-intl` avec des chemins localisés (`/fr/modeles` ↔ `/en/models`), `hreflang`, et des métadonnées par langue. `/` redirige vers la langue préférée du navigateur, à défaut vers `/fr`.
- **Images** : bucket public `media` sur Supabase Storage. Dans le navigateur, les photos sont redimensionnées et converties en WebP avec l'API Canvas native (sans bibliothèque), à 2400 px maximum, puis téléversées. Le site les affiche avec `next/image` (tailles responsives et chargement différé).
- **Styles** : Tailwind 4 avec des tokens de marque (noir profond, ivoire, or champagne). Typographies servies par `next/font` : un serif éditorial, par exemple *Cormorant Garamond*, et un sans-serif sobre, par exemple *Jost*, à valider avec la charte de la marque si elle existe.
- **Dépendances prévues** : `next`, `react`, `next-intl`, `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `tailwindcss`. Le réordonnancement se fait par boutons « monter / descendre » et glisser-déposer HTML5 natif, sans bibliothèque. Aucun CMS externe.

---

## 4. Schéma de base de données proposé

Type commun : `content_status = ('draft', 'published', 'archived')`.

```sql
-- Administrateurs (liste blanche ; plusieurs comptes possibles plus tard)
admins (user_id uuid PK → auth.users ON DELETE CASCADE, created_at)
is_admin() → boolean   -- SECURITY DEFINER, utilisée par toutes les politiques

models (
  id uuid PK, slug_fr text UNIQUE, slug_en text UNIQUE,
  name_fr text NOT NULL, name_en text,
  description_fr text, description_en text,
  reference text UNIQUE NULL, material_fr text, material_en text,
  craftsmanship_fr text, craftsmanship_en text,       -- détails de confection
  status content_status DEFAULT 'draft', is_featured bool DEFAULT false,
  featured_order int, published_at timestamptz,
  created_at, updated_at                              -- trigger updated_at
)

model_images (
  id uuid PK, model_id uuid → models ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE, alt_fr text, alt_en text,
  width int, height int, position int NOT NULL, is_primary bool DEFAULT false,
  created_at
)
-- index unique partiel : une seule image principale par modèle
UNIQUE (model_id) WHERE is_primary

themes (
  id uuid PK, slug_fr UNIQUE, slug_en UNIQUE, name_fr NOT NULL, name_en,
  description_fr, description_en, cover_path text,
  position int, status content_status DEFAULT 'draft', created_at, updated_at
)

model_themes (
  model_id → models ON DELETE CASCADE,
  theme_id → themes ON DELETE RESTRICT,   -- impossible de supprimer une thématique encore utilisée
  PRIMARY KEY (model_id, theme_id)
)

catalogues (
  id uuid PK, slug_fr UNIQUE, slug_en UNIQUE, title_fr NOT NULL, title_en,
  description_fr, description_en, cover_path text,
  status content_status DEFAULT 'draft', is_featured bool, featured_order int,
  published_at, created_at, updated_at
)

catalogue_models (
  catalogue_id → catalogues ON DELETE CASCADE,  -- supprimer un catalogue retire les liens, jamais les modèles
  model_id     → models ON DELETE RESTRICT,     -- un modèle encore catalogué ne peut pas être supprimé
  position int NOT NULL,
  PRIMARY KEY (catalogue_id, model_id)
)

pages (               -- textes institutionnels éditables, contenu par blocs/sections
  key text PK,        -- 'home', 'story', 'craftsmanship', 'showroom', 'contact', 'legal', 'privacy'
  title_fr, title_en, body_fr jsonb, body_en jsonb,
  seo_title_fr, seo_title_en, seo_description_fr, seo_description_en,
  status content_status, updated_at
)

site_settings (       -- une seule ligne (id = 1, CHECK)
  whatsapp_number, contact_email, phone, address, opening_hours_fr, opening_hours_en,
  instagram_url, facebook_url, tiktok_url, default_og_image_path, updated_at
)

contact_messages (
  id, name, email, phone, subject, message, locale, source_model_id → models ON DELETE SET NULL,
  ip_hash text, created_at, handled_at
)
```

**Stratégie de suppression explicite.** On archive par défaut. La suppression définitive d'un modèle n'est permise que pour un modèle **archivé** et retiré de tous les catalogues (`RESTRICT`). Elle se fait après confirmation et entraîne la suppression de ses images (base et Storage). Supprimer un catalogue ne supprime que ses liens. Une thématique ne peut être supprimée qu'une fois détachée de tous les modèles ; sinon on la masque.

**Index** : `(status, published_at)` sur `models` et `catalogues`, `model_themes(theme_id)`, `catalogue_models(catalogue_id, position)`, `model_images(model_id, position)`.

**Politiques RLS (toutes les tables) :**

| Table | `anon` | `authenticated` hors administrateurs | Administrateurs |
|---|---|---|---|
| models, catalogues, themes, pages | `SELECT` si `status = 'published'` | idem | tout (`is_admin()`) |
| model_images, model_themes | `SELECT` si le modèle (et la thématique) est publié | idem | tout |
| catalogue_models | `SELECT` si le catalogue **et** le modèle sont publiés | idem | tout |
| site_settings | `SELECT` | `SELECT` | `UPDATE` |
| contact_messages | aucun accès direct (insertion par fonction `SECURITY DEFINER` avec limitation de débit) | aucun | `SELECT`, `UPDATE` |
| admins | aucun | aucun | `SELECT` |
| storage `media` | lecture publique des fichiers | — | `INSERT`, `UPDATE`, `DELETE` ; types et taille limités au niveau du bucket (JPEG, PNG, WebP, 10 Mo) |

La **prévisualisation** des brouillons passe par des routes `/admin/apercu/...` rendues avec la session de l'administratrice : le RLS l'autorise à voir les brouillons, et ces routes ne sont jamais mises en cache publiquement.

---

## 5. Plan de développement par phases

| Phase | Contenu | Vérifications |
|---|---|---|
| **2. Fondation** | Création de `site/`, configuration de Next.js, TypeScript, Tailwind, des tokens de marque, des polices, de `next-intl` (chemins localisés), du layout public (en-tête, sélecteur de langue, pied de page), de la page 404 et de `.env.example` | `tsc`, `eslint`, `next build`, rendu mobile et bureau (Playwright) |
| **3. Site public** | Accueil, collections et catalogue, galerie filtrable, fiche modèle, pages institutionnelles et contact. Tout repose sur une couche `lib/data`, alimentée d'abord par des **données de démonstration explicitement marquées** | Captures mobile et bureau, navigation au clavier, contraste |
| **4. Supabase et administration** | Migrations, RLS, Storage, `is_admin()`, connexion par Supabase Auth, tableau de bord, CRUD modèles (photos multiples, image principale, ordre), thématiques, catalogues (sélection et ordre), pages, paramètres, messages | Migrations appliquées sur un projet de test, conseiller de sécurité Supabase sans alerte |
| **5. Intégration et sécurité** | Branchement du site sur Supabase, revalidation par tags, WhatsApp prérempli, formulaire de contact (zod, piège à robots, limitation de débit), sitemap, robots, Open Graph, `hreflang` | **Tests d'accès en visiteur non connecté** (lecture d'un brouillon, écriture, téléversement : tout doit être refusé), tests des deux langues |
| **6. Tests et déploiement** | Tests unitaires de validation, test de bout en bout du parcours d'administration (Playwright), configuration Vercel, documentation (installation, déploiement, guide de l'administratrice), liste des configurations manuelles | Résultats de tests consignés dans `site/docs/TESTS.md` |

Chaque phase se termine par un compte rendu : réalisations, fichiers, tests réellement exécutés, éléments bloquants et étape suivante.

---

## 6. Prérequis et accès nécessaires

**Décisions à valider :**
1. L'emplacement du code (option A, B ou C).
2. Le **contact** : enregistrer les messages dans Supabase et les consulter dans l'administration (proposé pour la V1, sans service tiers), ou ajouter un envoi d'e-mail (cela suppose un fournisseur comme Resend, qui demande une validation).
3. L'ajout d'une rubrique **« Messages »** dans la navigation d'administration, nécessaire pour consulter les demandes.

**Accès techniques (au nom de la marque) :**
- Un **nouveau projet Supabase** dédié au site, région Europe, ou l'autorisation de le créer via l'intégration Supabase disponible dans cette session.
- Un compte et un projet **Vercel**, ainsi que le **nom de domaine** et l'accès à sa zone DNS.
- L'adresse e-mail du **compte administrateur** initial.

**Contenus que seule la marque peut fournir (rien ne sera inventé) :**
- Le logo (SVG de préférence, versions claire et sombre) et la charte graphique éventuelle.
- Les photographies réelles des créations, avec leurs crédits.
- Les textes officiels FR et EN : notre histoire, savoir-faire, showroom.
- Le numéro WhatsApp, l'e-mail, le téléphone, l'adresse et les horaires du showroom, les réseaux sociaux.
- Les informations des mentions légales : raison sociale, forme juridique, siège, immatriculation (RCCM ou équivalent), responsable de publication, hébergeur.
- La politique de confidentialité : finalités, durée de conservation des messages, contact pour l'exercice des droits.

---

## 7. Principaux risques techniques

| Risque | Mesure |
|---|---|
| Mélange des données publiques et des données de l'ERP | Projet Supabase dédié (option B ou C) |
| Tables de l'ERP sans RLS (constat §1) | Signalé ; correction dans une intervention séparée sur l'ERP |
| Brouillons visibles par cache ou par l'API | RLS limité aux contenus publiés, aperçu sans cache, tests en visiteur anonyme |
| Fuite de la clé `service_role` | Non utilisée par l'application ; seules les variables `NEXT_PUBLIC_*` (URL et clé anonyme) atteignent le navigateur |
| Photos lourdes envoyées depuis un téléphone | Redimensionnement et conversion WebP côté client, limite de taille au niveau du bucket et de la Server Action, messages d'erreur explicites |
| Quota d'optimisation d'images de Vercel (offre gratuite) | Fichiers déjà réduits au téléversement ; tailles `sizes` maîtrisées ; repli possible sur les transformations Supabase (offre Pro) |
| Contenu obsolète après publication | `revalidateTag` dans chaque action, testé en phase 5 |
| Traductions manquantes | Champs EN facultatifs. Une fiche sans traduction s'affiche en anglais avec le texte français et une mention « Version française », jamais avec une traduction automatique présentée comme officielle. Le tableau de bord signale les traductions manquantes |
| Spam du formulaire de contact | Validation zod côté serveur, piège à robots, limitation de débit par IP hachée dans PostgreSQL, sans service tiers |
| Tests d'intégration sans Supabase local (Docker indisponible dans cet environnement) | Tests RLS sur un projet Supabase de test ou une branche Supabase |
| Ordre des modèles avec plusieurs onglets ouverts | Ordre enregistré en une seule transaction (fonction RPC), `updated_at` contrôlé |
