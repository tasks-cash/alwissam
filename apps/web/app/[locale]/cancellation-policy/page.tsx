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
    path: "/cancellation-policy",
    title: titleSegment(locale, "cancellation"),
    description:
      locale === "en"
        ? "Appointment cancellation policy at Al Wissam Dental Clinic."
        : locale === "fr"
          ? "Politique d’annulation des rendez-vous à la Clinique Dentaire El Wissam."
          : "سياسة إلغاء المواعيد في عيادة الوسام لطب الأسنان.",
  });
}

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ContentPage params={params} kind="cancellation-policy" />;
}
