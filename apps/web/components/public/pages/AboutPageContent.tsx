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
      <PageHero
        title={copy.aboutHeroTitle}
        description={about}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navAbout },
        ]}
        actions={
          <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
            {copy.navBook}
          </Link>
        }
        media={
          <Image
            src="/images/about-team.svg"
            alt={brandName}
            width={1200}
            height={800}
            className="page-hero-image"
            priority
            unoptimized
            sizes="(max-width: 900px) 100vw, 42vw"
          />
        }
      />

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
              className="clinic-photo"
              unoptimized
            />
          </div>
        </div>
      </PublicSection>

      {(mission || copy.visionBody) && (
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
      )}

      <PublicSection>
        <p className="section-kicker">{copy.valuesTitle}</p>
        <h2>{copy.valuesTitle}</h2>
        <div className="why-grid">
          {copy.values.map((v) => (
            <article key={v.title} className="why-card">
              <h3>{v.title}</h3>
              <p>{v.description}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection tone="mist">
        <h2>{copy.careApproach}</h2>
        <p className="pub-lead">{copy.careApproachBody}</p>
      </PublicSection>

      <PublicSection>
        <DoctorsSection locale={locale} copy={copy} doctors={doctors} limit={3} />
      </PublicSection>

      <PublicSection tone="soft">
        <SpecialtiesSection
          locale={locale}
          copy={copy}
          specialties={specialties}
        />
      </PublicSection>

      <PublicSection>
        <p className="section-kicker">{copy.sectionWhy}</p>
        <h2>{copy.sectionWhy}</h2>
        <WhyChooseClinic copy={copy} />
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
    </>
  );
}
