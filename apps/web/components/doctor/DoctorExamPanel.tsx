"use client";

import { useState } from "react";
import { apiErrorMessage, apiPost } from "../../lib/api";

export type ExamWaitingEntry = {
  id: string;
  patientName?: string;
  patientPhone?: string;
  patientAge?: number;
  patientCity?: string;
  patientAddress?: string;
  chronicIllnesses?: string;
  allergies?: string;
  patientType?: string;
  visitReason?: string;
  appointmentStartAt?: string;
  appointmentNumber?: string;
  doctorName?: string;
  status: string;
  waitingMinutes?: number;
};

type Props = {
  entry: ExamWaitingEntry;
  onDone: () => void;
};

export function DoctorExamPanel({ entry, onDone }: Props) {
  const [open, setOpen] = useState(entry.status === "WITH_DOCTOR");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [covered, setCovered] = useState(false);
  const [error, setError] = useState("");

  const done = entry.status === "SESSION_DONE" || entry.status === "LEFT";
  if (done) return null;

  async function openExam() {
    setLoading(true);
    setError("");
    if (entry.status === "WAITING" || entry.status === "ARRIVED") {
      const { ok, data } = await apiPost<{ message?: string }>(
        "/api/doctor/exam",
        { entryId: entry.id, action: "start" },
      );
      if (!ok) {
        setLoading(false);
        setError(apiErrorMessage(data) || "تعذر بدء المعاينة");
        return;
      }
    }
    setLoading(false);
    setOpen(true);
    onDone();
  }

  async function completeExam() {
    setLoading(true);
    setError("");
    const { ok, data } = await apiPost<{ message?: string }>(
      "/api/doctor/exam",
      {
        entryId: entry.id,
        action: "complete",
        amount: covered ? 0 : Number(amount),
        note,
        covered,
      },
    );
    setLoading(false);
    if (!ok) {
      setError(apiErrorMessage(data) || "تعذر إنهاء المعاينة");
      return;
    }
    setOpen(false);
    onDone();
  }

  return (
    <>
      <div className="exam-queue-row">
        <div>
          <strong>{entry.patientName || "—"}</strong>
          <div className="hint">
            {entry.appointmentStartAt
              ? new Date(entry.appointmentStartAt).toLocaleString("ar-DZ")
              : "—"}
            {entry.doctorName ? ` · ${entry.doctorName}` : ""}
            {typeof entry.waitingMinutes === "number"
              ? ` · ${entry.waitingMinutes} د`
              : ""}
            {` · ${entry.status}`}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading}
          onClick={() => void openExam()}
        >
          {loading ? "..." : "معاينة"}
        </button>
      </div>

      {open ? (
        <div className="exam-modal-backdrop" role="presentation">
          <div
            className="exam-modal card-surface"
            role="dialog"
            aria-modal="true"
            aria-label="معاينة المريض"
          >
            <div className="exam-modal-head">
              <strong>معاينة — {entry.patientName || "—"}</strong>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setOpen(false)}
              >
                إغلاق
              </button>
            </div>

            <dl className="exam-meta">
              <div>
                <dt>الهاتف</dt>
                <dd dir="ltr">{entry.patientPhone || "—"}</dd>
              </div>
              <div>
                <dt>العمر</dt>
                <dd>{entry.patientAge ?? "—"}</dd>
              </div>
              <div>
                <dt>العنوان</dt>
                <dd>
                  {[entry.patientAddress, entry.patientCity]
                    .filter(Boolean)
                    .join("، ") || "—"}
                </dd>
              </div>
              <div>
                <dt>سبب الزيارة</dt>
                <dd>{entry.visitReason || "—"}</dd>
              </div>
              <div>
                <dt>نوع المريض</dt>
                <dd>
                  {entry.patientType === "RETURNING" ? "مراجع" : "أول زيارة"}
                </dd>
              </div>
              <div>
                <dt>أمراض مزمنة</dt>
                <dd>{entry.chronicIllnesses || "لا يوجد"}</dd>
              </div>
              {entry.allergies ? (
                <div>
                  <dt>حساسية</dt>
                  <dd>{entry.allergies}</dd>
                </div>
              ) : null}
            </dl>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={covered}
                onChange={(e) => setCovered(e.target.checked)}
              />
              <span>مغطى</span>
            </label>

            {!covered ? (
              <div className="field">
                <label htmlFor={`amount-${entry.id}`}>التكلفة (دج)</label>
                <input
                  id={`amount-${entry.id}`}
                  className="input"
                  type="number"
                  min={1}
                  dir="ltr"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2000"
                />
              </div>
            ) : null}

            <div className="field">
              <label htmlFor={`note-${entry.id}`}>ملاحظة للسكرتير</label>
              <textarea
                id={`note-${entry.id}`}
                className="input"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثال: يحتاج موعد متابعة"
              />
            </div>

            {error ? <p className="alert-error">{error}</p> : null}

            <div className="toolbar">
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={() => void completeExam()}
              >
                {loading ? "جارٍ الحفظ..." : "إرسال للسكرتير"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setOpen(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
