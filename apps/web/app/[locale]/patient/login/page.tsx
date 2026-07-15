import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientAuthShell } from "../../../../components/public/PatientAuthShell";
import { PatientLoginForm } from "../../../../components/public/PatientLoginForm";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getPatientAuthCopy } from "../../../../lib/i18n/patient-auth-copy";
import { CLINIC_TITLE_BRAND } from "../../../../lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const copy = getPatientAuthCopy(locale);
  return {
    title: {
      absolute: `${CLINIC_TITLE_BRAND[locale]} | ${copy.documentTitleLogin}`,
    },
    robots: { index: false, follow: false },
  };
}

export default async function PatientLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <PatientAuthShell locale={locale}>
      <PatientLoginForm locale={locale} />
    </PatientAuthShell>
  );
}
