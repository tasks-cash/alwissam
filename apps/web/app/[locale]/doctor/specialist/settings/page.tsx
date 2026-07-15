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
  phoneDisplay?: string;
  phoneInternational?: string;
  email?: string;
  address?: string;
  addressAr?: string;
  addressEn?: string;
  addressFr?: string;
  city?: string;
  stateOrWilaya?: string;
  postalCode?: string;
  countryAr?: string;
  countryEn?: string;
  countryFr?: string;
  whatsappNumber?: string;
  whatsappEnabled?: boolean;
  facebookUrl?: string;
  mapsEmbedUrl?: string;
  mapsLink?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  fridayClosed?: boolean;
  workingHoursAr?: string;
  workingHoursEn?: string;
  workingHoursFr?: string;
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
          <div className="field">
            <label>Name (FR)</label>
            <input
              className="input"
              value={info.nameFr || ""}
              onChange={(e) => setInfo((i) => ({ ...i, nameFr: e.target.value }))}
            />
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
            <label>Address (AR)</label>
            <textarea
              className="input"
              rows={2}
              value={info.addressAr || info.address || ""}
              onChange={(e) =>
                setInfo((i) => ({
                  ...i,
                  addressAr: e.target.value,
                  address: e.target.value,
                }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Address (EN)</label>
              <textarea
                className="input"
                rows={2}
                value={info.addressEn || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, addressEn: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Address (FR)</label>
              <textarea
                className="input"
                rows={2}
                value={info.addressFr || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, addressFr: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>City</label>
              <input
                className="input"
                value={info.city || ""}
                onChange={(e) => setInfo((i) => ({ ...i, city: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Wilaya</label>
              <input
                className="input"
                value={info.stateOrWilaya || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, stateOrWilaya: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>Postal code</label>
              <input
                className="input"
                dir="ltr"
                value={info.postalCode || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, postalCode: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Timezone</label>
              <input
                className="input"
                dir="ltr"
                value={info.timezone || "Africa/Algiers"}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, timezone: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>Country (AR)</label>
              <input
                className="input"
                value={info.countryAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, countryAr: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Country (EN)</label>
              <input
                className="input"
                value={info.countryEn || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, countryEn: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="field">
            <label>Country (FR)</label>
            <input
              className="input"
              value={info.countryFr || ""}
              onChange={(e) =>
                setInfo((i) => ({ ...i, countryFr: e.target.value }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Phone display</label>
              <input
                className="input"
                dir="ltr"
                value={info.phoneDisplay || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, phoneDisplay: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Phone international</label>
              <input
                className="input"
                dir="ltr"
                value={info.phoneInternational || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    phoneInternational: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>WhatsApp number</label>
              <input
                className="input"
                dir="ltr"
                value={info.whatsappNumber || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, whatsappNumber: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>WhatsApp enabled</label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={info.whatsappEnabled !== false}
                  onChange={(e) =>
                    setInfo((i) => ({
                      ...i,
                      whatsappEnabled: e.target.checked,
                    }))
                  }
                />
                <span>Show WhatsApp on public site</span>
              </label>
            </div>
          </div>
          <div className="field">
            <label>Facebook URL</label>
            <input
              className="input"
              dir="ltr"
              value={info.facebookUrl || ""}
              onChange={(e) =>
                setInfo((i) => ({ ...i, facebookUrl: e.target.value }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Maps link (directions)</label>
              <input
                className="input"
                dir="ltr"
                value={info.mapsLink || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, mapsLink: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Maps embed URL</label>
              <input
                className="input"
                dir="ltr"
                value={info.mapsEmbedUrl || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, mapsEmbedUrl: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>Latitude</label>
              <input
                className="input"
                dir="ltr"
                value={info.latitude || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, latitude: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Longitude</label>
              <input
                className="input"
                dir="ltr"
                value={info.longitude || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, longitude: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="field">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={info.fridayClosed !== false}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, fridayClosed: e.target.checked }))
                }
              />
              <span>Friday closed</span>
            </label>
          </div>
          <div className="field">
            <label>Working hours (AR)</label>
            <textarea
              className="input"
              rows={3}
              value={info.workingHoursAr || ""}
              onChange={(e) =>
                setInfo((i) => ({ ...i, workingHoursAr: e.target.value }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Working hours (EN)</label>
              <textarea
                className="input"
                rows={3}
                value={info.workingHoursEn || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, workingHoursEn: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Working hours (FR)</label>
              <textarea
                className="input"
                rows={3}
                value={info.workingHoursFr || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, workingHoursFr: e.target.value }))
                }
              />
            </div>
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
