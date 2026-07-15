import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicDoctor } from "../../lib/public-site";
import { DoctorCard } from "./DoctorCard";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  doctors: PublicDoctor[];
  limit?: number;
};

export function DoctorsSection({ locale, copy, doctors, limit = 3 }: Props) {
  const shown = doctors.slice(0, limit);

  return (
    <>
      <div className="section-head">
        <div>
          <p className="section-kicker">{copy.sectionDoctors}</p>
          <h2>{copy.sectionDoctors}</h2>
        </div>
        <Link href={`/${locale}/doctors`}>{copy.allDoctors}</Link>
      </div>
      {shown.length === 0 ? (
        <p className="muted empty-state">{copy.emptyDoctors}</p>
      ) : (
        <div className="pub-doctor-grid">
          {shown.map((d) => (
            <DoctorCard key={d.id} locale={locale} copy={copy} doctor={d} />
          ))}
        </div>
      )}
    </>
  );
}
