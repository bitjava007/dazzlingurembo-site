-- Lien Google Maps du showroom (Paramètres du site) : bouton « Voir sur la carte ».
alter table public.site_settings
  add column maps_url text check (maps_url is null or (maps_url ~ '^https://' and length(maps_url) <= 500));
