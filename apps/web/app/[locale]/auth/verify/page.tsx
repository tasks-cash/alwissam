import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { VerifyContactForm } from "../../../../components/auth/VerifyContactForm";
import { PatientAuthShell } from "../../../../components/public/PatientAuthShell";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { CLINIC_TITLE_BRAND } from "../../../../lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const title =
    locale === "fr"
      ? "Vérification"
      : locale === "en"
        ? "Verify"
        : "تأكيد الحساب";
  return {
    title: { absolute: `${CLINIC_TITLE_BRAND[locale]} | ${title}` },
    robots: { index: false, follow: false },
  };
}

async function VerifyInner({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<{ token?: string }>;
}) {
  const q = await searchParams;
  return <VerifyContactForm locale={locale} initialToken={q.token || ""} />;
}

export default async function AuthVerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  return (
    <PatientAuthShell locale={locale}>
      <Suspense fallback={<div className="card-surface auth-card">...</div>}>
        <VerifyInner locale={locale} searchParams={searchParams} />
      </Suspense>
    </PatientAuthShell>
  );
}
