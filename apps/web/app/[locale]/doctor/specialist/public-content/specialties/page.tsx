"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../../lib/api";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

type Specialty = {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  shortDescriptionFr?: string;
  icon?: string;
  image?: string;
  isActive?: boolean;
  isPublic?: boolean;
  isFeatured?: boolean;
  isBookable?: boolean;
  displayOrder?: number;
};

const empty: Omit<Specialty, "id"> = {
  nameAr: "",
  nameEn: "",
  nameFr: "",
  slug: "",
  descriptionAr: "",
  descriptionEn: "",
  descriptionFr: "",
  shortDescriptionAr: "",
  shortDescriptionEn: "",
  shortDescriptionFr: "",
  icon: "tooth",
  image: "",
  isActive: true,
  isPublic: false,
  isFeatured: false,
  isBookable: true,
  displayOrder: 100,
};

export default function SpecialtiesAdminPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [rows, setRows] = useState<Specialty[]>([]);
  const [form, setForm] = useState<Omit<Specialty, "id"> & { id?: string }>({
    ...empty,
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { ok, data } = await apiRequest<{ specialties?: Specialty[] }>(
      "/api/admin/catalog/specialties?pageSize=100",
    );
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setRows(data.specialties || []);
  }, []);

  useEffect(() => {
    if (!loading && user) void load();
  }, [loading, user, load]);

  async function onSeed() {
    setSaving(true);
    setErr("");
    setMsg("");
    const { ok, data } = await apiRequest("/api/admin/catalog/seed", {
      method: "POST",
    });
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(
      locale === "en"
        ? "Catalog seed completed."
        : locale === "fr"
          ? "Seed du catalogue terminé."
          : "تم تنفيذ بذرة الكتالوج.",
    );
    await load();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setMsg("");
    const { ok, data } = await apiRequest(
      "/api/admin/catalog/specialties",
      {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(form),
      },
    );
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(locale === "en" ? "Saved." : locale === "fr" ? "Enregistré." : "تم الحفظ.");
    setForm({ ...empty });
    await load();
  }

  async function flag(
    id: string,
    action: "publish" | "activate" | "feature" | "archive",
    value?: boolean,
  ) {
    const path =
      action === "publish"
        ? "/api/admin/catalog/specialties/publish"
        : action === "activate"
          ? "/api/admin/catalog/specialties/activate"
          : action === "feature"
            ? "/api/admin/catalog/specialties/feature"
            : "/api/admin/catalog/specialties/archive";
    const body =
      action === "publish"
        ? { id, publish: value }
        : action === "activate"
          ? { id, active: value }
          : action === "feature"
            ? { id, featured: value }
            : { id };
    const { ok, data } = await apiRequest(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    await load();
  }

  if (loading) {
    return (
      <DashboardShell locale={locale} dict={dict} role={user?.role || "ADMIN"} userName={user?.fullName || ""}>
        <p className="muted">…</p>
      </DashboardShell>
    );
  }
  if (error || !user) {
    return (
      <DashboardShell locale={locale} dict={dict} role="ADMIN" userName="">
        <p className="alert-error">{error || "Unauthorized"}</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell locale={locale} dict={dict} role={user.role} userName={user.fullName}>
      <div className="stack-form">
        <div className="section-head">
          <h1>{dict.navSpecialtiesAdmin}</h1>
          <button type="button" className="btn btn-outline" onClick={onSeed} disabled={saving}>
            {locale === "en"
              ? "Run idempotent seed"
              : locale === "fr"
                ? "Seed idempotent"
                : "تشغيل بذرة آمنة"}
          </button>
        </div>
        {msg ? <p className="alert-success">{msg}</p> : null}
        {err ? <p className="alert-error">{err}</p> : null}

        <form className="card-surface stack-form" onSubmit={onSubmit}>
          <div className="row-2">
            <div className="field">
              <label htmlFor="nameAr">AR</label>
              <input
                id="nameAr"
                className="input"
                required
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="nameEn">EN</label>
              <input
                id="nameEn"
                className="input"
                required
                value={form.nameEn}
                onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="nameFr">FR</label>
              <input
                id="nameFr"
                className="input"
                required
                value={form.nameFr}
                onChange={(e) => setForm((f) => ({ ...f, nameFr: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="slug">slug</label>
              <input
                id="slug"
                className="input"
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="descriptionAr">وصف عربي</label>
            <textarea
              id="descriptionAr"
              className="input"
              rows={3}
              value={form.descriptionAr}
              onChange={(e) =>
                setForm((f) => ({ ...f, descriptionAr: e.target.value }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="shortDescriptionAr">وصف مختصر (AR)</label>
              <textarea
                id="shortDescriptionAr"
                className="input"
                rows={2}
                value={form.shortDescriptionAr}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    shortDescriptionAr: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="shortDescriptionEn">وصف مختصر (EN)</label>
              <textarea
                id="shortDescriptionEn"
                className="input"
                rows={2}
                value={form.shortDescriptionEn}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    shortDescriptionEn: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="shortDescriptionFr">وصف مختصر (FR)</label>
            <textarea
              id="shortDescriptionFr"
              className="input"
              rows={2}
              value={form.shortDescriptionFr}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  shortDescriptionFr: e.target.value,
                }))
              }
            />
          </div>
          <div className="row-2">
            <label className="check-row">
              <input
                type="checkbox"
                checked={form.isActive !== false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              Active
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={form.isPublic === true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublic: e.target.checked }))
                }
              />
              Public
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={form.isFeatured === true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                }
              />
              إظهار ضمن تخصصات مميزة
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={form.isBookable !== false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isBookable: e.target.checked }))
                }
              />
              قابل للحجز
            </label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {form.id
              ? locale === "en"
                ? "Update"
                : "تحديث"
              : locale === "en"
                ? "Create"
                : "إنشاء"}
          </button>
        </form>

        <div className="stack-form">
          {rows.map((row) => (
            <article key={row.id} className="card-surface">
              <h3>
                {row.nameAr} / {row.nameEn}
              </h3>
              <p className="muted">{row.slug}</p>
              <p>
                {row.isActive ? "active" : "inactive"} ·{" "}
                {row.isPublic ? "public" : "draft"} ·{" "}
                {row.isFeatured ? "featured" : "standard"}
              </p>
              <div className="cta-row">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setForm({ ...row })}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void flag(row.id, "publish", !row.isPublic)}
                >
                  {row.isPublic ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void flag(row.id, "activate", !row.isActive)}
                >
                  {row.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void flag(row.id, "feature", !row.isFeatured)}
                >
                  {row.isFeatured ? "Unfeature" : "Feature"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void flag(row.id, "archive")}
                >
                  Archive
                </button>
                <a
                  className="btn btn-outline"
                  href={`/${locale}/specialties/${row.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
