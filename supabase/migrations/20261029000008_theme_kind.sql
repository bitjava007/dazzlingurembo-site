-- Thématiques à deux niveaux (questionnaire de la fondatrice, 29/10) :
--   category : grandes catégories de navigation (Vêtements, Sacs, Chaussures…) ;
--   material : filtres de matière à l'intérieur des catégories (Bazin, Brocard…).
alter table public.themes
  add column kind text not null default 'category' check (kind in ('category', 'material'));
