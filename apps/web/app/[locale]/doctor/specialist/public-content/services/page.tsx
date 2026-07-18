"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../../lib/api";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

type SpecialtyOption = { id: string; nameAr: string; slug: string };

type ServiceRow = {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  shortDescriptionAr?: string;
  specialtyIds: string[];
  icon?: string;
  image?: string;
  durationMinutes?: number | null;
  isBookable?: boolean;
  isActive?: boolean;
  isPublic?: boolean;
  isFeatured?: boolean;
  requiresConsultation?: boolean;
  displayOrder?: number;
  archivedAt?: string | null;
};

const empty = {
  nameAr: "",
  nameEn: "",
  nameFr: "",
  slug: "",
  descriptionAr: "",
  descriptionEn: "",
  descriptionFr: "",
  shortDescriptionAr: "",
  specialtyIds: [] as string[],
  icon: "tooth",
  image: "",
  durationMinutes: null as number | null,
  isBookable: true,
  isActive: true,
  isPublic: false,
  isFeatured: false,
  requiresConsultation: false,
  displayOrder: 100,
};

export default function ServicesAdminPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [form, setForm] = useState<typeof empty & { id?: string }>({ ...empty });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    const [svc, spec] = await Promise.all([
      apiRequest<{ services?: ServiceRow[] }>(
        `/api/admin/catalog/services?pageSize=100${showArchived ? "&archived=true" : ""}`,
      ),
      apiRequest<{ specialties?: SpecialtyOption[] }>(
        "/api/admin/catalog/specialties?pageSize=100",
      ),
    ]);
    if (!svc.ok) {
      setErr(apiErrorMessage(svc.data));
      return;
    }
    setRows(svc.data.services || []);
    if (spec.ok) setSpecialties(spec.data.specialties || []);
  }, [showArchived]);

  useEffect(() => {
    if (!loading && user) void load();
  }, [loading, user, load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setMsg("");
    const { ok, data } = await apiRequest("/api/admin/catalog/services", {
      method: form.id ? "PATCH" : "POST",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(locale === "en" ? "Saved." : "تم الحفظ.");
    setForm({ ...empty });
    await load();
  }

  async function flag(
    id: string,
    action: "publish" | "activate" | "feature" | "archive" | "restore",
    value?: boolean,
  ) {
    const path =
      action === "publish"
        ? "/api/admin/catalog/services/publish"
        : action === "activate"
          ? "/api/admin/catalog/services/activate"
          : action === "feature"
            ? "/api/admin/catalog/services/feature"
            : action === "restore"
              ? "/api/admin/catalog/services/restore"
              : "/api/admin/catalog/services/archive";
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
        <h1>{dict.navServicesAdmin}</h1>
        {msg ? <p className="alert-success">{msg}</p> : null}
        {err ? <p className="alert-error">{err}</p> : null}

        <form className="card-surface stack-form" onSubmit={onSubmit}>
          <div className="row-2">
            <div className="field">
              <label htmlFor="s-nameAr">AR</label>
              <input
                id="s-nameAr"
                className="input"
                required
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="s-slug">slug</label>
              <input
                id="s-slug"
                className="input"
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="s-nameEn">EN</label>
              <input
                id="s-nameEn"
                className="input"
                required
                value={form.nameEn}
                onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="s-nameFr">FR</label>
              <input
                id="s-nameFr"
                className="input"
                required
                value={form.nameFr}
                onChange={(e) => setForm((f) => ({ ...f, nameFr: e.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="s-desc">وصف عربي</label>
            <textarea
              id="s-desc"
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
              <label htmlFor="s-image">مسار الصورة</label>
              <input
                id="s-image"
                className="input"
                dir="ltr"
                placeholder="/api/media/..."
                value={form.image}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="s-duration">المدة بالدقائق</label>
              <input
                id="s-duration"
                className="input"
                type="number"
                min={0}
                value={form.durationMinutes ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    durationMinutes:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <fieldset className="field">
            <legend>التخصصات المرتبطة</legend>
            <div className="cta-row" style={{ flexWrap: "wrap" }}>
              {specialties.map((s) => {
                const checked = form.specialtyIds.includes(s.id);
                return (
                  <label key={s.id} className="check-row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          specialtyIds: e.target.checked
                            ? [...f.specialtyIds, s.id]
                            : f.specialtyIds.filter((id) => id !== s.id),
                        }))
                      }
                    />
                    {s.nameAr}
                  </label>
                );
              })}
            </div>
          </fieldset>
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
              Featured
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={form.requiresConsultation === true}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    requiresConsultation: e.target.checked,
                  }))
                }
              />
              Consultation
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
            {form.id ? "Update" : "Create"}
          </button>
        </form>

        <label className="check-row">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          عرض الخدمات المؤرشفة
        </label>

        {rows.map((row) => (
          <article key={row.id} className="card-surface">
            <h3>
              {row.nameAr} / {row.nameEn}
            </h3>
            <p className="muted">{row.slug}</p>
            <p>
              {row.isActive ? "active" : "inactive"} ·{" "}
              {row.isPublic ? "public" : "draft"} · specialties:{" "}
              {row.specialtyIds?.length || 0} ·{" "}
              {row.isBookable === false ? "غير قابل للحجز" : "قابل للحجز"}
            </p>
            <div className="cta-row">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setForm({ ...empty, ...row })}
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
              {row.archivedAt ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void flag(row.id, "restore")}
                >
                  Restore
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void flag(row.id, "archive")}
                >
                  Archive
                </button>
              )}
              <a
                className="btn btn-outline"
                href={`/${locale}/services/${row.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Preview
              </a>
            </div>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
