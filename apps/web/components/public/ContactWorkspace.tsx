"use client";

import { useState } from "react";
import { AppointmentWizard } from "./AppointmentWizard";
import { ContactForm } from "./ContactForm";
import type { Locale } from "../../lib/i18n/config";
import { getPublicCopy } from "../../lib/i18n/public-copy";
import type {
  PublicDoctor,
  PublicService,
  PublicSpecialty,
} from "../../lib/public-site";

type Props = {
  locale: Locale;
  doctors: PublicDoctor[];
  specialties: PublicSpecialty[];
  services: PublicService[];
};

export function ContactWorkspace({
  locale,
  doctors,
  specialties,
  services,
}: Props) {
  const copy = getPublicCopy(locale);
  const [tab, setTab] = useState<"inquiry" | "book">("inquiry");

  return (
    <div className="contact-workspace">
      <div
        className="contact-tabs"
        role="tablist"
        aria-label={copy.navContact}
      >
        <button
          type="button"
          role="tab"
          id="tab-inquiry"
          aria-selected={tab === "inquiry"}
          aria-controls="panel-inquiry"
          className={tab === "inquiry" ? "contact-tab active" : "contact-tab"}
          onClick={() => setTab("inquiry")}
        >
          {copy.tabInquiry}
        </button>
        <button
          type="button"
          role="tab"
          id="tab-book"
          aria-selected={tab === "book"}
          aria-controls="panel-book"
          className={tab === "book" ? "contact-tab active" : "contact-tab"}
          onClick={() => setTab("book")}
        >
          {copy.tabBookDoctor}
        </button>
      </div>

      {tab === "inquiry" ? (
        <div
          role="tabpanel"
          id="panel-inquiry"
          aria-labelledby="tab-inquiry"
          className="contact-panel"
        >
          <ContactForm locale={locale} />
        </div>
      ) : (
        <div
          role="tabpanel"
          id="panel-book"
          aria-labelledby="tab-book"
          className="contact-panel card-surface"
        >
          <AppointmentWizard
            locale={locale}
            doctors={doctors}
            specialties={specialties}
            services={services}
          />
        </div>
      )}
    </div>
  );
}
