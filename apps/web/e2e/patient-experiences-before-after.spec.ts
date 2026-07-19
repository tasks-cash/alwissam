import { expect, test } from "@playwright/test";

/**
 * Homepage patient experiences + before/after sections.
 * Uses live public APIs — empty states are valid when no approved records exist.
 * Do not assume fabricated testimonials are present.
 */
test.describe("Homepage experiences and before/after", () => {
  for (const locale of ["ar", "en", "fr"] as const) {
    test(`${locale} homepage shows section headings and empty-safe states`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const dir = await page.locator("html").getAttribute("dir");
      expect(dir).toBe(locale === "ar" ? "rtl" : "ltr");

      const experiencesTitle =
        locale === "ar"
          ? "تجارب مرضانا"
          : locale === "fr"
            ? "Expériences de nos patients"
            : "Patient Experiences";
      const beforeAfterTitle =
        locale === "ar"
          ? "حالات علاجية سابقة"
          : locale === "fr"
            ? "Avant et après le traitement"
            : "Before and After Treatment";

      await expect(page.getByRole("heading", { name: experiencesTitle })).toBeVisible();
      await expect(page.getByRole("heading", { name: beforeAfterTitle })).toBeVisible();

      const disclaimer =
        locale === "ar"
          ? /تختلف النتائج/
          : locale === "fr"
            ? /Les résultats varient/
            : /Results vary/;

      // Medical disclaimer is always present under the section.
      await expect(page.getByText(disclaimer).first()).toBeVisible();
      await expect(
        page
          .getByText(
            locale === "ar"
              ? /الموافقات المطلوبة/
              : locale === "fr"
                ? /consentements requis/
                : /required consents/,
          )
          .first(),
      ).toBeVisible();

      if (locale === "ar") {
        const float = page.locator(".contact-float").first();
        await expect(float).toBeVisible();
        await expect(float).toContainText(/واتساب|اتصل/);
      }
    });
  }

  test("experiences API never exceeds 30 and hides private fields", async ({
    request,
  }) => {
    const res = await request.get(
      "/api/public/patient-experiences?limit=30&locale=ar",
    );
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.experiences)).toBeTruthy();
    expect(data.experiences.length).toBeLessThanOrEqual(30);
    for (const row of data.experiences) {
      expect(row).not.toHaveProperty("consentDocumentReference");
      expect(row).not.toHaveProperty("createdById");
      expect(row).not.toHaveProperty("isApproved");
      expect(row).toHaveProperty("displayName");
      expect(row).toHaveProperty("review");
      expect(row).toHaveProperty("rating");
    }
  });

  test("before-after API never exceeds 30 and hides private fields", async ({
    request,
  }) => {
    const res = await request.get(
      "/api/public/before-after?featured=true&limit=30&locale=en",
    );
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.cases)).toBeTruthy();
    expect(data.cases.length).toBeLessThanOrEqual(30);
    for (const row of data.cases) {
      expect(row).not.toHaveProperty("consentDocumentReference");
      expect(row).not.toHaveProperty("createdById");
      expect(row).not.toHaveProperty("patientAgeRange");
      expect(row).toHaveProperty("beforeImageUrl");
      expect(row).toHaveProperty("afterImageUrl");
      expect(row).toHaveProperty("title");
    }
  });

  test("public contact channels expose only safe display fields", async ({
    request,
  }) => {
    const res = await request.get(
      "/api/public/contact-channels?placement=global_floating",
    );
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.channels)).toBeTruthy();
    for (const row of data.channels) {
      expect(row).not.toHaveProperty("createdBy");
      expect(row).not.toHaveProperty("updatedBy");
      expect(row).not.toHaveProperty("archivedAt");
      expect(row.publicUrl).not.toMatch(/^(javascript|data|file):/i);
    }
  });
});
