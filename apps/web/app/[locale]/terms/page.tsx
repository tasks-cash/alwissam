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
    path: "/terms",
    title: titleSegment(locale, "terms"),
    description:
      locale === "en"
        ? "Terms and conditions for using the Al Wissam Dental Clinic website."
        : locale === "fr"
          ? "Conditions générales d’utilisation du site de la Clinique Dentaire El Wissam."
          : "الشروط والأحكام لاستخدام موقع عيادة الوسام لطب الأسنان.",
  });
}

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ContentPage params={params} kind="terms" />;
}
