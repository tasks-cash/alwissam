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

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;
  return { ok: res.ok, status: res.status, data };
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
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
  init?: RequestInit,
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
  init?: RequestInit,
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, {
    method: "DELETE",
    body: JSON.stringify(body),
    ...init,
  });
}

/** Map Nest fieldErrors into a simple record for controlled forms. */
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
