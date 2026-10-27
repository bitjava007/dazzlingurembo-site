import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Administration — Dazzling Urembo", template: "%s — Administration Dazzling Urembo" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="min-h-dvh bg-[#f6f3ee]">{children}</body>
    </html>
  );
}
