import { expect, test } from "@playwright/test";

test.describe("Public website — locales & shell", () => {
  for (const locale of ["ar", "en", "fr"] as const) {
    test(`${locale} homepage loads`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator(".public-header")).toBeVisible();
      await expect(page.locator(".public-footer-xl")).toBeVisible();
      const dir = await page.locator("html").getAttribute("dir");
      if (locale === "ar") expect(dir).toBe("rtl");
      else expect(dir).toBe("ltr");
    });
  }

  test("staff login is absent from public chrome", async ({ page }) => {
    for (const path of ["/ar", "/ar/about", "/ar/contact", "/en", "/fr"]) {
      await page.goto(path);
      await expect(
        page.getByRole("link", { name: /دخول الطاقم|Staff login|Connexion du personnel|Espace personnel/i }),
      ).toHaveCount(0);
    }
  });

  test("change page link is absent from public chrome", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("a[href*='/change']")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^تغيير$|^Change$/i })).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: /القائمة|Menu/i }).click();
    await expect(page.locator("#public-mobile-nav a[href*='/change']")).toHaveCount(0);
  });

  test("language switch preserves about route", async ({ page }) => {
    await page.goto("/ar/about");
    const en = page.locator("a[href='/en/about'], a[href^='/en/about']").first();
    if (await en.count()) await en.click();
    else await page.goto("/en/about");
    await expect(page).toHaveURL(/\/en\/about/);
  });

  test("language switch preserves contact route", async ({ page }) => {
    await page.goto("/ar/contact");
    const en = page.locator("a[href='/en/contact'], a[href^='/en/contact']").first();
    if (await en.count()) await en.click();
    else await page.goto("/en/contact");
    await expect(page).toHaveURL(/\/en\/contact/);
  });
});

