/**
 * FLOW — Quick Mode management pages smoke (owner credentials via env).
 */
import { expect, test } from "@playwright/test";

const email = process.env.PLAYWRIGHT_OWNER_EMAIL || "";
const password = process.env.PLAYWRIGHT_OWNER_PASSWORD || "";

test.describe("Quick Mode management pages", () => {
  test.skip(!email || !password, "Owner credentials not provided via env");

  test.beforeEach(async ({ page }) => {
    await page.goto("/ar/auth/login");
    await page.fill("#identifier", email);
    await page.fill("#password", password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/ar\/doctor\/specialist\/dashboard/, {
      timeout: 30_000,
    });
    await page.evaluate(async () => {
      await fetch("/api/admin/preferences/dashboard-mode", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "quick" }),
      });
    });
    await page.reload();
    await expect(page.locator('[data-admin-mode="quick"]')).toBeVisible({
      timeout: 15_000,
    });
  });

  test("exam board, secretaries, doctors display, settings hours", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /المعاينة — قائمة الانتظار/ }),
    ).toBeVisible();

    await page.goto("/ar/doctor/specialist/secretaries");
    await expect(
      page.getByRole("heading", { name: /إنشاء سكرتير/ }),
    ).toBeVisible();
    await expect(page.getByText("أوقات العمل").first()).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/ar/doctor/specialist/doctors#doctor-display");
    await expect(
      page.locator("#doctor-display").getByText("عرض الأطباء"),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto("/ar/doctor/specialist/settings#contact");
    await expect(page.getByText("حفظ التواصل").first()).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/ar/doctor/specialist/settings#hours");
    await expect(page.getByText("حفظ الدوام (صباح / مساء)")).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/ar/doctor/specialist/patients");
    await expect(page.getByRole("heading", { name: "مرضاي" })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.locator(".staff-chat-fab")).toBeVisible();
  });
});
