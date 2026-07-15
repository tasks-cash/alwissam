import type { MetadataRoute } from "next";
import { locales } from "../lib/i18n/config";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const paths = [
  "",
  "/about",
  "/services",
  "/specialties",
  "/doctors",
  "/reviews",
  "/book-appointment",
  "/contact",
  "/faq",
  "/patient-information",
  "/before-your-visit",
  "/after-your-visit",
  "/support",
  "/refund-policy",
  "/cancellation-policy",
  "/privacy",
  "/terms",
  "/cookies",
  "/accessibility",
  "/medical-disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of paths) {
      entries.push({
        url: `${siteUrl.replace(/\/$/, "")}/${locale}${path}`,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }
  return entries;
}
