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
    path: "/patient-information",
    title: titleSegment(locale, "patientInfo"),
    description:
      locale === "en"
        ? "Important information for patients before visiting Al Wissam Clinic."
        : locale === "fr"
          ? "Informations importantes pour les patients avant de visiter la clinique El Wissam."
          : "معلومات مهمة للمرضى قبل زيارة عيادة الوسام.",
  });
}

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ContentPage params={params} kind="patient-information" />;
}
