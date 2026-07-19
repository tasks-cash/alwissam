"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiPost } from "../../../../lib/api";
import { useDashboardSession } from "../../../../lib/use-dashboard-session";

type QueueItem = {
  id: string;
  requestNumber: string;
  queueNumber?: string;
  fullName: string;
  phone: string;
  reason?: string;
  appointmentType?: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  specialtySlug?: string | null;
  serviceSlug?: string | null;
  preferredDoctorId?: string | null;
  status?: string;
  additionalNotes?: string | null;
  createdAt?: string;
};

type DoctorOption = { id: string; fullName: string };

export default function SecretaryAssignmentQueuePage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST"],
  });
  const [rows, setRows] = useState<QueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [assignForm, setAssignForm] = useState({
    doctorId: "",
    preferredDate: "",
    preferredTime: "",
    assignmentNotes: "",
    confirm: true,
  });

  const load = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    const res = await fetch(`/api/secretary/assignment-queue?${params}`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setRows(Array.isArray(data.items) ? data.items : []);
    setTotal(Number(data.total) || 0);
  }, [page]);

  useEffect(() => {
    if (!user) return;
    void load();
    // Scheduling roster (not owner-only admin list) so SECRETARY can load doctors.
    void fetch("/api/doctors", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { doctors: [] }))
      .then((d) =>
        setDoctors(
          (Array.isArray(d.doctors) ? d.doctors : [])
            .filter(
              (doc: { fullName?: string; id?: string }) =>
                Boolean(doc.id && doc.fullName),
            )
            .map((doc: { id: string; fullName: string }) => ({
              id: doc.id,
              fullName: doc.fullName,
            })),
        ),
      )
      .catch(() => undefined);
  }, [load, user]);

  function openAssign(row: QueueItem) {
    setAssigningId(row.id);
    setFormError("");
    setSuccess("");
    setAssignForm({
      doctorId: row.preferredDoctorId || "",
      preferredDate: row.preferredDate || "",
      preferredTime: row.preferredTime || "",
      assignmentNotes: "",
      confirm: true,
    });
  }

  async function onAssign(e: FormEvent) {
    e.preventDefault();
    if (!assigningId) return;
    setFormError("");
    setSuccess("");
    setSaving(true);
    try {
      const { ok, data } = await apiPost<{ message?: string }>(
        "/api/secretary/assignment-queue/assign",
        {
          requestId: assigningId,
          doctorId: assignForm.doctorId,
          preferredDate: assignForm.preferredDate || undefined,
          preferredTime: assignForm.preferredTime || undefined,
          assignmentNotes: assignForm.assignmentNotes || undefined,
          confirm: assignForm.confirm,
        },
      );
      if (!ok) {
        setFormError(apiErrorMessage(data));
        return;
      }
      setSuccess(data.message || dict.successSaved);
      setAssigningId(null);
      void load();
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <main className="dash-panel">{dict.loading}</main>;
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
      title={dict.navAssignmentQueue}
      description={dict.assignmentQueueDesc}
    >
      {success ? <div className="alert-success">{success}</div> : null}
      {formError ? <div className="alert-error">{formError}</div> : null}

      <section className="card-surface dash-actions">
        <div className="toolbar">
          <span className="muted">
            {dict.total}: {total}
          </span>
        </div>
        {rows.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{dict.reference}</th>
                  <th>{dict.fullName}</th>
                  <th>{dict.phone}</th>
                  <th>{dict.preferredDate}</th>
                  <th>{dict.preferredTime}</th>
                  <th>{dict.status}</th>
                  <th>{dict.actions}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td dir="ltr">{r.requestNumber || r.queueNumber}</td>
                    <td>{r.fullName}</td>
                    <td dir="ltr">{r.phone}</td>
                    <td dir="ltr">{r.preferredDate || "—"}</td>
                    <td dir="ltr">{r.preferredTime || "—"}</td>
                    <td>{r.status || "—"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => openAssign(r)}
                      >
                        {dict.assignDoctor}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="cta-row" style={{ marginTop: "0.85rem" }}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {dict.previous}
          </button>
          <span className="muted">
            {dict.page} {page}
          </span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setPage((p) => p + 1)}
          >
            {dict.next}
          </button>
        </div>
      </section>

      {assigningId ? (
        <section className="card-surface dash-actions">
          <h2>{dict.assignDoctor}</h2>
          <form className="stack-form" onSubmit={onAssign}>
            <div className="field">
              <label htmlFor="doctorId">
                {dict.doctor} <span className="required">*</span>
              </label>
              <select
                id="doctorId"
                className="input"
                required
                value={assignForm.doctorId}
                onChange={(e) =>
                  setAssignForm((f) => ({ ...f, doctorId: e.target.value }))
                }
              >
                <option value="">—</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="row-2">
              <div className="field">
                <label htmlFor="preferredDate">{dict.preferredDate}</label>
                <input
                  id="preferredDate"
                  className="input"
                  type="date"
                  value={assignForm.preferredDate}
                  onChange={(e) =>
                    setAssignForm((f) => ({
                      ...f,
                      preferredDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="preferredTime">{dict.preferredTime}</label>
                <input
                  id="preferredTime"
                  className="input"
                  type="time"
                  dir="ltr"
                  value={assignForm.preferredTime}
                  onChange={(e) =>
                    setAssignForm((f) => ({
                      ...f,
                      preferredTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="assignmentNotes">{dict.notes}</label>
              <textarea
                id="assignmentNotes"
                className="input"
                rows={2}
                value={assignForm.assignmentNotes}
                onChange={(e) =>
                  setAssignForm((f) => ({
                    ...f,
                    assignmentNotes: e.target.value,
                  }))
                }
              />
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={assignForm.confirm}
                onChange={(e) =>
                  setAssignForm((f) => ({ ...f, confirm: e.target.checked }))
                }
              />
              {dict.confirmAssignment}
            </label>
            <div className="cta-row">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? dict.saving : dict.save}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setAssigningId(null)}
              >
                {dict.cancel}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </DashboardShell>
  );
}
