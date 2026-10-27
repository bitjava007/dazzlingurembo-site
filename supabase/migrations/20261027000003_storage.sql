-- Stockage des photos : bucket public en lecture (URL directes pour le site),
-- écriture réservée aux administrateurs. Types et taille contrôlés par le bucket lui-même.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Pas de politique SELECT pour les visiteurs : les fichiers restent accessibles par leur URL
-- publique, mais personne ne peut lister le contenu du bucket.
create policy media_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
