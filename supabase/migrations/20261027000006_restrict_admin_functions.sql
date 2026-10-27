-- Supabase accorde par défaut EXECUTE au rôle anon sur les nouvelles fonctions.
-- Les fonctions d'administration vérifient déjà is_admin() ; on retire en plus ce droit aux visiteurs.
-- is_admin() (utilisée par les règles RLS) et submit_contact_message() (formulaire public)
-- restent volontairement accessibles.
revoke execute on function public.assert_admin() from anon;
revoke execute on function public.set_model_themes(uuid, uuid[]) from anon;
revoke execute on function public.set_model_catalogues(uuid, uuid[]) from anon;
revoke execute on function public.set_catalogue_models(uuid, uuid[]) from anon;
revoke execute on function public.set_model_images_order(uuid, uuid[]) from anon;
