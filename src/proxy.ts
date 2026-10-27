import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, routeFromSegment, routes, type Locale } from "@/i18n/config";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/env";

function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return (ranked.find((r) => hasLocale(r.lang))?.lang as Locale | undefined) ?? defaultLocale;
}

/** Pages de l'administration accessibles sans session. */
const ADMIN_PUBLIC = ["/admin/connexion", "/admin/auth/"];

/**
 * Administration : rafraîchit la session Supabase (cookies) et renvoie vers la connexion
 * si personne n'est connecté. Ce n'est qu'un premier filtre : chaque page et chaque action
 * revérifient le statut d'administratrice côté serveur, et le RLS protège les données.
 */
async function adminProxy(request: NextRequest) {
  const isPublic = ADMIN_PUBLIC.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!isSupabaseConfigured) {
    if (isPublic) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/admin/connexion";
    url.search = "?erreur=config";
    return NextResponse.redirect(url);
  }
  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/connexion";
    url.search = "";
    return NextResponse.redirect(url);
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminProxy(request);
  const [, first, segment, ...rest] = pathname.split("/");

  // Sans langue : redirection vers la langue préférée du navigateur.
  if (!first || !hasLocale(first)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  if (!segment) return NextResponse.next();

  const route = routeFromSegment(first, segment);
  if (route) {
    // Segment public de la bonne langue : réécriture vers le dossier interne (français).
    const internal = routes[route].fr;
    if (internal === segment) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = ["", first, internal, ...rest].join("/");
    return NextResponse.rewrite(url);
  }

  // Segment de l'autre langue (ex. /en/modeles) : redirection vers l'URL canonique.
  const other: Locale = first === "fr" ? "en" : "fr";
  const foreign = routeFromSegment(other, segment);
  if (foreign && routes[foreign][first] !== segment) {
    const url = request.nextUrl.clone();
    url.pathname = ["", first, routes[foreign][first], ...rest].join("/");
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Ni les fichiers statiques, ni les routes techniques.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
