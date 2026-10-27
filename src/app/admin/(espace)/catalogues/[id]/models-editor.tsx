"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusMessage } from "@/components/admin/client";
import { statusLabels } from "@/components/admin/ui";
import { saveCatalogueModels } from "../actions";

type Option = { id: string; name: string; status: "draft" | "published" | "archived"; reference: string | null };
type Result = { ok: boolean; message: string } | null;

/**
 * Sélection des modèles d'un catalogue et de leur ordre d'affichage.
 * Aucune photo n'est dupliquée : le catalogue ne fait que pointer vers les modèles existants.
 */
export function CatalogueModelsEditor({ catalogueId, initial, options }: { catalogueId: string; initial: string[]; options: Option[] }) {
  const router = useRouter();
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const [selected, setSelected] = useState<string[]>(initial.filter((id) => byId.has(id)));
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Result>(null);

  const dirty = selected.join() !== initial.join();
  const candidates = options.filter(
    (o) => !selected.includes(o.id) && o.status !== "archived" && `${o.name} ${o.reference ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );

  const move = (index: number, delta: number) =>
    setSelected((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  async function save() {
    const removed = initial.filter((id) => !selected.includes(id)).length;
    if (removed && !window.confirm(`${removed} modèle(s) seront retirés de ce catalogue (ils ne sont pas supprimés). Continuer ?`)) return;
    setBusy(true);
    setStatus(await saveCatalogueModels({ catalogueId, modelIds: selected }));
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Dans ce catalogue, dans l&apos;ordre ({selected.length})</h3>
        {selected.length === 0 ? (
          <p className="text-sm text-taupe">Aucun modèle. Ajoutez-en depuis la liste.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-line border border-line">
            {selected.map((id, index) => {
              const m = byId.get(id)!;
              return (
                <li key={id} className="flex flex-wrap items-center gap-2 p-2 text-sm">
                  <span className="w-6 text-taupe">{index + 1}.</span>
                  <span className="min-w-0 flex-1 truncate">
                    {m.name}
                    {m.status !== "published" && <span className="ml-2 text-xs text-taupe">({statusLabels[m.status]} : non visible)</span>}
                  </span>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="min-h-9 min-w-9 border border-mist disabled:opacity-40" aria-label={`Monter ${m.name}`}>↑</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === selected.length - 1} className="min-h-9 min-w-9 border border-mist disabled:opacity-40" aria-label={`Descendre ${m.name}`}>↓</button>
                  <button type="button" onClick={() => setSelected((l) => l.filter((x) => x !== id))} className="min-h-9 border border-mist px-2 text-xs" aria-label={`Retirer ${m.name} du catalogue`}>Retirer</button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <label htmlFor="model-search" className="text-sm font-medium">Ajouter des modèles existants</label>
        <input id="model-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom ou référence" className="min-h-10 border border-mist px-3 text-sm" />
        <ul className="flex max-h-80 flex-col divide-y divide-line overflow-y-auto border border-line">
          {candidates.length === 0 && <li className="p-3 text-sm text-taupe">Aucun modèle à ajouter.</li>}
          {candidates.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 p-2 text-sm">
              <span className="min-w-0 truncate">
                {m.name} {m.reference && <span className="text-xs text-taupe">· {m.reference}</span>}
              </span>
              <button type="button" onClick={() => setSelected((l) => [...l, m.id])} className="min-h-9 shrink-0 border border-mist px-3 text-xs">Ajouter</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <button type="button" onClick={save} disabled={busy || !dirty} className="min-h-11 bg-ink px-4 text-sm text-ivory disabled:opacity-50">
          {busy ? "Enregistrement…" : "Enregistrer la sélection et l'ordre"}
        </button>
        {dirty && !busy && <span className="text-xs text-taupe">Modifications non enregistrées.</span>}
      </div>
      <div className="lg:col-span-2">
        <StatusMessage state={status} />
      </div>
    </div>
  );
}
