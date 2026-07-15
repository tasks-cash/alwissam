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
    path: "/medical-disclaimer",
    title: titleSegment(locale, "disclaimer"),
    description:
      locale === "en"
        ? "Medical disclaimer for Al Wissam Dental Clinic website content."
        : locale === "fr"
          ? "Avertissement médical concernant le contenu du site de la Clinique Dentaire El Wissam."
          : "إخلاء المسؤولية الطبية لمحتوى موقع عيادة الوسام لطب الأسنان.",
  });
}

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ContentPage params={params} kind="medical-disclaimer" />;
}
