"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type CaseForm = {
  titleAr: string; titleEn: string; titleFr: string;
  descriptionAr: string; descriptionEn: string; descriptionFr: string;
  beforeImageUrl: string; afterImageUrl: string;
  beforeAltAr: string; beforeAltEn: string; beforeAltFr: string;
  afterAltAr: string; afterAltEn: string; afterAltFr: string;
  doctorId: string; serviceSlug: string; specialtySlug: string;
  treatmentCategory: string; treatmentDuration: string; resultDate: string;
  patientAgeRange: string; isAnonymous: boolean; isFeatured: boolean;
  displayOrder: number; consentConfirmed: boolean; consentDocumentReference: string;
};

type CaseRow = CaseForm & {
  id: string;
  isApproved?: boolean;
  isPublished?: boolean;
  doctorName?: string;
  archivedAt?: string | null;
};

const EMPTY: CaseForm = {
  titleAr: "", titleEn: "", titleFr: "",
  descriptionAr: "", descriptionEn: "", descriptionFr: "",
  beforeImageUrl: "", afterImageUrl: "",
  beforeAltAr: "", beforeAltEn: "", beforeAltFr: "",
  afterAltAr: "", afterAltEn: "", afterAltFr: "",
  doctorId: "", serviceSlug: "", specialtySlug: "",
  treatmentCategory: "", treatmentDuration: "", resultDate: "",
  patientAgeRange: "", isAnonymous: true, isFeatured: false,
  displayOrder: 0, consentConfirmed: false, consentDocumentReference: "",
};

