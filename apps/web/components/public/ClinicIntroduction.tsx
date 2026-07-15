import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import { WorkingHours } from "./WorkingHours";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  title?: string;
  /** Optional Mongo-backed about text shown under the intro lead when distinct. */
  body?: string;
  imageAlt: string;
  hours?: string;
};

export function ClinicIntroduction({
  locale,
  copy,
  title,
  body,
  imageAlt,
  hours,
}: Props) {
  const extra = body?.trim();
  const showExtra =
    Boolean(extra) &&
    extra !== copy.clinicIntroLead.trim() &&
    extra!.length > 0;

  return (
    <div className="clinic-intro clinic-intro--premium">
      <div className="clinic-intro-story">
        <p className="section-kicker">{copy.clinicIntroTitle}</p>
        <h2>{title || copy.clinicIntroTitle}</h2>
        <p className="pub-lead clinic-intro-lead">{copy.clinicIntroLead}</p>
        {showExtra ? <p className="clinic-intro-extra">{extra}</p> : null}

        <ul className="clinic-intro-features">
          {copy.clinicIntroFeatures.map((feature) => (
            <li key={feature.title} className="clinic-intro-feature">
              <span className="clinic-intro-feature-mark" aria-hidden />
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="cta-row">
          <Link className="btn btn-primary" href={`/${locale}/about`}>
            {copy.learnMoreClinic}
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/book-appointment`}>
            {copy.navBook}
          </Link>
        </div>
      </div>

      <div className="clinic-intro-visual">
        <div className="clinic-intro-rail" aria-hidden />
        <div className="clinic-intro-media">
          <Image
            src="/images/stock/dental-clinic-interior.jpg"
            alt={imageAlt}
            width={1600}
            height={1070}
            sizes="(max-width: 768px) 100vw, 44vw"
            className="clinic-photo"
            loading="lazy"
          />
        </div>
        {hours ? (
          <div className="clinic-intro-hours-card">
            <WorkingHours copy={copy} hours={hours} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
