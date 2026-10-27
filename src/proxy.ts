import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, routeFromSegment, routes, type Locale } from "@/i18n/config";

function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => hasLocale(r.lang))?.lang as Locale | undefined ?? defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
  // Ni l'administration, ni les fichiers statiques, ni les routes techniques.
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
};
