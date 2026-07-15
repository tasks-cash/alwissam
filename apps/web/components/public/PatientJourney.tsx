import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";

type Props = {
  locale: Locale;
  copy: PublicCopy;
};

export function PatientJourney({ locale, copy }: Props) {
  return (
    <div className="journey-block">
      <ol className="journey-timeline">
        {copy.journeySteps.map((step, i) => (
          <li key={step.title} className="journey-step">
            <span className="journey-index" aria-hidden>
              {i + 1}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="cta-row journey-cta">
        <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
          {copy.navBook}
        </Link>
      </div>
    </div>
  );
}
