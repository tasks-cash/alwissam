"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DashboardShell } from "../layout/DashboardShell";
import { apiRequest } from "../../lib/api";
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
  const { locale, dict, user, loading, authResolved, error } =
    useDashboardSession({
      roles: ["PATIENT"],
      loginPath: "auth",
    });
  const [reloadKey, setReloadKey] = useState(0);
  const bump = useCallback(() => setReloadKey((k) => k + 1), []);

  if (!authResolved || loading) {
    return (
      <main className="dash-panel" aria-busy="true">
        {dict.sessionResolving}
      </main>
    );
  }
  if (error) {
    return <main className="dash-panel alert-error">{error}</main>;
  }
  if (!user) {
    return (
      <main className="dash-panel" aria-busy="true">
        {dict.sessionResolving}
      </main>
    );
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
  const { dict } = usePatientPortal();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(url));
  const [tick, setTick] = useState(0);
  const requestGen = useRef(0);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    const gen = ++requestGen.current;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    (async () => {
      const { ok, status, data: json } = await apiRequest<T>(url, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "private, no-store",
        },
      });
      if (controller.signal.aborted || gen !== requestGen.current) return;
      if (!ok) {
        const body = json as { code?: string; message?: string };
        if (
          status === 404 &&
          (body?.code === "NOT_FOUND" ||
            (typeof body?.message === "string" &&
              body.message.includes("غير مرتبط")))
        ) {
          setError(dict.missingPatientProfile);
        } else {
          setError(
            (typeof body?.message === "string" && body.message) ||
              dict.dashboardLoadError,
          );
        }
        setData(null);
        setLoading(false);
        return;
      }
      setData(json as T);
      setLoading(false);
    })().catch((err) => {
      if (controller.signal.aborted || (err as Error)?.name === "AbortError") {
        return;
      }
      if (gen !== requestGen.current) return;
      setError(dict.dashboardLoadError);
      setLoading(false);
    });
    return () => {
      controller.abort();
    };
  }, [url, reloadKey, tick, dict.dashboardLoadError, dict.missingPatientProfile]);

  return {
    data,
    error,
    loading,
    reload: () => setTick((t) => t + 1),
  };
}
