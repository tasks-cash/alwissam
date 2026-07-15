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
    path: "/refund-policy",
    title: titleSegment(locale, "refund"),
    description:
      locale === "en"
        ? "Refund policy for Al Wissam Dental Clinic."
        : locale === "fr"
          ? "Politique de remboursement de la Clinique Dentaire El Wissam."
          : "سياسة الاسترداد لعيادة الوسام لطب الأسنان.",
  });
}

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ContentPage params={params} kind="refund-policy" />;
}
