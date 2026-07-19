import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../../lib/i18n/config";
import type { PublicCopy } from "../../../lib/i18n/public-copy";
import type {
  PublicDoctor,
  PublicSpecialty,
  PublicSitePayload,
} from "../../../lib/public-site";
import { PageHero } from "../PageHero";
import { PublicSection } from "../PublicSection";
import { ClinicLocation } from "../ClinicLocation";
import { DoctorsSection } from "../DoctorsSection";
import { SpecialtiesSection } from "../SpecialtiesSection";
import { WhyChooseClinic } from "../WhyChooseClinic";
import { SectionReveal } from "../motion/SectionReveal";

export type AboutPageContentProps = {
  locale: Locale;
  copy: PublicCopy;
  brandName: string;
  about: string;
  mission: string;
  hours: string;
  clinic?: PublicSitePayload["clinic"];
  doctors: PublicDoctor[];
  specialties: PublicSpecialty[];
};

export function AboutPageContent({
  locale,
  copy,
  brandName,
  about,
  mission,
  hours,
  clinic,
  doctors,
  specialties,
}: AboutPageContentProps) {
  return (
    <>
      <SectionReveal from="up">
        <PageHero
          title={copy.aboutHeroTitle}
          description={copy.aboutHeroDescription || about}
          crumbs={[
            { href: `/${locale}`, label: copy.navHome },
            { label: copy.navAbout },
          ]}
          actions={
            <Link
              className="btn btn-primary"
              href={`/${locale}/book-appointment`}
            >
              {copy.navBook}
            </Link>
          }
          media={
            <Image
              src="/images/about-team.svg"
              alt={brandName}
              width={1200}
              height={900}
              className="page-hero-image no-rtl-flip"
              priority
              sizes="(max-width: 900px) 100vw, 42vw"
              unoptimized
            />
          }
        />
      </SectionReveal>

      <SectionReveal from="start">
        <PublicSection>
          <div className="clinic-intro-grid">
            <div>
              <p className="section-kicker">{copy.clinicIntroTitle}</p>
              <h2>{copy.clinicIntroTitle}</h2>
              <p className="pub-lead">{about}</p>
            </div>
            <div className="clinic-intro-media">
              <Image
                src="/images/hero-clinic.svg"
                alt={brandName}
                width={1200}
                height={900}
                sizes="(max-width: 768px) 100vw, 48vw"
                className="clinic-photo no-rtl-flip"
                unoptimized
              />
            </div>
          </div>
        </PublicSection>
      </SectionReveal>

      {(mission || copy.visionBody) && (
        <SectionReveal from="up">
          <PublicSection tone="soft">
            <div className="mission-vision-grid">
              {mission ? (
                <article className="card-surface">
                  <h2>{copy.mission}</h2>
                  <p className="pub-lead">{mission}</p>
                </article>
              ) : null}
              <article className="card-surface">
                <h2>{copy.vision}</h2>
                <p className="pub-lead">{copy.visionBody}</p>
              </article>
            </div>
          </PublicSection>
        </SectionReveal>
      )}

      <SectionReveal from="up" delayMs={40}>
        <PublicSection>
          <p className="section-kicker">{copy.valuesTitle}</p>
          <h2>{copy.valuesTitle}</h2>
          <div className="why-grid">
            {copy.values.map((v, i) => (
              <article
                key={v.title}
                className="why-card"
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </article>
            ))}
          </div>
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="start">
        <PublicSection tone="mist">
          <h2>{copy.careApproach}</h2>
          <p className="pub-lead">{copy.careApproachBody}</p>
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="up">
        <PublicSection>
          <DoctorsSection
            locale={locale}
            copy={copy}
            doctors={doctors}
            limit={3}
          />
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="end">
        <PublicSection tone="soft">
          <SpecialtiesSection
            locale={locale}
            copy={copy}
            specialties={specialties}
          />
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="up">
        <PublicSection>
          <p className="section-kicker">{copy.sectionWhy}</p>
          <h2>{copy.sectionWhy}</h2>
          <WhyChooseClinic copy={copy} />
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="start">
        <PublicSection tone="mist">
          <ClinicLocation
            locale={locale}
            copy={copy}
            clinic={clinic}
            hours={hours}
          />
        </PublicSection>
      </SectionReveal>

      <SectionReveal from="up">
        <PublicSection tone="green">
          <div className="pub-cta-band">
            <div>
              <h2>{copy.navBook}</h2>
              <p>{about.slice(0, 120)}</p>
            </div>
            <Link
              className="btn btn-primary btn-on-green"
              href={`/${locale}/book-appointment`}
            >
              {copy.navBook}
            </Link>
          </div>
        </PublicSection>
      </SectionReveal>
    </>
  );
}
