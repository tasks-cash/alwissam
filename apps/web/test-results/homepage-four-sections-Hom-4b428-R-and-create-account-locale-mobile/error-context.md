# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage-four-sections.spec.ts >> Homepage four sections + navbar create account >> English and French homepage preserve LTR and create-account locale
- Location: e2e/homepage-four-sections.spec.ts:75:7

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('html')
Expected: "ltr"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('html')
    14 × locator resolved to <html>…</html>
       - unexpected value "null"

```

```yaml
- document: Internal Server Error
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test.describe("Homepage four sections + navbar create account", () => {
  4   |   test("Arabic homepage shows booking, doctors, patient account, location", async ({
  5   |     page,
  6   |   }) => {
  7   |     await page.goto("/ar");
  8   |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  9   | 
  10  |     await expect(
  11  |       page.getByRole("heading", {
  12  |         name: /احجز موعدك من منزلك بكل سهولة/,
  13  |       }),
  14  |     ).toBeVisible();
  15  |     await expect(page.locator(".booking-home-steps li")).toHaveCount(4);
  16  |     await expect(
  17  |       page.locator(".booking-convenience a[href='/ar/book-appointment']").first(),
  18  |     ).toBeVisible();
  19  |     await expect(
  20  |       page.locator(".booking-convenience a[href='/ar/doctors']").first(),
  21  |     ).toBeVisible();
  22  | 
  23  |     await expect(
  24  |       page.locator(".home-doctors-section").getByRole("heading", { name: /أطباؤنا/ }),
  25  |     ).toBeVisible();
  26  |     await expect(
  27  |       page.locator(".home-doctors-section .pub-doctor-premium"),
  28  |     ).toHaveCount(await page.locator(".home-doctors-section .pub-doctor-premium").count());
  29  | 
  30  |     await expect(
  31  |       page.getByRole("heading", {
  32  |         name: /كل تفاصيل حالتك العلاجية في حساب واحد/,
  33  |       }),
  34  |     ).toBeVisible();
  35  |     await expect(
  36  |       page.locator(
  37  |         ".patient-account-section a[href='/ar/patient/register']",
  38  |       ),
  39  |     ).toBeVisible();
  40  |     await expect(
  41  |       page.locator(".patient-account-section a[href='/ar/patient/login']"),
  42  |     ).toBeVisible();
  43  |     await expect(page.locator(".patient-dash-visual")).toBeVisible();
  44  | 
  45  |     await expect(
  46  |       page.locator(".clinic-location-premium--home").getByRole("heading", {
  47  |         name: /الموقع والتواصل/,
  48  |       }),
  49  |     ).toBeVisible();
  50  |   });
  51  | 
  52  |   test("Create Account appears once in desktop header and once in mobile drawer", async ({
  53  |     page,
  54  |   }) => {
  55  |     await page.setViewportSize({ width: 1366, height: 900 });
  56  |     await page.goto("/ar");
  57  |     const desktopRegister = page.locator(
  58  |       ".public-header-actions a.public-register-btn[href='/ar/patient/register']",
  59  |     );
  60  |     await expect(desktopRegister).toHaveCount(1);
  61  |     await expect(
  62  |       page.locator(".public-header-actions a.public-book-btn[href='/ar/book-appointment']"),
  63  |     ).toHaveCount(1);
  64  | 
  65  |     await page.setViewportSize({ width: 390, height: 844 });
  66  |     await page.getByRole("button", { name: /القائمة|Menu/i }).click();
  67  |     await expect(
  68  |       page.locator("#public-mobile-nav a[href='/ar/patient/register']"),
  69  |     ).toHaveCount(1);
  70  |     await expect(
  71  |       page.locator("#public-mobile-nav a[href='/ar/book-appointment']"),
  72  |     ).toHaveCount(1);
  73  |   });
  74  | 
  75  |   test("English and French homepage preserve LTR and create-account locale", async ({
  76  |     page,
  77  |   }) => {
  78  |     await page.goto("/en");
> 79  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      |                                        ^ Error: expect(locator).toHaveAttribute(expected) failed
  80  |     await expect(
  81  |       page.locator(
  82  |         ".public-header-actions a.public-register-btn[href='/en/patient/register']",
  83  |       ),
  84  |     ).toBeVisible();
  85  |     await expect(
  86  |       page.getByRole("heading", {
  87  |         name: /Book your appointment from home with ease/i,
  88  |       }),
  89  |     ).toBeVisible();
  90  | 
  91  |     await page.goto("/fr");
  92  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  93  |     await expect(
  94  |       page.locator(
  95  |         ".public-header-actions a.public-register-btn[href='/fr/patient/register']",
  96  |       ),
  97  |     ).toBeVisible();
  98  |     await expect(
  99  |       page.getByRole("heading", {
  100 |         name: /Réservez votre rendez-vous depuis chez vous/i,
  101 |       }),
  102 |     ).toBeVisible();
  103 |   });
  104 | });
  105 | 
```