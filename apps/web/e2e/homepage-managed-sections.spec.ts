import { expect, test } from "@playwright/test";

test.describe("Homepage managed sections", () => {
  test("Arabic homepage shows specialties, services, and doctors sections", async ({
    page,
  }) => {
    await page.goto("/ar");
    await expect(page.getByRole("heading", { name: /تخصصاتنا الطبية/ })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: /خدمات طب الأسنان/ })).toBeVisible();
    await expect(page.locator(".home-section-image").first()).toBeVisible();
    await expect(page.locator(".doctor-avatar-shared, .doctor-avatar").first()).toBeVisible();
  });

  test("About page reveals without hydration crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    await page.goto("/ar/about");
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 20_000 });
    expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
  });
});
