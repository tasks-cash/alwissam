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
    path: "/after-your-visit",
    title: titleSegment(locale, "afterVisit"),
    description:
      locale === "en"
        ? "Guidance after your visit to Al Wissam Dental Clinic."
        : locale === "fr"
          ? "Conseils après votre visite à la Clinique Dentaire El Wissam."
          : "إرشادات بعد زيارة عيادة الوسام لطب الأسنان.",
  });
}

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ContentPage params={params} kind="after-your-visit" />;
}
