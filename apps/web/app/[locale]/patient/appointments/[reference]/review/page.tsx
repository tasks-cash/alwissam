"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import {
  PatientPortalPage,
  usePatientPortal,
} from "../../../../../../components/patient/PatientPortalPage";

function ReviewForm() {
  const params = useParams<{ reference: string; locale?: string }>();
  const reference = params?.reference ?? "";
  const { locale } = usePatientPortal();
  const [rating, setRating] = useState(5);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!consentConfirmed) {
      setError("يجب الموافقة على مراجعة التجربة قبل الإرسال.");
      return;
    }
    if (description.trim().length < 10) {
      setError("يرجى كتابة وصف أوضح للتجربة (10 أحرف على الأقل).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/patient/appointments/${encodeURIComponent(reference)}/review`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            subject: subject.trim() || undefined,
            description: description.trim(),
            isAnonymous,
            displayName: isAnonymous ? undefined : displayName.trim() || undefined,
            consentConfirmed: true,
          }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.message || "تعذر إرسال التجربة");
        return;
      }
      setSuccess(
        json.message ||
          "تم إرسال تجربتك للمراجعة، وستظهر في الموقع بعد اعتمادها من إدارة العيادة.",
      );
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card-surface dash-actions patient-review-form" onSubmit={onSubmit}>
      <h1>شارك تجربتك مع عيادة الوسام</h1>
      <p className="muted">
        بعد إكمال موعدك يمكنك مشاركة رأيك. لن تُنشر التجربة فورًا — تراجعها إدارة
        العيادة أولًا.
      </p>
      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="alert-success" role="status">
          {success}
          <p>
            <Link href={`/${locale}/patient/appointments/${encodeURIComponent(reference)}`}>
              العودة إلى الموعد
            </Link>
          </p>
        </div>
      ) : (
        <>
          <div className="field">
            <label htmlFor="rating">
              التقييم <span className="required">*</span>
            </label>
            <select
              id="rating"
              className="input"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
              aria-describedby="rating-hint"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
            <p id="rating-hint" className="field-hint">
              التقييم: {rating} من 5
            </p>
          </div>

          <div className="field">
            <label htmlFor="subject">عنوان التجربة</label>
            <input
              id="subject"
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="field">
            <label htmlFor="description">
              وصف التجربة <span className="required">*</span>
            </label>
            <textarea
              id="description"
              className="input"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={2000}
            />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            عرض التجربة باسم مجهول (موصى به)
          </label>

          {!isAnonymous ? (
            <div className="field">
              <label htmlFor="displayName">الاسم الظاهر للعامة</label>
              <input
                id="displayName"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
              />
            </div>
          ) : null}

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={consentConfirmed}
              onChange={(e) => setConsentConfirmed(e.target.checked)}
              required
            />
            أوافق على مراجعة إدارة العيادة لتجربتي قبل أي نشر عام
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "جارٍ الإرسال..." : "إرسال التجربة للمراجعة"}
          </button>
        </>
      )}
      <Link
        className="btn btn-outline"
        href={`/${locale}/patient/appointments/${encodeURIComponent(reference)}`}
      >
        إلغاء
      </Link>
    </form>
  );
}

export default function PatientReviewPage() {
  const params = useParams<{ reference: string }>();
  const reference = params?.reference ?? "";

  return (
    <PatientPortalPage title={`تجربة الموعد ${reference}`}>
      <ReviewForm />
    </PatientPortalPage>
  );
}
