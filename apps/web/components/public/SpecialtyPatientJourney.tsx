import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import { SectionReveal } from "./motion/SectionReveal";

type Props = {
  locale: Locale;
  copy: PublicCopy;
};

export function SpecialtyPatientJourney({ locale, copy }: Props) {
  const isRtl = locale === "ar";
  const steps = copy.specialtyJourneySteps;

  return (
    <SectionReveal className="specialty-journey">
      <h2>{copy.specialtyJourneyTitle}</h2>
      <p className="pub-lead">{copy.specialtyJourneyLead}</p>
      <ol
        className={`specialty-journey-path${isRtl ? " is-rtl" : " is-ltr"}`}
        aria-label={copy.specialtyJourneyTitle}
      >
        {steps.map((step, i) => (
          <li key={`${i}-${step}`} className="specialty-journey-node">
            <span className="specialty-journey-index" aria-hidden>
              {i + 1}
            </span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
      <p className="specialty-disclaimer muted">{copy.specialtyDoctorDecidesNote}</p>
    </SectionReveal>
  );
}
