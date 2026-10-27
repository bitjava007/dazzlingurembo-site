-- Opérations en plusieurs étapes exécutées en une seule transaction.
-- SECURITY INVOKER : le RLS de l'appelant s'applique ; is_admin() est en plus vérifié.

create function public.assert_admin() returns void
language plpgsql stable set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs.' using errcode = '42501';
  end if;
end $$;

-- Remplace les thématiques d'un modèle.
create function public.set_model_themes(p_model_id uuid, p_theme_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  perform public.assert_admin();
  delete from public.model_themes where model_id = p_model_id and not (theme_id = any (p_theme_ids));
  insert into public.model_themes (model_id, theme_id)
  select p_model_id, t from unnest(p_theme_ids) as t
  on conflict do nothing;
end $$;

-- Remplace les catalogues d'un modèle ; un modèle ajouté se place en fin de catalogue.
create function public.set_model_catalogues(p_model_id uuid, p_catalogue_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  perform public.assert_admin();
  delete from public.catalogue_models where model_id = p_model_id and not (catalogue_id = any (p_catalogue_ids));
  insert into public.catalogue_models (catalogue_id, model_id, position)
  select c, p_model_id,
         coalesce((select max(position) + 1 from public.catalogue_models cm where cm.catalogue_id = c), 0)
  from unnest(p_catalogue_ids) as c
  on conflict do nothing;
end $$;

-- Définit la liste ordonnée des modèles d'un catalogue (sélection + ordre).
create function public.set_catalogue_models(p_catalogue_id uuid, p_model_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  perform public.assert_admin();
  delete from public.catalogue_models where catalogue_id = p_catalogue_id and not (model_id = any (p_model_ids));
  insert into public.catalogue_models (catalogue_id, model_id, position)
  select p_catalogue_id, m, (o - 1)::int from unnest(p_model_ids) with ordinality as x(m, o)
  on conflict (catalogue_id, model_id) do update set position = excluded.position;
end $$;

-- Ordre des photos d'un modèle ; la première de la liste devient la photo principale.
create function public.set_model_images_order(p_model_id uuid, p_image_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  perform public.assert_admin();
  update public.model_images set is_primary = false where model_id = p_model_id and is_primary;
  update public.model_images i
     set position = (x.o - 1)::int, is_primary = (x.o = 1)
    from unnest(p_image_ids) with ordinality as x(id, o)
   where i.id = x.id and i.model_id = p_model_id;
end $$;

-- Formulaire de contact. Seule porte d'entrée des visiteurs vers contact_messages.
-- Limites : 5 messages par heure et par empreinte d'adresse IP, 60 par heure au total.
create function public.submit_contact_message(
  p_name text, p_email text, p_phone text, p_subject text, p_message text,
  p_locale text, p_model_id uuid, p_ip_hash text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if p_ip_hash is not null and (
    select count(*) from public.contact_messages
    where ip_hash = p_ip_hash and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if (select count(*) from public.contact_messages where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.contact_messages (name, email, phone, subject, message, locale, model_id, ip_hash)
  values (
    trim(p_name), nullif(trim(lower(p_email)), ''), nullif(trim(p_phone), ''), trim(p_subject), trim(p_message),
    coalesce(p_locale, 'fr'),
    (select id from public.models where id = p_model_id and status = 'published'),
    p_ip_hash
  )
  returning id into v_id;
  return v_id;
end $$;

revoke execute on function public.submit_contact_message(text, text, text, text, text, text, uuid, text) from public;
grant execute on function public.submit_contact_message(text, text, text, text, text, text, uuid, text) to anon, authenticated;

revoke execute on function public.assert_admin() from public;
grant execute on function public.assert_admin() to authenticated;
revoke execute on function public.set_model_themes(uuid, uuid[]) from public;
revoke execute on function public.set_model_catalogues(uuid, uuid[]) from public;
revoke execute on function public.set_catalogue_models(uuid, uuid[]) from public;
revoke execute on function public.set_model_images_order(uuid, uuid[]) from public;
grant execute on function public.set_model_themes(uuid, uuid[]) to authenticated;
grant execute on function public.set_model_catalogues(uuid, uuid[]) to authenticated;
grant execute on function public.set_catalogue_models(uuid, uuid[]) to authenticated;
grant execute on function public.set_model_images_order(uuid, uuid[]) to authenticated;
