"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../lib/api";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type ClinicInfo = {
  nameAr?: string;
  nameEn?: string;
  nameFr?: string;
  phone?: string;
  email?: string;
  address?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
};

type PublicPages = {
  aboutAr?: string;
  aboutEn?: string;
  aboutFr?: string;
  services?: { name: string; description?: string }[];
  faqs?: { question: string; answer: string }[];
};

export default function ClinicSettingsPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [info, setInfo] = useState<ClinicInfo>({});
  const [pages, setPages] = useState<PublicPages>({});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      fetch("/api/admin/clinic-settings", { credentials: "include" }),
      fetch("/api/admin/public-pages", { credentials: "include" }),
    ]);
    if (a.ok) {
      const d = await a.json();
      setInfo(d.clinicInfo || {});
    }
    if (b.ok) {
      const d = await b.json();
      setPages(d.publicPages || {});
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function saveInfo(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    const { ok, data } = await apiRequest<{ message?: string }>(
      "/api/admin/clinic-settings",
      {
        method: "PUT",
        body: JSON.stringify({ section: "clinic_info", clinicInfo: info }),
      },
    );
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || dict.successSaved);
  }

  async function savePages(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    const { ok, data } = await apiRequest<{ message?: string }>(
      "/api/admin/clinic-settings",
      {
        method: "PUT",
        body: JSON.stringify({
          section: "public_pages",
          publicPages: {
            aboutAr: pages.aboutAr,
            aboutEn: pages.aboutEn,
            aboutFr: pages.aboutFr,
            services: pages.services || [],
            faqs: pages.faqs || [],
          },
        }),
      },
    );
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || dict.successSaved);
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
      title={dict.navSettings}
      description={dict.dashboardLead}
    >
      {msg ? <div className="alert-success">{msg}</div> : null}
      {err ? <div className="alert-error">{err}</div> : null}

      <section className="card-surface dash-actions">
        <h2>Clinic info</h2>
        <form className="stack-form" onSubmit={saveInfo}>
          <div className="row-2">
            <div className="field">
              <label>Name (AR)</label>
              <input
                className="input"
                value={info.nameAr || ""}
                onChange={(e) => setInfo((i) => ({ ...i, nameAr: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Name (EN)</label>
              <input
                className="input"
                value={info.nameEn || ""}
                onChange={(e) => setInfo((i) => ({ ...i, nameEn: e.target.value }))}
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>{dict.phone}</label>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                value={info.phone || ""}
                onChange={(e) => setInfo((i) => ({ ...i, phone: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>{dict.email}</label>
              <input
                className="input"
                type="email"
                dir="ltr"
                spellCheck={false}
                autoComplete="email"
                value={info.email || ""}
                onChange={(e) => setInfo((i) => ({ ...i, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label>{dict.address}</label>
            <input
              className="input"
              value={info.address || ""}
              onChange={(e) => setInfo((i) => ({ ...i, address: e.target.value }))}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? dict.saving : dict.save}
          </button>
        </form>
      </section>

      <section className="card-surface dash-actions">
        <h2>Public content</h2>
        <form className="stack-form" onSubmit={savePages}>
          <div className="field">
            <label>About (AR)</label>
            <textarea
              className="input"
              rows={4}
              value={pages.aboutAr || ""}
              onChange={(e) =>
                setPages((p) => ({ ...p, aboutAr: e.target.value }))
              }
            />
          </div>
          <div className="field">
            <label>About (EN)</label>
            <textarea
              className="input"
              rows={3}
              value={pages.aboutEn || ""}
              onChange={(e) =>
                setPages((p) => ({ ...p, aboutEn: e.target.value }))
              }
            />
          </div>
          <div className="field">
            <label>About (FR)</label>
            <textarea
              className="input"
              rows={3}
              value={pages.aboutFr || ""}
              onChange={(e) =>
                setPages((p) => ({ ...p, aboutFr: e.target.value }))
              }
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? dict.saving : dict.save}
          </button>
        </form>
      </section>
    </DashboardShell>
  );
}
