-- Contenus issus du questionnaire rempli par la fondatrice (Christelle Matabaro Ndamuso), reçu le 29/10/2026.
-- Seules les réponses validées sont reprises ; les notes internes et les éléments « à confirmer »
-- (WhatsApp, e-mail, adresse, horaires, année de création, mentions légales) ne sont pas publiés.
-- Textes anglais : laissés vides (« à traduire ») ; le site affiche alors le français, signalé comme tel.
begin;

-- ─── Pages ───────────────────────────────────────────────────────────────────
update public.pages set
  title_fr = 'Une élégance qui vous ressemble.',
  body_fr = $t$Dazzling Urembo est une marque de mode qui propose des vêtements et des accessoires pensés pour accompagner les femmes dans leurs différents moments de vie. Nous aimons les belles matières, les coupes qui mettent en valeur et les détails bien travaillés. Notre univers s'inspire de nos racines africaines tout en restant actuel et facile à porter.$t$
where key = 'home';

update public.pages set
  body_fr = $t$J'ai fondé Dazzling Urembo avec l'envie de proposer des créations qui reflètent à la fois notre culture et une manière actuelle de s'habiller. C'est un projet que j'ai construit progressivement. La marque s'est développée entre mes attaches congolaises et mon activité à Dakar.

## D'où vient le nom « Urembo »

« Urembo » est un mot swahili associé à la beauté et à l'élégance. Ce nom traduit bien ce que je souhaite transmettre : une beauté qui ne se limite pas à la tenue, mais aussi à la manière de se sentir lorsqu'on la porte.

## Nos valeurs

La qualité du travail, le respect des clientes, l'écoute, la créativité et l'authenticité. Je tiens à ce qu'une création soit belle, mais aussi agréable à porter, bien finie et adaptée à la personne qui la choisit.

« J'aime l'idée qu'une tenue puisse mettre une femme en valeur sans prendre toute la place. »
Christelle Matabaro Ndamuso, fondatrice$t$
where key = 'story';

update public.pages set
  body_fr = $t$Nous travaillons différentes matières selon les modèles : bazin, brocard, shantung, soie, organza, crêpe et d'autres tissus choisis pour leur tombé et leur tenue. Nous accordons beaucoup d'importance à la coupe, aux finitions, à la broderie et aux détails. Nous collaborons avec des artisans et des ateliers selon les besoins des collections et des commandes.

## La confection sur mesure

Vous nous contactez d'abord pour nous expliquer ce que vous souhaitez, avec ou sans photo d'inspiration. Nous échangeons ensemble sur le modèle, la matière, les couleurs, les mesures et le délai.

Une fois les détails validés, un acompte de 50 % permet de lancer la confection. Le délai habituel est d'environ trois semaines, selon la complexité et les disponibilités ; les urgences sont étudiées au cas par cas. Des essayages ou ajustements peuvent être prévus lorsque c'est possible. Le solde est réglé à la livraison.

## Pour quelles occasions

Pour le quotidien, le travail, les sorties du week-end, les mariages, les fêtes et les cérémonies. Nos créations accompagnent une femme aussi bien dans ses journées ordinaires que dans ses grands moments.$t$
where key = 'craftsmanship';

update public.pages set
  body_fr = $t$Notre showroom à Ngor, Dakar, permet de découvrir notre univers et certaines de nos créations. L'accueil y est personnalisé. Pour le moment, le plus simple est de nous contacter avant de passer, afin de bien organiser votre visite.$t$
where key = 'showroom';

update public.pages set
  body_fr = $t$Vous avez une question, une envie particulière ou un projet de tenue ? Écrivez-nous, nous serons ravis d'en discuter avec vous. Nous répondons dès que possible, généralement pendant nos heures d'activité.$t$
where key = 'contact';

-- ─── Paramètres : seul le lien Instagram est confirmé ────────────────────────
update public.site_settings set instagram_url = 'https://www.instagram.com/dazzling_urembo/' where id = 1;

-- ─── Thématiques : 3 catégories + matières en filtres ────────────────────────
update public.themes set name_fr = 'Vêtements', name_en = 'Clothing', slug_fr = 'vetements', slug_en = 'clothing',
  kind = 'category', position = 1,
  description_fr = 'Des tenues pour le quotidien, le travail et les occasions spéciales : robes, ensembles, boubous et pantalons.'
where slug_fr = 'robes-et-tenues';
update public.themes set kind = 'category', position = 2,
  description_fr = 'Une sélection de sacs pour compléter les silhouettes Dazzling Urembo.' where slug_fr = 'sacs';
update public.themes set kind = 'category', position = 3,
  description_fr = 'Des chaussures pensées pour associer style et confort.' where slug_fr = 'chaussures';
-- Accessoires : masquée tant qu'il n'y a pas assez de produits (réponse Q39).
update public.themes set kind = 'category', position = 4, status = 'draft' where slug_fr = 'accessoires';
update public.themes set kind = 'material', position = 10,
  description_fr = 'Nos créations en bazin, entre belles couleurs, broderies et coupes travaillées.' where slug_fr = 'bazin';
update public.themes set kind = 'material', position = 11,
  description_fr = 'Des pièces en brocard, choisies pour leur texture et leur présence.' where slug_fr = 'brocard';

-- ─── Catalogues annoncés, en brouillon (sans créations ni photos pour l'instant) ──
insert into public.catalogues (slug_fr, slug_en, title_fr, title_en, description_fr, status, is_featured, featured_order)
select * from (values
  ('cowry-majesty', 'cowry-majesty', 'Cowry Majesty', 'Cowry Majesty',
   $t$Cowry Majesty est une collection qui explore une élégance inspirée de notre héritage africain. Elle réunit des silhouettes affirmées, des matières travaillées et des détails qui donnent du caractère à chaque pièce.$t$,
   'draft'::public.content_status, true, 1),
  ('collection-kuba', 'kuba-collection', 'Collection Kuba', 'Kuba Collection',
   $t$Cette capsule part d'un travail autour des motifs Kuba et de leur interprétation dans des silhouettes actuelles. Des pièces sobres mais reconnaissables, avec une vraie attention aux coupes, aux textures et aux couleurs.$t$,
   'draft'::public.content_status, false, null),
  ('nos-essentiels', 'our-essentials', 'Nos essentiels', 'Our Essentials',
   $t$Une sélection de créations faciles à intégrer à différentes occasions : tenues, sacs et chaussures. Dazzling Urembo ne se limite pas aux tenues de cérémonie.$t$,
   'draft'::public.content_status, true, 2)
) as v(slug_fr, slug_en, title_fr, title_en, description_fr, status, is_featured, featured_order)
where not exists (select 1 from public.catalogues c where c.slug_fr = v.slug_fr);

commit;
