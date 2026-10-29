# Modifications à faire (à réaliser en bloc)

Liste tenue au fil des échanges. Chaque point est validé par la marque avant réalisation. Les numéros ne changent pas quand un point est retiré.

Point retiré : n° 1, photos libres dans une collection (retiré le 29/10).

| N° | Modification | Statut | Origine |
| --- | --- | --- | --- |
| 2 | **Design de la page d'accueil** : appliquer la proposition choisie dans le PDF « 10 propositions de design » (mise en page). Couleurs et polices déjà fixées par la fondatrice (questionnaire du 29/10) : palette ivoire nude, beige sable, grège, kaki olive, terracotta, brun cacao ; Cormorant Garamond + Manrope — appliquées le 29/10. | Mise en page : en attente du choix | PDF du 28/10 |
| 3 | **Statistiques** : Vercel Web Analytics (fréquentation) et/ou rubrique « Statistiques » dans l'administration (vues des modèles, clics WhatsApp et « sur mesure », messages). | En attente du choix | Demande du 27/10 |
| 4 | **Français par défaut** : l'adresse du site (`/`) ouvre toujours la version française, quelle que soit la langue du navigateur ; l'anglais reste accessible par le sélecteur FR / EN. (Aujourd'hui, un navigateur réglé en anglais arrive sur la version anglaise.) | Réalisé le 29/10 | Demande du 28/10 |
| 5 | **Filigrane du logo, activable** : une case à cocher dans *Paramètres du site* — « Ajouter le logo Dazzling Urembo en filigrane sur les photos ». Cochée : chaque photo envoyée depuis l'administration (photos des modèles, couvertures des catalogues et thématiques) reçoit automatiquement le logo au centre, semi-transparent. Décochée : aucune photo ne reçoit le logo. Logo : version vectorielle `public/brand/logo-blanc.svg` (SVG du graphiste, fond retiré). Réglages proposés : ≈ 15 % d'opacité, ≈ 30 % de la largeur. La case s'applique aux photos envoyées après son changement ; les photos déjà en ligne gardent leur état (à renvoyer si besoin). | Réalisé le 29/10 (colonne `watermark_enabled`, migration 07 appliquée) | Demande du 28/10 |
| 6 | **Logo officiel sur le site** : remplacer le texte « DAZZLING UREMBO » par le logo dans l'en-tête, le pied de page, la page 404, l'administration (connexion et menu) et l'icône d'onglet (favicon) ; version noire sur fond clair, blanche sur fond sombre. | Réalisé le 29/10 (icône d'onglet : le « D » du logo) | Logos reçus le 29/10 |

| 7 | **Catégories et matières** : galerie organisée en 3 catégories (Vêtements, Sacs, Chaussures ; Accessoires masquée tant qu'il y a peu de produits) avec Bazin et Brocard en filtres de matière ; type « Catégorie / Matière » dans l'administration. | Réalisé le 29/10 | Questionnaire de la fondatrice |
Points proposés, non encore validés :

- Seconde photo au survol des modèles dans la galerie.

Fichiers du logo (`public/brand/`) :

- `logo-noir.svg` / `logo-blanc.svg` : logo vectoriel, fond transparent, cadré au plus près (à utiliser en priorité) ;
- `logo-noir.png` / `logo-blanc.png` : mêmes logos en image 2100 × 720, fond transparent ;
- `original-logo.svg`, `original-logo-noir-sur-blanc.png`, `original-logo-blanc-sur-noir.png` : fichiers fournis, tels quels.

Contenus du questionnaire de la fondatrice : enregistrés dans la base le 29/10
(`supabase/content/20261029_questionnaire_fondatrice.sql`, exécuté dans l'éditeur SQL de Supabase).
Restent à fournir : WhatsApp et e-mail confirmés, adresse et horaires du showroom, année de création,
mentions légales, traductions anglaises, créations et photos (avec leurs droits).
