"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../../lib/api";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

const reviewSchema = z.object({
  displayName: z.string().min(2).max(120),
  quoteAr: z.string().min(8).max(2000),
  quoteEn: z.string().max(2000).optional(),
  quoteFr: z.string().max(2000).optional(),
  rating: z.number().min(1).max(5),
  doctorId: z.string().optional(),
  specialtySlug: z.string().max(80).optional(),
  serviceSlug: z.string().max(80).optional(),
  isAnonymous: z.boolean(),
  isVerified: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z.number().min(0).max(10000),
  consentConfirmed: z.boolean(),
});

type ReviewRow = z.infer<typeof reviewSchema> & {
  id: string;
  status?: string;
  isApproved?: boolean;
  isPublished?: boolean;
};

const emptyForm = {
  displayName: "",
  quoteAr: "",
  quoteEn: "",
  quoteFr: "",
  rating: 5,
  doctorId: "",
  specialtySlug: "",
  serviceSlug: "",
  isAnonymous: true,
  isVerified: false,
  isFeatured: false,
  displayOrder: 0,
  consentConfirmed: true,
};

export default function ReviewsAdminPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<{ id: string; fullName: string }[]>(
    [],
  );

  const load = useCallback(async () => {
    const qs = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (q.trim()) qs.set("search", q.trim());
    if (status) qs.set("status", status);
    const res = await fetch(`/api/admin/reviews?${qs}`, {
      credentials: "include",
    });
    if (!res.ok) {
      setErr("تعذر تحميل التقييمات.");
      return;
    }
    const data = await res.json();
    setRows(data.items || []);
    setTotal(data.total || 0);
  }, [page, q, status]);

  useEffect(() => {
    if (!user) return;
    void load();
    void fetch("/api/admin/doctors", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors || []))
      .catch(() => undefined);
  }, [load, user]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const parsed = reviewSchema.safeParse({
      ...form,
      displayOrder: Number(form.displayOrder) || 0,
    });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }
    setSaving(true);
    const { ok, data } = await apiRequest<{ message?: string; id?: string }>(
      editingId ? `/api/admin/reviews/${editingId}` : "/api/admin/reviews",
      {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...parsed.data,
          displayNameAr: parsed.data.displayName,
        }),
      },
    );
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || dict.successSaved);
    setEditingId(null);
    setForm(emptyForm);
    await load();
  }

  async function act(
    id: string,
    action:
      | "approve"
      | "reject"
      | "publish"
      | "unpublish"
      | "feature"
      | "unfeature"
      | "archive",
  ) {
    setErr("");
    setMsg("");
    const { ok, data } = await apiRequest<{ message?: string }>(
      `/api/admin/reviews/${id}/${action}`,
      { method: "POST", body: JSON.stringify({}) },
    );
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || "OK");
    await load();
  }

  function startEdit(row: ReviewRow) {
    setEditingId(row.id);
    setForm({
      displayName: row.displayName || "",
      quoteAr: row.quoteAr || "",
      quoteEn: row.quoteEn || "",
      quoteFr: row.quoteFr || "",
      rating: row.rating || 5,
      doctorId: row.doctorId || "",
      specialtySlug: row.specialtySlug || "",
      serviceSlug: row.serviceSlug || "",
      isAnonymous: row.isAnonymous !== false,
      isVerified: row.isVerified === true,
      isFeatured: row.isFeatured === true,
      displayOrder: row.displayOrder || 0,
      consentConfirmed: row.consentConfirmed !== false,
    });
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
      title={dict.navReviewsAdmin}
      description="إدارة تقييمات المرضى — اعتماد، نشر، وتمييز"
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
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">كل الحالات</option>
            <option value="PENDING">بانتظار</option>
            <option value="APPROVED">معتمد</option>
            <option value="REJECTED">مرفوض</option>
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="pc-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>التقييم</th>
                <th>النص</th>
                <th>حالة</th>
                <th>نشر</th>
                <th>موثّق</th>
                <th>مميز</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.displayName || "—"}</td>
                  <td dir="ltr">{r.rating || "—"}</td>
                  <td>{(r.quoteAr || "").slice(0, 80)}…</td>
                  <td>{r.status || (r.isApproved ? "APPROVED" : "PENDING")}</td>
                  <td>{r.isPublished ? "نعم" : "لا"}</td>
                  <td>{r.isVerified ? "نعم" : "لا"}</td>
                  <td>{r.isFeatured ? "★" : "—"}</td>
                  <td>
                    <div className="pc-actions">
                      <button type="button" className="btn btn-outline" onClick={() => startEdit(r)}>
                        تعديل
                      </button>
                      {!r.isApproved ? (
                        <button type="button" className="btn btn-outline" onClick={() => void act(r.id, "approve")}>
                          اعتماد
                        </button>
                      ) : (
                        <button type="button" className="btn btn-outline" onClick={() => void act(r.id, "reject")}>
                          رفض
                        </button>
                      )}
                      {r.isPublished ? (
                        <button type="button" className="btn btn-outline" onClick={() => void act(r.id, "unpublish")}>
                          إلغاء نشر
                        </button>
                      ) : (
                        <button type="button" className="btn btn-primary" onClick={() => void act(r.id, "publish")}>
                          نشر
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() =>
                          void act(r.id, r.isFeatured ? "unfeature" : "feature")
                        }
                      >
                        {r.isFeatured ? "إلغاء تمييز" : "تمييز"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          {dict.page} {page} — {dict.total} {total}
        </p>
      </section>

      <section className="card-surface dash-actions" style={{ marginTop: "1rem" }}>
        <h2>{editingId ? "تعديل تقييم" : "إنشاء تقييم"}</h2>
        <form className="stack-form" onSubmit={save}>
          <div className="row-2">
            <div className="field">
              <label>الاسم *</label>
              <input
                className="input"
                required
                value={form.displayName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayName: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, rating: Number(e.target.value) || 5 }))
                }
              />
            </div>
          </div>
          <div className="field">
            <label>النص AR *</label>
            <textarea
              className="input"
              rows={3}
              required
              value={form.quoteAr}
              onChange={(e) => setForm((f) => ({ ...f, quoteAr: e.target.value }))}
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>طبيب</label>
              <select
                className="input"
                value={form.doctorId}
                onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
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
              <input
                className="input"
                value={form.specialtySlug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, specialtySlug: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>خدمة slug</label>
              <input
                className="input"
                value={form.serviceSlug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, serviceSlug: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>ترتيب</label>
              <input
                className="input"
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    displayOrder: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <label className="field">
              <span>
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isAnonymous: e.target.checked }))
                  }
                />{" "}
                مجهول
              </span>
            </label>
            <label className="field">
              <span>
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isVerified: e.target.checked }))
                  }
                />{" "}
                موثّق
              </span>
            </label>
            <label className="field">
              <span>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                  }
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
                    setForm((f) => ({
                      ...f,
                      consentConfirmed: e.target.checked,
                    }))
                  }
                />{" "}
                موافقة
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
                }}
              >
                {dict.cancel}
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </DashboardShell>
  );
}
