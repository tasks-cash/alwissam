import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

test.describe("Public content layout contracts", () => {
  const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8");

  test("service cards use 1/2/3 responsive grid", () => {
    expect(css).toContain(".service-card-grid");
    expect(css).toMatch(
      /\.service-card-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
    );
    expect(css).toMatch(
      /@media\s*\(min-width:\s*768px\)[\s\S]*?\.service-card-grid[\s\S]*?repeat\(2/,
    );
    expect(css).toMatch(
      /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.service-card-grid[\s\S]*?repeat\(3/,
    );
    expect(css).toMatch(
      /\.service-card-media\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*10/,
    );
  });

  test("services page loads from Nest catalog helper", () => {
    const page = readFileSync(
      join(__dirname, "../app/[locale]/services/page.tsx"),
      "utf8",
    );
    expect(page).toContain("fetchPublicServicesCatalog");
    expect(page).not.toContain("HARDCODED_SERVICES");
  });

  test("specialties hero consumes Mongo specialtiesPage", () => {
    const page = readFileSync(
      join(__dirname, "../app/[locale]/specialties/page.tsx"),
      "utf8",
    );
    const hero = readFileSync(
      join(__dirname, "../components/public/SpecialtiesPremiumHero.tsx"),
      "utf8",
    );
    expect(page).toContain("site.specialtiesPage");
    expect(hero).toContain("hero?.titleAr");
    expect(page).toContain("SpecialtiesExplorer");
  });

  test("reviews explorer requests up to 30 published items", () => {
    const explorer = readFileSync(
      join(__dirname, "../components/public/ReviewsExplorer.tsx"),
      "utf8",
    );
    const card = readFileSync(
      join(__dirname, "../components/public/ReviewCard.tsx"),
      "utf8",
    );
    expect(explorer).toContain('limit: "30"');
    expect(card).toContain("review-card-avatar");
    expect(card).not.toContain("review-card-verified");
  });

  test("owner display helper is wired into dashboard shell", () => {
    const shell = readFileSync(
      join(__dirname, "../components/layout/DashboardShell.tsx"),
      "utf8",
    );
    const helper = readFileSync(
      join(__dirname, "../lib/auth/owner-display.ts"),
      "utf8",
    );
    expect(helper).toContain("مالك النظام والطبيب الرئيسي");
    expect(helper).toContain("مالك النظام وطبيب مختص");
    expect(helper).toContain("مالك النظام وطبيب عام");
    expect(shell).toContain("formatOwnerDisplay");
    expect(shell).toContain("sidebarSecondary");
  });
});

