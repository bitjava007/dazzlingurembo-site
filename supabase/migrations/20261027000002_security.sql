-- Sécurité : RLS sur toutes les tables exposées.
--   * visiteurs (anon) et comptes non administrateurs : lecture des seuls contenus publiés ;
--   * administrateurs (e-mail présent dans public.admins) : lecture et écriture complètes.
-- Masquer un bouton dans l'interface ne protège rien : ces règles s'appliquent à toute requête.

-- Vrai si l'utilisateur connecté figure dans la liste des administrateurs.
-- SECURITY DEFINER : lit public.admins sans exposer la table.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admins enable row level security;
alter table public.themes enable row level security;
alter table public.models enable row level security;
alter table public.model_images enable row level security;
alter table public.model_themes enable row level security;
alter table public.catalogues enable row level security;
alter table public.catalogue_models enable row level security;
alter table public.pages enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

-- Privilèges de base ; le RLS décide ensuite ligne par ligne.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.themes, public.models, public.model_images, public.model_themes,
  public.catalogues, public.catalogue_models, public.pages, public.site_settings to anon, authenticated;
grant insert, update, delete on public.themes, public.models, public.model_images, public.model_themes,
  public.catalogues, public.catalogue_models to authenticated;
grant insert, update on public.pages, public.site_settings to authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select on public.admins to authenticated;

-- ─── Administrateurs ─────────────────────────────────────────────────────────
create policy admins_read_self on public.admins for select to authenticated
  using (public.is_admin());

-- ─── Thématiques ─────────────────────────────────────────────────────────────
create policy themes_read on public.themes for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy themes_write on public.themes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── Modèles ─────────────────────────────────────────────────────────────────
create policy models_read on public.models for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy models_write on public.models for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy model_images_read on public.model_images for select to anon, authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.models m where m.id = model_id and m.status = 'published')
  );
create policy model_images_write on public.model_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy model_themes_read on public.model_themes for select to anon, authenticated
  using (
    public.is_admin()
    or (
      exists (select 1 from public.models m where m.id = model_id and m.status = 'published')
      and exists (select 1 from public.themes t where t.id = theme_id and t.status = 'published')
    )
  );
create policy model_themes_write on public.model_themes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── Catalogues ──────────────────────────────────────────────────────────────
create policy catalogues_read on public.catalogues for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy catalogues_write on public.catalogues for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy catalogue_models_read on public.catalogue_models for select to anon, authenticated
  using (
    public.is_admin()
    or (
      exists (select 1 from public.catalogues c where c.id = catalogue_id and c.status = 'published')
      and exists (select 1 from public.models m where m.id = model_id and m.status = 'published')
    )
  );
create policy catalogue_models_write on public.catalogue_models for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── Pages et paramètres : lecture publique, écriture administrateur ─────────
create policy pages_read on public.pages for select to anon, authenticated using (true);
create policy pages_insert on public.pages for insert to authenticated with check (public.is_admin());
create policy pages_update on public.pages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy site_settings_read on public.site_settings for select to anon, authenticated using (true);
create policy site_settings_insert on public.site_settings for insert to authenticated with check (public.is_admin());
create policy site_settings_update on public.site_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── Messages : aucun accès direct pour les visiteurs ────────────────────────
-- Les visiteurs passent uniquement par la fonction submit_contact_message (limitation de débit).
create policy contact_messages_admin_read on public.contact_messages for select to authenticated
  using (public.is_admin());
create policy contact_messages_admin_update on public.contact_messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy contact_messages_admin_delete on public.contact_messages for delete to authenticated
  using (public.is_admin());
