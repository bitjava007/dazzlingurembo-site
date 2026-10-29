# Modifications à faire (à réaliser en bloc)

Liste tenue au fil des échanges. Chaque point est validé par la marque avant réalisation.

| N° | Modification | Statut | Origine |
| --- | --- | --- | --- |
| 1 | **Photos libres dans une collection** : déposer des photos directement dans un catalogue (ambiance, défilé), sans créer de fiche modèle ; ordre réglable, texte alternatif FR/EN, affichage sur la page du catalogue. | Validé | Demande du 28/10 |
| 2 | **Design de la page d'accueil** : appliquer la proposition choisie dans le PDF « 10 propositions de design » (polices, couleurs, mise en page). | En attente du choix | PDF du 28/10 |
| 3 | **Statistiques** : Vercel Web Analytics (fréquentation) et/ou rubrique « Statistiques » dans l'administration (vues des modèles, clics WhatsApp et « sur mesure », messages). | En attente du choix | Demande du 27/10 |
| 4 | **Français par défaut** : l'adresse du site (`/`) ouvre toujours la version française, quelle que soit la langue du navigateur ; l'anglais reste accessible par le sélecteur FR / EN. (Aujourd'hui, un navigateur réglé en anglais arrive sur la version anglaise.) | Validé | Demande du 28/10 |
| 5 | **Filigrane du logo, activable** : une case à cocher dans *Paramètres du site* — « Ajouter le logo Dazzling Urembo en filigrane sur les photos ». Cochée : chaque photo envoyée depuis l'administration (modèles, photos libres de collection) reçoit automatiquement le logo au centre, semi-transparent. Décochée : aucune photo ne reçoit le logo. Logo : version vectorielle `public/brand/logo-blanc.svg` (SVG du graphiste, fond retiré). Réglages proposés : ≈ 15 % d'opacité, ≈ 30 % de la largeur. La case s'applique aux photos envoyées après son changement ; les photos déjà en ligne gardent leur état (à renvoyer si besoin). | Validé (logo SVG reçu le 29/10) | Demande du 28/10 |
| 6 | **Logo officiel sur le site** : remplacer le texte « DAZZLING UREMBO » par le logo dans l'en-tête, le pied de page, la page 404, l'administration (connexion et menu) et l'icône d'onglet (favicon) ; version noire sur fond clair, blanche sur fond sombre. | Proposé | Logos reçus le 29/10 |

Points proposés, non encore validés :

- Seconde photo au survol des modèles dans la galerie.

Fichiers du logo (`public/brand/`) :

- `logo-noir.svg` / `logo-blanc.svg` : logo vectoriel, fond transparent, cadré au plus près (à utiliser en priorité) ;
- `logo-noir.png` / `logo-blanc.png` : mêmes logos en image 2100 × 720, fond transparent ;
- `original-logo.svg`, `original-logo-noir-sur-blanc.png`, `original-logo-blanc-sur-noir.png` : fichiers fournis, tels quels.
