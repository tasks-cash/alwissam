import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("Public FAQ page", () => {
  test("Arabic FAQ loads with title, search, categories, and structured data", async ({
    page,
  }) => {
    const res = await page.goto("/ar/faq", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveTitle(/الأسئلة الشائعة/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(
      page.getByRole("heading", { name: "الأسئلة الشائعة", level: 1 }),
    ).toBeVisible();
    await expect(page.locator("#faq-search input[type='search']")).toBeVisible();
    await expect(page.getByRole("tab", { name: /الكل/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /الحجز والمواعيد/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /الدعم والتواصل/ })).toBeVisible();

    const jsonLd = page.locator('script#faq-json-ld, script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached({ timeout: 10000 });
    const raw = await jsonLd.first().textContent();
    expect(raw).toBeTruthy();
    const data = JSON.parse(raw!);
    expect(data["@type"]).toBe("FAQPage");
    expect(Array.isArray(data.mainEntity)).toBeTruthy();
    expect(data.mainEntity.length).toBeGreaterThan(10);

    await expect(page.locator(".faq-disclaimer")).toContainText(
      /لا تغني عن الفحص والتشخيص/,
    );
    await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
    await expect(page.locator('a[href*="wa.me/213663098208"]').first()).toBeVisible();
    await expect(page.locator('a[href="/ar/book"]').first()).toBeVisible();
    await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);

    const box = await page.locator(".faq-explorer").boundingBox();
    expect(box).toBeTruthy();
    if (box) expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  });

  test("search and accordion behavior", async ({ page }) => {
    await page.goto("/ar/faq", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
    const search = page.locator("#faq-search input[type='search']");
    await search.fill("حجز");
    await expect(page.locator(".faq-results-count")).toContainText(/\d+\s*نتيجة/, {
      timeout: 8000,
    });
    const trigger = page.locator(".faq-trigger").first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await search.fill("___no_match_xyz___");
    await expect(page.locator(".faq-state")).toContainText(/لم نجد سؤالًا مطابقًا/, {
      timeout: 8000,
    });
  });

  test("English and French FAQ are LTR with correct titles", async ({ page }) => {
    await page.goto("/en/faq", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveTitle(/Frequently Asked Questions/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(
      page.getByRole("heading", { name: "Frequently Asked Questions", level: 1 }),
    ).toBeVisible();

    await page.goto("/fr/faq", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveTitle(/Questions fréquentes/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(
      page.getByRole("heading", { name: "Questions fréquentes", level: 1 }),
    ).toBeVisible();
  });

  test("category filter and featured section on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ar/faq", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: /أسئلة شائعة مختارة/ }),
    ).toBeVisible();
    await page.getByRole("tab", { name: /طوارئ الأسنان/ }).click();
    await expect(page.locator(".faq-trigger").first()).toBeVisible({
      timeout: 8000,
    });
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    expect(overflow).toBeFalsy();
  });
});
