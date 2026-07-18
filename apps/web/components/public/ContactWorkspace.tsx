"use client";

import { AppointmentWizard } from "./AppointmentWizard";
import { ProfessionalInquiryForm } from "./ContactForm";
import { ClinicAddressCard } from "./ClinicAddressCard";
import { ContactInformationCards } from "./ContactInformationCards";
import type { Locale } from "../../lib/i18n/config";
import { getPublicCopy } from "../../lib/i18n/public-copy";
import type {
  PublicDoctor,
  PublicService,
  PublicSpecialty,
} from "../../lib/public-site";
import {
  localizedServiceName,
  localizedSpecialtyName,
  pickLocalized,
} from "../../lib/public-site";
import type { ClinicContact } from "../../lib/clinic-contact";

type Props = {
  locale: Locale;
  doctors: PublicDoctor[];
  specialties: PublicSpecialty[];
  services: PublicService[];
  clinic?: ClinicContact | null;
  hours?: string;
};

export function ContactWorkspace({
  locale,
  doctors,
  specialties,
  services,
  clinic,
  hours,
}: Props) {
  const copy = getPublicCopy(locale);
  const inquiryTitle = pickLocalized(
    locale,
    clinic?.inquirySectionTitleAr,
    clinic?.inquirySectionTitleEn,
    clinic?.inquirySectionTitleFr,
    copy.contactFormTitle,
  );
  const inquiryLead = pickLocalized(
    locale,
    clinic?.inquirySectionDescriptionAr,
    clinic?.inquirySectionDescriptionEn,
    clinic?.inquirySectionDescriptionFr,
    copy.inquiryFormLead,
  );

  return (
    <div className="contact-workspace contact-workspace-premium">
      <div className="contact-main-columns">
        <section
          className="contact-inquiry-block"
          aria-labelledby="contact-inquiry-form-heading"
        >
          <ProfessionalInquiryForm
            locale={locale}
            title={inquiryTitle}
            lead={inquiryLead}
            doctors={doctors
              .filter((d) => d.id)
              .map((d) => ({
                id: String(d.id),
                label: d.fullName || String(d.id),
              }))}
            specialties={specialties
              .filter((s) => s.id)
              .map((s) => ({
                id: String(s.id),
                label: localizedSpecialtyName(locale, s),
              }))}
            services={services
              .filter((s) => s.id)
              .map((s) => ({
                id: String(s.id),
                label: localizedServiceName(locale, s),
              }))}
          />
          <ClinicAddressCard
            locale={locale}
            copy={copy}
            clinic={clinic}
            hours={hours}
          />
        </section>

        <section
          className="contact-side-panel"
          aria-labelledby="contact-info-panel-title"
        >
          <ContactInformationCards
            locale={locale}
            copy={copy}
            clinic={clinic}
            hours={hours}
          />
        </section>
      </div>

      <section
        className="contact-booking-block card-surface"
        aria-labelledby="contact-booking-heading"
      >
        <p className="section-kicker">{copy.tabBookDoctor}</p>
        <h2 id="contact-booking-heading">{copy.tabBookDoctor}</h2>
        <p className="pub-lead">{copy.contactBookingLead}</p>
        {doctors.length === 0 ? (
          <div className="empty-state" role="status">
            <p>{copy.noBookableDoctors}</p>
            <div className="cta-row">
              {clinic?.phone || clinic?.phoneInternational ? (
                <a
                  className="btn btn-outline"
                  href={
                    clinic.telephoneUrl ||
                    `tel:${String(clinic.phoneInternational || clinic.phone || "").replace(/\s/g, "")}`
                  }
                >
                  {copy.callClinic}
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <AppointmentWizard
            locale={locale}
            doctors={doctors}
            specialties={specialties}
            services={services}
          />
        )}
      </section>
    </div>
  );
}
