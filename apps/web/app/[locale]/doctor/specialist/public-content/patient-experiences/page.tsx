"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../../lib/api";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

const experienceSchema = z.object({
  id: z.string().optional(),
  isAnonymous: z.boolean(),
  displayNameAr: z.string().max(120).optional(),
  displayNameEn: z.string().max(120).optional(),
  displayNameFr: z.string().max(120).optional(),
  reviewAr: z.string().min(8).max(2000),
  reviewEn: z.string().max(2000).optional(),
  reviewFr: z.string().max(2000).optional(),
  rating: z.number().min(1).max(5),
  patientImageUrl: z.string().max(500).optional(),
  doctorId: z.string().optional(),
  serviceSlug: z.string().max(80).optional(),
  specialtySlug: z.string().max(80).optional(),
  treatmentTitleAr: z.string().max(160).optional(),
  treatmentTitleEn: z.string().max(160).optional(),
  treatmentTitleFr: z.string().max(160).optional(),
  reviewDate: z.string().optional(),
  isVerifiedPatient: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z.number().min(0).max(10000),
  consentConfirmed: z.boolean(),
  consentDocumentReference: z.string().max(200).optional(),
});

type Experience = z.infer<typeof experienceSchema> & {
  id: string;
  isApproved?: boolean;
  isPublished?: boolean;
  doctorName?: string;
  canPublish?: boolean;
  languages?: { ar: boolean; en: boolean; fr: boolean };
};

const emptyForm = {
  isAnonymous: true,
  displayNameAr: "",
  displayNameEn: "",
  displayNameFr: "",
  reviewAr: "",
  reviewEn: "",
  reviewFr: "",
  rating: 5,
  patientImageUrl: "",
  doctorId: "",
  serviceSlug: "",
  specialtySlug: "",
  treatmentTitleAr: "",
  treatmentTitleEn: "",
  treatmentTitleFr: "",
  reviewDate: "",
  isVerifiedPatient: false,
  isFeatured: false,
  displayOrder: 0,
  consentConfirmed: false,
  consentDocumentReference: "",
};

