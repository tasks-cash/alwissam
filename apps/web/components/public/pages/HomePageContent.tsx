import Link from "next/link";
import type { Dictionary } from "../../../lib/i18n/dictionaries";
import type { Locale } from "../../../lib/i18n/config";
import type { PublicCopy } from "../../../lib/i18n/public-copy";
import type {
  PublicBeforeAfterCase,
  PublicDoctor,
  PublicFaq,
  PublicPatientExperience,
  PublicService,
  PublicSpecialty,
  PublicSitePayload,
} from "../../../lib/public-site";
import { localizedFaqA, localizedFaqQ } from "../../../lib/public-site";
import { BeforeAfterSlider } from "../BeforeAfterSlider";
import { BookingConvenience } from "../BookingConvenience";
import { PatientAccountMotivation } from "../PatientAccountMotivation";
import { ClinicIntroduction } from "../ClinicIntroduction";
import { ClinicLocation } from "../ClinicLocation";
import { DoctorsSection } from "../DoctorsSection";
import { HeroFlowComposition } from "../HeroFlowComposition";
import { PatientExperiencesSlider } from "../PatientExperiencesSlider";
import { PatientJourney } from "../PatientJourney";
import { PublicSection } from "../PublicSection";
import { QuickBookPanel } from "../QuickBookPanel";
import { DentalServicesSection } from "../DentalServicesSection";
import { SpecialtiesSection } from "../SpecialtiesSection";
import { WhyChooseClinic } from "../WhyChooseClinic";

export type HomePageContentProps = {
  locale: Locale;
  dict: Dictionary;
  copy: PublicCopy;
  brandName: string;
  about: string;
  hours: string;
  clinic?: PublicSitePayload["clinic"];
  doctors: PublicDoctor[];
  specialties: PublicSpecialty[];
  services: PublicService[];
  faqs: PublicFaq[];
  experiences: PublicPatientExperience[];
  beforeAfterCases: PublicBeforeAfterCase[];
};

export function HomePageContent({
  locale,
  dict,
  copy,
  brandName,
  about,
  hours,
  clinic,
  doctors,
  specialties,
  services,
  faqs,
  experiences,
  beforeAfterCases,
}: HomePageContentProps) {
  const heroLead =
    locale === "ar" ? dict.homeLead : about || dict.homeLead;
  const trustBadge =
    locale === "ar"
      ? "رعاية منظمة"
      : locale === "fr"
        ? "Soins organisés"
        : "Organized care";
  const bookBadge =
    locale === "ar"
      ? "حجز عبر الإنترنت"
      : locale === "fr"
        ? "Réservation en ligne"
        : "Online booking";

  return (
    <>
      <section className="pub-hero pub-hero--flow">
        <div className="pub-container pub-hero-inner pub-hero-inner--split">
          <div className="pub-hero-copy">
            <p className="pub-brand-display">{brandName}</p>
            <h1>{dict.homeTitle}</h1>
            <p className="pub-lead">{heroLead}</p>
            <div className="cta-row">
              <Link
                className="btn btn-primary"
                href={`/${locale}/book-appointment`}
              >
                {copy.navBook}
              </Link>
              <Link className="btn btn-outline" href={`/${locale}/doctors`}>
                {copy.heroCtaDoctors}
              </Link>
            </div>
          </div>
          <HeroFlowComposition
            locale={locale}
            caption={copy.heroVisualCaption}
            badgePrimary={trustBadge}
            badgeSecondary={bookBadge}
          />
        </div>
      </section>

      <PublicSection tone="white">
        <QuickBookPanel
          locale={locale}
          doctors={doctors}
          specialties={specialties}
        />
      </PublicSection>

      <PublicSection tone="mist">
        <ClinicIntroduction
          locale={locale}
          copy={copy}
          body={about || dict.homeLead}
          imageAlt={copy.heroVisualCaption}
          hours={hours}
        />
      </PublicSection>

      <PublicSection tone="mist">
        <SpecialtiesSection
          locale={locale}
          copy={copy}
          specialties={specialties.slice(0, 6)}
        />
      </PublicSection>

      <PublicSection tone="soft" className="dental-services-section">
        <DentalServicesSection
          locale={locale}
          copy={copy}
          services={services.slice(0, 8)}
        />
      </PublicSection>

      <BookingConvenience locale={locale} copy={copy} />

      <PublicSection>
        <DoctorsSection locale={locale} copy={copy} doctors={doctors} limit={3} />
      </PublicSection>

      <PublicSection tone="soft">
        <p className="section-kicker">{copy.sectionWhy}</p>
        <h2>{copy.sectionWhy}</h2>
        <WhyChooseClinic copy={copy} />
      </PublicSection>

      <PublicSection>
        <p className="section-kicker">{copy.sectionJourney}</p>
        <h2>{copy.sectionJourney}</h2>
        <PatientJourney locale={locale} copy={copy} />
      </PublicSection>

      <PublicSection tone="mist" className="ba-section">
        <div className="section-head">
          <div>
            <p className="section-kicker">{copy.beforeAfterTitle}</p>
            <h2>{copy.beforeAfterTitle}</h2>
            <p className="pub-lead pe-lead">{copy.beforeAfterLead}</p>
          </div>
        </div>
        <BeforeAfterSlider
          locale={locale}
          copy={copy}
          cases={beforeAfterCases}
        />
        <p className="ba-disclaimer">{copy.beforeAfterDisclaimer}</p>
        <p className="ba-publication-note">{copy.beforeAfterPublicationNote}</p>
      </PublicSection>

      <PublicSection tone="soft" className="pe-section">
        <div className="section-head">
          <div>
            <p className="section-kicker">{copy.experiencesTitle}</p>
            <h2>{copy.experiencesTitle}</h2>
            <p className="pub-lead pe-lead">{copy.experiencesLead}</p>
          </div>
        </div>
        <PatientExperiencesSlider
          locale={locale}
          copy={copy}
          experiences={experiences}
        />
      </PublicSection>

      <PatientAccountMotivation locale={locale} copy={copy} />

      <PublicSection>
        <div className="section-head">
          <div>
            <p className="section-kicker">{copy.sectionFaq}</p>
            <h2>{copy.sectionFaq}</h2>
          </div>
          <Link href={`/${locale}/faq`}>{copy.navFaq}</Link>
        </div>
        {faqs.length === 0 ? (
          <p className="muted empty-state">{copy.emptyFaq}</p>
        ) : (
          <div className="pub-faq-preview">
            {faqs.slice(0, 6).map((f, i) => (
              <details key={i} className="pub-faq-item">
                <summary>{localizedFaqQ(locale, f)}</summary>
                <p>{localizedFaqA(locale, f)}</p>
              </details>
            ))}
          </div>
        )}
      </PublicSection>

      <PublicSection tone="mist">
        <ClinicLocation
          locale={locale}
          copy={copy}
          clinic={clinic}
          hours={hours}
        />
      </PublicSection>

      <PublicSection tone="green">
        <div className="pub-cta-band">
          <div>
            <h2>{copy.navBook}</h2>
            <p>
              {[hours?.split("\n")[0], clinic?.phone, clinic?.address]
                .filter(Boolean)
                .join(" · ") || dict.footerRights}
            </p>
          </div>
          <div className="cta-row">
            <Link
              className="btn btn-primary btn-on-green"
              href={`/${locale}/book-appointment`}
            >
              {copy.navBook}
            </Link>
            <Link
              className="btn btn-outline btn-on-green"
              href={`/${locale}/contact`}
            >
              {copy.navContact}
            </Link>
          </div>
        </div>
      </PublicSection>
    </>
  );
}
