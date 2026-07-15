# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-site.spec.ts >> Homepage premium sections >> booking convenience and location contact on all locales
- Location: e2e/public-site.spec.ts:68:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'لماذا تتعب من أجل حجز موعد؟' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'لماذا تتعب من أجل حجز موعد؟' })
    2 × waiting for" http://localhost:3004/ar" navigation to finish...
      - navigated to "http://localhost:3004/ar"

```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test.describe("Public website — locales & shell", () => {
  4   |   for (const locale of ["ar", "en", "fr"] as const) {
  5   |     test(`${locale} homepage loads`, async ({ page }) => {
  6   |       await page.goto(`/${locale}`);
  7   |       await expect(page.locator(".public-header")).toBeVisible();
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
  57  |     await expect(page.getByRole("heading", { name: /رحلة المريض/ })).toBeVisible();
  58  |     await expect(page.locator(".journey-step")).toHaveCount(7);
  59  |     await expect(
  60  |       page.locator(".working-hours-list").getByText("الجمعة: مغلق", { exact: true }),
  61  |     ).toBeVisible();
  62  |     await expect(page.locator(".working-hours-list").getByText(/08:00/)).toBeVisible();
  63  |     const cards = page.locator(".pub-doctor-grid .pub-doctor");
  64  |     const count = await cards.count();
  65  |     expect(count).toBeLessThanOrEqual(3);
  66  |   });
  67  | 
  68  |   test("booking convenience and location contact on all locales", async ({
  69  |     page,
  70  |   }) => {
  71  |     await page.goto("/ar");
  72  |     await expect(
  73  |       page.getByRole("heading", { name: "لماذا تتعب من أجل حجز موعد؟" }),
> 74  |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
  75  |     await expect(
  76  |       page.getByRole("heading", { name: "الموقع والتواصل" }),
  77  |     ).toBeVisible();
  78  |     await expect(page.getByText(/حي الأمير عبد القادر/)).toBeVisible();
  79  |     await expect(page.locator('a[href="tel:+213663098208"]')).toBeVisible();
  80  |     await expect(page.locator(".wa-float")).toBeVisible();
  81  |     await expect(page.locator(".wa-float")).toHaveAttribute(
  82  |       "href",
  83  |       /wa\.me\/213663098208\?text=/,
  84  |     );
  85  | 
  86  |     await page.goto("/en");
  87  |     await expect(
  88  |       page.getByRole("heading", {
  89  |         name: "Why travel just to book an appointment?",
  90  |       }),
  91  |     ).toBeVisible();
  92  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  93  |     await expect(page.locator(".wa-float")).toBeVisible();
  94  |     const enBox = await page.locator(".wa-float").boundingBox();
  95  |     expect(enBox).toBeTruthy();
  96  |     if (enBox) {
  97  |       expect(enBox.x + enBox.width).toBeGreaterThan(700);
  98  |     }
  99  | 
  100 |     await page.goto("/ar");
  101 |     const arBox = await page.locator(".wa-float").boundingBox();
  102 |     expect(arBox).toBeTruthy();
  103 |     if (arBox) {
  104 |       expect(arBox.x).toBeLessThan(80);
  105 |     }
  106 | 
  107 |     await page.goto("/fr");
  108 |     await expect(
  109 |       page.getByRole("heading", {
  110 |         name: /Pourquoi vous déplacer uniquement pour prendre rendez-vous/,
  111 |       }),
  112 |     ).toBeVisible();
  113 |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  114 |   });
  115 | 
  116 |   test("WhatsApp button is absent from owner dashboard shell", async ({
  117 |     page,
  118 |   }) => {
  119 |     await page.goto("/ar/doctor/specialist/dashboard");
  120 |     await expect(page.locator(".wa-float")).toHaveCount(0);
  121 |   });
  122 | 
  123 |   test("contact and Facebook links are functional", async ({ page }) => {
  124 |     await page.goto("/ar/contact");
  125 |     await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
  126 |     await expect(
  127 |       page.locator('a[href="mailto:clinic.elwissam@gmail.com"]').first(),
  128 |     ).toBeVisible();
  129 |     await expect(
  130 |       page
  131 |         .locator('a[href="https://web.facebook.com/Clinic.ElWissam"]')
  132 |         .first(),
  133 |     ).toBeVisible();
  134 |     await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  135 |   });
  136 | 
  137 |   test("specialties section includes dentistry without href='#'", async ({
  138 |     page,
  139 |   }) => {
  140 |     await page.goto("/ar");
  141 |     await expect(page.getByRole("heading", { name: "طب الأسنان", exact: true })).toBeVisible();
  142 |     await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  143 |   });
  144 | });
  145 | 
  146 | test.describe("About page", () => {
  147 |   for (const path of ["/ar/about", "/en/about", "/fr/about"]) {
  148 |     test(`loads ${path}`, async ({ page }) => {
  149 |       const res = await page.goto(path);
  150 |       expect(res?.ok()).toBeTruthy();
  151 |       await expect(page.locator(".public-header")).toBeVisible();
  152 |     });
  153 |   }
  154 | 
  155 |   test("about includes mission vision values team", async ({ page }) => {
  156 |     await page.goto("/ar/about");
  157 |     await expect(page.getByRole("heading", { name: /رسالتنا|رؤيتنا/ }).first()).toBeVisible();
  158 |     await expect(page.getByRole("heading", { name: /قيم العيادة/ })).toBeVisible();
  159 |     await expect(page.locator(".pub-doctor")).toHaveCount(
  160 |       Math.min(3, await page.locator(".pub-doctor").count()),
  161 |     );
  162 |   });
  163 | });
  164 | 
  165 | test.describe("Contact page", () => {
  166 |   test("Arabic contact page structure", async ({ page }) => {
  167 |     await page.goto("/ar/contact");
  168 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  169 |     await expect(page.getByRole("tab", { name: /إرسال استفسار/ })).toBeVisible();
  170 |     await expect(page.getByRole("tab", { name: /حجز موعد/ })).toBeVisible();
  171 |     await expect(page.locator("#email")).toHaveCount(0);
  172 |   });
  173 | 
  174 |   test("contact form validates missing name", async ({ page }) => {
```