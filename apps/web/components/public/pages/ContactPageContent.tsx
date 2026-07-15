import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../../lib/i18n/config";
import type { PublicCopy } from "../../../lib/i18n/public-copy";
import type {
  PublicDoctor,
  PublicService,
  PublicSpecialty,
  PublicSitePayload,
} from "../../../lib/public-site";
import { ContactWorkspace } from "../ContactWorkspace";
import { ClinicLocation } from "../ClinicLocation";
import { PageHero } from "../PageHero";
import { PublicSection } from "../PublicSection";

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
  return (
    <>
      <PageHero
        title={copy.contactHeroTitle}
        description={copy.contactHeroLead}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navContact },
        ]}
        tone="mist"
        actions={
          <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
            {copy.navBook}
          </Link>
        }
        media={
          <Image
            src="/images/contact-clinic.svg"
            alt={copy.contactHeroTitle}
            width={1200}
            height={700}
            className="page-hero-image"
            priority
            unoptimized
            sizes="(max-width: 900px) 100vw, 42vw"
          />
        }
      />

      <PublicSection tone="soft">
        <ClinicLocation
          locale={locale}
          copy={copy}
          clinic={clinic}
          hours={hours}
        />
      </PublicSection>

      <PublicSection>
        <ContactWorkspace
          locale={locale}
          doctors={doctors}
          specialties={specialties}
          services={services}
        />
      </PublicSection>
    </>
  );
}
