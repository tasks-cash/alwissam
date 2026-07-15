import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { UnifiedLoginForm } from "../../../../components/auth/UnifiedLoginForm";
import { PatientAuthShell } from "../../../../components/public/PatientAuthShell";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getUnifiedAuthCopy } from "../../../../lib/i18n/unified-auth-copy";
import { CLINIC_TITLE_BRAND } from "../../../../lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const copy = getUnifiedAuthCopy(locale);
  return {
    title: { absolute: `${CLINIC_TITLE_BRAND[locale]} | ${copy.loginTitle}` },
    robots: { index: false, follow: false },
  };
}

export default async function UnifiedLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  return (
    <PatientAuthShell locale={locale}>
      <Suspense fallback={<div className="card-surface auth-card">...</div>}>
        <UnifiedLoginForm locale={locale} />
      </Suspense>
    </PatientAuthShell>
  );
}