export default function BeforeAfterAdminPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({ roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"] });
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; fullName: string }[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [approval, setApproval] = useState("");
  const [publication, setPublication] = useState("");
  const [archived, setArchived] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<CaseForm>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [preview, setPreview] = useState<CaseRow | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [action, setAction] = useState<{ row: CaseRow; type: "approve" | "reject" | "publish" | "unpublish" | "archive" | "restore" } | null>(null);
  const [toast, setToast] = useState<AdminToastState>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (approval) params.set("approval", approval);
    if (publication) params.set("publication", publication);
    if (archived) params.set("archived", archived);
    return params.toString();
  }, [approval, archived, debouncedSearch, page, publication]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const response = await apiRequest<{ cases?: CaseRow[]; total?: number }>(`/api/admin/before-after?${query}`);
    setLoading(false);
    if (!response.ok) {
      setLoadError("تعذر تحميل حالات قبل وبعد حاليًا.");
      return;
    }
    setRows(response.data.cases || []);
    setTotal(response.data.total || 0);
  }, [query]);

  useEffect(() => {
    if (!user) return;
    void load();
    void apiRequest<{ doctors?: { id: string; fullName: string }[] }>("/api/admin/doctors?pageSize=100").then((response) => {
      if (response.ok) setDoctors(response.data.doctors || []);
    });
  }, [load, user]);

  const patch = (value: Partial<CaseForm>) => {
    setForm((current) => ({ ...current, ...value }));
    setDirty(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setDirty(false);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (row: CaseRow) => {
    setEditingId(row.id);
    setForm({
      ...EMPTY,
      ...row,
      resultDate: row.resultDate ? String(row.resultDate).slice(0, 10) : "",
    });
    setDirty(false);
    setFormError("");
    setFormOpen(true);
  };

  const upload = async (field: "beforeImageUrl" | "afterImageUrl", file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setFormError("اختر صورة JPEG أو PNG أو WebP بحجم لا يتجاوز 8MB.");
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
    patch({ [field]: data.url });
  };

  const save = async (close: boolean) => {
    if (form.titleAr.trim().length < 3) {
      setFormError("أدخل عنوان الحالة بالعربية.");
      return;
    }
    setSaving(true);
    setFormError("");
    const response = await apiRequest("/api/admin/before-after", {
      method: editingId ? "PATCH" : "POST",
      body: JSON.stringify({ ...form, id: editingId || undefined }),
    });
    setSaving(false);
    if (!response.ok) {
      setFormError(apiErrorMessage(response.data));
      return;
    }
    setDirty(false);
    setToast({ type: "success", message: editingId ? "تم حفظ الحالة." : "تم إنشاء الحالة كمسودة غير منشورة." });
    await load();
    if (close) setFormOpen(false);
  };

  const executeAction = async () => {
    if (!action) return;
    setSaving(true);
    const response = await apiRequest(`/api/admin/before-after/${action.type}`, {
      method: "POST",
      body: JSON.stringify({ id: action.row.id }),
    });
    setSaving(false);
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      return;
    }
    setAction(null);
    setToast({ type: "success", message: "تم تحديث حالة النشر والاعتماد." });
    await load();
  };

  const toggleFeatured = async (row: CaseRow) => {
    const response = await apiRequest("/api/admin/before-after/feature", {
      method: "POST",
      body: JSON.stringify({ id: row.id, featured: !row.isFeatured }),
    });
    setToast({ type: response.ok ? "success" : "error", message: response.ok ? "تم تحديث التمييز." : apiErrorMessage(response.data) });
    if (response.ok) await load();
  };

  if (sessionLoading || !user) return <main className="dash-panel">{dict.loading}</main>;
  if (sessionError) return <main className="dash-panel alert-error">{sessionError}</main>;

  return (
    <DashboardShell locale={locale} dict={dict} role={user.role} userName={user.fullName} initialAdminMode={user.adminDashboardMode === "full" ? "full" : "quick"}>
      <div className="admin-doctors-page">
        <AdminPageHeader eyebrow="محتوى الموقع" title="حالات قبل وبعد" description="إدارة صور نتائج العلاج مع موافقة صريحة ومراجعة آمنة قبل النشر." breadcrumbs={[{ label: "لوحة التحكم", href: `/${locale}/doctor/specialist/dashboard` }, { label: "قبل وبعد" }]} primaryAction={<button type="button" className="btn btn-primary" onClick={openCreate}>+ إضافة حالة</button>} />
        <section className="admin-list-card">
          <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="ابحث بالعنوان أو الطبيب أو العلاج" resultCount={total} filters={<><select value={approval} onChange={(event) => setApproval(event.target.value)} aria-label="الاعتماد"><option value="">كل الاعتماد</option><option value="approved">معتمد</option><option value="pending">بانتظار</option></select><select value={publication} onChange={(event) => setPublication(event.target.value)} aria-label="النشر"><option value="">كل النشر</option><option value="published">منشور</option><option value="draft">مسودة</option></select><select value={archived} onChange={(event) => setArchived(event.target.value)} aria-label="الأرشفة"><option value="">النشطة</option><option value="true">المؤرشفة</option><option value="all">الكل</option></select></>} />
          {loading ? <AdminLoadingSkeleton /> : loadError ? <AdminErrorState message={loadError} onRetry={() => void load()} /> : rows.length === 0 ? <AdminEmptyState title="لا توجد حالات مطابقة" description="أضف حالة موثقة بموافقة أو عدّل الفلاتر." action={<button type="button" className="btn btn-primary" onClick={openCreate}>إضافة حالة</button>} /> : (
            <>
              <div className="admin-doctors-table-wrap"><table className="admin-doctors-table"><thead><tr><th>الصور</th><th>الحالة</th><th>الطبيب والعلاج</th><th>الموافقة</th><th>الاعتماد</th><th>النشر</th><th><span className="sr-only">الإجراءات</span></th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><button type="button" className="admin-before-after-thumb" onClick={() => setPreview(row)}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={row.beforeImageUrl} alt="" />{/* eslint-disable-next-line @next/next/no-img-element */}<img src={row.afterImageUrl} alt="" /></button></td><td><strong>{row.titleAr}</strong><small>{row.treatmentCategory || row.serviceSlug || "—"}</small></td><td>{row.doctorName || "—"}<small>{row.treatmentDuration || "—"}</small></td><td><AdminStatusBadge tone={row.consentConfirmed ? "success" : "error"}>{row.consentConfirmed ? "مؤكدة" : "مفقودة"}</AdminStatusBadge></td><td>{row.isApproved ? "معتمد" : "بانتظار"}</td><td>{row.isPublished ? "منشور" : "مسودة"}</td><td><AdminRowActions><button type="button" onClick={() => setPreview(row)}>معاينة</button><button type="button" onClick={() => openEdit(row)}>تعديل</button>{!row.archivedAt ? <>{!row.isApproved ? <button type="button" onClick={() => setAction({ row, type: "approve" })}>اعتماد</button> : <button type="button" onClick={() => setAction({ row, type: "reject" })}>رفض</button>}{row.isPublished ? <button type="button" onClick={() => setAction({ row, type: "unpublish" })}>إلغاء النشر</button> : <button type="button" disabled={!row.isApproved || !row.consentConfirmed} onClick={() => setAction({ row, type: "publish" })}>نشر</button>}<button type="button" onClick={() => void toggleFeatured(row)}>{row.isFeatured ? "إلغاء التمييز" : "تمييز"}</button><button type="button" onClick={() => setAction({ row, type: "archive" })}>أرشفة</button></> : <button type="button" onClick={() => setAction({ row, type: "restore" })}>استعادة</button>}</AdminRowActions></td></tr>)}</tbody></table></div>
              <div className="admin-doctor-cards">{rows.map((row) => <article key={row.id} className="admin-doctor-card"><button type="button" className="admin-before-after-mobile" onClick={() => setPreview(row)}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={row.beforeImageUrl} alt="قبل" />{/* eslint-disable-next-line @next/next/no-img-element */}<img src={row.afterImageUrl} alt="بعد" /></button><header><div><h3>{row.titleAr}</h3><p>{row.doctorName || "—"}</p></div><AdminRowActions><button type="button" onClick={() => setPreview(row)}>معاينة</button><button type="button" onClick={() => openEdit(row)}>تعديل</button></AdminRowActions></header><div><AdminStatusBadge tone={row.consentConfirmed ? "success" : "error"}>{row.consentConfirmed ? "موافقة مؤكدة" : "موافقة مفقودة"}</AdminStatusBadge><span>{row.isPublished ? "منشور" : "مسودة"}</span></div></article>)}</div>
              <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / 20))} onPageChange={setPage} />
            </>
          )}
        </section>
      </div>

      <AdminDialog open={formOpen} title={editingId ? "تعديل حالة قبل وبعد" : "إضافة حالة قبل وبعد"} description="لا تنشر صورًا قابلة للتعرف على المريض دون موافقة صريحة." onClose={() => setFormOpen(false)} dirty={dirty} busy={saving} size="xl" locale={locale} footer={<div className="admin-dialog-actions"><button type="button" className="btn btn-outline" disabled={!dirty || saving} onClick={() => void save(false)}>حفظ</button><button type="button" className="btn btn-primary" disabled={!dirty || saving} onClick={() => void save(true)}>{saving ? "جارٍ الحفظ..." : editingId ? "حفظ وإغلاق" : "إنشاء المسودة"}</button></div>}>
        {formError ? <div className="admin-form-error" role="alert">{formError}</div> : null}
        {!form.consentConfirmed ? <div className="admin-privacy-warning" role="note"><strong>تنبيه الخصوصية</strong><p>تأكيد موافقة المريض مطلوب قبل النشر العام.</p></div> : null}
        <AdminFormSection title="المحتوى الأساسي">
          <AdminField label="العنوان بالعربية">{({ id }) => <AdminInput id={id} value={form.titleAr} onChange={(event) => patch({ titleAr: event.target.value })} />}</AdminField>
          <AdminField label="العنوان بالإنجليزية" optional>{({ id }) => <AdminInput id={id} dir="ltr" value={form.titleEn} onChange={(event) => patch({ titleEn: event.target.value })} />}</AdminField>
          <AdminField label="العنوان بالفرنسية" optional>{({ id }) => <AdminInput id={id} dir="ltr" value={form.titleFr} onChange={(event) => patch({ titleFr: event.target.value })} />}</AdminField>
          <div className="admin-form-full"><AdminField label="الوصف بالعربية" optional>{({ id }) => <AdminTextarea id={id} rows={4} value={form.descriptionAr} onChange={(event) => patch({ descriptionAr: event.target.value })} />}</AdminField></div>
        </AdminFormSection>
        <AdminFormSection title="صور العلاج" description="استخدم صورتين متقاربتين في الأبعاد والإضاءة من نظام الوسائط الآمن.">
          {(["beforeImageUrl", "afterImageUrl"] as const).map((field) => <div className="admin-case-upload" key={field}><strong>{field === "beforeImageUrl" ? "قبل العلاج" : "بعد العلاج"}</strong>{form[field] ? <div className="admin-media-preview">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={form[field]} alt={field === "beforeImageUrl" ? "قبل العلاج" : "بعد العلاج"} /><button type="button" className="btn btn-outline" onClick={() => patch({ [field]: "" })}>إزالة الصورة</button></div> : null}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(field, file); }} /></div>)}
          <AdminField label="وصف صورة قبل بالعربية" optional>{({ id }) => <AdminInput id={id} value={form.beforeAltAr} onChange={(event) => patch({ beforeAltAr: event.target.value })} />}</AdminField>
          <AdminField label="وصف صورة بعد بالعربية" optional>{({ id }) => <AdminInput id={id} value={form.afterAltAr} onChange={(event) => patch({ afterAltAr: event.target.value })} />}</AdminField>
        </AdminFormSection>
        <AdminFormSection title="العلاج والخصوصية">
          <AdminField label="الطبيب" optional>{({ id }) => <AdminSelect id={id} value={form.doctorId} onChange={(event) => patch({ doctorId: event.target.value })}><option value="">دون ارتباط</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>)}</AdminSelect>}</AdminField>
          <AdminField label="رابط الخدمة" optional>{({ id }) => <AdminInput id={id} dir="ltr" value={form.serviceSlug} onChange={(event) => patch({ serviceSlug: event.target.value })} />}</AdminField>
          <AdminField label="رابط التخصص" optional>{({ id }) => <AdminInput id={id} dir="ltr" value={form.specialtySlug} onChange={(event) => patch({ specialtySlug: event.target.value })} />}</AdminField>
          <AdminField label="فئة العلاج" optional>{({ id }) => <AdminInput id={id} value={form.treatmentCategory} onChange={(event) => patch({ treatmentCategory: event.target.value })} />}</AdminField>
          <AdminField label="مدة العلاج" optional>{({ id }) => <AdminInput id={id} value={form.treatmentDuration} onChange={(event) => patch({ treatmentDuration: event.target.value })} />}</AdminField>
          <AdminField label="تاريخ النتيجة" optional>{({ id }) => <AdminInput id={id} type="date" value={form.resultDate} onChange={(event) => patch({ resultDate: event.target.value })} />}</AdminField>
          <AdminField label="مرجع وثيقة الموافقة" optional>{({ id }) => <AdminInput id={id} value={form.consentDocumentReference} onChange={(event) => patch({ consentDocumentReference: event.target.value })} />}</AdminField>
          <AdminField label="ترتيب العرض">{({ id }) => <AdminInput id={id} type="number" min={0} value={form.displayOrder} onChange={(event) => patch({ displayOrder: Number(event.target.value) || 0 })} />}</AdminField>
          <AdminSwitch label="إخفاء هوية المريض" checked={form.isAnonymous} onChange={(checked) => patch({ isAnonymous: checked })} />
          <AdminSwitch label="موافقة المريض مؤكدة" description="أؤكد وجود موافقة صريحة وصالحة لاستخدام الصور علنًا." checked={form.consentConfirmed} onChange={(checked) => patch({ consentConfirmed: checked })} />
          <AdminSwitch label="حالة مميزة" checked={form.isFeatured} onChange={(checked) => patch({ isFeatured: checked })} />
        </AdminFormSection>
      </AdminDialog>

      <AdminDialog open={!!preview} title={preview?.titleAr || "معاينة الحالة"} description={preview?.doctorName} onClose={() => setPreview(null)} size="lg" locale={locale}>
        {preview ? <div className="admin-case-preview"><figure>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={preview.beforeImageUrl} alt={preview.beforeAltAr || "قبل العلاج"} /><figcaption>قبل العلاج</figcaption></figure><figure>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={preview.afterImageUrl} alt={preview.afterAltAr || "بعد العلاج"} /><figcaption>بعد العلاج</figcaption></figure><div className="admin-form-full"><p>{preview.descriptionAr || "لا يوجد وصف."}</p></div></div> : null}
      </AdminDialog>
      <ConfirmDialog open={!!action} title={action?.type === "publish" ? "نشر الحالة" : action?.type === "archive" ? "أرشفة الحالة" : "تأكيد تغيير الحالة"} description={action?.type === "publish" ? "ستظهر الصور للعامة. تحقق من الموافقة والاعتماد وعدم كشف هوية المريض." : `سيتم تحديث حالة "${action?.row.titleAr || ""}".`} confirmLabel={action?.type === "publish" ? "نشر الحالة" : action?.type === "archive" ? "أرشفة الحالة" : "تأكيد"} loading={saving} onCancel={() => setAction(null)} onConfirm={() => void executeAction()} />
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardShell>
  );
}
