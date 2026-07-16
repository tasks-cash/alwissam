# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: patient-experiences-before-after.spec.ts >> Homepage experiences and before/after >> ar homepage shows section headings and empty-safe states
- Location: e2e/patient-experiences-before-after.spec.ts:10:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "rtl"
Received: null
```

# Page snapshot

```yaml
- generic [ref=e2]: Internal Server Error
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | /**
  4  |  * Homepage patient experiences + before/after sections.
  5  |  * Uses live public APIs — empty states are valid when no approved records exist.
  6  |  * Do not assume fabricated testimonials are present.
  7  |  */
  8  | test.describe("Homepage experiences and before/after", () => {
  9  |   for (const locale of ["ar", "en", "fr"] as const) {
  10 |     test(`${locale} homepage shows section headings and empty-safe states`, async ({
  11 |       page,
  12 |     }) => {
  13 |       await page.goto(`/${locale}`);
  14 |       const dir = await page.locator("html").getAttribute("dir");
> 15 |       expect(dir).toBe(locale === "ar" ? "rtl" : "ltr");
     |                   ^ Error: expect(received).toBe(expected) // Object.is equality
  16 | 
  17 |       const experiencesTitle =
  18 |         locale === "ar"
  19 |           ? "تجارب مرضانا"
  20 |           : locale === "fr"
  21 |             ? "Expériences de nos patients"
  22 |             : "Patient Experiences";
  23 |       const beforeAfterTitle =
  24 |         locale === "ar"
  25 |           ? "نتائج قبل وبعد العلاج"
  26 |           : locale === "fr"
  27 |             ? "Avant et après le traitement"
  28 |             : "Before and After Treatment";
  29 | 
  30 |       await expect(page.getByRole("heading", { name: experiencesTitle })).toBeVisible();
  31 |       await expect(page.getByRole("heading", { name: beforeAfterTitle })).toBeVisible();
  32 | 
  33 |       const disclaimer =
  34 |         locale === "ar"
  35 |           ? /تختلف النتائج/
  36 |           : locale === "fr"
  37 |             ? /Les résultats varient/
  38 |             : /Results vary/;
  39 | 
  40 |       // Medical disclaimer is always present under the section.
  41 |       await expect(page.getByText(disclaimer).first()).toBeVisible();
  42 |       await expect(
  43 |         page
  44 |           .getByText(
  45 |             locale === "ar"
  46 |               ? /الموافقات المطلوبة/
  47 |               : locale === "fr"
  48 |                 ? /consentements requis/
  49 |                 : /required consents/,
  50 |           )
  51 |           .first(),
  52 |       ).toBeVisible();
  53 |     });
  54 |   }
  55 | 
  56 |   test("experiences API never exceeds 10 and hides private fields", async ({
  57 |     request,
  58 |   }) => {
  59 |     const res = await request.get(
  60 |       "/api/public/patient-experiences?limit=10&locale=ar",
  61 |     );
  62 |     expect(res.ok()).toBeTruthy();
  63 |     const data = await res.json();
  64 |     expect(Array.isArray(data.experiences)).toBeTruthy();
  65 |     expect(data.experiences.length).toBeLessThanOrEqual(10);
  66 |     for (const row of data.experiences) {
  67 |       expect(row).not.toHaveProperty("consentDocumentReference");
  68 |       expect(row).not.toHaveProperty("createdById");
  69 |       expect(row).not.toHaveProperty("isApproved");
  70 |       expect(row).toHaveProperty("displayName");
  71 |       expect(row).toHaveProperty("review");
  72 |       expect(row).toHaveProperty("rating");
  73 |     }
  74 |   });
  75 | 
  76 |   test("before-after API never exceeds 10 and hides private fields", async ({
  77 |     request,
  78 |   }) => {
  79 |     const res = await request.get(
  80 |       "/api/public/before-after?featured=true&limit=10&locale=en",
  81 |     );
  82 |     expect(res.ok()).toBeTruthy();
  83 |     const data = await res.json();
  84 |     expect(Array.isArray(data.cases)).toBeTruthy();
  85 |     expect(data.cases.length).toBeLessThanOrEqual(10);
  86 |     for (const row of data.cases) {
  87 |       expect(row).not.toHaveProperty("consentDocumentReference");
  88 |       expect(row).not.toHaveProperty("createdById");
  89 |       expect(row).not.toHaveProperty("patientAgeRange");
  90 |       expect(row).toHaveProperty("beforeImageUrl");
  91 |       expect(row).toHaveProperty("afterImageUrl");
  92 |       expect(row).toHaveProperty("title");
  93 |     }
  94 |   });
  95 | });
  96 | 
```