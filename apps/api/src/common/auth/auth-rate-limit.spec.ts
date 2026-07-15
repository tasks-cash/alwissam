import { AuthRateLimiter } from "./auth-rate-limit";

describe("AuthRateLimiter", () => {
  it("allows up to max then blocks", () => {
    const limiter = new AuthRateLimiter(2, 60_000);
    expect(limiter.tryConsume("k")).toBe(true);
    expect(limiter.tryConsume("k")).toBe(true);
    expect(limiter.tryConsume("k")).toBe(false);
  });

  it("tracks keys independently", () => {
    const limiter = new AuthRateLimiter(1, 60_000);
    expect(limiter.tryConsume("a")).toBe(true);
    expect(limiter.tryConsume("b")).toBe(true);
    expect(limiter.tryConsume("a")).toBe(false);
  });
});
