"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  EmptyState,
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";
import { apiPost } from "../../../../lib/api";
import { getPublicCopy } from "../../../../lib/i18n/public-copy";
import type { Locale } from "../../../../lib/i18n/config";

type HelpSummary = {
  ok: boolean;
  routes: {
    support: string;
    booking: string;
    contact: string;
    messages: string;
  };
  clinic: {
    phoneTel: string;
    whatsappUrl: string;
  };
  supportAvailable: boolean;
  messagingDisclaimer: string;
  emergencyWarning: string;
  hasEligibleVisits: boolean;
  eligibleAppointments: Array<{
    reference: string;
    completedAt?: string;
    service?: string;
    specialty?: string;
    doctor: {
      id: string;
      fullName: string;
      imageUrl?: string | null;
    };
    thread: {
      id: string;
      status: string;
      patientUnreadCount: number;
    } | null;
    action: "start" | "open" | "view";
  }>;
};

function DoctorAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="patient-help-avatar"
        src={imageUrl}
        alt=""
        width={56}
        height={56}
      />
    );
  }
  const initial = (name || "ط").trim().charAt(0);
  return (
    <span className="patient-help-avatar patient-help-avatar--fallback" aria-hidden>
      {initial}
    </span>
  );
}

function formatVisitDate(value: string | undefined, locale: Locale) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-FR" : "en-GB",
      { dateStyle: "medium", timeStyle: "short" },
    ).format(new Date(value));
  } catch {
    return value;
  }
}

function serviceLabel(code: string | undefined, locale: Locale) {
  if (!code) return "—";
  const copy = getPublicCopy(locale);
  return copy.reasons[code] || code;
}

