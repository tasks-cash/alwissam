import { DEFAULT_HOMEPAGE_SECTION_TITLES } from "./homepage-sections.defaults";

describe("Homepage section defaults", () => {
  it("keeps Arabic specialties and services titles for public homepage", () => {
    expect(DEFAULT_HOMEPAGE_SECTION_TITLES.specialtiesAr).toBe("تخصصاتنا الطبية");
    expect(DEFAULT_HOMEPAGE_SECTION_TITLES.servicesAr).toBe("خدمات طب الأسنان");
    expect(DEFAULT_HOMEPAGE_SECTION_TITLES.specialtiesImage).toContain(
      "medical-specialties",
    );
    expect(DEFAULT_HOMEPAGE_SECTION_TITLES.servicesImage).toContain(
      "dental-services",
    );
  });
});
