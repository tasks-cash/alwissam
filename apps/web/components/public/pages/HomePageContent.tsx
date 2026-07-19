import Link from "next/link";
import type { Dictionary } from "../../../lib/i18n/dictionaries";
import type { Locale } from "../../../lib/i18n/config";
import type { PublicCopy } from "../../../lib/i18n/public-copy";
import type {
  PublicBeforeAfterCase,
  PublicDoctor,
  PublicFaq,
  PublicHomepageSections,
  PublicPatientExperience,
  PublicReview,
  PublicService,
  PublicSpecialty,
  PublicSitePayload,
} from "../../../lib/public-site";
import {
  localizedFaqA,
  localizedFaqQ,
  pickLocalized,
} from "../../../lib/public-site";
import { BeforeAfterSlider } from "../BeforeAfterSlider";
import { BookingConvenience } from "../BookingConvenience";
import { PatientAccountMotivation } from "../PatientAccountMotivation";
import { ClinicIntroduction } from "../ClinicIntroduction";
import { HomeLocationContact } from "../HomeLocationContact";
import { DoctorsSection } from "../DoctorsSection";
import { HeroFlowComposition } from "../HeroFlowComposition";
import { PatientExperiencesSlider } from "../PatientExperiencesSlider";
import { PatientJourney } from "../PatientJourney";
import { PubBookingCta } from "../PubBookingCta";
import { PublicSection } from "../PublicSection";
import { QuickBookPanel } from "../QuickBookPanel";
import { DentalServicesSection } from "../DentalServicesSection";
import { SpecialtiesSection } from "../SpecialtiesSection";
import { WhyChooseClinic } from "../WhyChooseClinic";
import { SectionReveal } from "../motion/SectionReveal";
import { ReviewsSlider } from "../ReviewsSlider";

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
  reviews: PublicReview[];
  homepageSections?: PublicHomepageSections | null;
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
  reviews,
  homepageSections,
}: HomePageContentProps) {
  const heroLead = locale === "ar" ? dict.homeLead : about || dict.homeLead;
  const specialtiesSection = homepageSections?.specialties;
  const servicesSection = homepageSections?.services;
  const doctorsSection = homepageSections?.doctors;
  const reviewsSection = homepageSections?.reviews;
  const doctorsTitle =
    pickLocalized(
      locale,
      doctorsSection?.titleAr,
      doctorsSection?.titleEn,
      doctorsSection?.titleFr,
    ) || copy.sectionDoctors;
  const reviewsTitle =
    pickLocalized(
      locale,
      reviewsSection?.titleAr,
      reviewsSection?.titleEn,
      reviewsSection?.titleFr,
    ) || copy.navReviews;
  const reviewsLead =
    pickLocalized(
      locale,
      reviewsSection?.descriptionAr,
      reviewsSection?.descriptionEn,
      reviewsSection?.descriptionFr,
    ) || copy.reviewsLead;

  return (
    <>
      <SectionReveal from="up">
        <section className="pub-hero pub-hero--cinematic">
          <div className="pub-hero-wash" aria-hidden />
          <div className="pub-container pub-hero-inner pub-hero-inner--split">
            <div className="pub-hero-copy pub-hero-copy--animated">
              <p className="pub-specialty-chip">{copy.heroEyebrow}</p>
              <p className="pub-brand-display">{brandName}</p>
              <h1>{dict.homeTitle}</h1>
              <p className="pub-lead">{heroLead}</p>
              <ul className="hero-trust-list" aria-label={copy.heroEyebrow}>
                <li>{copy.heroTrustHome}</li>
                <li>{copy.heroTrustDoctor}</li>
                <li>{copy.heroTrustFollowUp}</li>
              </ul>
              <div className="cta-row">
                <Link
                  className="btn btn-primary btn-lg"
                  href={`/${locale}/book-appointment`}
                >
                  {copy.navBook}
                </Link>
                <Link
                  className="btn btn-outline btn-lg"
                  href={`/${locale}/doctors`}
                >
                  {copy.heroCtaDoctors}
                </Link>
              </div>
            </div>
            <HeroFlowComposition
              locale={locale}
              caption={copy.heroVisualCaption}
              overlayMain={copy.heroOverlayMain}
              overlayAccent={copy.heroOverlayAccent}
              overlayBadge={copy.heroOverlayBadge}
            />
          </div>
        </section>
      </SectionReveal>

      <SectionReveal from="up" delayMs={40}>
        <PublicSection tone="white">
          <QuickBookPanel
            locale={locale}
            doctors={doctors}
            specialties={specialties}
          />
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="start">
        <PublicSection tone="mist">
          <ClinicIntroduction
            locale={locale}
            copy={copy}
            body={about || dict.homeLead}
            imageAlt={copy.heroVisualCaption}
            hours={hours}
          />
        </PublicSection>
      </SectionReveal>

      {specialtiesSection !== null ? (
        <SectionReveal from="up">
          <PublicSection tone="mist">
            <SpecialtiesSection
              locale={locale}
              copy={copy}
              specialties={specialties}
              section={specialtiesSection}
            />
          </PublicSection>
        </SectionReveal>
      ) : null}

      {servicesSection !== null ? (
        <SectionReveal from="up">
          <PublicSection tone="soft" className="dental-services-section">
            <DentalServicesSection
              locale={locale}
              copy={copy}
              services={services}
              section={servicesSection}
            />
          </PublicSection>
        </SectionReveal>
      ) : null}

      <SectionReveal from="end">
        <BookingConvenience locale={locale} copy={copy} />
      </SectionReveal>

      {doctorsSection !== null ? (
        <SectionReveal from="up">
          <PublicSection className="home-doctors-section">
            <DoctorsSection
              locale={locale}
              copy={{
                ...copy,
                sectionDoctors: doctorsTitle,
                homeDoctorsLead:
                  pickLocalized(
                    locale,
                    doctorsSection?.descriptionAr,
                    doctorsSection?.descriptionEn,
                    doctorsSection?.descriptionFr,
                  ) || copy.homeDoctorsLead,
              }}
              doctors={doctors}
              limit={3}
              homeVariant
            />
          </PublicSection>
        </SectionReveal>
      ) : null}

      {reviewsSection !== null ? (
        <SectionReveal from="up">
          <PublicSection tone="mist" className="home-reviews-section">
            <div className="section-head">
              <div>
                <p className="section-kicker">
                  {pickLocalized(
                    locale,
                    reviewsSection?.badgeAr,
                    reviewsSection?.badgeEn,
                    reviewsSection?.badgeFr,
                  ) || copy.navReviews}
                </p>
                <h2>{reviewsTitle}</h2>
                <p className="pub-lead pe-lead">{reviewsLead}</p>
              </div>
              <Link href={`/${locale}/reviews`}>
                {pickLocalized(
                  locale,
                  reviewsSection?.ctaLabelAr,
                  reviewsSection?.ctaLabelEn,
                  reviewsSection?.ctaLabelFr,
                ) || copy.navReviews}
              </Link>
            </div>
            <ReviewsSlider
              locale={locale}
              reviews={reviews}
              anonymousLabel={copy.reviewsAnonymous}
              verifiedLabel={copy.reviewsVerifiedBadge}
              readMoreLabel={copy.reviewsReadMore}
              readLessLabel={copy.reviewsReadLess}
              emptyLabel={
                locale === "en"
                  ? "No published reviews are available right now."
                  : locale === "fr"
                    ? "Aucun avis publié pour le moment."
                    : "لا توجد تقييمات منشورة حاليًا."
              }
            />
          </PublicSection>
        </SectionReveal>
      ) : null}

      <SectionReveal from="up">
        <PublicSection tone="soft">
          <p className="section-kicker">{copy.sectionWhy}</p>
          <h2>{copy.sectionWhy}</h2>
          <WhyChooseClinic copy={copy} />
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="start">
        <PublicSection>
          <p className="section-kicker">{copy.sectionJourney}</p>
          <h2>{copy.sectionJourney}</h2>
          <PatientJourney locale={locale} copy={copy} />
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="up">
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
      </SectionReveal>

      <SectionReveal from="up">
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
      </SectionReveal>

      <SectionReveal from="end">
        <PatientAccountMotivation locale={locale} copy={copy} />
      </SectionReveal>

      <SectionReveal from="up">
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
      </SectionReveal>

      <SectionReveal from="start">
        <PublicSection tone="mist">
          <HomeLocationContact
            locale={locale}
            copy={copy}
            clinic={clinic}
            hours={hours}
          />
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="up">
        <PublicSection tone="green">
          <PubBookingCta
            locale={locale}
            copy={copy}
            clinic={clinic}
            hours={hours}
            brandName={brandName}
          />
        </PublicSection>
      </SectionReveal>
    </>
  );
}
