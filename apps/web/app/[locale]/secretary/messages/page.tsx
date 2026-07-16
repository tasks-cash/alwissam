"use client";

import { DashboardShell } from "../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../lib/use-dashboard-session";

/**
 * Full-page staff chat surface (FAB mounts from DashboardShell).
 * Spec: /secretary/messages
 */
export default function SecretaryMessagesPage() {
  const { locale, dict, user, loading, error, authResolved } =
    useDashboardSession({
      roles: [
        "ADMIN",
        "SECRETARY",
        "DOCTOR_SPECIALIST",
        "DOCTOR_GENERAL",
      ],
    });

  if (!authResolved || loading || !user) {
    return <main className="dash-panel">جارٍ التحميل...</main>;
  }
  if (error) {
    return <main className="dash-panel alert-error">{error}</main>;
  }

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title="دردشة الطاقم"
      description="رسائل نصية وصوتية بين الأطباء والسكرتارية والإدارة — ليست رسائل المرضى."
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
    >
      <article className="card-surface dash-actions">
        <p>
          استخدم أيقونة الدردشة أسفل الشاشة للتواصل مع الزملاء. التسجيلات الصوتية
          تُخزَّن بشكل خاص وتُبث فقط لمرسل ومستلم الرسالة عبر واجهة محمية.
        </p>
        <p className="muted">
          هذه المحادثات غير مخصصة للمرضى ولا للتشخيص الطبي عن بُعد.
        </p>
      </article>
    </DashboardShell>
  );
}
