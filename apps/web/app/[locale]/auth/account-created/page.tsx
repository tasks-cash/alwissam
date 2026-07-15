import Link from "next/link";
import { notFound } from "next/navigation";
import { PatientAuthShell } from "../../../../components/public/PatientAuthShell";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getUnifiedAuthCopy } from "../../../../lib/i18n/unified-auth-copy";

export default async function AccountCreatedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const copy = getUnifiedAuthCopy(locale);
  return (
    <PatientAuthShell locale={locale}>
      <div className="card-surface auth-card stack-form">
        <h1>{copy.accountCreatedTitle}</h1>
        <p className="lead">{copy.accountCreatedLead}</p>
        <Link className="btn btn-primary" href={`/${locale}/auth/login`}>
          {copy.goLogin}
        </Link>
      </div>
    </PatientAuthShell>
  );
}
