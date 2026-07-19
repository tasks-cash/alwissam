"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AdminPagination, AdminRowActions, AdminTableToolbar } from "../../../../../../components/admin/AdminDataTable";
import { AdminDialog } from "../../../../../../components/admin/AdminDialog";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingSkeleton,
  AdminStatusBadge,
  AdminToast,
  type AdminToastState,
} from "../../../../../../components/admin/AdminFeedback";
import {
  AdminField,
  AdminFormSection,
  AdminInput,
  AdminSelect,
  AdminSwitch,
  AdminTextarea,
} from "../../../../../../components/admin/AdminForm";
import { AdminPageHeader } from "../../../../../../components/admin/AdminPageHeader";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { ConfirmDialog } from "../../../../../../components/ui/ConfirmDialog";
import { apiErrorMessage, apiRequest } from "../../../../../../lib/api";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

const schema = z.object({
  displayName: z.string().trim().min(2, "أدخل اسم العرض.").max(120),
  subjectAr: z.string().trim().max(180).optional(),
  quoteAr: z.string().trim().min(8, "نص التقييم قصير جدًا.").max(2000),
  quoteEn: z.string().trim().max(2000).optional(),
  quoteFr: z.string().trim().max(2000).optional(),
  avatarType: z.enum(["male", "female", "neutral", "initials", "uploaded"]),
  patientImage: z.string().max(500).optional(),
  rating: z.number().min(1).max(5),
  doctorId: z.string().optional(),
  specialtySlug: z.string().max(80).optional(),
  serviceSlug: z.string().max(80).optional(),
  isAnonymous: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z.number().min(0).max(10000),
  consentConfirmed: z.boolean(),
});

type ReviewForm = z.infer<typeof schema>;
type ReviewRow = ReviewForm & {
  id: string;
  status?: string;
  isApproved?: boolean;
  isPublished?: boolean;
  isVerified?: boolean;
  isSample?: boolean;
  createdAt?: string;
};

const EMPTY: ReviewForm = {
  displayName: "",
  subjectAr: "",
  quoteAr: "",
  quoteEn: "",
  quoteFr: "",
  avatarType: "neutral",
  patientImage: "",
  rating: 5,
  doctorId: "",
  specialtySlug: "",
  serviceSlug: "",
  isAnonymous: true,
  isFeatured: false,
  displayOrder: 0,
  consentConfirmed: false,
};

function statusBadge(row: ReviewRow) {
  if (row.isPublished) return <AdminStatusBadge tone="success">منشور</AdminStatusBadge>;
  if (row.status === "REJECTED") return <AdminStatusBadge tone="error">مرفوض</AdminStatusBadge>;
  if (row.isApproved || row.status === "APPROVED") return <AdminStatusBadge tone="info">معتمد</AdminStatusBadge>;
  if (row.status === "ARCHIVED") return <AdminStatusBadge>مؤرشف</AdminStatusBadge>;
  return <AdminStatusBadge tone="warning">بانتظار المراجعة</AdminStatusBadge>;
}

