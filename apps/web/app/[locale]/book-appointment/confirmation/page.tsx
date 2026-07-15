import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "../../../../components/public/PageHero";
import { PublicChrome } from "../../../../components/public/PublicChrome";
import { PublicSection } from "../../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getDictionary } from "../../../../lib/i18n/dictionaries";
import { getPublicCopy, reasonLabel } from "../../../../lib/i18n/public-copy";
import { contextualWhatsAppMessage } from "../../../../lib/clinic-contact";
import {
  fetchPublicAppointmentRef,
  fetchPublicSite,
  localizedClinicName,
  localizedWorkingHours,
} from "../../../../lib/public-site";

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale: raw } = await params;
  const { ref } = await searchParams;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const site = await fetchPublicSite();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const request = ref ? await fetchPublicAppointmentRef(ref) : null;
  const publicReference = String(request?.requestNumber || ref || "").trim();
  const pendingAssignment = request?.status === "pending_reception_assignment";

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
      whatsappMessage={
        publicReference
          ? contextualWhatsAppMessage(locale, {
              kind: "confirmation",
              publicReference,
            })
          : contextualWhatsAppMessage(locale, { kind: "booking" })
      }
    >
      <PageHero
        title={
          pendingAssignment
            ? copy.confirmationPendingAssignment
            : copy.confirmationTitle
        }
        description={
          pendingAssignment
            ? copy.confirmationPendingAssignmentLead
            : copy.confirmationLead
        }
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { href: `/${locale}/book-appointment`, label: copy.navBook },
          { label: copy.confirmationTitle },
        ]}
        tone="soft"
      />
      <PublicSection>
        <div className="confirmation-card card-surface">
          <p className="section-kicker" aria-hidden>
            ✓
          </p>
          <h2>
            {pendingAssignment
              ? copy.confirmationPendingAssignment
              : copy.confirmationTitle}
          </h2>
          <p className="pub-lead">
            {pendingAssignment
              ? copy.confirmationPendingAssignmentLead
              : copy.confirmationLead}
          </p>
          {(request?.requestNumber || ref) ? (
            <p className="confirmation-ref" dir="ltr">
              <span>{copy.queueLabel}</span>
              <strong>{request?.requestNumber || ref}</strong>
            </p>
          ) : null}
          {request ? (
            <ul className="contact-list" style={{ textAlign: "start" }}>
              {request.fullName ? (
                <li>
                  {dict.fullName}: {request.fullName}
                </li>
              ) : null}
              {request.appointmentType ? (
                <li>
                  {copy.visitReason}:{" "}
                  {reasonLabel(locale, request.appointmentType)}
                </li>
              ) : null}
              {request.preferredDate ? (
                <li>
                  {copy.preferredDate}:{" "}
                  <span dir="ltr">{request.preferredDate}</span>
                </li>
              ) : null}
              {request.preferredTime ? (
                <li>
                  {copy.preferredTime}:{" "}
                  <span dir="ltr">{request.preferredTime}</span>
                </li>
              ) : null}
              {site.clinic?.address ? (
                <li>
                  {copy.navContact}: {site.clinic.address}
                </li>
              ) : null}
              {site.clinic?.phone ? (
                <li dir="ltr">{site.clinic.phone}</li>
              ) : null}
            </ul>
          ) : null}
          <div className="cta-row">
            <Link className="btn btn-primary" href={`/${locale}/patient/register`}>
              {copy.patientAccountRegister}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/patient/login`}>
              {copy.patientAccountLogin}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}`}>
              {copy.backHome}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/contact`}>
              {copy.navContact}
            </Link>
          </div>
          <p className="muted" style={{ marginBlockStart: "1rem" }}>
            {locale === "en"
              ? "Create an account now to track this booking request, keep visit records, and review doctor instructions when shared."
              : locale === "fr"
                ? "Créez un compte maintenant pour suivre cette demande, conserver vos visites et consulter les consignes du médecin lorsqu’elles sont partagées."
                : "أنشئ حسابًا الآن لتتمكن من متابعة حالة طلب الحجز والاحتفاظ بسجل زياراتك وتعليمات الطبيب."}
          </p>
        </div>
      </PublicSection>
    </PublicChrome>
  );
}
