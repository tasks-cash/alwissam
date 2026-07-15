import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "../../../lib/i18n/dictionaries";
import type { Locale } from "../../../lib/i18n/config";
import type { PublicCopy } from "../../../lib/i18n/public-copy";
import type {
  PublicDoctor,
  PublicFaq,
  PublicReview,
  PublicService,
  PublicSpecialty,
  PublicSitePayload,
} from "../../../lib/public-site";
import {
  localizedFaqA,
  localizedFaqQ,
  localizedReviewName,
  localizedReviewQuote,
  localizedServiceDesc,
  localizedServiceName,
} from "../../../lib/public-site";
import { ClinicIntroduction } from "../ClinicIntroduction";
import { ClinicLocation } from "../ClinicLocation";
import { DoctorsSection } from "../DoctorsSection";
import { PatientJourney } from "../PatientJourney";
import { PublicSection } from "../PublicSection";
import { QuickBookPanel } from "../QuickBookPanel";
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
  reviews: PublicReview[];
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
  reviews,
}: HomePageContentProps) {
  const heroLead =
    locale === "ar" ? dict.homeLead : about || dict.homeLead;

  return (
    <>
      <section className="pub-hero">
        <div className="pub-hero-media" aria-hidden>
          <Image
            src="/images/hero-clinic.svg"
            alt=""
            width={1200}
            height={900}
            className="pub-hero-image"
            priority
            unoptimized
            sizes="(max-width: 900px) 100vw, 46vw"
          />
        </div>
        <div className="pub-container pub-hero-inner">
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
        />
      </PublicSection>

      <PublicSection>
        <p className="section-kicker">{copy.sectionWhy}</p>
        <h2>{copy.sectionWhy}</h2>
        <WhyChooseClinic copy={copy} />
      </PublicSection>

      <PublicSection tone="soft">
        <p className="section-kicker">{copy.sectionJourney}</p>
        <h2>{copy.sectionJourney}</h2>
        <PatientJourney locale={locale} copy={copy} />
      </PublicSection>

      <PublicSection>
        <div className="section-head">
          <div>
            <p className="section-kicker">{copy.sectionServices}</p>
            <h2>{copy.sectionServices}</h2>
          </div>
          <Link href={`/${locale}/services`}>{copy.allServices}</Link>
        </div>
        <div className="pub-tile-grid">
          {services.slice(0, 4).map((s) => (
            <Link
              key={s.slug}
              href={`/${locale}/services/${s.slug}`}
              className="pub-tile"
            >
              <h3>{localizedServiceName(locale, s)}</h3>
              <p>{localizedServiceDesc(locale, s)}</p>
            </Link>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="mist">
        <SpecialtiesSection
          locale={locale}
          copy={copy}
          specialties={specialties}
        />
      </PublicSection>

      <PublicSection>
        <DoctorsSection locale={locale} copy={copy} doctors={doctors} limit={3} />
      </PublicSection>

      {reviews.length > 0 ? (
        <PublicSection tone="soft">
          <div className="section-head">
            <div>
              <p className="section-kicker">{copy.reviewsTitle}</p>
              <h2>{copy.reviewsTitle}</h2>
            </div>
            <Link href={`/${locale}/reviews`}>{copy.navReviews}</Link>
          </div>
          <div className="pub-review-grid">
            {reviews.slice(0, 3).map((r, i) => (
              <blockquote key={r.id || i} className="pub-review">
                <p>{localizedReviewQuote(locale, r)}</p>
                <footer>{localizedReviewName(locale, r)}</footer>
              </blockquote>
            ))}
          </div>
        </PublicSection>
      ) : null}

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
          phone={clinic?.phone}
          address={clinic?.address}
          hours={hours}
          mapsEmbedUrl={clinic?.mapsEmbedUrl}
          mapsLink={(clinic as { mapsLink?: string } | undefined)?.mapsLink}
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
            <Link className="btn btn-outline btn-on-green" href={`/${locale}/contact`}>
              {copy.navContact}
            </Link>
          </div>
        </div>
      </PublicSection>
    </>
  );
}
