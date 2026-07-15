import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicChrome } from "../../../../components/public/PublicChrome";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getDictionary } from "../../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../../lib/i18n/public-copy";
import {
  fetchPublicDoctors,
  fetchPublicSite,
  localizedClinicName,
  localizedDoctorSpecialty,
  localizedSpecialtyDesc,
  localizedSpecialtyName,
} from "../../../../lib/public-site";

export default async function SpecialtyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const site = await fetchPublicSite();
  const specialty = (site.content?.specialties || []).find((s) => s.slug === slug);
  if (!specialty) notFound();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const doctors = await fetchPublicDoctors({
    specialty: specialty.nameEn || specialty.nameAr,
  });

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={name}
      phone={site.clinic?.phone}
      email={site.clinic?.email}
      address={site.clinic?.address}
    >
      <section className="public-section">
        <p className="eyebrow">{copy.navSpecialties}</p>
        <h1>{localizedSpecialtyName(locale, specialty)}</h1>
        <p className="lead">{localizedSpecialtyDesc(locale, specialty)}</p>
        <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
          {copy.relatedCta}
        </Link>
      </section>
      <section className="public-section">
        <h2>{copy.sectionDoctors}</h2>
        {doctors.length === 0 ? (
          <p className="muted">{copy.emptyDoctors}</p>
        ) : (
          <div className="public-grid">
            {doctors.map((d) => (
              <article key={d.id} className="public-card">
                <h3>{d.fullName}</h3>
                <p>{localizedDoctorSpecialty(locale, d)}</p>
                <Link href={`/${locale}/doctors/${d.id}`}>{copy.viewProfile}</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </PublicChrome>
  );
}