function Body() {
  const { locale, reloadKey } = usePatientPortal();
  const router = useRouter();
  const { data, error, loading, reload } = usePatientFetch<HelpSummary>(
    "/api/patient/help",
    reloadKey,
  );
  const [openingRef, setOpeningRef] = useState<string | null>(null);
  const [threadError, setThreadError] = useState("");

  if (loading) {
    return (
      <div className="patient-help" aria-busy="true">
        <p className="muted">جارٍ تحميل خيارات المساعدة...</p>
        <SkeletonBlock />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="patient-help">
        <ErrorRetry
          message="تعذر تحميل خيارات المساعدة حاليًا."
          onRetry={reload}
          label="إعادة المحاولة"
        />
        <div className="patient-quick-actions">
          <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
            حجز موعد جديد
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/contact`}>
            تواصل مع العيادة
          </Link>
        </div>
      </div>
    );
  }

  const supportHref = `/${locale}${data.routes.support}`;
  const bookingHref = `/${locale}${data.routes.booking}`;
  const contactHref = `/${locale}${data.routes.contact}`;

  async function openOrCreateThread(reference: string, existingId?: string | null) {
    setThreadError("");
    if (existingId) {
      router.push(`/${locale}/patient/messages/${existingId}`);
      return;
    }
    setOpeningRef(reference);
    try {
      const { ok, data: res } = await apiPost<{
        threadId?: string;
        message?: string;
      }>(`/api/patient/appointments/${encodeURIComponent(reference)}/message-thread`, {});
      if (!ok || !res.threadId) {
        setThreadError(
          (typeof res.message === "string" && res.message) ||
            "تعذر فتح المحادثة مع الطبيب حاليًا. حاول مرة أخرى أو تواصل مع العيادة.",
        );
        return;
      }
      router.push(`/${locale}/patient/messages/${res.threadId}`);
    } catch {
      setThreadError(
        "تعذر فتح المحادثة مع الطبيب حاليًا. حاول مرة أخرى أو تواصل مع العيادة.",
      );
    } finally {
      setOpeningRef(null);
    }
  }

  return (
    <div className="patient-help">
      <section className="patient-help-intro card-surface">
        <p>
          من هذه الصفحة يمكنك طلب دعم الحساب، حجز موعد جديد، التواصل مع العيادة،
          أو مراسلة الطبيب بخصوص زيارة مكتملة مرتبطة بحسابك.
        </p>
        <p className="muted">
          الرسائل ليست تشخيصًا تلقائيًا ولا تغني عن موعد جديد عند ظهور حالة طبية
          جديدة.
        </p>
      </section>

      <section className="patient-help-actions" aria-label="خيارات المساعدة">
        <Link className="patient-help-card card-surface" href={supportHref}>
          <h2>الدعم</h2>
          <p>أرسل طلب دعم بخصوص حسابك أو استخدام لوحة المريض.</p>
          <span className="patient-help-card-cta">فتح الدعم</span>
        </Link>
        <Link className="patient-help-card card-surface" href={bookingHref}>
          <h2>حجز موعد جديد</h2>
          <p>اختر الطبيب أو الخدمة والموعد المناسب وأرسل طلب حجز جديد.</p>
          <span className="patient-help-card-cta">احجز الآن</span>
        </Link>
        <Link className="patient-help-card card-surface" href={contactHref}>
          <h2>تواصل مع العيادة</h2>
          <p>تواصل مع الاستقبال للاستفسار أو المساعدة في تنظيم موعدك.</p>
          <span className="patient-help-card-cta">صفحة التواصل</span>
        </Link>
      </section>

      <section className="patient-help-followup card-surface">
        <header className="patient-help-section-head">
          <h2>التواصل مع الطبيب بعد الزيارة</h2>
          <p>
            يمكنك مراسلة الطبيب بخصوص ما حدث بعد زيارة مكتملة مرتبطة بحسابك.
          </p>
        </header>

        <p className="patient-help-disclaimer">{data.messagingDisclaimer}</p>

        {threadError ? <p className="alert-error">{threadError}</p> : null}

        {!data.hasEligibleVisits ? (
          <div className="patient-help-empty">
            <EmptyState>
              لا توجد زيارة مكتملة متاحة للتواصل مع الطبيب بشأنها حاليًا.
            </EmptyState>
            <div className="patient-quick-actions">
              <Link className="btn btn-primary" href={bookingHref}>
                حجز موعد جديد
              </Link>
              <Link className="btn btn-outline" href={contactHref}>
                تواصل مع العيادة
              </Link>
              <Link className="btn btn-outline" href={supportHref}>
                طلب الدعم
              </Link>
            </div>
          </div>
        ) : (
          <ul className="patient-help-visits">
            {data.eligibleAppointments.map((visit) => {
              const cta =
                visit.action === "open"
                  ? "فتح المحادثة"
                  : visit.action === "view"
                    ? "عرض المحادثة"
                    : "راسل الطبيب بخصوص هذه الزيارة";
              const busy = openingRef === visit.reference;
              return (
                <li key={visit.reference} className="patient-help-visit">
                  <DoctorAvatar
                    name={visit.doctor.fullName}
                    imageUrl={visit.doctor.imageUrl}
                  />
                  <div className="patient-help-visit-body">
                    <strong>{visit.doctor.fullName}</strong>
                    <p>
                      {formatVisitDate(visit.completedAt, locale)} ·{" "}
                      {serviceLabel(visit.service, locale)}
                      {visit.specialty ? ` · ${visit.specialty}` : ""}
                    </p>
                    <p className="muted">
                      المرجع: {visit.reference}
                      {visit.thread ? (
                        <>
                          {" "}
                          · الحالة: {visit.thread.status}
                          {visit.thread.patientUnreadCount > 0
                            ? ` · غير مقروء: ${visit.thread.patientUnreadCount}`
                            : ""}
                        </>
                      ) : (
                        " · لا توجد محادثة بعد"
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={() =>
                      void openOrCreateThread(
                        visit.reference,
                        visit.action === "start" ? null : visit.thread?.id,
                      )
                    }
                  >
                    {busy ? "جارٍ الفتح..." : cta}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="patient-help-new-visit">
          <h3>هل تحتاج إلى فحص جديد؟</h3>
          <p>
            إذا كان الاستفسار لا يتعلق بالزيارة السابقة أو ظهرت حالة جديدة،
            احجز موعدًا جديدًا أو تواصل مع الاستقبال.
          </p>
          <div className="patient-quick-actions">
            <Link className="btn btn-primary" href={bookingHref}>
              حجز موعد جديد
            </Link>
            <Link className="btn btn-outline" href={contactHref}>
              تواصل مع العيادة
            </Link>
          </div>
        </div>
      </section>

      <section className="patient-help-emergency card-surface" role="note">
        <h2>تنبيه هام</h2>
        <p>{data.emergencyWarning}</p>
        <div className="patient-quick-actions">
          <a className="btn btn-primary" href={data.clinic.phoneTel}>
            اتصل بالعيادة
          </a>
          <a
            className="btn btn-outline"
            href={data.clinic.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            تواصل عبر واتساب
          </a>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage
      title="المساعدة والدعم"
      description="اختر طريقة المساعدة المناسبة، أو تواصل مع طبيبك بخصوص زيارة مكتملة."
    >
      <Body />
    </PatientPortalPage>
  );
}
