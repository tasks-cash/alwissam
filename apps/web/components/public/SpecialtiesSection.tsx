import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicSpecialty } from "../../lib/public-site";
import { SpecialtyCard } from "./SpecialtyCard";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  specialties: PublicSpecialty[];
};

export function SpecialtiesSection({ locale, copy, specialties }: Props) {
  return (
    <>
      <div className="section-head">
        <div>
          <p className="section-kicker">{copy.sectionSpecialties}</p>
          <h2>{copy.sectionSpecialties}</h2>
          <p className="pub-lead">{copy.sectionSpecialtiesLead}</p>
        </div>
        <Link href={`/${locale}/specialties`}>{copy.allSpecialties}</Link>
      </div>
      {specialties.length === 0 ? (
        <p className="muted empty-state">{copy.emptySpecialties}</p>
      ) : (
        <div className="pub-tile-grid pub-tile-grid-3 specialty-card-grid">
          {specialties.map((s, i) => (
            <SpecialtyCard
              key={s.slug}
              locale={locale}
              copy={copy}
              specialty={s}
              index={i}
            />
          ))}
        </div>
      )}
    </>
  );
}
