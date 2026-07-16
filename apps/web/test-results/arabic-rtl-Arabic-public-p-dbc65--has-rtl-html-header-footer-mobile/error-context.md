# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: arabic-rtl.spec.ts >> Arabic public pages RTL shell >> Arabic / has rtl html + header/footer
- Location: e2e/arabic-rtl.spec.ts:63:9

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('html')
Expected: "rtl"
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
  3   | const publicPaths = [
  4   |   "",
  5   |   "/about",
  6   |   "/services",
  7   |   "/specialties",
  8   |   "/doctors",
  9   |   "/reviews",
  10  |   "/faq",
  11  |   "/contact",
  12  |   "/book-appointment",
  13  |   "/patient-information",
  14  |   "/before-your-visit",
  15  |   "/after-your-visit",
  16  |   "/support",
  17  |   "/privacy",
  18  |   "/terms",
  19  |   "/cookies",
  20  |   "/refund-policy",
  21  |   "/cancellation-policy",
  22  |   "/accessibility",
  23  |   "/medical-disclaimer",
  24  | ];
  25  | 
  26  | const authPaths = ["/staff/login", "/patient/login", "/forgot-password"];
  27  | 
  28  | test.describe("Arabic RTL document direction", () => {
  29  |   test("Arabic root is lang=ar dir=rtl", async ({ page }) => {
  30  |     await page.goto("/ar");
  31  |     const html = page.locator("html");
  32  |     await expect(html).toHaveAttribute("lang", "ar");
  33  |     await expect(html).toHaveAttribute("dir", "rtl");
  34  |   });
  35  | 
  36  |   test("English root is lang=en dir=ltr", async ({ page }) => {
  37  |     await page.goto("/en");
  38  |     const html = page.locator("html");
  39  |     await expect(html).toHaveAttribute("lang", "en");
  40  |     await expect(html).toHaveAttribute("dir", "ltr");
  41  |   });
  42  | 
  43  |   test("French root is lang=fr dir=ltr", async ({ page }) => {
  44  |     await page.goto("/fr");
  45  |     const html = page.locator("html");
  46  |     await expect(html).toHaveAttribute("lang", "fr");
  47  |     await expect(html).toHaveAttribute("dir", "ltr");
  48  |   });
  49  | 
  50  |   test("locale switch updates dir without wrong LTR flash on Arabic", async ({
  51  |     page,
  52  |   }) => {
  53  |     await page.goto("/en");
  54  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  55  |     await page.goto("/ar");
  56  |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  57  |     await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  58  |   });
  59  | });
  60  | 
  61  | test.describe("Arabic public pages RTL shell", () => {
  62  |   for (const path of publicPaths) {
  63  |     test(`Arabic ${path || "/"} has rtl html + header/footer`, async ({
  64  |       page,
  65  |     }) => {
  66  |       await page.goto(`/ar${path}`, { waitUntil: "domcontentloaded" });
> 67  |       await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      |                                          ^ Error: expect(locator).toHaveAttribute(expected) failed
  68  |       await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  69  |       await expect(page.locator(".public-header")).toBeVisible();
  70  |       await expect(page.locator(".public-footer-xl")).toBeVisible();
  71  |     });
  72  |   }
  73  | 
  74  |   test("English homepage stays LTR", async ({ page }) => {
  75  |     await page.goto("/en");
  76  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  77  |     await expect(page.locator(".public-header")).toBeVisible();
  78  |   });
  79  | 
  80  |   test("French homepage stays LTR", async ({ page }) => {
  81  |     await page.goto("/fr");
  82  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  83  |     await expect(page.locator(".public-header")).toBeVisible();
  84  |   });
  85  | });
  86  | 
  87  | test.describe("Arabic header + mobile menu", () => {
  88  |   test("mobile menu opens from inline-start (RTL right)", async ({ page }) => {
  89  |     await page.setViewportSize({ width: 390, height: 844 });
  90  |     await page.goto("/ar");
  91  |     await page.getByRole("button", { name: "القائمة" }).click();
  92  |     const drawer = page.locator("#public-mobile-nav");
  93  |     await expect(drawer).toBeVisible();
  94  |     const nav = drawer.locator(".public-mobile-nav");
  95  |     const box = await nav.boundingBox();
  96  |     expect(box).toBeTruthy();
  97  |     if (box) {
  98  |       // Right-aligned in RTL: trailing edge meets the viewport (wide panel may start < mid)
  99  |       expect(box.x + box.width).toBeGreaterThan(390 - 8);
  100 |     }
  101 |     await page.keyboard.press("Escape");
  102 |     await expect(drawer).toHaveCount(0);
  103 |   });
  104 | 
  105 |   test("English mobile menu opens from the left", async ({ page }) => {
  106 |     await page.setViewportSize({ width: 390, height: 844 });
  107 |     await page.goto("/en");
  108 |     await page.getByRole("button", { name: "Menu" }).click();
  109 |     const nav = page.locator(".public-mobile-nav");
  110 |     await expect(nav).toBeVisible();
  111 |     const box = await nav.boundingBox();
  112 |     expect(box).toBeTruthy();
  113 |     if (box) {
  114 |       // Left-aligned in LTR
  115 |       expect(box.x).toBeLessThan(8);
  116 |     }
  117 |   });
  118 | });
  119 | 
  120 | test.describe("Arabic bidi fields", () => {
  121 |   test("contact phone input remains LTR", async ({ page }) => {
  122 |     await page.goto("/ar/contact");
  123 |     const phone = page.locator("#phone");
  124 |     await expect(phone).toHaveAttribute("dir", "ltr");
  125 |     await phone.fill("0123456789");
  126 |     await expect(phone).toHaveValue("0123456789");
  127 |   });
  128 | 
  129 |   test("staff login password field is LTR", async ({ page }) => {
  130 |     await page.goto("/ar/staff/login");
  131 |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  132 |     const password = page.locator('input[name="password"], #password').first();
  133 |     await expect(password).toHaveAttribute("dir", "ltr");
  134 |   });
  135 | });
  136 | 
  137 | test.describe("Arabic auth pages RTL", () => {
  138 |   for (const path of authPaths) {
  139 |     test(`${path} is RTL`, async ({ page }) => {
  140 |       const res = await page.goto(`/ar${path}`);
  141 |       expect(res?.ok()).toBeTruthy();
  142 |       await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  143 |       await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  144 |     });
  145 |   }
  146 | });
  147 | 
  148 | test.describe("Dashboard login redirect preserves locale dir", () => {
  149 |   test("Arabic secretary route redirects to Arabic staff login RTL", async ({
  150 |     page,
  151 |   }) => {
  152 |     await page.goto("/ar/secretary/dashboard");
  153 |     await expect(page).toHaveURL(/\/ar\/staff\/login/);
  154 |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  155 |   });
  156 | 
  157 |   test("English secretary route redirects to English staff login LTR", async ({
  158 |     page,
  159 |   }) => {
  160 |     await page.goto("/en/secretary/dashboard");
  161 |     await expect(page).toHaveURL(/\/en\/staff\/login/);
  162 |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  163 |   });
  164 | });
  165 | 
```