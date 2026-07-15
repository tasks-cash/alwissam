"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiPost } from "../../../../../lib/api";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type InvitationRow = {
  id: string;
  role: string;
  doctorType?: string;
  email?: string;
  phoneCanonical?: string;
  fullName?: string;
  status: string;
  expiresAt?: string;
  createdAt?: string;
};

export default function StaffInvitationsPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"],
  });
  const [rows, setRows] = useState<InvitationRow[]>([]);
  const [msg, setMsg] = useState("");
  const [formError, setFormError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    role: "DOCTOR" as "DOCTOR" | "SECRETARY",
    doctorType: "GENERAL" as "GENERAL" | "SPECIALIST",
    fullName: "",
    email: "",
    phone: "",
    workStartTime: "07:00",
    workEndTime: "14:30",
    workDays: "SUN,MON,TUE,WED,THU,SAT",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/staff-invitations", {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setRows(Array.isArray(data.invitations) ? data.invitations : []);
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setMsg("");
    setInviteUrl("");
    setSaving(true);
    try {
      const { ok, data } = await apiPost<{
        message?: string;
        inviteUrl?: string;
        invitationToken?: string;
      }>("/api/admin/staff-invitations", {
        role: form.role,
        doctorType: form.role === "DOCTOR" ? form.doctorType : undefined,
        fullName: form.fullName || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        workStartTime: form.role === "SECRETARY" ? form.workStartTime : undefined,
        workEndTime: form.role === "SECRETARY" ? form.workEndTime : undefined,
        workDays: form.role === "SECRETARY" ? form.workDays : undefined,
      });
      if (!ok) {
        setFormError(apiErrorMessage(data));
        return;
      }
      setMsg(data.message || "Created");
      setInviteUrl(data.inviteUrl || "");
      void load();
    } finally {
      setSaving(false);
    }
  }

  async function revoke(id: string) {
    const { ok, data } = await apiPost<{ message?: string }>(
      `/api/admin/staff-invitations/${id}/revoke`,
      {},
    );
    setMsg(ok ? data.message || "Revoked" : apiErrorMessage(data));
    if (ok) void load();
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
      title="Staff invitations"
      description="Secure doctor and secretary invitations (no public privileged self-registration)."
    >
      {msg ? <div className="alert-success">{msg}</div> : null}
      {formError ? <div className="alert-error">{formError}</div> : null}
      {inviteUrl ? (
        <div className="alert-success" style={{ wordBreak: "break-all" }}>
          Invite URL (share once securely): {inviteUrl}
        </div>
      ) : null}

      <section className="card-surface dash-actions">
        <h2>Create invitation</h2>
        <form className="stack-form" onSubmit={onCreate}>
          <div className="row-2">
            <div className="field">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                className="input"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value as "DOCTOR" | "SECRETARY",
                  }))
                }
              >
                <option value="DOCTOR">DOCTOR</option>
                <option value="SECRETARY">SECRETARY</option>
              </select>
            </div>
            {form.role === "DOCTOR" ? (
              <div className="field">
                <label htmlFor="doctorType">Doctor type</label>
                <select
                  id="doctorType"
                  className="input"
                  value={form.doctorType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      doctorType: e.target.value as "GENERAL" | "SPECIALIST",
                    }))
                  }
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="SPECIALIST">SPECIALIST</option>
                </select>
              </div>
            ) : (
              <div className="field">
                <label htmlFor="workDays">Work days</label>
                <input
                  id="workDays"
                  className="input"
                  value={form.workDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, workDays: e.target.value }))
                  }
                />
              </div>
            )}
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                className="input"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                className="input"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                dir="ltr"
              />
            </div>
            {form.role === "SECRETARY" ? (
              <div className="field">
                <label htmlFor="shift">Shift</label>
                <div className="toolbar">
                  <input
                    className="input"
                    value={form.workStartTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, workStartTime: e.target.value }))
                    }
                    placeholder="07:00"
                  />
                  <input
                    className="input"
                    value={form.workEndTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, workEndTime: e.target.value }))
                    }
                    placeholder="14:30"
                  />
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? dict.saving : "Create invitation"}
          </button>
        </form>
      </section>

      <section className="card-surface dash-actions">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Invitations</h2>
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
                  <th>Role</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>{dict.actions}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.role}
                      {r.doctorType ? `/${r.doctorType}` : ""}
                    </td>
                    <td>{r.fullName || "—"}</td>
                    <td>{r.email || "—"}</td>
                    <td>{r.phoneCanonical || "—"}</td>
                    <td>
                      <span className="badge">{r.status}</span>
                    </td>
                    <td>
                      {r.expiresAt
                        ? new Date(r.expiresAt).toLocaleString(locale)
                        : "—"}
                    </td>
                    <td>
                      {r.status === "pending" ? (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => void revoke(r.id)}
                        >
                          Revoke
                        </button>
                      ) : (
                        "—"
                      )}
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
