import type { Metadata } from "next";
import { ContentPage } from "../../../components/public/ContentPage";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import {
  buildPublicMetadata,
  titleSegment,
} from "../../../lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  return buildPublicMetadata({
    locale,
    path: "/accessibility",
    title: titleSegment(locale, "accessibility"),
    description:
      locale === "en"
        ? "Accessibility statement for Al Wissam Dental Clinic."
        : locale === "fr"
          ? "Déclaration d’accessibilité de la Clinique Dentaire El Wissam."
          : "بيان إمكانية الوصول لموقع عيادة الوسام.",
  });
}

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ContentPage params={params} kind="accessibility" />;
}
