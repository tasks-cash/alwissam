"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
};

type Options = {
  roles?: string[];
  loginPath?: "staff" | "patient";
};

export function useDashboardSession(options: Options = {}) {
  const params = useParams();
  const raw = String(params?.locale || "ar");
  const locale: Locale = isLocale(raw) ? raw : "ar";
  const dict: Dictionary = useMemo(() => getDictionary(locale), [locale]);
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loginPath =
    options.loginPath === "patient"
      ? `/${locale}/patient/login`
      : `/${locale}/staff/login`;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        router.replace(loginPath);
        return null;
      }
      const json = (await res.json()) as { user?: SessionUser };
      if (!json.user) {
        router.replace(loginPath);
        return null;
      }
      if (options.roles?.length && !options.roles.includes(json.user.role)) {
        router.replace(loginPath);
        return null;
      }
      setUser(json.user);
      return json.user;
    } catch {
      setError(dict.connectionError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [dict.connectionError, loginPath, options.roles, router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { locale, dict, user, loading, error, refresh, loginPath };
}
