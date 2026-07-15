"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../../lib/api";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

const caseSchema = z.object({
  id: z.string().optional(),
  titleAr: z.string().min(3).max(200),
  titleEn: z.string().max(200).optional(),
  titleFr: z.string().max(200).optional(),
  descriptionAr: z.string().max(2000).optional(),
  descriptionEn: z.string().max(2000).optional(),
  descriptionFr: z.string().max(2000).optional(),
  beforeImageUrl: z.string().min(3).max(500),
  afterImageUrl: z.string().min(3).max(500),
  beforeAltAr: z.string().max(200).optional(),
  beforeAltEn: z.string().max(200).optional(),
  beforeAltFr: z.string().max(200).optional(),
  afterAltAr: z.string().max(200).optional(),
  afterAltEn: z.string().max(200).optional(),
  afterAltFr: z.string().max(200).optional(),
  doctorId: z.string().optional(),
  serviceSlug: z.string().max(80).optional(),
  specialtySlug: z.string().max(80).optional(),
  treatmentCategory: z.string().max(120).optional(),
  treatmentDuration: z.string().max(120).optional(),
  resultDate: z.string().optional(),
  patientAgeRange: z.string().max(40).optional(),
  isAnonymous: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z.number().min(0).max(10000),
  consentConfirmed: z.boolean(),
  consentDocumentReference: z.string().max(200).optional(),
});

type CaseRow = z.infer<typeof caseSchema> & {
  id: string;
  isApproved?: boolean;
  isPublished?: boolean;
  doctorName?: string;
  canPublish?: boolean;
};

const emptyForm = {
  titleAr: "",
  titleEn: "",
  titleFr: "",
  descriptionAr: "",
  descriptionEn: "",
  descriptionFr: "",
  beforeImageUrl: "",
  afterImageUrl: "",
  beforeAltAr: "",
  beforeAltEn: "",
  beforeAltFr: "",
  afterAltAr: "",
  afterAltEn: "",
  afterAltFr: "",
  doctorId: "",
  serviceSlug: "",
  specialtySlug: "",
  treatmentCategory: "",
  treatmentDuration: "",
  resultDate: "",
  patientAgeRange: "",
  isAnonymous: true,
  isFeatured: false,
  displayOrder: 0,
  consentConfirmed: false,
  consentDocumentReference: "",
};

