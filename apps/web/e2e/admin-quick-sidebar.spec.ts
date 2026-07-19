import { expect, test } from "@playwright/test";

const email = process.env.PLAYWRIGHT_OWNER_EMAIL || "";
const password = process.env.PLAYWRIGHT_OWNER_PASSWORD || "";

test.describe("Admin Quick Mode sidebar", () => {
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
    await expect(page.locator('[data-admin-mode="quick"]')).toBeVisible();
  });

  test("matches the required desktop/mobile structure and persists modes", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Responsive states are verified sequentially in Chromium",
    );
    const sidebar = page.locator("#dash-sidebar");
    await expect(sidebar.getByText("عيادة الوسام", { exact: true })).toBeVisible();
    await expect(sidebar.getByText("لطب الأسنان", { exact: true })).toBeVisible();

    const primary = sidebar.locator(".quick-sidebar-nav > .quick-sidebar-link");
    await expect(primary).toHaveCount(7);
    await expect(primary).toHaveText([
      "المعاينة",
      "مرضاي",
      "الأطباء",
      "السكرتارية",
      "تجارب المرضى",
      "الحالات السابقة",
      "وسائل التواصل",
    ]);

    await sidebar.getByRole("button", { name: "الإعدادات" }).click();
    const children = sidebar.locator(".quick-settings-link");
    await expect(children).toHaveCount(4);
    await expect(children).toHaveText([
      "تواصل معنا",
      "مواعيد العمل",
      "صفحات الموقع",
      "عرض الأطباء",
    ]);

    await expect(sidebar.getByText("تسجيل الخروج", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "عرض لوحة التحكم الشاملة" }),
    ).toBeVisible();

    await page.reload();
    await expect(page.locator('[data-admin-mode="quick"]')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".dash-menu-btn").click();
    await expect(sidebar).toHaveClass(/open/);
    if (
      (await sidebar
        .getByRole("button", { name: "الإعدادات" })
        .getAttribute("aria-expanded")) !== "true"
    ) {
      await sidebar.getByRole("button", { name: "الإعدادات" }).click();
    }
    await sidebar.getByRole("link", { name: "صفحات الموقع" }).click();
    await page.waitForURL(/\/doctor\/specialist\/public-content\/homepage/);

    await page.locator(".dash-menu-btn").click();
    await expect(
      page.locator(".quick-settings-trigger[aria-expanded='true']"),
    ).toBeVisible();
    await expect(
      page.locator(".quick-settings-link.active", { hasText: "صفحات الموقع" }),
    ).toBeVisible();

    await page.locator(".dash-backdrop").click({ position: { x: 8, y: 8 } });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page
      .getByRole("button", { name: "عرض لوحة التحكم الشاملة" })
      .click();
    await expect(page.locator('[data-admin-mode="full"]')).toBeVisible();
    await expect(page.locator(".quick-sidebar-nav")).toHaveCount(0);

    await page.reload();
    await expect(page.locator('[data-admin-mode="full"]')).toBeVisible();
    await expect(
      page
        .getByRole("button", { name: "عرض لوحة التحكم السريعة" })
        .last(),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "عرض لوحة التحكم السريعة" })
      .last()
      .click();
    await expect(page.locator('[data-admin-mode="quick"]')).toBeVisible();
    await page.locator(".quick-logout-button").click();
    await page.waitForURL(/\/ar\/staff\/login/);
  });
});
