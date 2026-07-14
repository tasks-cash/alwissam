import { createHash } from "crypto";

export const SESSION_COOKIE = "alwisam_session";
export const ACCESS_COOKIE = "alwisam_access";
export const REFRESH_COOKIE = "alwisam_refresh";
export const CSRF_HEADER = "x-csrf-token";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
