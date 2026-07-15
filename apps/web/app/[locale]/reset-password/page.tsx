import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatientAuthShell } from "../../../components/public/PatientAuthShell";
import { ResetPasswordForm } from "../../../components/public/ResetPasswordForm";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import { CLINIC_TITLE_BRAND } from "../../../lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const title =
    locale === "en"
      ? "Reset password"
      : locale === "fr"
        ? "Réinitialiser le mot de passe"
        : "تعيين كلمة مرور جديدة";
  return {
    title: { absolute: `${CLINIC_TITLE_BRAND[locale]} | ${title}` },
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <PatientAuthShell locale={locale}>
      <ResetPasswordForm locale={locale} />
    </PatientAuthShell>
  );
}
