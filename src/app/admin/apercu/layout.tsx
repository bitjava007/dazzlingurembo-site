import { Suspense } from "react";

/** Aperçu des contenus non publiés, rendu comme sur le site, réservé aux administrateurs. */
export default function PreviewLayout({ children }: LayoutProps<"/admin/apercu">) {
  return <Suspense fallback={<div className="min-h-dvh bg-ivory" aria-busy="true" />}>{children}</Suspense>;
}
