import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  fetchPublicDoctors,
  fetchPublicSite,
  localizedClinicName,
  localizedDoctorAvailability,
  localizedDoctorBio,
  localizedDoctorSpecialty,
  localizedWorkingHours,
} from "../../../lib/public-site";

export default async function DoctorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; specialty?: string }>;
}) {
  const { locale: raw } = await params;
  const { q, specialty } = await searchParams;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const site = await fetchPublicSite();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const doctorsRaw = await fetchPublicDoctors({ q, specialty });
  const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : [];
  const specialties = Array.isArray(site.content?.specialties)
    ? site.content.specialties
    : [];

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={name}
      clinic={site.clinic}
      phone={site.clinic?.phone}
      email={site.clinic?.email}
      address={site.clinic?.address}
      hours={hours}
    >
      <PageHero
        title={copy.sectionDoctors}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navDoctors },
        ]}
      />
      <PublicSection>
        <form className="toolbar" method="get">
          <input
            className="input"
            name="q"
            defaultValue={q || ""}
            placeholder={copy.searchPlaceholder}
            style={{ maxWidth: 280 }}
          />
          <select
            className="input"
            name="specialty"
            defaultValue={specialty || ""}
            style={{ maxWidth: 240 }}
            aria-label={copy.sectionSpecialties}
          >
            <option value="">{copy.sectionSpecialties}</option>
            {specialties.map((s) => (
              <option key={s.slug} value={localizedSpecialtyFallback(s)}>
                {locale === "en"
                  ? s.nameEn || s.nameAr
                  : locale === "fr"
                    ? s.nameFr || s.nameEn || s.nameAr
                    : s.nameAr || s.nameEn}
              </option>
            ))}
          </select>
          <button className="btn btn-outline" type="submit">
            {dict.search}
          </button>
        </form>
        {doctors.length === 0 ? (
          <p className="muted">{copy.emptyDoctors}</p>
        ) : (
          <div className="pub-doctor-grid" style={{ marginTop: "1.25rem" }}>
            {doctors.map((d) => {
              const availability = localizedDoctorAvailability(locale, d);
              return (
                <article key={d.id} className="pub-doctor">
                  <div className="doctor-avatar" aria-hidden>
                    {d.fullName.slice(0, 1)}
                  </div>
                  <div>
                    <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.15rem" }}>
                      {d.fullName}
                    </h2>
                    <p>{localizedDoctorSpecialty(locale, d)}</p>
                    <p className="muted">{localizedDoctorBio(locale, d)}</p>
                    {availability ? (
                      <p className="pub-availability">
                        {copy.availabilityLabel}: {availability}
                      </p>
                    ) : null}
                    <div className="cta-row">
                      <Link href={`/${locale}/doctors/${d.id}`}>
                        {copy.viewProfile}
                      </Link>
                      <Link
                        className="btn btn-primary"
                        href={`/${locale}/book-appointment?doctor=${d.id}`}
                      >
                        {copy.bookWithDoctor}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PublicSection>
    </PublicChrome>
  );
}

function localizedSpecialtyFallback(s: {
  nameAr?: string;
  nameEn?: string;
  nameFr?: string;
}) {
  return s.nameAr || s.nameEn || s.nameFr || "";
}
