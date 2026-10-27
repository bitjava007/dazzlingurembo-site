# Installation et configuration

Ce document décrit comment recréer et configurer le site de zéro. Les comptes (GitHub, Supabase,
Vercel, nom de domaine) doivent appartenir à Dazzling Urembo.

## 1. Base de données Supabase

Projet actuel : `dazzlingurembo-site` (région eu-west-1), distinct de l'ERP.

### Recréer le schéma sur un nouveau projet

Exécuter dans l'éditeur SQL de Supabase, **dans l'ordre**, les fichiers de `supabase/migrations/` :

| Fichier | Contenu |
| --- | --- |
| `…01_schema.sql` | Tables, contraintes, index, déclencheurs |
| `…02_security.sql` | `is_admin()`, RLS et politiques d'accès |
| `…03_storage.sql` | Bucket `media` (JPEG/PNG/WebP, 10 Mo) et ses droits |
| `…04_functions.sql` | Réordonnancements transactionnels, formulaire de contact limité |
| `…05_initial_content.sql` | Six thématiques, pages vides, ligne des paramètres |
| `…06_restrict_admin_functions.sql` | Retrait des fonctions d'administration au rôle visiteur |

Puis déclarer l'administratrice (adresse en minuscules) :

```sql
insert into public.admins (email) values ('adresse@exemple.com');
```

Pour vérifier les droits : exécuter `supabase/tests/rls_check.sql` en y remplaçant `ADMIN_EMAIL`.

### Réglages à faire dans le tableau de bord Supabase (manuels)

1. **Créer le compte de l'administratrice** — *Authentication → Users → Add user → Create new user* :
   saisir l'adresse e-mail, cocher **Auto Confirm User**. Le mot de passe demandé n'est pas utilisé
   (connexion par lien e-mail) : mettre une valeur longue et aléatoire.
2. **Fermer les inscriptions publiques** — *Authentication → Sign In / Providers* :
   désactiver **Allow new users to sign up**. Seuls les comptes créés à l'étape 1 peuvent se connecter.
3. **Adresses de retour du lien de connexion** — *Authentication → URL Configuration* :
   - *Site URL* : l'adresse de production, par exemple `https://www.dazzlingurembo.com` ;
   - *Redirect URLs* : ajouter `http://localhost:3000/admin/auth/confirm` et
     `https://www.dazzlingurembo.com/admin/auth/confirm` (et l'adresse Vercel tant que le domaine n'est pas branché).
4. **Envoi des e-mails** — le service d'e-mail intégré de Supabase est limité à quelques envois par heure,
   suffisant pour une administratrice. Pour plus de volume ou un expéditeur au nom de la marque,
   configurer un SMTP (*Authentication → Emails → SMTP Settings*).

Un compte connecté **sans** figurer dans `public.admins` n'a aucun droit, même s'il existe dans Supabase Auth.

## 2. Application Next.js

```bash
npm install
cp .env.example .env.local
npm run dev
```

Variables (`.env.local` en local, *Settings → Environment Variables* sur Vercel) :

| Variable | Valeur | Exposée au navigateur |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.dazzlingurembo.com` | oui |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<projet>.supabase.co` | oui (prévu) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clé `sb_publishable_…` (*Project Settings → API Keys*) | oui (prévu) |
| `CONTACT_HASH_SALT` | longue valeur aléatoire (limitation des envois du formulaire) | **non** |

La clé `service_role` / `secret` **n'est utilisée nulle part** et ne doit jamais être ajoutée au projet :
toute la sécurité repose sur le RLS et la liste des administrateurs.

## 3. Déploiement sur Vercel

1. *Add New → Project*, importer le dépôt `dazzlingurembo-site` (framework détecté : Next.js).
2. Renseigner les trois variables ci-dessus pour *Production* et *Preview*.
3. Déployer, puis brancher le domaine (*Settings → Domains*) et mettre à jour la *Site URL*
   et les *Redirect URLs* Supabase.

Les publications faites dans l'administration apparaissent sur le site sans redéploiement
(cache invalidé par étiquettes à chaque enregistrement).
