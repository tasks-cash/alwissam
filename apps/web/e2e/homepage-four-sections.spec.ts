import { expect, test } from "@playwright/test";

test.describe("Homepage four sections + navbar create account", () => {
  test("Arabic homepage shows booking, doctors, patient account, location", async ({
    page,
  }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await expect(
      page.getByRole("heading", {
        name: /احجز موعدك من منزلك بكل سهولة/,
      }),
    ).toBeVisible();
    await expect(page.locator(".booking-home-steps li")).toHaveCount(4);
    await expect(
      page.locator(".booking-convenience a[href='/ar/book-appointment']").first(),
    ).toBeVisible();
    await expect(
      page.locator(".booking-convenience a[href='/ar/doctors']").first(),
    ).toBeVisible();

    await expect(
      page.locator(".home-doctors-section").getByRole("heading", { name: /أطباؤنا/ }),
    ).toBeVisible();
    await expect(
      page.locator(".home-doctors-section .pub-doctor-premium"),
    ).toHaveCount(await page.locator(".home-doctors-section .pub-doctor-premium").count());

    await expect(
      page.getByRole("heading", {
        name: /كل تفاصيل حالتك العلاجية في حساب واحد/,
      }),
    ).toBeVisible();
    await expect(
      page.locator(
        ".patient-account-section a[href='/ar/patient/register']",
      ),
    ).toBeVisible();
    await expect(
      page.locator(".patient-account-section a[href='/ar/patient/login']"),
    ).toBeVisible();
    await expect(page.locator(".patient-dash-visual")).toBeVisible();

    await expect(
      page.locator(".clinic-location-premium--home").getByRole("heading", {
        name: /الموقع والتواصل/,
      }),
    ).toBeVisible();
  });

  test("Create Account appears once in desktop header and once in mobile drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/ar");
    const desktopRegister = page.locator(
      ".public-header-actions a.public-register-btn[href='/ar/patient/register']",
    );
    await expect(desktopRegister).toHaveCount(1);
    await expect(
      page.locator(".public-header-actions a.public-book-btn[href='/ar/book-appointment']"),
    ).toHaveCount(1);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: /القائمة|Menu/i }).click();
    await expect(
      page.locator("#public-mobile-nav a[href='/ar/patient/register']"),
    ).toHaveCount(1);
    await expect(
      page.locator("#public-mobile-nav a[href='/ar/book-appointment']"),
    ).toHaveCount(1);
  });

  test("English and French homepage preserve LTR and create-account locale", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(
      page.locator(
        ".public-header-actions a.public-register-btn[href='/en/patient/register']",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Book your appointment from home with ease/i,
      }),
    ).toBeVisible();

    await page.goto("/fr");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(
      page.locator(
        ".public-header-actions a.public-register-btn[href='/fr/patient/register']",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Réservez votre rendez-vous depuis chez vous/i,
      }),
    ).toBeVisible();
  });
});
