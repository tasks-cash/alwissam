export type ApiErrorBody = {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T & ApiErrorBody;
};

/** Single-flight refresh promise — only one POST /api/auth/refresh at a time. */
let refreshPromise: Promise<boolean> | null = null;

export function resetRefreshMutexForTests() {
  refreshPromise = null;
}

async function refreshAccessTokenOnce(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      // Clear after microtask so concurrent waiters share this flight.
      queueMicrotask(() => {
        refreshPromise = null;
      });
    }
  })();

  return refreshPromise;
}

type RequestOptions = RequestInit & {
  /** When true, do not attempt refresh+retry on 401 (used by refresh itself / me bootstrap). */
  skipAuthRefresh?: boolean;
};

export async function apiRequest<T>(
  path: string,
  init?: RequestOptions,
): Promise<ApiResult<T>> {
  const { skipAuthRefresh, ...rest } = init || {};
  const doFetch = () =>
    fetch(path, {
      credentials: "include",
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(rest.headers || {}),
      },
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuthRefresh && !path.includes("/api/auth/refresh")) {
    const refreshed = await refreshAccessTokenOnce();
    if (refreshed) {
      res = await doFetch();
    }
  }

  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;
  return { ok: res.ok, status: res.status, data };
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  init?: RequestOptions,
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
  });
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  init?: RequestOptions,
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...init,
  });
}

export async function apiDelete<T>(
  path: string,
  body: unknown,
  init?: RequestOptions,
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, {
    method: "DELETE",
    body: JSON.stringify(body),
    ...init,
  });
}

export function mapFieldErrors(data: ApiErrorBody): Record<string, string> {
  const out: Record<string, string> = {};
  if (data.fieldErrors) {
    for (const [key, msgs] of Object.entries(data.fieldErrors)) {
      if (msgs?.length) out[key] = msgs[0];
    }
  }
  return out;
}

export function apiErrorMessage(
  data: ApiErrorBody,
  fallback = "تعذر الاتصال بالخادم حاليًا. يرجى المحاولة مرة أخرى.",
): string {
  if (typeof data.message === "string" && data.message) return data.message;
  if (Array.isArray(data.message) && data.message[0]) return String(data.message[0]);
  if (data.error) return data.error;
  const fields = mapFieldErrors(data);
  const first = Object.values(fields)[0];
  return first || fallback;
}
