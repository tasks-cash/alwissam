"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiRequest } from "./api";
import {
  roleDashboardPath,
  roleMatchesAny,
} from "./auth/role-paths";
import { isLocale, type Locale } from "./i18n/config";
import { getDictionary, type Dictionary } from "./i18n/dictionaries";

export type SessionUser = {
  id: string;
  fullName: string;
  role: string;
  email?: string;
  status?: string;
  permissions?: string[];
  locale?: string;
  adminDashboardMode?: "quick" | "full" | "light";
};

type Options = {
  /** Stable allow-list — pass a constant array or memoize at call site. */
  roles?: readonly string[];
  loginPath?: "staff" | "patient" | "auth";
};

/**
 * Single auth bootstrap for dashboard shells.
 *
 * Root-cause fix: never depend on `options.roles` array identity inside
 * useCallback — join to a stable string key instead. That prevented
 * `/api/auth/me` + `router.replace` loops on /patient/dashboard.
 */
export function useDashboardSession(options: Options = {}) {
  const params = useParams();
  const raw = String(params?.locale || "ar");
  const locale: Locale = isLocale(raw) ? raw : "ar";
  const dict: Dictionary = useMemo(() => getDictionary(locale), [locale]);
  const router = useRouter();

  const rolesKey = (options.roles || []).join("|");
  const loginKind = options.loginPath || "auth";

  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);
  const [error, setError] = useState("");
  const redirectedRef = useRef(false);
  const bootstrapIdRef = useRef(0);

  const loginPath = useMemo(() => {
    if (loginKind === "patient") return `/${locale}/patient/login`;
    if (loginKind === "staff") return `/${locale}/staff/login`;
    return `/${locale}/auth/login`;
  }, [locale, loginKind]);

  const redirectOnce = useCallback(
    (to: string) => {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      router.replace(to);
    },
    [router],
  );

  const bootstrap = useCallback(
    async (signal?: AbortSignal) => {
      const id = ++bootstrapIdRef.current;
      setLoading(true);
      setError("");
      try {
        // First try /me — if 401, apiRequest performs one single-flight refresh + retry.
        const { ok, status, data } = await apiRequest<{ user?: SessionUser }>(
          "/api/auth/me",
          { signal, skipAuthRefresh: false },
        );

        if (signal?.aborted || id !== bootstrapIdRef.current) return null;

        if (!ok || !data.user) {
          if (status === 401 || status === 403) {
            redirectOnce(`${loginPath}?next=${encodeURIComponent(`/${locale}`)}`);
          } else {
            setError(
              dict.sessionCheckError ||
                dict.connectionError ||
                "تعذر التحقق من جلسة الدخول",
            );
          }
          setUser(null);
          return null;
        }

        const roles = rolesKey ? rolesKey.split("|").filter(Boolean) : [];
        if (roles.length > 0 && !roleMatchesAny(data.user.role, roles)) {
          redirectOnce(roleDashboardPath(data.user.role, locale));
          setUser(null);
          return null;
        }

        setUser(data.user);
        return data.user;
      } catch (err) {
        if (signal?.aborted || id !== bootstrapIdRef.current) return null;
        if ((err as Error)?.name === "AbortError") return null;
        setError(dict.connectionError);
        return null;
      } finally {
        if (!signal?.aborted && id === bootstrapIdRef.current) {
          setLoading(false);
          setAuthResolved(true);
        }
      }
    },
    [
      dict.connectionError,
      dict.sessionCheckError,
      locale,
      loginPath,
      redirectOnce,
      rolesKey,
    ],
  );

  useEffect(() => {
    redirectedRef.current = false;
    const controller = new AbortController();
    void bootstrap(controller.signal);
    return () => {
      controller.abort();
    };
  }, [bootstrap]);

  return {
    locale,
    dict,
    user,
    loading,
    authResolved,
    error,
    refresh: () => bootstrap(),
    loginPath,
  };
}
