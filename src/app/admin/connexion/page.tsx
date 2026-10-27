import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

const notices: Record<string, { ok: boolean; text: string }> = {
  acces: { ok: false, text: "Ce compte n'a pas accès à l'administration." },
  lien: { ok: false, text: "Ce lien de connexion est invalide ou a expiré. Demandez-en un nouveau." },
  deconnecte: { ok: true, text: "Vous êtes déconnectée." },
  config: { ok: false, text: "La base de données n'est pas configurée (variables NEXT_PUBLIC_SUPABASE_*)." },
};

async function Notice({ searchParams }: { searchParams: PageProps<"/admin/connexion">["searchParams"] }) {
  const params = await searchParams;
  const key = String(params.erreur ?? params.message ?? "");
  const notice = notices[key];
  if (!notice) return null;
  return (
    <p role="status" className={`p-3 text-sm ${notice.ok ? "bg-[#e8f0e6] text-[#24452a]" : "bg-[#f6e5e1] text-[#7a2a1d]"}`}>
      {notice.text}
    </p>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/admin/connexion">) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-4 py-16">
      <div className="flex flex-col gap-2">
        <span className="font-serif text-2xl tracking-[0.22em]">DAZZLING UREMBO</span>
        <h1 className="text-xl font-medium">Administration</h1>
        <p className="text-sm text-taupe">
          Saisissez votre adresse : vous recevrez un lien de connexion à usage unique, sans mot de passe.
        </p>
      </div>
      <Suspense>
        <Notice searchParams={searchParams} />
      </Suspense>
      <LoginForm />
    </main>
  );
}
