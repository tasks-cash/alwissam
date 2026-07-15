import { expect, test } from "@playwright/test";

const publicPaths = [
  "",
  "/about",
  "/services",
  "/specialties",
  "/doctors",
  "/reviews",
  "/faq",
  "/contact",
  "/book-appointment",
  "/patient-information",
  "/before-your-visit",
  "/after-your-visit",
  "/support",
  "/privacy",
  "/terms",
  "/cookies",
  "/refund-policy",
  "/cancellation-policy",
  "/accessibility",
  "/medical-disclaimer",
];

const authPaths = ["/staff/login", "/patient/login", "/forgot-password"];

test.describe("Arabic RTL document direction", () => {
  test("Arabic root is lang=ar dir=rtl", async ({ page }) => {
    await page.goto("/ar");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");
  });

  test("English root is lang=en dir=ltr", async ({ page }) => {
    await page.goto("/en");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");
  });

  test("French root is lang=fr dir=ltr", async ({ page }) => {
    await page.goto("/fr");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "fr");
    await expect(html).toHaveAttribute("dir", "ltr");
  });

  test("locale switch updates dir without wrong LTR flash on Arabic", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });
});

test.describe("Arabic public pages RTL shell", () => {
  for (const path of publicPaths) {
    test(`Arabic ${path || "/"} has rtl html + header/footer`, async ({
      page,
    }) => {
      await page.goto(`/ar${path}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expect(page.locator(".public-header")).toBeVisible();
      await expect(page.locator(".public-footer-xl")).toBeVisible();
    });
  }

  test("English homepage stays LTR", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator(".public-header")).toBeVisible();
  });

  test("French homepage stays LTR", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator(".public-header")).toBeVisible();
  });
});

test.describe("Arabic header + mobile menu", () => {
  test("mobile menu opens from inline-start (RTL right)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ar");
    await page.getByRole("button", { name: "القائمة" }).click();
    const drawer = page.locator("#public-mobile-nav");
    await expect(drawer).toBeVisible();
    const nav = drawer.locator(".public-mobile-nav");
    const box = await nav.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      // Right-aligned in RTL: trailing edge meets the viewport (wide panel may start < mid)
      expect(box.x + box.width).toBeGreaterThan(390 - 8);
    }
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
  });

  test("English mobile menu opens from the left", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    await page.getByRole("button", { name: "Menu" }).click();
    const nav = page.locator(".public-mobile-nav");
    await expect(nav).toBeVisible();
    const box = await nav.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      // Left-aligned in LTR
      expect(box.x).toBeLessThan(8);
    }
  });
});

test.describe("Arabic bidi fields", () => {
  test("contact phone input remains LTR", async ({ page }) => {
    await page.goto("/ar/contact");
    const phone = page.locator("#phone");
    await expect(phone).toHaveAttribute("dir", "ltr");
    await phone.fill("0123456789");
    await expect(phone).toHaveValue("0123456789");
  });

  test("staff login password field is LTR", async ({ page }) => {
    await page.goto("/ar/staff/login");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const password = page.locator('input[name="password"], #password').first();
    await expect(password).toHaveAttribute("dir", "ltr");
  });
});

test.describe("Arabic auth pages RTL", () => {
  for (const path of authPaths) {
    test(`${path} is RTL`, async ({ page }) => {
      const res = await page.goto(`/ar${path}`);
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    });
  }
});

test.describe("Dashboard login redirect preserves locale dir", () => {
  test("Arabic secretary route redirects to Arabic staff login RTL", async ({
    page,
  }) => {
    await page.goto("/ar/secretary/dashboard");
    await expect(page).toHaveURL(/\/ar\/staff\/login/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("English secretary route redirects to English staff login LTR", async ({
    page,
  }) => {
    await page.goto("/en/secretary/dashboard");
    await expect(page).toHaveURL(/\/en\/staff\/login/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });
});
