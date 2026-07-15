"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiPost } from "../../../../lib/api";
import { useDashboardSession } from "../../../../lib/use-dashboard-session";

type PatientOpt = { id: string; fullName: string; patientNumber: string };
type DoctorOpt = { id: string; fullName: string; specialtyAr?: string };
type Appt = {
  id: string;
  appointmentNumber: string;
  patientName?: string;
  doctorName?: string;
  status: string;
  startAt: string;
  appointmentType: string;
};

const TYPES = [
  "GENERAL_EXAM",
  "EMERGENCY",
  "TOOTHACHE",
  "CLEANING",
  "FILLING",
  "EXTRACTION",
  "ROOT_CANAL",
  "ORTHO_CONSULT",
  "OTHER",
];

export default function SecretaryAppointmentsPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST"],
  });
  const [patients, setPatients] = useState<PatientOpt[]>([]);
  const [doctors, setDoctors] = useState<DoctorOpt[]>([]);
  const [rows, setRows] = useState<Appt[]>([]);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentType: "GENERAL_EXAM",
    startAt: "",
    durationMinutes: "30",
    isEmergency: false,
    notes: "",
  });

  const load = useCallback(async () => {
    const [pRes, dRes, aRes] = await Promise.all([
      fetch("/api/patients?pageSize=100", { credentials: "include" }),
      fetch("/api/doctors", { credentials: "include" }),
      fetch("/api/appointments?pageSize=50", { credentials: "include" }),
    ]);
    if (pRes.ok) {
      const p = await pRes.json();
      setPatients(Array.isArray(p.patients) ? p.patients : []);
    }
    if (dRes.ok) {
      const d = await dRes.json();
      setDoctors(Array.isArray(d.doctors) ? d.doctors : []);
    }
    if (aRes.ok) {
      const a = await aRes.json();
      setRows(Array.isArray(a.appointments) ? a.appointments : []);
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    setSaving(true);
    try {
      const start = form.startAt ? new Date(form.startAt) : null;
      if (!start || Number.isNaN(start.getTime())) {
        setFormError(dict.connectionError);
        return;
      }
      const { ok, data } = await apiPost<{ message?: string }>("/api/appointments", {
        patientId: form.patientId,
        doctorId: form.doctorId,
        appointmentType: form.appointmentType,
        startAt: start.toISOString(),
        durationMinutes: Number(form.durationMinutes) || 30,
        isEmergency: form.isEmergency,
        notes: form.notes || undefined,
      });
      if (!ok) {
        setFormError(apiErrorMessage(data));
        return;
      }
      setSuccess(data.message || dict.successSaved);
      setForm((f) => ({
        ...f,
        patientId: "",
        notes: "",
        isEmergency: false,
      }));
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
      title={dict.navAppointments}
      description={dict.scheduleAppointment}
    >
      {success ? <div className="alert-success">{success}</div> : null}
      {formError ? <div className="alert-error">{formError}</div> : null}

      <section className="card-surface dash-actions">
        <h2>{dict.scheduleAppointment}</h2>
        <form className="stack-form" onSubmit={onCreate}>
          <div className="row-2">
            <div className="field">
              <label htmlFor="patientId">
                {dict.patient} <span className="required">*</span>
              </label>
              <select
                id="patientId"
                className="input"
                required
                value={form.patientId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, patientId: e.target.value }))
                }
              >
                <option value="">—</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patientNumber} — {p.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="doctorId">
                {dict.doctor} <span className="required">*</span>
              </label>
              <select
                id="doctorId"
                className="input"
                required
                value={form.doctorId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, doctorId: e.target.value }))
                }
              >
                <option value="">—</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                    {d.specialtyAr ? ` (${d.specialtyAr})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="appointmentType">{dict.appointmentType}</label>
              <select
                id="appointmentType"
                className="input"
                value={form.appointmentType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, appointmentType: e.target.value }))
                }
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="startAt">
                {dict.startAt} <span className="required">*</span>
              </label>
              <input
                id="startAt"
                className="input"
                type="datetime-local"
                required
                value={form.startAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startAt: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="durationMinutes">{dict.durationMinutes}</label>
              <input
                id="durationMinutes"
                className="input"
                type="number"
                min={5}
                max={480}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, durationMinutes: e.target.value }))
                }
              />
            </div>
            <div className="field check-row" style={{ alignItems: "end" }}>
              <label htmlFor="isEmergency">
                <input
                  id="isEmergency"
                  type="checkbox"
                  checked={form.isEmergency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isEmergency: e.target.checked }))
                  }
                />{" "}
                {dict.emergency}
              </label>
            </div>
          </div>
          <div className="field">
            <label htmlFor="notes">{dict.notes}</label>
            <textarea
              id="notes"
              className="input"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? dict.saving : dict.save}
          </button>
        </form>
      </section>

      <section className="card-surface dash-actions">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>{dict.upcomingAppointments}</h2>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{dict.patient}</th>
                  <th>{dict.doctor}</th>
                  <th>{dict.appointmentType}</th>
                  <th>{dict.startAt}</th>
                  <th>{dict.status}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td>{a.appointmentNumber}</td>
                    <td>{a.patientName || "—"}</td>
                    <td>{a.doctorName || "—"}</td>
                    <td>{a.appointmentType}</td>
                    <td>{new Date(a.startAt).toLocaleString(locale)}</td>
                    <td>
                      <span className="badge">{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
