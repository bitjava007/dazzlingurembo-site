-- Filigrane du logo sur les photos envoyées depuis l'administration (Paramètres du site).
-- Désactivé par défaut ; le réglage ne s'applique qu'aux photos envoyées après son changement.
alter table public.site_settings
  add column watermark_enabled boolean not null default false;
