# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: faq.spec.ts >> Public FAQ page >> Arabic FAQ loads with title, search, categories, and structured data
- Location: e2e/faq.spec.ts:6:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 500
Received:   500
```

# Page snapshot

```yaml
- generic [ref=e2]: Internal Server Error
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test.describe.configure({ mode: "serial" });
  4   | 
  5   | test.describe("Public FAQ page", () => {
  6   |   test("Arabic FAQ loads with title, search, categories, and structured data", async ({
  7   |     page,
  8   |   }) => {
  9   |     const res = await page.goto("/ar/faq", { waitUntil: "domcontentloaded" });
> 10  |     expect(res?.status()).toBeLessThan(500);
      |                           ^ Error: expect(received).toBeLessThan(expected)
  11  |     await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
  12  |     await expect(page).toHaveTitle(/الأسئلة الشائعة/);
  13  |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  14  |     await expect(
  15  |       page.getByRole("heading", { name: "الأسئلة الشائعة", level: 1 }),
  16  |     ).toBeVisible();
  17  |     await expect(page.locator("#faq-search input[type='search']")).toBeVisible();
  18  |     await expect(page.getByRole("tab", { name: /الكل/ })).toBeVisible();
  19  |     await expect(page.getByRole("tab", { name: /الحجز والمواعيد/ })).toBeVisible();
  20  |     await expect(page.getByRole("tab", { name: /الدعم والتواصل/ })).toBeVisible();
  21  | 
  22  |     const jsonLd = page.locator('script#faq-json-ld, script[type="application/ld+json"]');
  23  |     await expect(jsonLd.first()).toBeAttached({ timeout: 10000 });
  24  |     const raw = await jsonLd.first().textContent();
  25  |     expect(raw).toBeTruthy();
  26  |     const data = JSON.parse(raw!);
  27  |     expect(data["@type"]).toBe("FAQPage");
  28  |     expect(Array.isArray(data.mainEntity)).toBeTruthy();
  29  |     expect(data.mainEntity.length).toBeGreaterThan(10);
  30  | 
  31  |     await expect(page.locator(".faq-disclaimer")).toContainText(
  32  |       /لا تغني عن الفحص والتشخيص/,
  33  |     );
  34  |     await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
  35  |     await expect(page.locator('a[href*="wa.me/213663098208"]').first()).toBeVisible();
  36  |     await expect(page.locator('a[href="/ar/book"]').first()).toBeVisible();
  37  |     await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  38  | 
  39  |     const box = await page.locator(".faq-explorer").boundingBox();
  40  |     expect(box).toBeTruthy();
  41  |     if (box) expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  42  |   });
  43  | 
  44  |   test("search and accordion behavior", async ({ page }) => {
  45  |     await page.goto("/ar/faq", { waitUntil: "domcontentloaded" });
  46  |     await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
  47  |     const search = page.locator("#faq-search input[type='search']");
  48  |     await search.fill("حجز");
  49  |     await expect(page.locator(".faq-results-count")).toContainText(/\d+\s*نتيجة/, {
  50  |       timeout: 8000,
  51  |     });
  52  |     const trigger = page.locator(".faq-trigger").first();
  53  |     await expect(trigger).toBeVisible();
  54  |     await trigger.click();
  55  |     await expect(trigger).toHaveAttribute("aria-expanded", "true");
  56  |     await trigger.click();
  57  |     await expect(trigger).toHaveAttribute("aria-expanded", "false");
  58  | 
  59  |     await search.fill("___no_match_xyz___");
  60  |     await expect(page.locator(".faq-state")).toContainText(/لم نجد سؤالًا مطابقًا/, {
  61  |       timeout: 8000,
  62  |     });
  63  |   });
  64  | 
  65  |   test("English and French FAQ are LTR with correct titles", async ({ page }) => {
  66  |     await page.goto("/en/faq", { waitUntil: "domcontentloaded" });
  67  |     await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
  68  |     await expect(page).toHaveTitle(/Frequently Asked Questions/);
  69  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  70  |     await expect(
  71  |       page.getByRole("heading", { name: "Frequently Asked Questions", level: 1 }),
  72  |     ).toBeVisible();
  73  | 
  74  |     await page.goto("/fr/faq", { waitUntil: "domcontentloaded" });
  75  |     await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
  76  |     await expect(page).toHaveTitle(/Questions fréquentes/);
  77  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  78  |     await expect(
  79  |       page.getByRole("heading", { name: "Questions fréquentes", level: 1 }),
  80  |     ).toBeVisible();
  81  |   });
  82  | 
  83  |   test("category filter and featured section on mobile", async ({ page }) => {
  84  |     await page.setViewportSize({ width: 390, height: 844 });
  85  |     await page.goto("/ar/faq", { waitUntil: "domcontentloaded" });
  86  |     await expect(page.locator(".faq-explorer")).toBeVisible({ timeout: 15000 });
  87  |     await expect(
  88  |       page.getByRole("heading", { name: /أسئلة شائعة مختارة/ }),
  89  |     ).toBeVisible();
  90  |     await page.getByRole("tab", { name: /طوارئ الأسنان/ }).click();
  91  |     await expect(page.locator(".faq-trigger").first()).toBeVisible({
  92  |       timeout: 8000,
  93  |     });
  94  |     const overflow = await page.evaluate(() => {
  95  |       return document.documentElement.scrollWidth > window.innerWidth + 2;
  96  |     });
  97  |     expect(overflow).toBeFalsy();
  98  |   });
  99  | });
  100 | 
```