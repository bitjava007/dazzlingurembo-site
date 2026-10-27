-- Vérification des droits d'accès (à exécuter dans l'éditeur SQL de Supabase).
-- Tout se passe dans une transaction annulée : aucune donnée n'est conservée.
-- Résultat attendu : chaque ligne « refuse » sauf les deux dernières (administratrice).
-- Remplacer ADMIN_EMAIL par une adresse présente dans public.admins.
begin;
insert into public.models (slug_fr, slug_en, name_fr, status) values ('test-brouillon', 'test-draft', 'Brouillon test', 'draft');
create temp table t(test text, resultat text);
grant all on t to anon, authenticated;

set local role anon;
do $$ begin
  insert into t values ('visiteur: brouillons visibles (attendu 0)', (select count(*) from public.models where status = 'draft')::text);
  begin insert into public.models (slug_fr, slug_en, name_fr) values ('x', 'x', 'x'); insert into t values ('visiteur: insert', 'ACCEPTE (probleme)');
  exception when others then insert into t values ('visiteur: insert', 'refuse: ' || sqlerrm); end;
  begin update public.site_settings set whatsapp_number = '+1 555 0000'; insert into t values ('visiteur: paramètres', 'ACCEPTE (probleme)');
  exception when others then insert into t values ('visiteur: paramètres', 'refuse: ' || sqlerrm); end;
  begin perform public.set_catalogue_models(gen_random_uuid(), array[]::uuid[]); insert into t values ('visiteur: rpc', 'ACCEPTE (probleme)');
  exception when others then insert into t values ('visiteur: rpc', 'refuse: ' || sqlerrm); end;
  begin insert into storage.objects (bucket_id, name) values ('media', 'models/x.jpg'); insert into t values ('visiteur: photo', 'ACCEPTE (probleme)');
  exception when others then insert into t values ('visiteur: photo', 'refuse: ' || sqlerrm); end;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","email":"inconnu@example.com","role":"authenticated"}', true);
do $$ begin
  insert into t values ('compte non admin: brouillons visibles (attendu 0)', (select count(*) from public.models where status = 'draft')::text);
  begin insert into public.models (slug_fr, slug_en, name_fr) values ('x', 'x', 'x'); insert into t values ('compte non admin: insert', 'ACCEPTE (probleme)');
  exception when others then insert into t values ('compte non admin: insert', 'refuse: ' || sqlerrm); end;
end $$;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002","email":"ADMIN_EMAIL","role":"authenticated"}', true);
do $$ begin
  insert into t values ('admin: brouillons visibles (attendu 1)', (select count(*) from public.models where status = 'draft')::text);
  begin insert into public.models (slug_fr, slug_en, name_fr) values ('admin-test', 'admin-test', 'x'); insert into t values ('admin: insert', 'accepte');
  exception when others then insert into t values ('admin: insert', 'refuse: ' || sqlerrm); end;
end $$;

select * from t;
rollback;
