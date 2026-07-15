"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  PatientPortalPage,
  usePatientFetch,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";
import { apiPost } from "../../../../lib/api";

const CATEGORIES = [
  { value: "account_access", label: "الوصول إلى الحساب" },
  { value: "password_security", label: "كلمة المرور والأمان" },
  { value: "personal_info", label: "معلومات شخصية غير صحيحة" },
  { value: "appointment_display", label: "مشكلة في عرض المواعيد" },
  { value: "missing_file", label: "ملف أو تقرير مفقود" },
  { value: "notifications", label: "مشكلة في الإشعارات" },
  { value: "technical", label: "مشكلة تقنية في لوحة التحكم" },
  { value: "other", label: "أخرى (غير طارئة)" },
] as const;

type AppointmentsRes = {
  appointments?: Array<{ reference: string; startAt?: string; status?: string }>;
};

function Body() {
  const { locale } = usePatientPortal();
  const { data } = usePatientFetch<AppointmentsRes>(
    "/api/patient/appointments",
  );
  const [category, setCategory] = useState<string>(CATEGORIES[0].value);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [relatedRef, setRelatedRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessId("");
    setSubmitting(true);
    try {
      const { ok, data: res } = await apiPost<{
        requestId?: string;
        message?: string;
      }>("/api/patient/support", {
        category,
        subject: subject.trim(),
        description: description.trim(),
        relatedAppointmentReference: relatedRef || undefined,
      });
      if (!ok || !res.requestId) {
        setError(
          (typeof res.message === "string" && res.message) ||
            "تعذر فتح صفحة الدعم حاليًا.",
        );
        return;
      }
      setSuccessId(res.requestId);
      setSubject("");
      setDescription("");
      setRelatedRef("");
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  const appointments = data?.appointments || [];

  return (
    <div className="patient-support">
      <article className="card-surface patient-support-panel">
        <p>
          استخدم هذا النموذج لمشاكل الحساب أو لوحة المريض فقط. للدعم الطبي
          الطارئ استخدم الاتصال أو واتساب من صفحة المساعدة.
        </p>
        <p className="alert-error patient-support-notice">
          لا تستخدم طلب الدعم للحصول على تشخيص طبي أو وصف دواء أو رعاية طارئة.
        </p>

        {successId ? (
          <p className="alert-success" role="status">
            تم إرسال طلب الدعم بنجاح. رقم الطلب: {successId}
          </p>
        ) : null}
        {error ? <p className="alert-error">{error}</p> : null}

        <form className="patient-support-form" onSubmit={onSubmit}>
          <label>
            التصنيف
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            الموضوع
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={160}
              required
              minLength={3}
              autoComplete="off"
            />
          </label>

          <label>
            الوصف
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={4000}
              required
              minLength={10}
              rows={6}
            />
          </label>

          <label>
            موعد مرتبط (اختياري)
            <select
              value={relatedRef}
              onChange={(e) => setRelatedRef(e.target.value)}
            >
              <option value="">— بدون —</option>
              {appointments.map((a) => (
                <option key={a.reference} value={a.reference}>
                  {a.reference}
                  {a.status ? ` · ${a.status}` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="patient-quick-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "جارٍ الإرسال..." : "إرسال طلب الدعم"}
            </button>
            <Link className="btn btn-outline" href={`/${locale}/patient/help`}>
              العودة للمساعدة
            </Link>
          </div>
        </form>
      </article>
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage
      title="الدعم"
      description="أرسل طلب دعم بخصوص حسابك أو استخدام لوحة المريض."
    >
      <Body />
    </PatientPortalPage>
  );
}
