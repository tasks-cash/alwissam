"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LogoutButton } from "../auth/LogoutButton";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import type { Dictionary } from "../../lib/i18n/dictionaries";
import type { Locale } from "../../lib/i18n/config";
import { navForRole } from "../../lib/navigation";

type Props = {
  locale: Locale;
  dict: Dictionary;
  role: string;
  userName: string;
  children: ReactNode;
  title?: string;
  description?: string;
};

export function DashboardShell({
  locale,
  dict,
  role,
  userName,
  children,
  title,
  description,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = useMemo(() => navForRole(role, locale), [role, locale]);

  const label = (key: string) =>
    (dict as Record<string, string>)[key] || key;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="dash-shell">
      <aside className={`dash-sidebar ${open ? "open" : ""}`} id="dash-sidebar">
        <div className="dash-sidebar-brand">
          <strong>{dict.brand}</strong>
          <span>{dict.brandSubtitle}</span>
        </div>
        <nav className="dash-nav" aria-label="Dashboard">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "dash-nav-link active" : "dash-nav-link"}
                onClick={() => setOpen(false)}
              >
                {label(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="dash-content">
        <header className="dash-topbar">
          <button
            type="button"
            className="btn btn-outline dash-menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="dash-sidebar"
          >
            ☰
          </button>
          <div className="dash-topbar-main">
            <div>
              {title ? <h1>{title}</h1> : null}
              {description ? <p className="muted">{description}</p> : null}
            </div>
            <div className="dash-topbar-actions">
              <span className="dash-user">{userName}</span>
              <LanguageSwitcher locale={locale} label={dict.language} />
              <LogoutButton
                label={dict.logout}
                loginPath={
                  role === "PATIENT"
                    ? `/${locale}/patient/login`
                    : `/${locale}/staff/login`
                }
              />
            </div>
          </div>
        </header>
        <div className="dash-page">{children}</div>
      </div>
      {open ? (
        <button
          type="button"
          className="dash-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
