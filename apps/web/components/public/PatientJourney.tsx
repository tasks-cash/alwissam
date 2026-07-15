import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import { DentalIcon } from "./DentalIcon";

type Props = {
  locale: Locale;
  copy: PublicCopy;
};

const STEP_ICONS = [
  "specialty",
  "doctor",
  "calendar",
  "send",
  "check",
  "clinic",
  "followup",
] as const;

export function PatientJourney({ locale, copy }: Props) {
  const isRtl = locale === "ar";

  return (
    <div className={`journey-block journey-block--premium${isRtl ? " is-rtl" : " is-ltr"}`}>
      <p className="pub-lead pe-lead journey-lead">{copy.sectionJourneyLead}</p>

      <ol className="journey-path" aria-label={copy.sectionJourney}>
        {copy.journeySteps.map((step, i) => (
          <li key={`${i}-${step.title}`} className="journey-node">
            <div className="journey-node-connector" aria-hidden />
            <div className="journey-node-core">
              <span className="journey-index" aria-hidden>
                {i + 1}
              </span>
              <span className="journey-icon" aria-hidden>
                <DentalIcon name={STEP_ICONS[i] || "clinic"} />
              </span>
            </div>
            <div className="journey-node-copy">
              <h3>
                <span className="sr-only">
                  {i + 1}.{" "}
                </span>
                {step.title}
              </h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="cta-row journey-cta">
        <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
          {copy.journeyCta}
        </Link>
      </div>
    </div>
  );
}
