-- Dazzling Urembo — schéma du site vitrine
-- Un modèle n'est enregistré qu'une fois ; thématiques et catalogues y sont reliés
-- par des tables de liaison. Stratégie de suppression explicite :
--   * supprimer un catalogue retire ses liens, jamais les modèles (CASCADE sur le lien) ;
--   * un modèle encore présent dans un catalogue ne peut pas être supprimé (RESTRICT) ;
--   * une thématique encore utilisée ne peut pas être supprimée (RESTRICT) ;
--   * un modèle doit être archivé avant d'être supprimé (déclencheur).

create type public.content_status as enum ('draft', 'published', 'archived');

-- ─── Administrateurs ─────────────────────────────────────────────────────────
-- Liste blanche par e-mail. Un compte authentifié dont l'e-mail n'y figure pas n'a aucun droit.
create table public.admins (
  email text primary key check (email = lower(email) and position('@' in email) > 1),
  created_at timestamptz not null default now()
);

-- ─── Utilitaires ─────────────────────────────────────────────────────────────
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Date de première publication, conservée ensuite (sert à l'ordre « plus récents »).
create function public.set_published_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

-- Identifiant d'URL : minuscules, chiffres et tirets.
create domain public.slug as text check (value ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(value) <= 120);

-- ─── Thématiques ─────────────────────────────────────────────────────────────
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  slug_fr public.slug not null unique,
  slug_en public.slug not null unique,
  name_fr text not null check (length(trim(name_fr)) between 1 and 120),
  name_en text check (name_en is null or length(name_en) <= 120),
  description_fr text check (description_fr is null or length(description_fr) <= 2000),
  description_en text check (description_en is null or length(description_en) <= 2000),
  cover_path text,
  position integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index themes_status_position_idx on public.themes (status, position);

-- ─── Modèles ─────────────────────────────────────────────────────────────────
create table public.models (
  id uuid primary key default gen_random_uuid(),
  slug_fr public.slug not null unique,
  slug_en public.slug not null unique,
  reference text unique check (reference is null or length(reference) <= 60),
  name_fr text not null check (length(trim(name_fr)) between 1 and 160),
  name_en text check (name_en is null or length(name_en) <= 160),
  description_fr text check (description_fr is null or length(description_fr) <= 5000),
  description_en text check (description_en is null or length(description_en) <= 5000),
  material_fr text check (material_fr is null or length(material_fr) <= 300),
  material_en text check (material_en is null or length(material_en) <= 300),
  craftsmanship_fr text check (craftsmanship_fr is null or length(craftsmanship_fr) <= 3000),
  craftsmanship_en text check (craftsmanship_en is null or length(craftsmanship_en) <= 3000),
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  featured_order integer,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index models_status_published_idx on public.models (status, published_at desc);
create index models_featured_idx on public.models (featured_order) where is_featured;

create table public.model_images (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models (id) on delete cascade,
  storage_path text not null unique check (storage_path ~ '^models/'),
  alt_fr text check (alt_fr is null or length(alt_fr) <= 300),
  alt_en text check (alt_en is null or length(alt_en) <= 300),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  position integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index model_images_model_position_idx on public.model_images (model_id, position);
-- Une seule photo principale par modèle.
create unique index model_images_one_primary_idx on public.model_images (model_id) where is_primary;

create table public.model_themes (
  model_id uuid not null references public.models (id) on delete cascade,
  theme_id uuid not null references public.themes (id) on delete restrict,
  primary key (model_id, theme_id)
);
create index model_themes_theme_idx on public.model_themes (theme_id);

-- ─── Catalogues ──────────────────────────────────────────────────────────────
create table public.catalogues (
  id uuid primary key default gen_random_uuid(),
  slug_fr public.slug not null unique,
  slug_en public.slug not null unique,
  title_fr text not null check (length(trim(title_fr)) between 1 and 160),
  title_en text check (title_en is null or length(title_en) <= 160),
  description_fr text check (description_fr is null or length(description_fr) <= 3000),
  description_en text check (description_en is null or length(description_en) <= 3000),
  cover_path text,
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  featured_order integer,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index catalogues_status_published_idx on public.catalogues (status, published_at desc);

create table public.catalogue_models (
  catalogue_id uuid not null references public.catalogues (id) on delete cascade,
  model_id uuid not null references public.models (id) on delete restrict,
  position integer not null default 0,
  primary key (catalogue_id, model_id)
);
create index catalogue_models_order_idx on public.catalogue_models (catalogue_id, position);
create index catalogue_models_model_idx on public.catalogue_models (model_id);

-- ─── Pages institutionnelles ─────────────────────────────────────────────────
create table public.pages (
  key text primary key check (key in ('home', 'story', 'craftsmanship', 'showroom', 'contact', 'legal', 'privacy')),
  title_fr text check (title_fr is null or length(title_fr) <= 200),
  title_en text check (title_en is null or length(title_en) <= 200),
  body_fr text check (body_fr is null or length(body_fr) <= 20000),
  body_en text check (body_en is null or length(body_en) <= 20000),
  seo_description_fr text check (seo_description_fr is null or length(seo_description_fr) <= 300),
  seo_description_en text check (seo_description_en is null or length(seo_description_en) <= 300),
  updated_at timestamptz not null default now()
);

-- ─── Paramètres du site (une seule ligne) ────────────────────────────────────
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^\+?[0-9 ().-]{6,25}$'),
  contact_email text check (contact_email is null or contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or length(phone) <= 40),
  address text check (address is null or length(address) <= 500),
  opening_hours_fr text check (opening_hours_fr is null or length(opening_hours_fr) <= 500),
  opening_hours_en text check (opening_hours_en is null or length(opening_hours_en) <= 500),
  instagram_url text check (instagram_url is null or instagram_url ~ '^https://'),
  facebook_url text check (facebook_url is null or facebook_url ~ '^https://'),
  tiktok_url text check (tiktok_url is null or tiktok_url ~ '^https://'),
  hero_image_path text,
  updated_at timestamptz not null default now()
);

-- ─── Messages du formulaire de contact ───────────────────────────────────────
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  email text check (email is null or (length(email) <= 200 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  phone text check (phone is null or length(phone) <= 40),
  subject text not null check (length(trim(subject)) between 1 and 200),
  message text not null check (length(trim(message)) between 1 and 5000),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  model_id uuid references public.models (id) on delete set null,
  ip_hash text check (ip_hash is null or length(ip_hash) <= 128),
  created_at timestamptz not null default now(),
  handled_at timestamptz,
  constraint contact_messages_reachable check (email is not null or phone is not null)
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);
create index contact_messages_ip_idx on public.contact_messages (ip_hash, created_at desc);

-- ─── Déclencheurs ────────────────────────────────────────────────────────────
create trigger themes_updated_at before update on public.themes for each row execute function public.set_updated_at();
create trigger models_updated_at before update on public.models for each row execute function public.set_updated_at();
create trigger catalogues_updated_at before update on public.catalogues for each row execute function public.set_updated_at();
create trigger pages_updated_at before update on public.pages for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

create trigger models_published_at before insert or update of status on public.models for each row execute function public.set_published_at();
create trigger catalogues_published_at before insert or update of status on public.catalogues for each row execute function public.set_published_at();

-- Un modèle doit être archivé avant d'être supprimé définitivement.
create function public.guard_model_delete() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.status <> 'archived' then
    raise exception 'Archivez le modèle avant de le supprimer.' using errcode = 'P0001';
  end if;
  return old;
end $$;
create trigger models_guard_delete before delete on public.models for each row execute function public.guard_model_delete();
