"use client";

import Link from "next/link";
import {
  EmptyState,
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";

type DashboardRes = {
  dashboard: {
    greetingName: string;
    profileComplete: boolean;
    counts: Record<string, number>;
    nextAppointment: null | {
      reference: string;
      status: string;
      startAt: string;
      doctorName?: string;
    };
  };
};

function Body() {
  const { locale, dict, reloadKey } = usePatientPortal();
  const { data, error, loading, reload } = usePatientFetch<DashboardRes>(
    "/api/patient/dashboard",
    reloadKey,
  );
  if (loading) {
    return (
      <div aria-busy="true">
        <p className="muted">{dict.dashboardLoading}</p>
        <SkeletonBlock />
      </div>
    );
  }
  if (error) {
    return (
      <ErrorRetry
        message={error || dict.dashboardLoadError}
        onRetry={reload}
        label={dict.retry}
      />
    );
  }
  const d = data?.dashboard;
  if (!d) return <EmptyState>لا توجد بيانات للعرض.</EmptyState>;
  return (
    <div className="patient-dash">
      <p className="patient-greeting">مرحبًا، {d.greetingName}</p>
      <section className="stat-grid">
        <article className="stat-card card-surface"><span>القادمة</span><strong>{d.counts.upcoming}</strong></article>
        <article className="stat-card card-surface"><span>المكتملة</span><strong>{d.counts.completed}</strong></article>
        <article className="stat-card card-surface"><span>الملغاة</span><strong>{d.counts.cancelled}</strong></article>
        <article className="stat-card card-surface"><span>بانتظار المراجعة</span><strong>{d.counts.pending}</strong></article>
        <article className="stat-card card-surface"><span>الحالات</span><strong>{d.counts.medicalCases}</strong></article>
        <article className="stat-card card-surface"><span>الملفات</span><strong>{d.counts.files}</strong></article>
        <article className="stat-card card-surface"><span>رسائل غير مقروءة</span><strong>{d.counts.unreadMessages}</strong></article>
        <article className="stat-card card-surface"><span>إشعارات</span><strong>{d.counts.unreadNotifications}</strong></article>
      </section>
      <section className="card-surface dash-actions">
        <h2>الموعد القادم</h2>
        {d.nextAppointment ? (
          <p>
            <Link href={`/${locale}/patient/appointments/${d.nextAppointment.reference}`}>
              {d.nextAppointment.reference}
            </Link>
            {" — "}
            {d.nextAppointment.doctorName || "—"}
            {" — "}
            {new Date(d.nextAppointment.startAt).toLocaleString(locale)}
          </p>
        ) : (
          <EmptyState>لا يوجد موعد قادم حاليًا.</EmptyState>
        )}
      </section>
      <section className="card-surface dash-actions">
        <h2>إجراءات سريعة</h2>
        <div className="patient-quick-actions">
          <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>حجز موعد جديد</Link>
          <Link className="btn btn-outline" href={`/${locale}/patient/appointments`}>عرض مواعيدي</Link>
          <Link className="btn btn-outline" href={`/${locale}/patient/medical-cases`}>متابعة حالتي العلاجية</Link>
          <Link className="btn btn-outline" href={`/${locale}/patient/files`}>عرض صوري وتقاريري</Link>
          <Link className="btn btn-outline" href={`/${locale}/patient/messages`}>رسائلي</Link>
          <Link className="btn btn-outline" href={`/${locale}/patient/help`}>المساعدة والدعم</Link>
          <Link className="btn btn-outline" href={`/${locale}/patient/profile`}>تعديل معلوماتي</Link>
          <Link className="btn btn-outline" href={`/${locale}/patient/security`}>تغيير كلمة المرور</Link>
        </div>
      </section>
      {!d.profileComplete ? (
        <p className="muted">
          أكمل ملفك الشخصي: <Link href={`/${locale}/patient/profile`}>المعلومات الشخصية</Link>
        </p>
      ) : null}
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage
      title="لوحة تحكم المريض"
      description="نظرة عامة على مواعيدك وحالتك العلاجية وإشعاراتك."
    >
      <Body />
    </PatientPortalPage>
  );
}
