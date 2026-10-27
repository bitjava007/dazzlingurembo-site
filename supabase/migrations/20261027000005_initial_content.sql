-- Contenu initial : uniquement des structures, aucun texte officiel inventé.
--   * les six thématiques du cahier des charges (publiées, modifiables) ;
--   * une ligne vide par page institutionnelle ;
--   * la ligne unique des paramètres du site, vide.
-- L'administratrice (table public.admins) n'est pas créée ici : voir docs/INSTALLATION.md.

insert into public.themes (slug_fr, slug_en, name_fr, name_en, position, status) values
  ('bazin', 'bazin', 'Bazin', 'Bazin', 1, 'published'),
  ('brocard', 'brocade', 'Brocard', 'Brocade', 2, 'published'),
  ('robes-et-tenues', 'dresses-and-outfits', 'Robes et tenues', 'Dresses & outfits', 3, 'published'),
  ('sacs', 'bags', 'Sacs', 'Bags', 4, 'published'),
  ('chaussures', 'shoes', 'Chaussures', 'Shoes', 5, 'published'),
  ('accessoires', 'accessories', 'Accessoires', 'Accessories', 6, 'published')
on conflict do nothing;

insert into public.pages (key) values
  ('home'), ('story'), ('craftsmanship'), ('showroom'), ('contact'), ('legal'), ('privacy')
on conflict do nothing;

insert into public.site_settings (id) values (1) on conflict do nothing;
