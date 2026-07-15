import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  title?: string;
  body: string;
  imageAlt: string;
};

export function ClinicIntroduction({
  locale,
  copy,
  title,
  body,
  imageAlt,
}: Props) {
  return (
    <div className="clinic-intro-grid">
      <div>
        <p className="section-kicker">{copy.clinicIntroTitle}</p>
        <h2>{title || copy.clinicIntroTitle}</h2>
        <p className="pub-lead">{body}</p>
        <div className="cta-row">
          <Link className="btn btn-primary" href={`/${locale}/about`}>
            {copy.learnMoreAbout}
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/book-appointment`}>
            {copy.navBook}
          </Link>
        </div>
      </div>
      <div className="clinic-intro-media">
        <Image
          src="/images/stock/dental-clinic-interior.jpg"
          alt={imageAlt}
          width={1600}
          height={1070}
          sizes="(max-width: 768px) 100vw, 48vw"
          className="clinic-photo"
          loading="lazy"
        />
      </div>
    </div>
  );
}
