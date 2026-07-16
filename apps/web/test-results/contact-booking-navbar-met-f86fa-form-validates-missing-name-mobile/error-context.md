# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contact-booking-navbar-metadata.spec.ts >> Contact page + navbar + titles >> inquiry form validates missing name
- Location: e2e/contact-booking-navbar-metadata.spec.ts:41:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByLabel(/رقم الهاتف/)

```

# Page snapshot

```yaml
- generic [ref=e2]: Internal Server Error
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test.describe("Contact page + navbar + titles", () => {
  4   |   test("Arabic contact page structure", async ({ page }) => {
  5   |     await page.goto("/ar/contact");
  6   |     await expect(
  7   |       page.getByRole("heading", { level: 1, name: /تواصل معنا واحجز موعدك/ }),
  8   |     ).toBeVisible();
  9   |     await expect(page.getByRole("heading", { name: /إرسال استفسار/ })).toBeVisible();
  10  |     await expect(page.getByRole("heading", { name: /موقع عيادة الوسام/ })).toBeVisible();
  11  |     await expect(page.getByRole("heading", { name: /حجز موعد مع طبيب/ })).toBeVisible();
  12  |     await expect(page.locator("#email")).toHaveCount(0);
  13  |     await expect(
  14  |       page.locator(".clinic-address-card").getByText(/حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير/),
  15  |     ).toBeVisible();
  16  |     const mapsLink = page.locator(
  17  |       'a[href="https://maps.app.goo.gl/1KtpHq8VWw98enw8A"]',
  18  |     );
  19  |     await expect(mapsLink.first()).toBeVisible();
  20  |     await expect(
  21  |       page.locator(".clinic-maps-url-link[dir='ltr']").filter({
  22  |         hasText: "https://maps.app.goo.gl/1KtpHq8VWw98enw8A",
  23  |       }),
  24  |     ).toBeVisible();
  25  |     await expect(
  26  |       page.getByRole("link", { name: /فتح اتجاهات الوصول إلى عيادة الوسام في خرائط Google/ }).first(),
  27  |     ).toBeVisible();
  28  |     await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
  29  |     await expect(
  30  |       page.locator('a[href="mailto:clinic.elwissam@gmail.com"]').first(),
  31  |     ).toBeVisible();
  32  |     await expect(
  33  |       page.locator('a[href="https://web.facebook.com/Clinic.ElWissam"]').first(),
  34  |     ).toBeVisible();
  35  |     await expect(page.locator('a[href="https://wa.me/213663098208"]').first()).toBeVisible();
  36  |     await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  37  |     await expect(page.locator(".contact-quick-actions")).toBeVisible();
  38  |     await expect(page.locator(".clinic-address-card")).toBeVisible();
  39  |   });
  40  | 
  41  |   test("inquiry form validates missing name", async ({ page }) => {
  42  |     await page.goto("/ar/contact");
> 43  |     await page.getByLabel(/رقم الهاتف/).fill("0123456789");
      |                                         ^ Error: locator.fill: Test timeout of 60000ms exceeded.
  44  |     await page.getByLabel(/موضوع/).fill("استفسار تجربة");
  45  |     await page.getByLabel(/تفاصيل/).fill("تفاصيل كافية للاختبار هنا");
  46  |     await page.getByRole("button", { name: /إرسال الاستفسار/ }).click();
  47  |     await expect(page.locator(".field-error, .alert-error").first()).toBeVisible();
  48  |   });
  49  | 
  50  |   test("phone accepts digits only", async ({ page }) => {
  51  |     await page.goto("/ar/contact");
  52  |     const phone = page.locator("#phone");
  53  |     await phone.fill("abc0123x456");
  54  |     await expect(phone).toHaveValue("0123456");
  55  |   });
  56  | 
  57  |   test("booking section shows wizard with real doctors grid capacity", async ({
  58  |     page,
  59  |   }) => {
  60  |     await page.goto("/ar/contact");
  61  |     await expect(page.locator(".appointment-wizard")).toBeVisible();
  62  |     // Advance to doctor step when Next is available
  63  |     const next = page.getByRole("button", { name: /التالي|Next|Suivant/i });
  64  |     if (await next.count()) {
  65  |       await next.first().click();
  66  |       if (await next.count()) await next.first().click();
  67  |     }
  68  |     const doctorSelect = page.locator("#doctorId");
  69  |     if (await doctorSelect.count()) {
  70  |       const count = await doctorSelect.locator("option").count();
  71  |       expect(count).toBeLessThanOrEqual(6);
  72  |       expect(count).toBeGreaterThan(0);
  73  |     }
  74  |   });
  75  | 
  76  |   test("language switcher absent from public navbar and mobile menu", async ({
  77  |     page,
  78  |   }) => {
  79  |     await page.goto("/ar/contact");
  80  |     await expect(page.locator(".public-header .lang-switcher")).toHaveCount(0);
  81  |     await expect(
  82  |       page.locator(".public-header a[href^='/en/'], .public-header a[href^='/fr/']"),
  83  |     ).toHaveCount(0);
  84  |     await page.setViewportSize({ width: 390, height: 844 });
  85  |     await page.getByRole("button", { name: /القائمة|Menu/i }).click();
  86  |     await expect(page.locator("#public-mobile-nav .lang-switcher")).toHaveCount(0);
  87  |   });
  88  | 
  89  |   test("locale routes still work without navbar switcher", async ({ page }) => {
  90  |     await page.goto("/en/contact");
  91  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  92  |     await expect(page.getByRole("heading", { level: 1 })).toContainText(
  93  |       /Contact Us and Book Your Appointment/i,
  94  |     );
  95  |     await page.goto("/fr/contact");
  96  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  97  |     await expect(page.getByRole("heading", { level: 1 })).toContainText(
  98  |       /Contactez-nous et prenez rendez-vous/i,
  99  |     );
  100 |   });
  101 | 
  102 |   test("browser titles use clinic brand template", async ({ page }) => {
  103 |     await page.goto("/ar");
  104 |     await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| الرئيسية/);
  105 |     await page.goto("/ar/contact");
  106 |     await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| تواصل/);
  107 |     await expect(page).not.toHaveTitle(
  108 |       /عيادة الوسام لطب الأسنان \| عيادة الوسام لطب الأسنان/,
  109 |     );
  110 |     await page.goto("/ar/about");
  111 |     await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| من نحن/);
  112 |     await page.goto("/ar/faq");
  113 |     await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| الأسئلة الشائعة/);
  114 |     await page.goto("/ar/doctors");
  115 |     await expect(page).toHaveTitle(/عيادة الوسام لطب الأسنان \| الأطباء/);
  116 |     await page.goto("/en/contact");
  117 |     await expect(page).toHaveTitle(/Al Wissam Dental Clinic \| Contact/);
  118 |   });
  119 | 
  120 |   for (const path of ["/en/contact", "/ar/contact", "/fr/contact"]) {
  121 |     test(`loads ${path}`, async ({ page }) => {
  122 |       const res = await page.goto(path);
  123 |       expect(res?.ok()).toBeTruthy();
  124 |     });
  125 |   }
  126 | });
  127 | 
```