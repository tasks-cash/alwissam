"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SVGProps,
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
import { formatOwnerDisplay } from "../../lib/auth/owner-display";
import { isOwnerRole } from "../../lib/auth/role-paths";

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
  /** Doctor profile type for Owner display (from /api/auth/me). */
  doctorType?: "GENERAL" | "SPECIALIST";
  /** Optional page-scoped language/direction; other dashboards keep inherited values. */
  pageLanguage?: Locale;
  pageDirection?: "rtl" | "ltr";
  pageClassName?: string;
};

const MODE_STORAGE_KEY = "alwisam_admin_dashboard_mode";

function SidebarIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & {
  name:
    | "dashboard"
    | "patients"
    | "doctors"
    | "secretaries"
    | "reviews"
    | "cases"
    | "contact"
    | "settings"
    | "logout";
}) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    patients: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c.7-4 2.6-6 5.5-6s4.8 2 5.5 6" />
        <path d="M16 11.5c2.8.3 4.3 2.1 4.8 5.5" />
        <path d="M15.5 5.3a3 3 0 0 1 0 5.4" />
      </>
    ),
    doctors: (
      <>
        <circle cx="12" cy="7" r="3.2" />
        <path d="M5.5 21v-2.2c0-4 2.2-6.3 6.5-6.3s6.5 2.3 6.5 6.3V21" />
        <path d="M9.2 13.1 12 17l2.8-3.9" />
      </>
    ),
    secretaries: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M9 5V3h6v2M8 10h8M8 14h5M8 18h4" />
      </>
    ),
    reviews: (
      <>
        <path d="M5 4h14v12H9l-4 4V4Z" />
        <path d="m9 10 1.7 1.2-.7 2 2-1.2 2 1.2-.7-2L15 10h-2.1L12 8l-.9 2H9Z" />
      </>
    ),
    cases: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M12 5v14M7 12h2M15 12h2" />
      </>
    ),
    contact: (
      <>
        <path d="M7 3H4.8A1.8 1.8 0 0 0 3 4.9C3.5 13.4 10.6 20.5 19.1 21a1.8 1.8 0 0 0 1.9-1.8V17l-4.2-1-1.4 2.1a15.5 15.5 0 0 1-9.5-9.5L8 7.2 7 3Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

function ClinicMark() {
  return (
    <span className="quick-sidebar-mark" aria-hidden="true">
      <svg viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="21" />
        <path d="M22 9c-5.2 4.1-7.8 8.4-7.8 13 0 5.8 3.5 11 7.8 13 4.3-2 7.8-7.2 7.8-13 0-4.6-2.6-8.9-7.8-13Z" />
        <path d="M15 25c2.7 1.2 5 1.8 7 1.8s4.3-.6 7-1.8" />
      </svg>
    </span>
  );
}

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
  doctorType,
  pageLanguage,
  pageDirection,
  pageClassName,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showModeSwitch = canUseAdminDashboardModes(role);
  const [adminMode, setAdminMode] = useState<AdminDashboardMode>(
    normalizeAdminDashboardMode(initialAdminMode),
  );
  const [modeBusy, setModeBusy] = useState(false);
  const modeChangedByUser = useRef(false);
  const [resolvedDoctorType, setResolvedDoctorType] = useState<
    "GENERAL" | "SPECIALIST" | undefined
  >(doctorType);
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith(`/${locale}/doctor/specialist/settings`),
  );
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    if (doctorType) setResolvedDoctorType(doctorType);
  }, [doctorType]);

  useEffect(() => {
    if (!isOwnerRole(role) || resolvedDoctorType) return;
    let cancelled = false;
    (async () => {
      const { ok, data } = await apiRequest<{
        user?: { doctor?: { type?: "GENERAL" | "SPECIALIST" } };
      }>("/api/auth/me");
      if (cancelled || !ok) return;
      const type = data.user?.doctor?.type;
      if (type === "GENERAL" || type === "SPECIALIST") {
        setResolvedDoctorType(type);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role, resolvedDoctorType]);

  const ownerDisplay = useMemo(
    () =>
      formatOwnerDisplay({
        fullName: userName,
        role,
        doctor: resolvedDoctorType ? { type: resolvedDoctorType } : null,
      }),
    [userName, role, resolvedDoctorType],
  );
  const sidebarDisplay = useMemo(
    () =>
      formatOwnerDisplay(
        {
          fullName: userName,
          role,
          doctor: resolvedDoctorType ? { type: resolvedDoctorType } : null,
        },
        { compact: true },
      ),
    [userName, role, resolvedDoctorType],
  );
  const displayName = isOwnerRole(role) ? ownerDisplay.primary : userName;
  const sidebarPrimary = isOwnerRole(role) ? sidebarDisplay.primary : userName;
  const sidebarSecondary = isOwnerRole(role)
    ? sidebarDisplay.secondary
    : undefined;

  useEffect(() => {
    if (!showModeSwitch) return;
    let cancelled = false;
    (async () => {
      const { ok, data } = await apiRequest<{
        preferences?: { adminDashboardMode?: string };
      }>("/api/admin/preferences");
      if (cancelled || modeChangedByUser.current) return;
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
    modeChangedByUser.current = true;
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
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    if (
      pathname.startsWith(`/${locale}/doctor/specialist/settings`) ||
      activeHash === "#doctor-display"
    ) {
      setSettingsOpen(true);
    }
  }, [activeHash, locale, pathname]);

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

  const quickBase = `/${locale}/doctor/specialist`;
  const quickMainItems = [
    {
      href: `${quickBase}/dashboard`,
      label: "المعاينة",
      icon: "dashboard" as const,
    },
    {
      href: `${quickBase}/patients`,
      label: "مرضاي",
      icon: "patients" as const,
    },
    {
      href: `${quickBase}/doctors`,
      label: "الأطباء",
      icon: "doctors" as const,
    },
    {
      href: `${quickBase}/secretaries`,
      label: "السكرتارية",
      icon: "secretaries" as const,
    },
    {
      href: `${quickBase}/public-content/reviews`,
      label: "تجارب المرضى",
      icon: "reviews" as const,
    },
    {
      href: `${quickBase}/public-content/before-after`,
      label: "الحالات السابقة",
      icon: "cases" as const,
    },
    {
      href: `${quickBase}/public-content/contact-channels`,
      label: "وسائل التواصل",
      icon: "contact" as const,
    },
  ];
  const quickSettingsItems = [
    {
      href: `${quickBase}/clinic-settings#contact`,
      label: "تواصل معنا",
      hash: "#contact",
    },
    {
      href: `${quickBase}/clinic-settings#hours`,
      label: "مواعيد العمل",
      hash: "#hours",
    },
    {
      href: `${quickBase}/public-content/homepage`,
      label: "صفحات الموقع",
      hash: "#homepage",
    },
    {
      href: `${quickBase}/doctors#doctor-display`,
      label: "عرض الأطباء",
      hash: "#doctor-display",
    },
  ];
  const quickSettingsActive =
    pathname.startsWith(`${quickBase}/clinic-settings`) ||
    pathname.startsWith(`${quickBase}/public-content/homepage`) ||
    (pathname === `${quickBase}/doctors` && activeHash === "#doctor-display");
  const groupOrder = [
    "daily",
    "people",
    "appointments",
    "medical",
    "content",
    "comms",
    "system",
  ] as const;
  const groupLabels: Record<string, Record<Locale, string>> = {
    daily: { ar: "نظرة عامة", en: "Overview", fr: "Vue d’ensemble" },
    people: { ar: "إدارة العيادة", en: "Clinic management", fr: "Gestion de la clinique" },
    appointments: { ar: "المواعيد والمالية", en: "Appointments & finance", fr: "Rendez-vous et finances" },
    medical: { ar: "السجل الطبي", en: "Clinical records", fr: "Dossiers cliniques" },
    content: { ar: "محتوى الموقع", en: "Website content", fr: "Contenu du site" },
    comms: { ar: "التواصل", en: "Communication", fr: "Communication" },
    system: { ar: "النظام والإعدادات", en: "System & settings", fr: "Système et paramètres" },
  };
  const groupedItems = groupOrder
    .map((group) => ({
      group,
      items: items.filter((item) => (item.group || "system") === group),
    }))
    .filter((entry) => entry.items.length > 0);

  return (
    <div
      className={`dash-shell${showModeSwitch ? ` dash-shell--${adminMode}` : ""}${pageClassName ? ` ${pageClassName}` : ""}`}
      data-admin-mode={showModeSwitch ? adminMode : undefined}
      lang={pageLanguage}
      dir={pageDirection}
    >
      <aside
        className={`dash-sidebar ${open ? "open" : ""}`}
        id="dash-sidebar"
        dir={
          showModeSwitch && adminMode === "quick"
            ? pageDirection || "rtl"
            : undefined
        }
      >
        {showModeSwitch && adminMode === "quick" ? (
          <>
            <div className="quick-sidebar-brand">
              <ClinicMark />
              <span>
                <strong>عيادة الوسام</strong>
                <small>لطب الأسنان</small>
              </span>
            </div>

            <nav className="quick-sidebar-nav" aria-label="التنقل السريع">
              {quickMainItems.map((item) => {
                const doctorDisplay =
                  item.href === `${quickBase}/doctors` &&
                  activeHash === "#doctor-display";
                const active =
                  !doctorDisplay &&
                  (pathname === item.href ||
                    pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "quick-sidebar-link active"
                        : "quick-sidebar-link"
                    }
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <SidebarIcon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div
                className={`quick-settings-group${settingsOpen ? " open" : ""}`}
              >
                <button
                  type="button"
                  className={
                    quickSettingsActive
                      ? "quick-sidebar-link quick-settings-trigger active"
                      : "quick-sidebar-link quick-settings-trigger"
                  }
                  aria-expanded={settingsOpen}
                  aria-controls="quick-settings-links"
                  onClick={() => setSettingsOpen((value) => !value)}
                >
                  <SidebarIcon name="settings" />
                  <span>الإعدادات</span>
                  <span className="quick-settings-arrow" aria-hidden="true">
                    ‹
                  </span>
                </button>

                {settingsOpen ? (
                  <div
                    id="quick-settings-links"
                    className="quick-settings-children"
                  >
                    {quickSettingsItems.map((item) => {
                      const active =
                        item.hash === "#doctor-display"
                          ? pathname === `${quickBase}/doctors` &&
                            activeHash === item.hash
                          : item.hash === "#homepage"
                            ? pathname.startsWith(
                                `${quickBase}/public-content/homepage`,
                              )
                            : pathname === `${quickBase}/clinic-settings` &&
                              (activeHash === item.hash ||
                                (!activeHash && item.hash === "#contact"));
                      return (
                        <Link
                          key={item.hash}
                          href={item.href}
                          className={
                            active
                              ? "quick-settings-link active"
                              : "quick-settings-link"
                          }
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </nav>

            <div className="quick-sidebar-user">
              <span className="quick-user-avatar" aria-hidden="true">
                {userName.trim().charAt(0) || "م"}
              </span>
              <div className="quick-sidebar-user-text">
                <strong title={ownerDisplay.full}>{sidebarPrimary}</strong>
                {sidebarSecondary ? (
                  <span className="quick-sidebar-user-role">{sidebarSecondary}</span>
                ) : null}
              </div>
              <LogoutButton
                label="تسجيل الخروج"
                loginPath={`/${locale}/staff/login`}
                className="quick-logout-button"
                icon={<SidebarIcon name="logout" />}
              />
            </div>
          </>
        ) : (
          <>
            <div className="dash-sidebar-brand">
              <strong>{dict.brand}</strong>
              <span>{dict.brandSubtitle}</span>
              {showModeSwitch ? (
                <span className="dash-mode-badge">
                  {locale === "fr"
                    ? "Mode complet"
                    : locale === "en"
                      ? "Full mode"
                      : "الوضع الشامل"}
                </span>
              ) : null}
            </div>
            <nav className="dash-nav" aria-label="Dashboard">
              {groupedItems.map((entry) => (
                <section className="dash-nav-group" key={entry.group}>
                  <h2>{groupLabels[entry.group]?.[locale] || entry.group}</h2>
                  {entry.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={
                          active ? "dash-nav-link active" : "dash-nav-link"
                        }
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                      >
                        {label(item.labelKey)}
                      </Link>
                    );
                  })}
                </section>
              ))}
            </nav>
            {showModeSwitch ? (
              <div className="dash-sidebar-mode">
                <button
                  type="button"
                  className="btn btn-outline dash-mode-switch"
                  onClick={() => void toggleMode()}
                  disabled={modeBusy}
                  aria-pressed
                  aria-label={switchLabel}
                >
                  {switchLabel}
                </button>
              </div>
            ) : null}
          </>
        )}
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
              {!showModeSwitch || adminMode === "full" ? (
                <>
                  <span className="dash-user" title={ownerDisplay.full}>
                    {displayName}
                  </span>
                  <LanguageSwitcher locale={locale} label={dict.language} />
                  <LogoutButton
                    label={dict.logout}
                    loginPath={
                      role === "PATIENT"
                        ? `/${locale}/patient/login`
                        : `/${locale}/staff/login`
                    }
                  />
                </>
              ) : null}
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
