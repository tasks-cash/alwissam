import type { Locale } from "../../../lib/i18n/config";
import type { PublicCopy } from "../../../lib/i18n/public-copy";
import type {
  PublicDoctor,
  PublicService,
  PublicSpecialty,
  PublicSitePayload,
} from "../../../lib/public-site";
import { pickLocalized } from "../../../lib/public-site";
import { ContactWorkspace } from "../ContactWorkspace";
import { ContactPremiumHero } from "../ContactPremiumHero";
import { QuickContactActions } from "../QuickContactActions";
import { PublicSection } from "../PublicSection";
import {
  resolveClinicContact,
} from "../../../lib/clinic-contact";
import { BidiSafeValue } from "../BidiSafeValue";
import { WorkingHours } from "../WorkingHours";

export type ContactPageContentProps = {
  locale: Locale;
  copy: PublicCopy;
  hours: string;
  clinic?: PublicSitePayload["clinic"];
  doctors: PublicDoctor[];
  specialties: PublicSpecialty[];
  services: PublicService[];
};

export function ContactPageContent({
  locale,
  copy,
  hours,
  clinic,
  doctors,
  specialties,
  services,
}: ContactPageContentProps) {
  const clinicName = pickLocalized(
    locale,
    clinic?.nameAr || clinic?.clinicNameAr,
    clinic?.nameEn || clinic?.clinicNameEn,
    clinic?.nameFr || clinic?.clinicNameFr,
    copy.clinicIntroTitle,
  );
  const contact = resolveClinicContact(locale, clinic, clinicName);
  const mapsHref = contact.mapsLink || "";
  const displayHours = contact.hours || hours || "";

  return (
    <div className="contact-page">
      <ContactPremiumHero
        locale={locale}
        copy={copy}
        clinic={clinic}
        hours={hours}
      />

      <PublicSection tone="white" className="contact-quick-section">
        <QuickContactActions locale={locale} copy={copy} clinic={clinic} />
      </PublicSection>

      <PublicSection tone="soft" className="contact-main-section">
        <ContactWorkspace
          locale={locale}
          doctors={doctors}
          specialties={specialties}
          services={services}
          clinic={clinic}
          hours={hours}
        />
      </PublicSection>

      {(displayHours || contact.phoneDisplay) && (
        <PublicSection tone="mist" className="contact-hours-section">
          <div className="contact-hours-panel card-surface">
            <p className="section-kicker">{clinicName}</p>
            <h2>{copy.hoursLabel}</h2>
            <p className="pub-lead">{copy.locationLead}</p>
            <div className="contact-hours-grid">
              {displayHours ? (
                <div>
                  <WorkingHours copy={copy} hours={displayHours} />
                </div>
              ) : null}
              {contact.phoneDisplay && contact.phoneTel ? (
                <div>
                  <h3>{copy.phoneNumberLabel}</h3>
                  <a href={contact.phoneTel}>
                    <BidiSafeValue>{contact.phoneDisplay}</BidiSafeValue>
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </PublicSection>
      )}

      <PublicSection tone="white" className="contact-final-cta-section">
        <div className="contact-final-cta">
          <h2>{copy.contactFinalCtaTitle}</h2>
          <p className="pub-lead">{copy.contactFinalCtaLead}</p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#contact-booking-heading">
              {copy.heroBookDoctor}
            </a>
            {mapsHref ? (
              <a
                className="btn btn-outline"
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.heroDirections}
              </a>
            ) : null}
            {contact.phoneTel ? (
              <a className="btn btn-outline" href={contact.phoneTel}>
                {copy.callClinic}
              </a>
            ) : null}
          </div>
        </div>
      </PublicSection>
    </div>
  );
}
