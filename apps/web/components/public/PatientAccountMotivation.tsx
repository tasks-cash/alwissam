import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import { PatientDashboardVisual } from "./PatientDashboardVisual";
import { PublicSection } from "./PublicSection";

const BENEFITS = [
  "benefitAppointments",
  "benefitStatus",
  "benefitHistory",
  "benefitFiles",
  "benefitInstructions",
  "benefitReminders",
  "benefitProfile",
  "benefitMessaging",
] as const;

type Props = {
  locale: Locale;
  copy: PublicCopy;
};

export function PatientAccountMotivation({ locale, copy }: Props) {
  return (
    <PublicSection tone="soft" className="patient-account-section">
      <div className="patient-account-grid">
        <div className="patient-account-copy">
          <p className="section-kicker">{copy.patientAccountKicker}</p>
          <h2>{copy.patientAccountTitle}</h2>
          <p className="pub-lead">{copy.patientAccountLead}</p>
          <ul className="patient-account-benefits">
            {BENEFITS.map((key) => (
              <li key={key}>{copy[key]}</li>
            ))}
          </ul>
          <div className="cta-row">
            <Link
              className="btn btn-primary"
              href={`/${locale}/patient/register`}
            >
              {copy.patientAccountRegister}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/patient/login`}>
              {copy.patientAccountLogin}
            </Link>
          </div>
        </div>
        <PatientDashboardVisual
          locale={locale}
          imageAlt={copy.patientAccountImageAlt}
          mockLabel={copy.patientAccountMockLabel}
          cardAppointment={copy.patientFloatAppointment}
          cardProgress={copy.patientFloatProgress}
          cardNotice={copy.patientFloatNotice}
          cardFile={copy.patientFloatFile}
          securityBadge={copy.patientSecurityBadge}
        />
      </div>
    </PublicSection>
  );
}