export default function PatientExperiencesAdminPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [rows, setRows] = useState<Experience[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [approval, setApproval] = useState("");
  const [publication, setPublication] = useState("");
  const [featured, setFeatured] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewLocale, setPreviewLocale] = useState<"ar" | "en" | "fr">("ar");
  const [doctors, setDoctors] = useState<{ id: string; fullName: string }[]>(
    [],
  );

  const load = useCallback(async () => {
    const qs = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      sort: "displayOrder",
    });
    if (q.trim()) qs.set("q", q.trim());
    if (approval) qs.set("approval", approval);
    if (publication) qs.set("publication", publication);
    if (featured) qs.set("featured", featured);
    const res = await fetch(`/api/admin/patient-experiences?${qs}`, {
      credentials: "include",
    });
    if (!res.ok) {
      setErr("تعذر تحميل التجارب.");
      return;
    }
    const data = await res.json();
    setRows(data.experiences || []);
    setTotal(data.total || 0);
  }, [approval, featured, page, publication, q]);

  useEffect(() => {
    if (!user) return;
    void load();
    void fetch("/api/admin/doctors", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors || []))
      .catch(() => undefined);
  }, [load, user]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function patchForm(partial: Partial<typeof emptyForm>) {
    setDirty(true);
    setForm((f) => ({ ...f, ...partial }));
  }

  async function uploadImage(file: File) {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/media/upload", {
      method: "POST",
      credentials: "include",
      body,
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(apiErrorMessage(data) || "فشل رفع الصورة");
      return;
    }
    patchForm({ patientImageUrl: data.url });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const parsed = experienceSchema.safeParse({
      ...form,
      id: editingId || undefined,
      rating: Number(form.rating),
      displayOrder: Number(form.displayOrder) || 0,
    });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }
    setSaving(true);
    const { ok, data } = await apiRequest<{ message?: string }>(
      "/api/admin/patient-experiences",
      {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...parsed.data,
          id: editingId || undefined,
        }),
      },
    );
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || dict.successSaved);
    setDirty(false);
    setEditingId(null);
    setForm(emptyForm);
    await load();
  }

  async function act(path: string, id: string, extra?: Record<string, unknown>) {
    setErr("");
    setMsg("");
    const { ok, data } = await apiRequest<{ message?: string }>(
      `/api/admin/patient-experiences/${path}`,
      {
        method: "POST",
        body: JSON.stringify({ id, ...extra }),
      },
    );
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || "OK");
    await load();
  }

  function startEdit(row: Experience) {
    setEditingId(row.id);
    setDirty(false);
    setForm({
      isAnonymous: row.isAnonymous !== false,
      displayNameAr: row.displayNameAr || "",
      displayNameEn: row.displayNameEn || "",
      displayNameFr: row.displayNameFr || "",
      reviewAr: row.reviewAr,
      reviewEn: row.reviewEn || "",
      reviewFr: row.reviewFr || "",
      rating: row.rating,
      patientImageUrl: row.patientImageUrl || "",
      doctorId: row.doctorId || "",
      serviceSlug: row.serviceSlug || "",
      specialtySlug: row.specialtySlug || "",
      treatmentTitleAr: row.treatmentTitleAr || "",
      treatmentTitleEn: row.treatmentTitleEn || "",
      treatmentTitleFr: row.treatmentTitleFr || "",
      reviewDate: row.reviewDate
        ? String(row.reviewDate).slice(0, 10)
        : "",
      isVerifiedPatient: row.isVerifiedPatient === true,
      isFeatured: row.isFeatured === true,
      displayOrder: row.displayOrder || 0,
      consentConfirmed: row.consentConfirmed === true,
      consentDocumentReference: row.consentDocumentReference || "",
    });
  }

  const preview = useMemo(() => {
    const name = form.isAnonymous
      ? previewLocale === "en"
        ? "Verified clinic patient"
        : previewLocale === "fr"
          ? "Patient de la clinique"
          : "مريض من العيادة"
      : previewLocale === "en"
        ? form.displayNameEn || form.displayNameAr
        : previewLocale === "fr"
          ? form.displayNameFr || form.displayNameEn || form.displayNameAr
          : form.displayNameAr || form.displayNameEn;
    const text =
      previewLocale === "en"
        ? form.reviewEn || form.reviewAr
        : previewLocale === "fr"
          ? form.reviewFr || form.reviewEn || form.reviewAr
          : form.reviewAr || form.reviewEn;
    return { name, text };
  }, [form, previewLocale]);

  const blockers = [];
  if (!form.consentConfirmed) blockers.push("موافقة النشر مفقودة");
  if (!(form.reviewAr || form.reviewEn || form.reviewFr))
    blockers.push("نص التجربة مفقود");

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
      title={dict.navPatientExperiences}
      description="إدارة تجارب المرضى للموقع العام — اعتماد وموافقة ونشر"
    >
      {msg ? <div className="alert-success">{msg}</div> : null}
      {err ? <div className="alert-error">{err}</div> : null}

      <section className="card-surface dash-actions">
        <div className="row-2" style={{ gap: "0.75rem", marginBottom: "1rem" }}>
          <input
            className="input"
            placeholder={dict.search}
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
          <select
            className="input"
            value={approval}
            onChange={(e) => {
              setPage(1);
              setApproval(e.target.value);
            }}
          >
            <option value="">كل حالات الاعتماد</option>
            <option value="approved">معتمد</option>
            <option value="pending">بانتظار الاعتماد</option>
          </select>
          <select
            className="input"
            value={publication}
            onChange={(e) => {
              setPage(1);
              setPublication(e.target.value);
            }}
          >
            <option value="">كل حالات النشر</option>
            <option value="published">منشور</option>
            <option value="draft">غير منشور</option>
          </select>
          <select
            className="input"
            value={featured}
            onChange={(e) => {
              setPage(1);
              setFeatured(e.target.value);
            }}
          >
            <option value="">الكل / مميز</option>
            <option value="true">مميز</option>
            <option value="false">غير مميز</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pc-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>تقييم</th>
                <th>طبيب</th>
                <th>خدمة</th>
                <th>موثّق</th>
                <th>موافقة</th>
                <th>اعتماد</th>
                <th>نشر</th>
                <th>مميز</th>
                <th>ترتيب</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.isAnonymous
                      ? "مريض من العيادة"
                      : r.displayNameAr || r.displayNameEn || "—"}
                  </td>
                  <td>{r.rating}</td>
                  <td>{r.doctorName || "—"}</td>
                  <td>{r.serviceSlug || "—"}</td>
                  <td>{r.isVerifiedPatient ? "✓" : "—"}</td>
                  <td>
                    <span className={`pc-badge ${r.consentConfirmed ? "" : "warn"}`}>
                      {r.consentConfirmed ? "نعم" : "لا"}
                    </span>
                  </td>
                  <td>
                    <span className={`pc-badge ${r.isApproved ? "" : "warn"}`}>
                      {r.isApproved ? "معتمد" : "بانتظار"}
                    </span>
                  </td>
                  <td>
                    <span className={`pc-badge ${r.isPublished ? "" : "muted"}`}>
                      {r.isPublished ? "منشور" : "مسودة"}
                    </span>
                  </td>
                  <td>{r.isFeatured ? "★" : "—"}</td>
                  <td>{r.displayOrder}</td>
                  <td>
                    <div className="pc-actions">
                      <button type="button" className="btn btn-outline" onClick={() => startEdit(r)}>
                        تعديل
                      </button>
                      {!r.isApproved ? (
                        <button type="button" className="btn btn-outline" onClick={() => void act("approve", r.id)}>
                          اعتماد
                        </button>
                      ) : (
                        <button type="button" className="btn btn-outline" onClick={() => void act("reject", r.id)}>
                          رفض
                        </button>
                      )}
                      {r.isPublished ? (
                        <button type="button" className="btn btn-outline" onClick={() => void act("unpublish", r.id)}>
                          إلغاء نشر
                        </button>
                      ) : (
                        <button type="button" className="btn btn-primary" onClick={() => void act("publish", r.id)}>
                          نشر
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() =>
                          void act("feature", r.id, { featured: !r.isFeatured })
                        }
                      >
                        {r.isFeatured ? "إلغاء تمييز" : "تمييز"}
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => void act("archive", r.id)}>
                        أرشفة
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          الصفحة {page} — إجمالي {total}
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginInlineStart: "0.5rem" }}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            السابق
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginInlineStart: "0.35rem" }}
            disabled={page * 20 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            التالي
          </button>
        </p>
      </section>

      <section className="card-surface dash-actions" style={{ marginTop: "1rem" }}>
        <h2>{editingId ? "تعديل تجربة" : "إنشاء تجربة"}</h2>
        {blockers.length > 0 ? (
          <div className="alert-error" style={{ marginBottom: "0.75rem" }}>
            متطلبات النشر غير مكتملة: {blockers.join(" · ")}
          </div>
        ) : (
          <div className="alert-success" style={{ marginBottom: "0.75rem" }}>
            الموافقة ونص التجربة جاهزان — يلزم الاعتماد قبل النشر.
          </div>
        )}
        <form className="stack-form" onSubmit={save}>
          <label className="field">
            <span>
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) => patchForm({ isAnonymous: e.target.checked })}
              />{" "}
              عرض مجهول
            </span>
          </label>
          <div className="row-2">
            <div className="field">
              <label>الاسم AR</label>
              <input
                className="input"
                value={form.displayNameAr}
                onChange={(e) => patchForm({ displayNameAr: e.target.value })}
              />
            </div>
            <div className="field">
              <label>الاسم EN</label>
              <input
                className="input"
                value={form.displayNameEn}
                onChange={(e) => patchForm({ displayNameEn: e.target.value })}
              />
            </div>
            <div className="field">
              <label>الاسم FR</label>
              <input
                className="input"
                value={form.displayNameFr}
                onChange={(e) => patchForm({ displayNameFr: e.target.value })}
              />
            </div>
            <div className="field">
              <label>التقييم</label>
              <input
                className="input"
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => patchForm({ rating: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="field">
            <label>التجربة AR *</label>
            <textarea
              className="input"
              rows={3}
              required
              value={form.reviewAr}
              onChange={(e) => patchForm({ reviewAr: e.target.value })}
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>التجربة EN</label>
              <textarea
                className="input"
                rows={3}
                value={form.reviewEn}
                onChange={(e) => patchForm({ reviewEn: e.target.value })}
              />
            </div>
            <div className="field">
              <label>التجربة FR</label>
              <textarea
                className="input"
                rows={3}
                value={form.reviewFr}
                onChange={(e) => patchForm({ reviewFr: e.target.value })}
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>طبيب</label>
              <select
                className="input"
                value={form.doctorId}
                onChange={(e) => patchForm({ doctorId: e.target.value })}
              >
                <option value="">—</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>خدمة (slug)</label>
              <input
                className="input"
                value={form.serviceSlug}
                onChange={(e) => patchForm({ serviceSlug: e.target.value })}
              />
            </div>
            <div className="field">
              <label>تخصص (slug)</label>
              <input
                className="input"
                value={form.specialtySlug}
                onChange={(e) => patchForm({ specialtySlug: e.target.value })}
              />
            </div>
            <div className="field">
              <label>ترتيب العرض</label>
              <input
                className="input"
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  patchForm({ displayOrder: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>عنوان العلاج AR</label>
              <input
                className="input"
                value={form.treatmentTitleAr}
                onChange={(e) => patchForm({ treatmentTitleAr: e.target.value })}
              />
            </div>
            <div className="field">
              <label>عنوان العلاج EN</label>
              <input
                className="input"
                value={form.treatmentTitleEn}
                onChange={(e) => patchForm({ treatmentTitleEn: e.target.value })}
              />
            </div>
            <div className="field">
              <label>عنوان العلاج FR</label>
              <input
                className="input"
                value={form.treatmentTitleFr}
                onChange={(e) => patchForm({ treatmentTitleFr: e.target.value })}
              />
            </div>
            <div className="field">
              <label>تاريخ المراجعة</label>
              <input
                className="input"
                type="date"
                value={form.reviewDate}
                onChange={(e) => patchForm({ reviewDate: e.target.value })}
              />
            </div>
          </div>
          <div className="row-2">
            <label className="field">
              <span>
                <input
                  type="checkbox"
                  checked={form.isVerifiedPatient}
                  onChange={(e) =>
                    patchForm({ isVerifiedPatient: e.target.checked })
                  }
                />{" "}
                مريض موثّق
              </span>
            </label>
            <label className="field">
              <span>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => patchForm({ isFeatured: e.target.checked })}
                />{" "}
                مميز
              </span>
            </label>
            <label className="field">
              <span>
                <input
                  type="checkbox"
                  checked={form.consentConfirmed}
                  onChange={(e) =>
                    patchForm({ consentConfirmed: e.target.checked })
                  }
                />{" "}
                تأكيد الموافقة
              </span>
            </label>
            <div className="field">
              <label>مرجع الموافقة (داخلي)</label>
              <input
                className="input"
                value={form.consentDocumentReference}
                onChange={(e) =>
                  patchForm({ consentDocumentReference: e.target.value })
                }
              />
            </div>
          </div>
          <div className="field">
            <label>صورة المريض (اختياري بعد الموافقة)</label>
            <input
              className="input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadImage(f);
              }}
            />
            {form.patientImageUrl ? (
              <div style={{ marginTop: "0.5rem" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.patientImageUrl}
                  alt=""
                  style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => patchForm({ patientImageUrl: "" })}
                >
                  إزالة الصورة
                </button>
              </div>
            ) : null}
          </div>
          <div className="cta-row">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? dict.loading : dict.save}
            </button>
            {editingId ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setDirty(false);
                }}
              >
                إلغاء
              </button>
            ) : null}
          </div>
        </form>

        <div className="pc-preview">
          <div className="cta-row" style={{ marginBottom: "0.75rem" }}>
            <strong>معاينة</strong>
            {(["ar", "en", "fr"] as const).map((l) => (
              <button
                key={l}
                type="button"
                className="btn btn-outline"
                onClick={() => setPreviewLocale(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <blockquote className="pub-review" dir={previewLocale === "ar" ? "rtl" : "ltr"}>
            <p>{preview.text || "—"}</p>
            <footer>{preview.name || "—"} · {form.rating}/5</footer>
          </blockquote>
        </div>
      </section>
    </DashboardShell>
  );
}
