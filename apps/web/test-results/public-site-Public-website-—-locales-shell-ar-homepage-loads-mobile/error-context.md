# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-site.spec.ts >> Public website — locales & shell >> ar homepage loads
- Location: e2e/public-site.spec.ts:5:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.public-header')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.public-header')

```

```yaml
- text: Internal Server Error
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test.describe("Public website — locales & shell", () => {
  4   |   for (const locale of ["ar", "en", "fr"] as const) {
  5   |     test(`${locale} homepage loads`, async ({ page }) => {
  6   |       await page.goto(`/${locale}`);
> 7   |       await expect(page.locator(".public-header")).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  8   |       await expect(page.locator(".public-footer-xl")).toBeVisible();
  9   |       const dir = await page.locator("html").getAttribute("dir");
  10  |       if (locale === "ar") expect(dir).toBe("rtl");
  11  |       else expect(dir).toBe("ltr");
  12  |     });
  13  |   }
  14  | 
  15  |   test("staff login is absent from public chrome", async ({ page }) => {
  16  |     for (const path of ["/ar", "/ar/about", "/ar/contact", "/en", "/fr"]) {
  17  |       await page.goto(path);
  18  |       await expect(
  19  |         page.getByRole("link", { name: /دخول الطاقم|Staff login|Connexion du personnel|Espace personnel/i }),
  20  |       ).toHaveCount(0);
  21  |     }
  22  |   });
  23  | 
  24  |   test("change page link is absent from public chrome", async ({ page }) => {
  25  |     await page.goto("/ar");
  26  |     await expect(page.locator("a[href*='/change']")).toHaveCount(0);
  27  |     await expect(page.getByRole("link", { name: /^تغيير$|^Change$/i })).toHaveCount(0);
  28  |     await page.setViewportSize({ width: 390, height: 844 });
  29  |     await page.getByRole("button", { name: /القائمة|Menu/i }).click();
  30  |     await expect(page.locator("#public-mobile-nav a[href*='/change']")).toHaveCount(0);
  31  |   });
  32  | 
  33  |   test("language switch preserves about route", async ({ page }) => {
  34  |     await page.goto("/ar/about");
  35  |     const en = page.locator("a[href='/en/about'], a[href^='/en/about']").first();
  36  |     if (await en.count()) await en.click();
  37  |     else await page.goto("/en/about");
  38  |     await expect(page).toHaveURL(/\/en\/about/);
  39  |   });
  40  | 
  41  |   test("language switch preserves contact route", async ({ page }) => {
  42  |     await page.goto("/ar/contact");
  43  |     const en = page.locator("a[href='/en/contact'], a[href^='/en/contact']").first();
  44  |     if (await en.count()) await en.click();
  45  |     else await page.goto("/en/contact");
  46  |     await expect(page).toHaveURL(/\/en\/contact/);
  47  |   });
  48  | });
  49  | 
  50  | test.describe("Homepage premium sections", () => {
  51  |   test("Arabic home shows why, journey, hours, and max 3 doctors", async ({
  52  |     page,
  53  |   }) => {
  54  |     await page.goto("/ar");
  55  |     await expect(page.getByRole("heading", { name: /لماذا عيادتنا/ })).toBeVisible();
  56  |     await expect(page.locator(".why-card")).toHaveCount(8);
  57  |     await expect(
  58  |       page.getByRole("heading", { name: /رحلة المريض في عيادة الوسام/ }),
  59  |     ).toBeVisible();
  60  |     await expect(page.locator(".journey-node")).toHaveCount(7);
  61  |     await expect(
  62  |       page.locator(".working-hours-list").getByText("الجمعة: مغلق", { exact: true }).first(),
  63  |     ).toBeVisible();
  64  |     await expect(
  65  |       page.locator(".working-hours-list").getByText(/08:00/).first(),
  66  |     ).toBeVisible();
  67  |     const cards = page.locator(".pub-doctor-grid .pub-doctor");
  68  |     const count = await cards.count();
  69  |     expect(count).toBeLessThanOrEqual(3);
  70  |   });
  71  | 
  72  |   test("homepage hero flow and doctors section copy", async ({ page }) => {
  73  |     await page.goto("/ar");
  74  |     await expect(page.locator(".hero-flow")).toBeVisible();
  75  |     await expect(page.locator(".hero-flow-main img")).toBeVisible();
  76  |     await expect(page.getByRole("heading", { name: "أطباؤنا" })).toBeVisible();
  77  |     await expect(
  78  |       page.getByText("تعرّف على فريق عيادة الوسام واختر الطبيب المناسب لحجز موعدك."),
  79  |     ).toBeVisible();
  80  |     await expect(
  81  |       page.getByRole("heading", { name: "تعرّف على عيادة الوسام" }),
  82  |     ).toBeVisible();
  83  |     await expect(page.locator(".clinic-intro-feature")).toHaveCount(6);
  84  |     await expect(
  85  |       page.getByRole("link", { name: "ابدأ رحلتك واحجز موعدك" }),
  86  |     ).toBeVisible();
  87  |   });
  88  | 
  89  |   test("booking convenience and location contact on all locales", async ({
  90  |     page,
  91  |   }) => {
  92  |     await page.goto("/ar");
  93  |     await expect(
  94  |       page.getByRole("heading", { name: "لماذا تتعب من أجل حجز موعد؟" }),
  95  |     ).toBeVisible();
  96  |     await expect(
  97  |       page.getByRole("heading", { name: "الموقع والتواصل" }),
  98  |     ).toBeVisible();
  99  |     await expect(page.getByText(/حي الأمير عبد القادر/).first()).toBeVisible();
  100 |     await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
  101 |     await expect(page.locator(".wa-float")).toBeVisible();
  102 |     await expect(page.locator(".wa-float")).toHaveAttribute(
  103 |       "href",
  104 |       /wa\.me\/213663098208\?text=/,
  105 |     );
  106 | 
  107 |     await page.goto("/en");
```