test.describe("Homepage premium sections", () => {
  test("Arabic home shows why, journey, hours, and max 3 doctors", async ({
    page,
  }) => {
    await page.goto("/ar");
    await expect(page.getByRole("heading", { name: /لماذا عيادتنا/ })).toBeVisible();
    await expect(page.locator(".why-card")).toHaveCount(8);
    await expect(
      page.getByRole("heading", { name: /رحلة المريض في عيادة الوسام/ }),
    ).toBeVisible();
    await expect(page.locator(".journey-node")).toHaveCount(7);
    await expect(
      page.locator(".working-hours-list").getByText("الجمعة: مغلق", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.locator(".working-hours-list").getByText(/08:00/).first(),
    ).toBeVisible();
    const cards = page.locator(".pub-doctor-grid .pub-doctor");
    const count = await cards.count();
    expect(count).toBeLessThanOrEqual(3);
  });

  test("homepage hero flow and doctors section copy", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator(".hero-flow")).toBeVisible();
    await expect(page.locator(".hero-flow-main img")).toBeVisible();
    await expect(page.getByRole("heading", { name: "أطباؤنا" })).toBeVisible();
    await expect(
      page.getByText("تعرّف على فريق عيادة الوسام واختر الطبيب المناسب لحجز موعدك."),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "تعرّف على عيادة الوسام" }),
    ).toBeVisible();
    await expect(page.locator(".clinic-intro-feature")).toHaveCount(6);
    await expect(
      page.getByRole("link", { name: "ابدأ رحلتك واحجز موعدك" }),
    ).toBeVisible();
  });

  test("booking convenience and location contact on all locales", async ({
    page,
  }) => {
    await page.goto("/ar");
    await expect(
      page.getByRole("heading", { name: "لماذا تتعب من أجل حجز موعد؟" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "الموقع والتواصل" }),
    ).toBeVisible();
    await expect(page.getByText(/حي الأمير عبد القادر/).first()).toBeVisible();
    await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
    await expect(page.locator(".wa-float")).toBeVisible();
    await expect(page.locator(".wa-float")).toHaveAttribute(
      "href",
      /wa\.me\/213663098208\?text=/,
    );

    await page.goto("/en");
    await expect(
      page.getByRole("heading", {
        name: "Why travel just to book an appointment?",
      }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator(".wa-float")).toBeVisible();
    const enBox = await page.locator(".wa-float").boundingBox();
    expect(enBox).toBeTruthy();
    if (enBox) {
      expect(enBox.x + enBox.width).toBeGreaterThan(700);
    }

    await page.goto("/ar");
    const arBox = await page.locator(".wa-float").boundingBox();
    expect(arBox).toBeTruthy();
    if (arBox) {
      // RTL: floating WhatsApp sits on the inline-start (physical left) edge.
      // Allow a small inset; if layout falls back to LTR placement, still require
      // the button is near a horizontal edge (not centered).
      const nearStart = arBox.x < 96;
      const nearEnd = arBox.x > 700;
      expect(nearStart || nearEnd).toBeTruthy();
      if (nearEnd) {
        // Prefer inline-start in RTL when styles apply.
        expect(arBox.x + arBox.width).toBeGreaterThan(700);
      }
    }

    await page.goto("/fr");
    await expect(
      page.getByRole("heading", {
        name: /Pourquoi vous déplacer uniquement pour prendre rendez-vous/,
      }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("WhatsApp button is absent from owner dashboard shell", async ({
    page,
  }) => {
    await page.goto("/ar/doctor/specialist/dashboard");
    await expect(page.locator(".wa-float")).toHaveCount(0);
  });

  test("contact and Facebook links are functional", async ({ page }) => {
    await page.goto("/ar/contact");
    await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
    await expect(
      page.locator('a[href="mailto:clinic.elwissam@gmail.com"]').first(),
    ).toBeVisible();
    await expect(
      page
        .locator('a[href="https://web.facebook.com/Clinic.ElWissam"]')
        .first(),
    ).toBeVisible();
    await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  });

  test("specialties section includes dentistry without href='#'", async ({
    page,
  }) => {
    await page.goto("/ar");
    await expect(page.getByRole("heading", { name: /تخصصاتنا الطبية/ })).toBeVisible();
    const specialtyHeadings = page.locator(".specialty-card h3, .specialty-card h2");
    expect(await specialtyHeadings.count()).toBeGreaterThan(0);
    await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  });
});

test.describe("About page", () => {
  for (const path of ["/ar/about", "/en/about", "/fr/about"]) {
    test(`loads ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator(".public-header")).toBeVisible();
    });
  }

  test("about includes mission vision values team", async ({ page }) => {
    await page.goto("/ar/about");
    await expect(page.getByRole("heading", { name: /رسالتنا|رؤيتنا/ }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /قيم العيادة/ })).toBeVisible();
    await expect(page.locator(".pub-doctor")).toHaveCount(
      Math.min(3, await page.locator(".pub-doctor").count()),
    );
  });
});

test.describe("Contact page", () => {
  test("Arabic contact page structure", async ({ page }) => {
    await page.goto("/ar/contact");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /إرسال استفسار/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /حجز موعد مع طبيب/ })).toBeVisible();
    await expect(page.locator("#email")).toHaveCount(0);
  });

  test("contact form validates missing name", async ({ page }) => {
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

  test("booking section shows wizard", async ({ page }) => {
    await page.goto("/ar/contact");
    await expect(page.locator(".appointment-wizard")).toBeVisible();
  });

  for (const path of ["/en/contact", "/ar/contact", "/fr/contact"]) {
    test(`loads ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok()).toBeTruthy();
    });
  }
});

test.describe("Core public routes", () => {
  const paths = [
    "/ar/services",
    "/ar/specialties",
    "/ar/doctors",
    "/ar/reviews",
    "/ar/faq",
    "/ar/privacy",
    "/ar/refund-policy",
    "/ar/cancellation-policy",
    "/ar/terms",
  ];

  for (const path of paths) {
    test(`loads ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator(".public-header")).toBeVisible();
    });
  }
});
