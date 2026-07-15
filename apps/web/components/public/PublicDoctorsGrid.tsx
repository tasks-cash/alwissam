import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicDoctor } from "../../lib/public-site";
import { DoctorCard } from "./DoctorCard";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  doctors: PublicDoctor[];
  className?: string;
  large?: boolean;
};

export function PublicDoctorsGrid({
  locale,
  copy,
  doctors,
  className = "",
  large = true,
}: Props) {
  if (doctors.length === 0) {
    return (
      <div className="empty-state card-surface">
        <p>{copy.emptyDoctors}</p>
      </div>
    );
  }

  return (
    <div className={`pub-doctor-grid pub-doctor-grid--premium ${className}`.trim()}>
      {doctors.map((d, index) => (
        <DoctorCard
          key={d.id}
          locale={locale}
          copy={copy}
          doctor={d}
          large={large}
          index={index}
        />
      ))}
    </div>
  );
}
