/** Point d'entrée de l'administration : connexion Supabase et modules arrivent en Phase 4. */
export default function AdminHome() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-4">
      <span className="font-serif text-2xl tracking-[0.22em]">DAZZLING UREMBO</span>
      <h1 className="text-xl font-medium">Administration</h1>
      <p className="text-taupe">
        L&apos;espace d&apos;administration (connexion, modèles, catalogues, thématiques, pages, messages et paramètres) sera
        disponible à la Phase 4.
      </p>
    </main>
  );
}