export default function BeforeAfterAdminPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [rows, setRows] = useState<CaseRow[]>([]);
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
    });
    if (q.trim()) qs.set("q", q.trim());
    if (approval) qs.set("approval", approval);
    if (publication) qs.set("publication", publication);
    if (featured) qs.set("featured", featured);
    const res = await fetch(`/api/admin/before-after?${qs}`, {
      credentials: "include",
    });
    if (!res.ok) {
      setErr("تعذر تحميل الحالات.");
      return;
    }
    const data = await res.json();
    setRows(data.cases || []);
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

  async function upload(field: "beforeImageUrl" | "afterImageUrl", file: File) {
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
    patchForm({ [field]: data.url });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const parsed = caseSchema.safeParse({
      ...form,
      id: editingId || undefined,
      displayOrder: Number(form.displayOrder) || 0,
    });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }
    if (!parsed.data.beforeImageUrl || !parsed.data.afterImageUrl) {
      setErr("صور قبل وبعد مطلوبة.");
      return;
    }
    setSaving(true);
    const { ok, data } = await apiRequest<{ message?: string }>(
      "/api/admin/before-after",
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
      `/api/admin/before-after/${path}`,
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

  function startEdit(row: CaseRow) {
    setEditingId(row.id);
    setDirty(false);
    setForm({
      titleAr: row.titleAr,
      titleEn: row.titleEn || "",
      titleFr: row.titleFr || "",
      descriptionAr: row.descriptionAr || "",
      descriptionEn: row.descriptionEn || "",
      descriptionFr: row.descriptionFr || "",
      beforeImageUrl: row.beforeImageUrl,
      afterImageUrl: row.afterImageUrl,
      beforeAltAr: row.beforeAltAr || "",
      beforeAltEn: row.beforeAltEn || "",
      beforeAltFr: row.beforeAltFr || "",
      afterAltAr: row.afterAltAr || "",
      afterAltEn: row.afterAltEn || "",
      afterAltFr: row.afterAltFr || "",
      doctorId: row.doctorId || "",
      serviceSlug: row.serviceSlug || "",
      specialtySlug: row.specialtySlug || "",
      treatmentCategory: row.treatmentCategory || "",
      treatmentDuration: row.treatmentDuration || "",
      resultDate: row.resultDate ? String(row.resultDate).slice(0, 10) : "",
      patientAgeRange: row.patientAgeRange || "",
      isAnonymous: row.isAnonymous !== false,
      isFeatured: row.isFeatured === true,
      displayOrder: row.displayOrder || 0,
      consentConfirmed: row.consentConfirmed === true,
      consentDocumentReference: row.consentDocumentReference || "",
    });
  }

  const previewTitle = useMemo(() => {
    if (previewLocale === "en") return form.titleEn || form.titleAr;
    if (previewLocale === "fr") return form.titleFr || form.titleEn || form.titleAr;
    return form.titleAr || form.titleEn;
  }, [form, previewLocale]);

  const blockers: string[] = [];
  if (!form.beforeImageUrl) blockers.push("صورة قبل مفقودة");
  if (!form.afterImageUrl) blockers.push("صورة بعد مفقودة");
  if (!form.consentConfirmed) blockers.push("موافقة النشر مفقودة");

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
      title={dict.navBeforeAfter}
      description="إدارة حالات قبل وبعد للعلاج — موافقة، اعتماد، ونشر آمن"
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
            <option value="">كل الاعتماد</option>
            <option value="approved">معتمد</option>
            <option value="pending">بانتظار</option>
          </select>
          <select
            className="input"
            value={publication}
            onChange={(e) => {
              setPage(1);
              setPublication(e.target.value);
            }}
          >
            <option value="">كل النشر</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
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
                <th>قبل</th>
                <th>بعد</th>
                <th>العنوان</th>
                <th>طبيب</th>
                <th>تخصص</th>
                <th>خدمة</th>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="pc-thumb" src={r.beforeImageUrl} alt="" />
                  </td>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="pc-thumb" src={r.afterImageUrl} alt="" />
                  </td>
                  <td>{r.titleAr}</td>
                  <td>{r.doctorName || "—"}</td>
                  <td>{r.specialtySlug || "—"}</td>
                  <td>{r.serviceSlug || "—"}</td>
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
        </p>
      </section>

      <section className="card-surface dash-actions" style={{ marginTop: "1rem" }}>
        <h2>{editingId ? "تعديل حالة" : "إنشاء حالة قبل/بعد"}</h2>
        {blockers.length > 0 ? (
          <div className="alert-error" style={{ marginBottom: "0.75rem" }}>
            متطلبات النشر غير مكتملة: {blockers.join(" · ")} — يلزم الاعتماد أيضاً قبل النشر.
          </div>
        ) : (
          <div className="alert-success" style={{ marginBottom: "0.75rem" }}>
            الصور والموافقة جاهزة — يلزم الاعتماد قبل النشر.
          </div>
        )}
        <form className="stack-form" onSubmit={save}>
          <div className="row-2">
            <div className="field">
              <label>العنوان AR *</label>
              <input
                className="input"
                required
                value={form.titleAr}
                onChange={(e) => patchForm({ titleAr: e.target.value })}
              />
            </div>
            <div className="field">
              <label>العنوان EN</label>
              <input
                className="input"
                value={form.titleEn}
                onChange={(e) => patchForm({ titleEn: e.target.value })}
              />
            </div>
            <div className="field">
              <label>العنوان FR</label>
              <input
                className="input"
                value={form.titleFr}
                onChange={(e) => patchForm({ titleFr: e.target.value })}
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
          <div className="field">
            <label>الوصف AR</label>
            <textarea
              className="input"
              rows={3}
              value={form.descriptionAr}
              onChange={(e) => patchForm({ descriptionAr: e.target.value })}
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>الوصف EN</label>
              <textarea
                className="input"
                rows={2}
                value={form.descriptionEn}
                onChange={(e) => patchForm({ descriptionEn: e.target.value })}
              />
            </div>
            <div className="field">
              <label>الوصف FR</label>
              <textarea
                className="input"
                rows={2}
                value={form.descriptionFr}
                onChange={(e) => patchForm({ descriptionFr: e.target.value })}
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>صورة قبل *</label>
              <input
                className="input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload("beforeImageUrl", f);
                }}
              />
              {form.beforeImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="pc-thumb" src={form.beforeImageUrl} alt="" style={{ marginTop: 8 }} />
              ) : null}
            </div>
            <div className="field">
              <label>صورة بعد *</label>
              <input
                className="input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload("afterImageUrl", f);
                }}
              />
              {form.afterImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="pc-thumb" src={form.afterImageUrl} alt="" style={{ marginTop: 8 }} />
              ) : null}
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>قبل Alt AR</label>
              <input className="input" value={form.beforeAltAr} onChange={(e) => patchForm({ beforeAltAr: e.target.value })} />
            </div>
            <div className="field">
              <label>قبل Alt EN</label>
              <input className="input" value={form.beforeAltEn} onChange={(e) => patchForm({ beforeAltEn: e.target.value })} />
            </div>
            <div className="field">
              <label>بعد Alt AR</label>
              <input className="input" value={form.afterAltAr} onChange={(e) => patchForm({ afterAltAr: e.target.value })} />
            </div>
            <div className="field">
              <label>بعد Alt EN</label>
              <input className="input" value={form.afterAltEn} onChange={(e) => patchForm({ afterAltEn: e.target.value })} />
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
              <label>تخصص slug</label>
              <input className="input" value={form.specialtySlug} onChange={(e) => patchForm({ specialtySlug: e.target.value })} />
            </div>
            <div className="field">
              <label>خدمة slug</label>
              <input className="input" value={form.serviceSlug} onChange={(e) => patchForm({ serviceSlug: e.target.value })} />
            </div>
            <div className="field">
              <label>مدة العلاج</label>
              <input className="input" value={form.treatmentDuration} onChange={(e) => patchForm({ treatmentDuration: e.target.value })} />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>فئة العلاج</label>
              <input className="input" value={form.treatmentCategory} onChange={(e) => patchForm({ treatmentCategory: e.target.value })} />
            </div>
            <div className="field">
              <label>تاريخ النتيجة</label>
              <input className="input" type="date" value={form.resultDate} onChange={(e) => patchForm({ resultDate: e.target.value })} />
            </div>
            <div className="field">
              <label>الفئة العمرية</label>
              <input className="input" value={form.patientAgeRange} onChange={(e) => patchForm({ patientAgeRange: e.target.value })} />
            </div>
            <div className="field">
              <label>مرجع الموافقة</label>
              <input className="input" value={form.consentDocumentReference} onChange={(e) => patchForm({ consentDocumentReference: e.target.value })} />
            </div>
          </div>
          <div className="row-2">
            <label className="field">
              <span>
                <input type="checkbox" checked={form.isAnonymous} onChange={(e) => patchForm({ isAnonymous: e.target.checked })} /> مجهول
              </span>
            </label>
            <label className="field">
              <span>
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => patchForm({ isFeatured: e.target.checked })} /> مميز
              </span>
            </label>
            <label className="field">
              <span>
                <input type="checkbox" checked={form.consentConfirmed} onChange={(e) => patchForm({ consentConfirmed: e.target.checked })} /> موافقة مؤكدة
              </span>
            </label>
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
            <strong>معاينة — {previewTitle || "—"}</strong>
            {(["ar", "en", "fr"] as const).map((l) => (
              <button key={l} type="button" className="btn btn-outline" onClick={() => setPreviewLocale(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {form.beforeImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="pc-thumb" style={{ width: 160, height: 120 }} src={form.beforeImageUrl} alt="before" />
            ) : null}
            {form.afterImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="pc-thumb" style={{ width: 160, height: 120 }} src={form.afterImageUrl} alt="after" />
            ) : null}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
