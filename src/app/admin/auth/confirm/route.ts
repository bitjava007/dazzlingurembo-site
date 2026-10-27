import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Retour du lien de connexion envoyé par e-mail.
 * Accepte le flux PKCE (`code`) et le flux par jeton (`token_hash` + `type`).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const supabase = await createSessionClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  const target = url.clone();
  target.search = "";
  target.pathname = ok ? "/admin" : "/admin/connexion";
  if (!ok) target.searchParams.set("erreur", "lien");
  return NextResponse.redirect(target);
}
