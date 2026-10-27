import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { EmptyState, formatDate, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteMessage, toggleHandled } from "./actions";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const { supabase } = await requireAdmin();
  const showAll = (await searchParams).tous === "1";
  let query = supabase.from("contact_messages").select("*, models(id, name_fr)").order("created_at", { ascending: false }).limit(200);
  if (!showAll) query = query.is("handled_at", null);
  const { data, error } = await query;

  return (
    <>
      <PageHeader title="Messages" />
      <nav aria-label="Filtrer les messages" className="flex gap-2">
        <Link href="/admin/messages" aria-current={!showAll ? "page" : undefined} className={`inline-flex min-h-10 items-center border px-3 text-sm ${!showAll ? "border-ink bg-ink text-ivory" : "border-mist bg-white"}`}>À traiter</Link>
        <Link href="/admin/messages?tous=1" aria-current={showAll ? "page" : undefined} className={`inline-flex min-h-10 items-center border px-3 text-sm ${showAll ? "border-ink bg-ink text-ivory" : "border-mist bg-white"}`}>Tous</Link>
      </nav>
      {error ? (
        <EmptyState>Les messages n&apos;ont pas pu être chargés. Rechargez la page.</EmptyState>
      ) : !data.length ? (
        <EmptyState>{showAll ? "Aucun message reçu." : "Aucun message à traiter."}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {data.map((m) => (
            <li key={m.id} className={`flex flex-col gap-3 border bg-white p-5 ${m.handled_at ? "border-line opacity-75" : "border-ink"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-medium">{m.subject}</h2>
                <span className="text-xs text-taupe">{formatDate(m.created_at)} · {m.locale.toUpperCase()}</span>
              </div>
              <p className="text-sm">
                <strong className="font-medium">{m.name}</strong>
                {m.email && <> · <a href={`mailto:${m.email}`} className="underline">{m.email}</a></>}
                {m.phone && <> · <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="underline">{m.phone}</a></>}
              </p>
              {m.models && (
                <p className="text-sm text-taupe">
                  Modèle concerné : <Link href={`/admin/modeles/${m.models.id}`} className="underline">{m.models.name_fr}</Link>
                </p>
              )}
              <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed">{m.message}</p>
              <div className="flex flex-wrap gap-2">
                <ActionForm action={toggleHandled} hidden={{ id: m.id, handled: m.handled_at ? "false" : "true" }} className="contents">
                  <SubmitButton variant="outline" pendingLabel="…">{m.handled_at ? "Remettre à traiter" : "Marquer comme traité"}</SubmitButton>
                </ActionForm>
                <ActionForm action={deleteMessage} hidden={{ id: m.id }} confirm="Supprimer définitivement ce message ?" className="contents">
                  <SubmitButton variant="danger" pendingLabel="…">Supprimer</SubmitButton>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
