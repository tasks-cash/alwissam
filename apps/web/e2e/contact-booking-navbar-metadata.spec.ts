import { expect, test } from "@playwright/test";

test.describe("Contact page + navbar + titles", () => {
  test("Arabic contact page structure", async ({ page }) => {
    await page.goto("/ar/contact");
    await expect(
      page.getByRole("heading", { level: 1, name: /تواصل معنا واحجز موعدك/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /إرسال استفسار/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /موقع عيادة الوسام/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /حجز موعد مع طبيب/ })).toBeVisible();
    await expect(page.locator("#email")).toHaveCount(0);
    await expect(
      page.locator(".clinic-address-card").getByText(/حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير/),
    ).toBeVisible();
    const mapsLink = page.locator(
      'a[href="https://maps.app.goo.gl/1KtpHq8VWw98enw8A"]',
    );
    await expect(mapsLink.first()).toBeVisible();
    await expect(
      page.locator(".clinic-maps-url-link[dir='ltr']").filter({
        hasText: "https://maps.app.goo.gl/1KtpHq8VWw98enw8A",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /فتح اتجاهات الوصول إلى عيادة الوسام في خرائط Google/ }).first(),
    ).toBeVisible();
    await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
    await expect(
      page.locator('a[href="mailto:clinic.elwissam@gmail.com"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('a[href="https://web.facebook.com/Clinic.ElWissam"]').first(),
    ).toBeVisible();
    await expect(page.locator('a[href="https://wa.me/213663098208"]').first()).toBeVisible();
    await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
    await expect(page.locator(".contact-quick-actions")).toBeVisible();
    await expect(page.locator(".clinic-address-card")).toBeVisible();
  });

  test("inquiry form validates missing name", async ({ page }) => {
    await page.goto("/ar/contact");
    await page.getByLabel(/رقم الهاتف/).fill("0123456789");
    await page.getByLabel(/موضوع/).fill("استفسار تجربة");
    await page.getByLabel(/تفاصيل/).fill("تفاصيل كافية للاختبار هنا");
    await page.getByRole("button", { name: /إرسال الاستفسار/ }).click();
    await expect(page.locator(".field-error, .alert-error").first()).toBeVisible();
  });

  test("phone accepts digits only", async ({ page }) => {
    await page.goto("/ar/contact");
    const phone = page.locator("#phone");
    await phone.fill("abc0123x456");
    await expect(phone).toHaveValue("0123456");
  });

  test("booking section shows wizard with real doctors grid capacity", async ({
    page,
  }) => {
    await page.goto("/ar/contact");
    await expect(page.locator(".appointment-wizard")).toBeVisible();
    // Advance to doctor step when Next is available
    const next = page.getByRole("button", { name: /التالي|Next|Suivant/i });
    if (await next.count()) {
      await next.first().click();
      if (await next.count()) await next.first().click();
    }
    const doctorSelect = page.locator("#doctorId");
    if (await doctorSelect.count()) {
      const count = await doctorSelect.locator("option").count();
      expect(count).toBeLessThanOrEqual(6);
      expect(count).toBeGreaterThan(0);
    }
  });

  test("language switcher absent from public navbar and mobile menu", async ({
    page,
  }) => {
    await page.goto("/ar/contact");
    await expect(page.locator(".public-header .lang-switcher")).toHaveCount(0);
    await expect(
      page.locator(".public-header a[href^='/en/'], .public-header a[href^='/fr/']"),
    ).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: /القائمة|Menu/i }).click();
    await expect(page.locator("#public-mobile-nav .lang-switcher")).toHaveCount(0);
  });

  test("locale routes still work without navbar switcher", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Contact Us and Book Your Appointment/i,
    );
    await page.goto("/fr/contact");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Contactez-nous et prenez rendez-vous/i,
    );
  });

  test("browser titles use clinic brand template", async ({ page }) => {
    await page.goto("/ar");
    await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| الرئيسية/);
    await page.goto("/ar/contact");
    await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| تواصل/);
    await expect(page).not.toHaveTitle(
      /عيادة الوسام لطب الأسنان \| عيادة الوسام لطب الأسنان/,
    );
    await page.goto("/ar/about");
    await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| من نحن/);
    await page.goto("/ar/faq");
    await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| الأسئلة الشائعة/);
    await page.goto("/ar/doctors");
    await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| الأطباء/);
    await page.goto("/en/contact");
    await expect(page).toHaveTitle(/Al Wissam Dental Clinic \| Contact/);
  });

  for (const path of ["/en/contact", "/ar/contact", "/fr/contact"]) {
    test(`loads ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok()).toBeTruthy();
    });
  }
});
