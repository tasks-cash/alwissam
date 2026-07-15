export const locales = ["ar", "en", "fr"] as const;
export type Locale = (typeof locales)[number];
/** Arabic-first clinic: fallback when cookie and browser language are unsupported. */
export const defaultLocale: Locale = "ar";
export const localeCookieName = "alwisam_locale";

export const localeMeta: Record<
  Locale,
  { label: string; dir: "rtl" | "ltr"; htmlLang: string }
> = {
  ar: { label: "العربية", dir: "rtl", htmlLang: "ar" },
  en: { label: "English", dir: "ltr", htmlLang: "en" },
  fr: { label: "Français", dir: "ltr", htmlLang: "fr" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Map Accept-Language / navigator language tags to ar|en|fr. */
export function negotiateLocale(
  acceptLanguage: string | null | undefined,
): Locale {
  if (!acceptLanguage) return defaultLocale;
  const parts = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: (tag || "").toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of parts) {
    if (tag.startsWith("ar")) return "ar";
    if (tag.startsWith("fr")) return "fr";
    if (tag.startsWith("en")) return "en";
  }
  return defaultLocale;
}
