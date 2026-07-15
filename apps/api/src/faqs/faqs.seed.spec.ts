import { FAQ_SEEDS } from "./faq.seed-data";
import { FEATURED_FAQ_SLUGS } from "./faq.categories";
import { normalizeFaqQuestion } from "./faq.utils";

describe("FAQ seed data", () => {
  it("contains exactly 100 unique slugs", () => {
    expect(FAQ_SEEDS).toHaveLength(100);
    const slugs = FAQ_SEEDS.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(100);
  });

  it("marks required featured questions", () => {
    const featured = new Set(
      FAQ_SEEDS.filter((f) => f.isFeatured).map((f) => f.slug),
    );
    for (const slug of FEATURED_FAQ_SLUGS) {
      expect(featured.has(slug)).toBe(true);
    }
  });

  it("has non-empty trilingual questions and answers", () => {
    for (const seed of FAQ_SEEDS) {
      expect(seed.questionAr.trim().length).toBeGreaterThan(5);
      expect(seed.questionEn.trim().length).toBeGreaterThan(5);
      expect(seed.questionFr.trim().length).toBeGreaterThan(5);
      expect(seed.answerAr.trim().length).toBeGreaterThan(20);
      expect(seed.answerEn.trim().length).toBeGreaterThan(20);
      expect(seed.answerFr.trim().length).toBeGreaterThan(20);
      expect(seed.category).toBeTruthy();
    }
  });

  it("normalizes Arabic questions for duplicate detection", () => {
    const a = normalizeFaqQuestion("ما ساعات عمل العيادة؟");
    const b = normalizeFaqQuestion("ما  ساعات   عمل العيادة؟");
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(3);
  });

  it("avoids unsafe guaranteed-result medical claims in answers", () => {
    const unsafe =
      /(مضمون\s*النتيجة|guaranteed?\s+results?|100%\s*success|résultat\s+garanti)/i;
    for (const seed of FAQ_SEEDS) {
      expect(seed.answerAr).not.toMatch(unsafe);
      expect(seed.answerEn).not.toMatch(unsafe);
      expect(seed.answerFr).not.toMatch(unsafe);
    }
  });
});