export default function ReviewsAdminPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({ roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"] });
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; fullName: string }[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<ReviewForm>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [action, setAction] = useState<{ row: ReviewRow; type: "approve" | "reject" | "publish" | "unpublish" | "archive" | "restore" } | null>(null);
  const [toast, setToast] = useState<AdminToastState>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    return params.toString();
  }, [debouncedSearch, page, status]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const response = await apiRequest<{ items?: ReviewRow[]; total?: number }>(`/api/admin/reviews?${query}`);
    setLoading(false);
    if (!response.ok) {
      setLoadError("تعذر تحميل التقييمات حاليًا.");
      return;
    }
    setRows(response.data.items || []);
    setTotal(response.data.total || 0);
  }, [query]);

  useEffect(() => {
    if (!user) return;
    void load();
    void apiRequest<{ doctors?: { id: string; fullName: string }[] }>("/api/admin/doctors?pageSize=100").then((response) => {
      if (response.ok) setDoctors(response.data.doctors || []);
    });
  }, [load, user]);

  const patch = (value: Partial<ReviewForm>) => {
    setForm((current) => ({ ...current, ...value }));
    setDirty(true);
  };

  const openCreate = () => {
    setForm(EMPTY);
    setEditingId(null);
    setDirty(false);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (row: ReviewRow) => {
    setEditingId(row.id);
    setForm({
      displayName: row.displayName || "",
      subjectAr: row.subjectAr || "",
      quoteAr: row.quoteAr || "",
      quoteEn: row.quoteEn || "",
      quoteFr: row.quoteFr || "",
      avatarType: row.avatarType || "neutral",
      patientImage: row.patientImage || "",
      rating: row.rating || 5,
      doctorId: row.doctorId || "",
      specialtySlug: row.specialtySlug || "",
      serviceSlug: row.serviceSlug || "",
      isAnonymous: row.isAnonymous !== false,
      isFeatured: row.isFeatured === true,
      displayOrder: row.displayOrder || 0,
      consentConfirmed: row.consentConfirmed === true,
    });
    setDirty(false);
    setFormError("");
    setFormOpen(true);
  };

  const uploadAvatar = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setFormError("اختر صورة معتمدة بصيغة JPEG أو PNG أو WebP وحجم لا يتجاوز 3MB.");
      return;
    }
    setSaving(true);
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/media/upload", { method: "POST", credentials: "include", body });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setFormError(apiErrorMessage(data));
      return;
    }
    patch({ patientImage: data.url, avatarType: "uploaded" });
  };

  const save = async (close: boolean) => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || "تحقق من البيانات.");
      return;
    }
    setSaving(true);
    setFormError("");
    const response = await apiRequest<{ message?: string }>(editingId ? `/api/admin/reviews/${editingId}` : "/api/admin/reviews", {
      method: editingId ? "PATCH" : "POST",
      body: JSON.stringify({
        ...parsed.data,
        displayNameAr: parsed.data.displayName,
        isVerified: false,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setFormError(apiErrorMessage(response.data));
      return;
    }
    setDirty(false);
    setToast({ type: "success", message: editingId ? "تم حفظ التقييم." : "تم إنشاء التقييم كمسودة غير منشورة." });
    await load();
    if (close) setFormOpen(false);
  };

  const executeAction = async () => {
    if (!action) return;
    setSaving(true);
    const response = await apiRequest(`/api/admin/reviews/${action.row.id}/${action.type}`, { method: "POST", body: JSON.stringify({}) });
    setSaving(false);
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      return;
    }
    setAction(null);
    setToast({ type: "success", message: "تم تحديث حالة التقييم." });
    await load();
  };

  const toggleFeatured = async (row: ReviewRow) => {
    const response = await apiRequest(`/api/admin/reviews/${row.id}/${row.isFeatured ? "unfeature" : "feature"}`, { method: "POST", body: JSON.stringify({}) });
    setToast({ type: response.ok ? "success" : "error", message: response.ok ? "تم تحديث التمييز." : apiErrorMessage(response.data) });
    if (response.ok) await load();
  };

  if (sessionLoading || !user) return <main className="dash-panel">{dict.loading}</main>;
  if (sessionError) return <main className="dash-panel alert-error">{sessionError}</main>;

  return (
    <DashboardShell locale={locale} dict={dict} role={user.role} userName={user.fullName} initialAdminMode={user.adminDashboardMode === "full" ? "full" : "quick"}>
      <div className="admin-doctors-page">
        <AdminPageHeader
          eyebrow="محتوى الموقع"
          title="إدارة التقييمات"
          description="مراجعة واعتماد ونشر تقييمات المرضى دون تقديم المحتوى التجريبي كتجربة حقيقية."
          breadcrumbs={[{ label: "لوحة التحكم", href: `/${locale}/doctor/specialist/dashboard` }, { label: "التقييمات" }]}
          primaryAction={<button type="button" className="btn btn-primary" onClick={openCreate}>+ إنشاء مسودة تقييم</button>}
          status={<AdminStatusBadge tone="info">{total} تقييم</AdminStatusBadge>}
        />
        <section className="admin-list-card">
          <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="ابحث بالاسم أو الموضوع أو النص" resultCount={total} filters={<select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="الحالة"><option value="">كل الحالات</option><option value="PENDING">بانتظار المراجعة</option><option value="APPROVED">معتمد</option><option value="REJECTED">مرفوض</option><option value="PUBLISHED">منشور</option><option value="ARCHIVED">مؤرشف</option></select>} />
          {loading ? <AdminLoadingSkeleton /> : loadError ? <AdminErrorState message={loadError} onRetry={() => void load()} /> : rows.length === 0 ? <AdminEmptyState title="لا توجد تقييمات مطابقة" description="أنشئ مسودة إدارية أو عدّل الفلاتر." action={<button type="button" className="btn btn-primary" onClick={openCreate}>إنشاء مسودة</button>} /> : (
            <>
              <div className="admin-doctors-table-wrap">
                <table className="admin-doctors-table">
                  <thead><tr><th>المراجع</th><th>التقييم</th><th>الموضوع والنص</th><th>الحالة</th><th>مميز</th><th>التاريخ</th><th><span className="sr-only">الإجراءات</span></th></tr></thead>
                  <tbody>{rows.map((row) => <tr key={row.id}>
                    <td><strong>{row.displayName || "مجهول"}</strong>{row.isSample ? <small>مسودة تجريبية</small> : null}</td>
                    <td dir="ltr">{"★".repeat(row.rating || 0)}</td>
                    <td><strong>{row.subjectAr || "دون موضوع"}</strong><small>{(row.quoteAr || "").slice(0, 90)}{row.quoteAr?.length > 90 ? "…" : ""}</small></td>
                    <td>{statusBadge(row)}</td>
                    <td>{row.isFeatured ? "نعم" : "لا"}</td>
                    <td>{row.createdAt ? new Intl.DateTimeFormat("ar-DZ").format(new Date(row.createdAt)) : "—"}</td>
                    <td><AdminRowActions>
                      <button type="button" onClick={() => openEdit(row)}>تعديل</button>
                      {!row.isApproved ? <button type="button" onClick={() => setAction({ row, type: "approve" })}>اعتماد</button> : <button type="button" onClick={() => setAction({ row, type: "reject" })}>رفض</button>}
                      {row.isPublished ? <button type="button" onClick={() => setAction({ row, type: "unpublish" })}>إلغاء النشر</button> : <button type="button" disabled={row.isSample || !row.isApproved} title={row.isSample ? "لا يمكن نشر المسودات التجريبية" : undefined} onClick={() => setAction({ row, type: "publish" })}>نشر</button>}
                      <button type="button" onClick={() => void toggleFeatured(row)}>{row.isFeatured ? "إلغاء التمييز" : "تمييز"}</button>
                      {row.status === "ARCHIVED" ? <button type="button" onClick={() => setAction({ row, type: "restore" })}>استعادة</button> : <button type="button" onClick={() => setAction({ row, type: "archive" })}>أرشفة</button>}
                    </AdminRowActions></td>
                  </tr>)}</tbody>
                </table>
              </div>
              <div className="admin-doctor-cards">{rows.map((row) => <article key={row.id} className="admin-doctor-card"><header><span className="admin-doctor-avatar"><span>{row.avatarType === "female" ? "👩" : row.avatarType === "male" ? "👨" : "★"}</span></span><div><h3>{row.displayName}</h3><p dir="ltr">{"★".repeat(row.rating)}</p></div><AdminRowActions><button type="button" onClick={() => openEdit(row)}>تعديل</button>{!row.isApproved ? <button type="button" onClick={() => setAction({ row, type: "approve" })}>اعتماد</button> : null}</AdminRowActions></header><div>{statusBadge(row)}{row.isSample ? <span>تجريبي</span> : null}</div><small>{row.quoteAr.slice(0, 100)}…</small></article>)}</div>
              <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / 20))} onPageChange={setPage} />
            </>
          )}
        </section>
      </div>

      <AdminDialog open={formOpen} title={editingId ? "تعديل التقييم" : "إنشاء مسودة تقييم"} description="المسودات الإدارية لا تُنشر تلقائيًا ولا تحمل شارة زيارة موثقة." onClose={() => setFormOpen(false)} dirty={dirty} busy={saving} size="xl" locale={locale} footer={<div className="admin-dialog-actions"><button type="button" className="btn btn-outline" disabled={!dirty || saving} onClick={() => void save(false)}>حفظ</button><button type="button" className="btn btn-primary" disabled={!dirty || saving} onClick={() => void save(true)}>{saving ? "جارٍ الحفظ..." : editingId ? "حفظ وإغلاق" : "إنشاء المسودة"}</button></div>}>
        {formError ? <div className="admin-form-error" role="alert">{formError}</div> : null}
        <AdminFormSection title="محتوى التقييم">
          <AdminField label="اسم العرض">{({ id }) => <AdminInput id={id} value={form.displayName} onChange={(event) => patch({ displayName: event.target.value })} />}</AdminField>
          <AdminField label="التقييم">{({ id }) => <AdminSelect id={id} value={form.rating} onChange={(event) => patch({ rating: Number(event.target.value) })}><option value={5}>5 — ممتاز</option><option value={4}>4 — جيد جدًا</option><option value={3}>3 — جيد</option><option value={2}>2</option><option value={1}>1</option></AdminSelect>}</AdminField>
          <AdminField label="الموضوع" optional>{({ id }) => <AdminInput id={id} value={form.subjectAr || ""} onChange={(event) => patch({ subjectAr: event.target.value })} />}</AdminField>
          <div className="admin-form-full"><AdminField label="نص التقييم بالعربية">{({ id }) => <AdminTextarea id={id} rows={5} value={form.quoteAr} onChange={(event) => patch({ quoteAr: event.target.value })} />}</AdminField></div>
          <AdminField label="النص بالإنجليزية" optional>{({ id }) => <AdminTextarea id={id} dir="ltr" rows={4} value={form.quoteEn || ""} onChange={(event) => patch({ quoteEn: event.target.value })} />}</AdminField>
          <AdminField label="النص بالفرنسية" optional>{({ id }) => <AdminTextarea id={id} dir="ltr" rows={4} value={form.quoteFr || ""} onChange={(event) => patch({ quoteFr: event.target.value })} />}</AdminField>
        </AdminFormSection>
        <AdminFormSection title="الصورة والارتباطات">
          <AdminField label="نوع الصورة الرمزية">{({ id }) => <AdminSelect id={id} value={form.avatarType} onChange={(event) => patch({ avatarType: event.target.value as ReviewForm["avatarType"], patientImage: event.target.value === "uploaded" ? form.patientImage : "" })}><option value="neutral">محايد</option><option value="male">ذكر عام</option><option value="female">أنثى عامة</option><option value="initials">الأحرف الأولى</option><option value="uploaded">صورة مرفوعة بموافقة</option></AdminSelect>}</AdminField>
          {form.avatarType === "uploaded" ? <div className="admin-field"><label htmlFor="review-avatar"><span>صورة معتمدة</span></label><input id="review-avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAvatar(file); }} /><p>لا تُرفع صورة حساب المريض تلقائيًا. يلزم وجود موافقة.</p></div> : null}
          <AdminField label="الطبيب" optional>{({ id }) => <AdminSelect id={id} value={form.doctorId || ""} onChange={(event) => patch({ doctorId: event.target.value })}><option value="">دون ارتباط</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>)}</AdminSelect>}</AdminField>
          <AdminField label="رابط التخصص" optional>{({ id }) => <AdminInput id={id} dir="ltr" value={form.specialtySlug || ""} onChange={(event) => patch({ specialtySlug: event.target.value })} />}</AdminField>
          <AdminField label="رابط الخدمة" optional>{({ id }) => <AdminInput id={id} dir="ltr" value={form.serviceSlug || ""} onChange={(event) => patch({ serviceSlug: event.target.value })} />}</AdminField>
          <AdminField label="ترتيب العرض">{({ id }) => <AdminInput id={id} type="number" min={0} value={form.displayOrder} onChange={(event) => patch({ displayOrder: Number(event.target.value) || 0 })} />}</AdminField>
          <AdminSwitch label="إخفاء هوية المراجع" checked={form.isAnonymous} onChange={(checked) => patch({ isAnonymous: checked })} />
          <AdminSwitch label="مميز" checked={form.isFeatured} onChange={(checked) => patch({ isFeatured: checked })} />
          <AdminSwitch label="تأكيد موافقة استخدام المحتوى" checked={form.consentConfirmed} onChange={(checked) => patch({ consentConfirmed: checked })} />
        </AdminFormSection>
      </AdminDialog>

      <ConfirmDialog open={!!action} title={action?.type === "publish" ? "نشر التقييم" : action?.type === "archive" ? "أرشفة التقييم" : "تأكيد تغيير الحالة"} description={action?.type === "publish" ? `سيظهر تقييم ${action.row.displayName} للعامة. تأكد من الاعتماد والموافقة وعدم كونه محتوى تجريبيًا.` : `سيتم تحديث حالة تقييم ${action?.row.displayName || ""}.`} confirmLabel={action?.type === "publish" ? "نشر التقييم" : action?.type === "archive" ? "أرشفة التقييم" : "تأكيد"} loading={saving} onCancel={() => setAction(null)} onConfirm={() => void executeAction()} />
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardShell>
  );
}
