import { HttpException, HttpStatus } from "@nestjs/common";

type Counter = { count: number; resetAt: number };

/**
 * In-memory sliding-window rate limiter for auth endpoints.
 * Suitable for single-instance deployments; replace with Redis in multi-instance production.
 */
export class AuthRateLimiter {
  private readonly buckets = new Map<string, Counter>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if the key is allowed; increments on success. */
  tryConsume(key: string): boolean {
    const now = Date.now();
    const cur = this.buckets.get(key);
    if (!cur || cur.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (cur.count >= this.max) return false;
    cur.count += 1;
    return true;
  }

  assertAllowed(key: string, message = "محاولات كثيرة. حاول لاحقًا.") {
    if (!this.tryConsume(key)) {
      throw new HttpException(
        { code: "RATE_LIMITED", message },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /** Opportunistic cleanup to bound memory. */
  prune(maxEntries = 5_000) {
    if (this.buckets.size < maxEntries) return;
    const now = Date.now();
    for (const [k, v] of this.buckets) {
      if (v.resetAt <= now) this.buckets.delete(k);
    }
  }
}

export const loginIpLimiter = new AuthRateLimiter(
  Number(process.env.AUTH_LOGIN_IP_MAX || 30),
  Number(process.env.AUTH_LOGIN_IP_WINDOW_MS || 15 * 60_000),
);

export const loginIdLimiter = new AuthRateLimiter(
  Number(process.env.AUTH_LOGIN_ID_MAX || 12),
  Number(process.env.AUTH_LOGIN_ID_WINDOW_MS || 15 * 60_000),
);

export const forgotPasswordLimiter = new AuthRateLimiter(
  Number(process.env.AUTH_FORGOT_MAX || 5),
  Number(process.env.AUTH_FORGOT_WINDOW_MS || 15 * 60_000),
);

export const verifyResendLimiter = new AuthRateLimiter(
  Number(process.env.AUTH_VERIFY_RESEND_MAX || 3),
  Number(process.env.AUTH_VERIFY_RESEND_WINDOW_MS || 10 * 60_000),
);
