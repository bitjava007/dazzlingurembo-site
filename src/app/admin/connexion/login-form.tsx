"use client";

import { useActionState } from "react";
import { sendLoginLink, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendLoginLink, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label htmlFor="email" className="text-sm font-medium">
        Adresse e-mail
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="min-h-12 border border-mist bg-white px-4 text-base focus:border-ink focus:outline-none"
      />
      <button type="submit" disabled={pending} className="btn btn-dark disabled:opacity-60">
        {pending ? "Envoi…" : "Recevoir un lien de connexion"}
      </button>
      {state && (
        <p role="status" className={`p-3 text-sm ${state.ok ? "bg-[#e8f0e6] text-[#24452a]" : "bg-[#f6e5e1] text-[#7a2a1d]"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
