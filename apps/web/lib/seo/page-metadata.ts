import type { Metadata } from "next";
import { locales, type Locale } from "../i18n/config";

/** Browser title / OG clinic brand by locale — never duplicate in page `title` segments. */
export const CLINIC_TITLE_BRAND: Record<Locale, string> = {
  ar: "عيادة الوسام لطب الأسنان",
  en: "Al Wissam Dental Clinic",
  fr: "Clinique Dentaire El Wissam",
};

/** Short page segment used with title.template → `Brand | Segment`. */
export const PAGE_TITLE_SEGMENT = {
  home: { ar: "الرئيسية", en: "Home", fr: "Accueil" },
  about: { ar: "من نحن", en: "About Us", fr: "À propos" },
  contact: { ar: "تواصل", en: "Contact", fr: "Contact" },
  doctors: { ar: "الأطباء", en: "Doctors", fr: "Médecins" },
  specialties: { ar: "التخصصات", en: "Specialties", fr: "Spécialités" },
  services: { ar: "الخدمات", en: "Services", fr: "Services" },
  book: { ar: "حجز موعد", en: "Book an Appointment", fr: "Prendre rendez-vous" },
  faq: { ar: "الأسئلة الشائعة", en: "Frequently Asked Questions", fr: "Questions fréquentes" },
  reviews: { ar: "تجارب وآراء مرضانا", en: "Patient Reviews", fr: "Avis patients" },
  beforeAfter: { ar: "قبل وبعد العلاج", en: "Before and After", fr: "Avant et après" },
  privacy: { ar: "سياسة الخصوصية", en: "Privacy Policy", fr: "Politique de confidentialité" },
  terms: { ar: "الشروط والأحكام", en: "Terms and Conditions", fr: "Conditions générales" },
  cancellation: {
    ar: "سياسة إلغاء المواعيد",
    en: "Cancellation Policy",
    fr: "Politique d’annulation",
  },
  disclaimer: {
    ar: "إخلاء المسؤولية الطبية",
    en: "Medical Disclaimer",
    fr: "Avertissement médical",
  },
  cookies: { ar: "ملفات تعريف الارتباط", en: "Cookies", fr: "Cookies" },
  accessibility: { ar: "إمكانية الوصول", en: "Accessibility", fr: "Accessibilité" },
  refund: { ar: "سياسة الاسترداد", en: "Refund Policy", fr: "Politique de remboursement" },
  support: { ar: "الدعم", en: "Support", fr: "Assistance" },
  patientInfo: {
    ar: "معلومات المرضى",
    en: "Patient Information",
    fr: "Informations patients",
  },
  beforeVisit: { ar: "قبل زيارتكم", en: "Before Your Visit", fr: "Avant votre visite" },
  afterVisit: { ar: "بعد زيارتكم", en: "After Your Visit", fr: "Après votre visite" },
  notFound: { ar: "غير موجود", en: "Not Found", fr: "Introuvable" },
} as const;

export type PageTitleKey = keyof typeof PAGE_TITLE_SEGMENT;

export function titleSegment(locale: Locale, key: PageTitleKey): string {
  return PAGE_TITLE_SEGMENT[key][locale];
}

export function localeMetadataBase(locale: Locale): Metadata {
  const brand = CLINIC_TITLE_BRAND[locale];
  return {
    title: {
      default: `${brand} | ${titleSegment(locale, "home")}`,
      template: `${brand} | %s`,
    },
    description:
      locale === "en"
        ? "Al Wissam Dental Clinic in El Oued — book appointments, explore specialties and services, and contact the clinic team."
        : locale === "fr"
          ? "Clinique Dentaire El Wissam à El Oued — prenez rendez-vous, explorez spécialités et services, et contactez l’équipe."
          : "عيادة الوسام لطب الأسنان في الوادي — احجز موعدًا، استكشف التخصصات والخدمات، وتواصل مع فريق العيادة.",
  };
}

export function buildPublicMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
}): Metadata {
  const { locale, path, title, description } = opts;
  const languages = Object.fromEntries(
    locales.map((l) => [l, `/${l}${path === "/" ? "" : path}`]),
  ) as Record<string, string>;
  const canonical = `/${locale}${path === "/" ? "" : path}`;
  const ogLocale =
    locale === "ar" ? "ar_DZ" : locale === "fr" ? "fr_DZ" : "en_US";

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: opts.ogTitle || `${CLINIC_TITLE_BRAND[locale]} | ${title}`,
      description,
      locale: ogLocale,
      type: "website",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.ogTitle || `${CLINIC_TITLE_BRAND[locale]} | ${title}`,
      description,
    },
    robots: { index: true, follow: true },
  };
}
