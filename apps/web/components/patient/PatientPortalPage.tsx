"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DashboardShell } from "../layout/DashboardShell";
import type { Dictionary } from "../../lib/i18n/dictionaries";
import type { Locale } from "../../lib/i18n/config";
import { useDashboardSession } from "../../lib/use-dashboard-session";

type PortalCtx = {
  locale: Locale;
  dict: Dictionary;
  user: { fullName: string; role: string };
  reloadKey: number;
  bump: () => void;
};

const PatientPortalContext = createContext<PortalCtx | null>(null);

export function usePatientPortal() {
  const ctx = useContext(PatientPortalContext);
  if (!ctx) {
    throw new Error("usePatientPortal must be used within PatientPortalPage");
  }
  return ctx;
}

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PatientPortalPage({ title, description, children }: Props) {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["PATIENT"],
    loginPath: "patient",
  });
  const [reloadKey, setReloadKey] = useState(0);
  const bump = useCallback(() => setReloadKey((k) => k + 1), []);

  if (loading || !user) {
    return <main className="dash-panel">{dict.loading}</main>;
  }
  if (error) {
    return <main className="dash-panel alert-error">{error}</main>;
  }

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title={title}
      description={description}
    >
      <PatientPortalContext.Provider
        value={{ locale, dict, user, reloadKey, bump }}
      >
        {children}
      </PatientPortalContext.Provider>
    </DashboardShell>
  );
}

export const PatientShell = PatientPortalPage;

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="muted patient-empty">{children}</p>;
}

export function ErrorRetry({
  message,
  onRetry,
  label,
}: {
  message: string;
  onRetry: () => void;
  label: string;
}) {
  return (
    <div className="alert-error" style={{ display: "grid", gap: "0.75rem" }}>
      <span>{message}</span>
      <button type="button" className="btn btn-outline" onClick={onRetry}>
        {label}
      </button>
    </div>
  );
}

export function SkeletonBlock() {
  return <div className="patient-skeleton" aria-hidden />;
}

export function usePatientFetch<T>(
  url: string | null,
  reloadKey = 0,
): { data: T | null; error: string; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(url));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setError(
              (typeof json.message === "string" && json.message) ||
                json.error ||
                "تعذر تحميل البيانات",
            );
            setData(null);
          }
          return;
        }
        if (!cancelled) setData(json as T);
      } catch {
        if (!cancelled) setError("تعذر الاتصال بالخادم");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, reloadKey, tick]);

  return {
    data,
    error,
    loading,
    reload: () => setTick((t) => t + 1),
  };
}
