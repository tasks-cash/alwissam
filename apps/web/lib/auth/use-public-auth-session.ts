"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { roleDashboardPath } from "./role-paths";

export type PublicAuthUser = {
  id: string;
  fullName: string;
  role: string;
};

/**
 * Lightweight session probe for public chrome — never redirects.
 * Patient/dashboard shells keep useDashboardSession for gated routes.
 */
export function usePublicAuthSession(locale: string) {
  const [user, setUser] = useState<PublicAuthUser | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const { ok, data } = await apiRequest<{ user?: PublicAuthUser }>(
          "/api/auth/me",
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setUser(ok && data.user ? data.user : null);
      } catch {
        if (!controller.signal.aborted) setUser(null);
      } finally {
        if (!controller.signal.aborted) setResolved(true);
      }
    })();
    return () => controller.abort();
  }, [locale]);

  return {
    user,
    resolved,
    dashboardHref: user
      ? roleDashboardPath(user.role, locale)
      : `/${locale}/auth/login`,
    accountHref: user
      ? user.role === "PATIENT"
        ? `/${locale}/patient/profile`
        : roleDashboardPath(user.role, locale)
      : `/${locale}/auth/login`,
  };
}
