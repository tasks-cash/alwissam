import { expect, test } from "@playwright/test";

/**
 * FLOW D — Admin/Owner login (credentials from env only).
 * Requires PLAYWRIGHT_OWNER_EMAIL + PLAYWRIGHT_OWNER_PASSWORD and a running stack.
 */
const email = process.env.PLAYWRIGHT_OWNER_EMAIL || "";
const password = process.env.PLAYWRIGHT_OWNER_PASSWORD || "";

test.describe("Owner auth", () => {
  test.skip(!email || !password, "Owner credentials not provided via env");

  test("owner logs in once and opens specialist dashboard without loop", async ({
    page,
  }) => {
    const meCalls: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/auth/me")) meCalls.push(req.url());
    });

    await page.goto("/ar/auth/login");
    await page.fill("#identifier", email);
    await page.fill("#password", password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/ar\/doctor\/specialist\/dashboard/, {
      timeout: 30_000,
    });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    const afterLogin = meCalls.length;
    await page.waitForTimeout(2500);
    // No infinite /auth/me loop after settle
    expect(meCalls.length - afterLogin).toBeLessThan(4);
  });
});

test.describe("Patient dashboard auth stability", () => {
  const patientEmail = process.env.PLAYWRIGHT_PATIENT_EMAIL || "";
  const patientPassword = process.env.PLAYWRIGHT_PATIENT_PASSWORD || "";

  test.skip(
    !patientEmail || !patientPassword,
    "Patient credentials not provided via env",
  );

  test("patient dashboard loads without redirect loop", async ({ page }) => {
    const navigations: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigations.push(frame.url());
    });
    const refreshCalls: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/auth/refresh")) refreshCalls.push(req.url());
    });

    await page.goto("/ar/auth/login");
    await page.fill("#identifier", patientEmail);
    await page.fill("#password", patientPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/ar\/patient\/dashboard/, { timeout: 30_000 });
    await expect(page.getByText(/مرحب|لوحة|جارٍ/)).toBeVisible({
      timeout: 15_000,
    });

    const dashNavs = navigations.filter((u) => u.includes("/patient/dashboard"));
    expect(dashNavs.length).toBeLessThan(4);

    await page.reload();
    await page.waitForURL(/\/ar\/patient\/dashboard/, { timeout: 30_000 });
    expect(refreshCalls.length).toBeLessThan(3);
  });
});
