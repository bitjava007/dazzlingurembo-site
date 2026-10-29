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

| 7 | **Catégories et matières** : galerie organisée en 3 catégories (Vêtements, Sacs, Chaussures ; Accessoires masquée tant qu'il y a peu de produits) avec Bazin et Brocard en filtres de matière ; type « Catégorie / Matière » dans l'administration. | Réalisé le 29/10 | Questionnaire de la fondatrice || 8 | **Lien Google Maps du showroom** : ajouter un champ « Lien Google Maps » dans *Paramètres du site* et un bouton « Voir sur la carte » sur la page Showroom et dans le pied de page. Lien reçu : https://maps.app.goo.gl/jFwfMHAB1wn22wkG7 | Réalisé le 29/10 (lien en ligne) | Message du 29/10 |

Points proposés, non encore validés :

- Seconde photo au survol des modèles dans la galerie.

Fichiers du logo (`public/brand/`) :

- `logo-noir.svg` / `logo-blanc.svg` : logo vectoriel, fond transparent, cadré au plus près (à utiliser en priorité) ;
- `logo-noir.png` / `logo-blanc.png` : mêmes logos en image 2100 × 720, fond transparent ;
- `original-logo.svg`, `original-logo-noir-sur-blanc.png`, `original-logo-blanc-sur-noir.png` : fichiers fournis, tels quels.

## Informations de la fondatrice

Questionnaire de Christelle Matabaro Ndamuso, fondatrice, reçu le 29/10. Contenus validés enregistrés dans la base
le 29/10 (`supabase/content/20261029_questionnaire_fondatrice.sql`) : textes français des pages Accueil, Notre histoire,
Savoir-faire et sur mesure, Showroom, Contact ; lien Instagram ; catégories et matières ; catalogues Cowry Majesty,
Collection Kuba et Nos essentiels (en brouillon).

### Reçu, à publier dès confirmation

| Information | Valeur reçue | Statut |
| --- | --- | --- |
| Showroom — adresse | Ngor Almadies, Dakar, Sénégal ; lien Google Maps : https://maps.app.goo.gl/jFwfMHAB1wn22wkG7 | Confirmé le 29/10 — en ligne (adresse et bouton « Voir sur la carte ») |
| WhatsApp | +221 77 833 60 31 | Confirmé le 29/10 (visuel des réseaux de la marque) — en ligne |
| Téléphone affiché | +221 77 833 60 31 | Confirmé le 29/10 (appels et WhatsApp) — en ligne |
| Création de la maison | 2016, à Ngor Almadies (Dakar), au showroom | Confirmé le 29/10 — en ligne (« Notre histoire ») |
| Horaires du showroom | Du lundi au samedi, de 9 h à 17 h 30 | Confirmé le 29/10 — en ligne |
| E-mail de contact | dazzlingurembo@outlook.com | Confirmé le 29/10 — en ligne |
| E-mail données personnelles | dazzlingurembo@outlook.com (proposé, adresse de la marque) | À confirmer avec les mentions légales |
| Message d'accueil WhatsApp | « Bonjour et bienvenue chez Dazzling Urembo ! Merci de nous écrire. Dites-nous ce que vous recherchez, nous vous répondrons dès que possible. » | Proposé |
| Signature en français | « L'héritage africain, l'élégance d'aujourd'hui. » | Proposition, à voir selon le rendu |
| Showroom sur rendez-vous | Préférence : encourager la prise de rendez-vous | À confirmer |
| TikTok | @dazzlingurembo → https://www.tiktok.com/@dazzlingurembo | Confirmé le 29/10 — en ligne |
| Facebook | https://www.facebook.com/dazzlingurembo | Confirmé le 29/10 — en ligne |
| Domaine | dazzlingurembo.com | Vérifier s'il est disponible ou déjà acheté, et par qui |
| Durée de conservation des messages | 12 mois | Proposé |
| Lecture des messages | La fondatrice et, si besoin, la personne chargée des demandes du site | Proposé |
| Responsable de la publication | Christelle Matabaro Ndamuso, fondatrice | Sous réserve de validation administrative |

### Encore à fournir

- Mentions légales : raison sociale, forme juridique, siège, RCCM, identifiant fiscal, droit applicable.
- Relecture des traductions anglaises par la fondatrice (traduites et en ligne le 29/10 : pages, titre d'ouverture, catégories, matières, catalogues).
- Créations : noms, descriptions, matières, références, photos ; références des 9 tenues de Cowry Majesty.
- Photos institutionnelles (ouverture, showroom, confection, portrait) et confirmation des droits à l'image et crédits.
- Personne(s) ayant accès à l'administration ; adresse e-mail de la marque pour le transfert des comptes techniques.
- Date de mise en ligne (après validation des textes, visuels et informations obligatoires).
