import { normalizeCatalogName } from "./catalog.service";
import { SERVICE_SEEDS, SPECIALTY_SEEDS } from "./catalog.seed-data";

describe("catalog seed data integrity", () => {
  it("has unique specialty slugs", () => {
    const slugs = SPECIALTY_SEEDS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique service slugs", () => {
    const slugs = SERVICE_SEEDS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("does not treat whitening as a specialty", () => {
    expect(SPECIALTY_SEEDS.some((s) => s.slug.includes("whitening"))).toBe(
      false,
    );
    expect(SERVICE_SEEDS.some((s) => s.slug === "teeth-whitening")).toBe(true);
  });

  it("links whitening and gum cleaning to dentistry specialties", () => {
    const whitening = SERVICE_SEEDS.find((s) => s.slug === "teeth-whitening");
    const cleaning = SERVICE_SEEDS.find(
      (s) => s.slug === "dental-scaling-gum-cleaning",
    );
    expect(whitening?.specialtySlugs).toContain("cosmetic-dentistry");
    expect(cleaning?.specialtySlugs).toContain("periodontics");
  });

  it("has a single general dentistry specialty seed", () => {
    const dentistry = SPECIALTY_SEEDS.filter(
      (s) =>
        s.slug === "general-dentistry" ||
        normalizeCatalogName(s.nameEn) === "general dentistry",
    );
    expect(dentistry).toHaveLength(1);
  });

  it("covers required featured homepage services", () => {
    const featured = new Set(
      SERVICE_SEEDS.filter((s) => s.isFeatured).map((s) => s.slug),
    );
    for (const slug of [
      "teeth-whitening",
      "dental-scaling-gum-cleaning",
      "dental-fillings",
      "root-canal-treatment",
      "dental-implants",
      "orthodontic-consultation",
    ]) {
      expect(featured.has(slug)).toBe(true);
    }
  });
});
