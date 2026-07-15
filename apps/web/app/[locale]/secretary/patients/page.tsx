"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PhoneField } from "../../../../components/ui/PhoneField";
import { DashboardShell } from "../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiPost, mapFieldErrors } from "../../../../lib/api";
import { useDashboardSession } from "../../../../lib/use-dashboard-session";

type PatientRow = {
  id: string;
  patientNumber: string;
  fullName: string;
  phone: string;
  email?: string;
  city?: string;
  createdAt?: string;
};

export default function SecretaryPatientsPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
  });
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [total, setTotal] = useState(0);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    city: "",
    address: "",
    notes: "",
  });

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("pageSize", "50");
    const res = await fetch(`/api/patients?${params}`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setRows(Array.isArray(data.patients) ? data.patients : []);
    setTotal(Number(data.total) || 0);
  }, [q]);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    setFieldErrors({});
    setSaving(true);
    try {
      const body = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        gender: form.gender || undefined,
        city: form.city || undefined,
        address: form.address || undefined,
        notes: form.notes || undefined,
      };
      const { ok, data } = await apiPost<{ message?: string }>(
        "/api/secretary/patients",
        body,
      );
      if (!ok) {
        setFieldErrors(mapFieldErrors(data));
        setFormError(apiErrorMessage(data));
        return;
      }
      setSuccess(data.message || dict.successSaved);
      setForm({
        fullName: "",
        phone: "",
        email: "",
        gender: "",
        city: "",
        address: "",
        notes: "",
      });
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
      title={dict.navPatients}
      description={dict.registerPatient}
    >
      {success ? <div className="alert-success">{success}</div> : null}
      {formError ? <div className="alert-error">{formError}</div> : null}

      <section className="card-surface dash-actions">
        <h2>{dict.registerPatient}</h2>
        <form className="stack-form" onSubmit={onCreate}>
          <div className="row-2">
            <div className="field">
              <label htmlFor="fullName">
                {dict.fullName} <span className="required">*</span>
              </label>
              <input
                id="fullName"
                className="input"
                required
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
              {fieldErrors.fullName ? (
                <span className="field-error">{fieldErrors.fullName}</span>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="phone">
                {dict.phone} <span className="required">*</span>
              </label>
              <PhoneField
                id="phone"
                value={form.phone}
                onChange={(phone) => setForm((f) => ({ ...f, phone }))}
                required
              />
              {fieldErrors.phone ? (
                <span className="field-error">{fieldErrors.phone}</span>
              ) : null}
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="email">{dict.email}</label>
              <input
                id="email"
                className="input"
                type="email"
                dir="ltr"
                spellCheck={false}
                autoComplete="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="gender">{dict.gender}</label>
              <select
                id="gender"
                className="input"
                value={form.gender}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gender: e.target.value }))
                }
              >
                <option value="">—</option>
                <option value="MALE">{dict.male}</option>
                <option value="FEMALE">{dict.female}</option>
              </select>
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="city">{dict.city}</label>
              <input
                id="city"
                className="input"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="address">{dict.address}</label>
              <input
                id="address"
                className="input"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="notes">{dict.notes}</label>
            <textarea
              id="notes"
              className="input"
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? dict.saving : dict.save}
          </button>
        </form>
      </section>

      <section className="card-surface dash-actions">
        <div className="toolbar">
          <input
            className="input"
            style={{ maxWidth: 320 }}
            placeholder={dict.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.search}
          </button>
          <span className="muted">{total}</span>
        </div>
        {rows.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{dict.fullName}</th>
                  <th>{dict.phone}</th>
                  <th>{dict.email}</th>
                  <th>{dict.city}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>{p.patientNumber}</td>
                    <td>{p.fullName}</td>
                    <td>{p.phone}</td>
                    <td>{p.email || "—"}</td>
                    <td>{p.city || "—"}</td>
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
