"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LogoutButton } from "../auth/LogoutButton";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import { StaffChatWidget } from "../staff/StaffChatWidget";
import type { Dictionary } from "../../lib/i18n/dictionaries";
import type { Locale } from "../../lib/i18n/config";
import {
  canUseAdminDashboardModes,
  normalizeAdminDashboardMode,
  navForRole,
  type AdminDashboardMode,
} from "../../lib/navigation";
import { apiPatch, apiRequest } from "../../lib/api";

type Props = {
  locale: Locale;
  dict: Dictionary;
  role: string;
  userName: string;
  children: ReactNode;
  title?: string;
  description?: string;
  /** Initial mode from /api/auth/me when available. */
  initialAdminMode?: AdminDashboardMode;
  onAdminModeChange?: (mode: AdminDashboardMode) => void;
};

const MODE_STORAGE_KEY = "alwisam_admin_dashboard_mode";

export function DashboardShell({
  locale,
  dict,
  role,
  userName,
  children,
  title,
  description,
  initialAdminMode,
  onAdminModeChange,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showModeSwitch = canUseAdminDashboardModes(role);
  const [adminMode, setAdminMode] = useState<AdminDashboardMode>(
    normalizeAdminDashboardMode(initialAdminMode),
  );
  const [modeBusy, setModeBusy] = useState(false);

  useEffect(() => {
    if (!showModeSwitch) return;
    let cancelled = false;
    (async () => {
      const { ok, data } = await apiRequest<{
        preferences?: { adminDashboardMode?: string };
      }>("/api/admin/preferences");
      if (cancelled) return;
      if (ok && data.preferences?.adminDashboardMode) {
        setAdminMode(
          normalizeAdminDashboardMode(data.preferences.adminDashboardMode),
        );
        return;
      }
      try {
        const local = localStorage.getItem(MODE_STORAGE_KEY);
        if (local) setAdminMode(normalizeAdminDashboardMode(local));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showModeSwitch]);

  useEffect(() => {
    if (initialAdminMode) {
      setAdminMode(normalizeAdminDashboardMode(initialAdminMode));
    }
  }, [initialAdminMode]);

  const items = useMemo(
    () => navForRole(role, locale, showModeSwitch ? adminMode : "full"),
    [role, locale, showModeSwitch, adminMode],
  );

  const label = (key: string) =>
    (dict as Record<string, string>)[key] || key;

  const switchLabel =
    adminMode === "quick"
      ? locale === "en"
        ? "Show full dashboard"
        : locale === "fr"
          ? "Afficher le tableau complet"
          : "عرض لوحة التحكم الشاملة"
      : locale === "en"
        ? "Show quick dashboard"
        : locale === "fr"
          ? "Afficher le tableau rapide"
          : "عرض لوحة التحكم السريعة";

  const toggleMode = useCallback(async () => {
    const next: AdminDashboardMode = adminMode === "quick" ? "full" : "quick";
    setAdminMode(next);
    onAdminModeChange?.(next);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setModeBusy(true);
    try {
      await apiPatch("/api/admin/preferences/dashboard-mode", { mode: next });
    } catch {
      /* local fallback already applied */
    } finally {
      setModeBusy(false);
    }
  }, [adminMode, onAdminModeChange]);

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
    <div
      className={`dash-shell${showModeSwitch ? ` dash-shell--${adminMode}` : ""}`}
      data-admin-mode={showModeSwitch ? adminMode : undefined}
    >
      <aside className={`dash-sidebar ${open ? "open" : ""}`} id="dash-sidebar">
        <div className="dash-sidebar-brand">
          <strong>{dict.brand}</strong>
          <span>{dict.brandSubtitle}</span>
          {showModeSwitch ? (
            <span className="dash-mode-badge">
              {adminMode === "quick"
                ? locale === "fr"
                  ? "Mode rapide"
                  : locale === "en"
                    ? "Quick mode"
                    : "الوضع السريع"
                : locale === "fr"
                  ? "Mode complet"
                  : locale === "en"
                    ? "Full mode"
                    : "الوضع الشامل"}
            </span>
          ) : null}
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
        {showModeSwitch ? (
          <div className="dash-sidebar-mode">
            <button
              type="button"
              className="btn btn-outline dash-mode-switch"
              onClick={() => void toggleMode()}
              disabled={modeBusy}
              aria-pressed={adminMode === "full"}
              aria-label={switchLabel}
            >
              {switchLabel}
            </button>
          </div>
        ) : null}
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
              {showModeSwitch ? (
                <button
                  type="button"
                  className="btn btn-outline dash-mode-switch"
                  onClick={() => void toggleMode()}
                  disabled={modeBusy}
                  aria-pressed={adminMode === "full"}
                  aria-label={switchLabel}
                >
                  {adminMode === "quick" ? "⊞ " : "⊡ "}
                  {locale === "ar" ? switchLabel : switchLabel}
                </button>
              ) : null}
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
      {role !== "PATIENT" ? <StaffChatWidget /> : null}
    </div>
  );
}
