import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
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
    <PublicSection tone="soft" className="patient-account-section reveal-section">
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
            <Link className="btn btn-primary" href={`/${locale}/patient/register`}>
              {copy.patientAccountRegister}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/patient/login`}>
              {copy.patientAccountLogin}
            </Link>
          </div>
        </div>
        <div className="patient-account-visual" aria-hidden={false}>
          <Image
            src="/images/stock/dental-team-care.jpg"
            alt={copy.patientAccountImageAlt}
            width={960}
            height={720}
            sizes="(max-width: 768px) 100vw, 42vw"
            className="patient-account-image"
          />
          <div className="patient-dashboard-mock" aria-hidden>
            <span className="mock-label">{copy.patientAccountMockLabel}</span>
            <div className="mock-row" />
            <div className="mock-row short" />
            <div className="mock-chips">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </div>
    </PublicSection>
  );
}
