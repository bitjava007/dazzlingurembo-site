"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { translatePath, type Locale } from "@/i18n/config";
import { ChatIcon, CloseIcon, MenuIcon } from "./icons";

export type NavItem = { href: string; label: string };

type HeaderProps = {
  locale: Locale;
  homeHref: string;
  items: NavItem[];
  labels: {
    main: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    switchTo: string;
    whatsapp: string;
  };
  whatsappHref: string | null;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ locale, homeHref, items, labels, whatsappHref }: HeaderProps) {
  const pathname = usePathname();
  // Le menu mobile est ouvert pour une page donnée : il se referme de lui-même après navigation.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const other: Locale = locale === "fr" ? "en" : "fr";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const languageSwitch = (
    <span className="flex items-center gap-2 text-[0.8125rem] tracking-[0.12em]" aria-label={labels.language}>
      <span aria-current="true" className="font-medium">
        {locale.toUpperCase()}
      </span>
      <span aria-hidden="true" className="text-stone">
        /
      </span>
      <Link
        href={translatePath(pathname, other)}
        hrefLang={other}
        lang={other}
        className="text-taupe hover:text-ink"
        title={labels.switchTo}
      >
        <span className="sr-only">{labels.switchTo} — </span>
        {other.toUpperCase()}
      </Link>
    </span>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-4 sm:px-8 lg:h-20">
        <Link href={homeHref} className="font-serif text-lg font-medium tracking-[0.24em] sm:text-2xl sm:tracking-[var(--tracking-wordmark)]">
          DAZZLING UREMBO
        </Link>

        <nav aria-label={labels.main} className="hidden lg:block">
          <ul className="flex gap-7 text-[0.8125rem] uppercase tracking-[0.14em]">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={active ? "link-underline" : "hover:text-gold-deep"}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {languageSwitch}
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline min-h-11 px-4 text-xs">
              <ChatIcon size={16} />
              {labels.whatsapp}
            </a>
          )}
        </div>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? labels.closeMenu : labels.openMenu}
          onClick={() => setOpen(!open)}
        >
          {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[65px] overflow-y-auto bg-ivory px-4 pb-10 sm:px-8 lg:hidden">
          <nav aria-label={labels.main}>
            <ul className="flex flex-col border-t border-line">
              {items.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="flex min-h-14 items-center font-serif text-2xl"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 flex flex-col gap-6">
            {languageSwitch}
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-dark w-full">
                <ChatIcon size={16} />
                {labels.whatsapp}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
