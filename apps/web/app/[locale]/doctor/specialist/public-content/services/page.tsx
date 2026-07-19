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
  updatedAt?: string;
};

const EMPTY: Omit<ServiceRow, "id"> = {
  nameAr: "",
  nameEn: "",
  nameFr: "",
  slug: "",
  descriptionAr: "",
  descriptionEn: "",
  descriptionFr: "",
  shortDescriptionAr: "",
  specialtyIds: [],
  icon: "tooth",
  image: "",
  durationMinutes: null,
  isBookable: true,
  isActive: true,
  isPublic: false,
  isFeatured: false,
  requiresConsultation: false,
  displayOrder: 100,
};

function validateService(form: Omit<ServiceRow, "id"> & { id?: string }) {
  if (form.nameAr.trim().length < 2) return "أدخل اسم الخدمة بالعربية.";
  if (form.nameEn.trim().length < 2) return "أدخل اسم الخدمة بالإنجليزية.";
  if (form.nameFr.trim().length < 2) return "أدخل اسم الخدمة بالفرنسية.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) return "الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.";
  if (form.durationMinutes != null && (form.durationMinutes < 5 || form.durationMinutes > 480)) return "مدة الخدمة يجب أن تكون بين 5 و480 دقيقة.";
  return "";
}

export default function ServicesAdminPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({ roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"] });
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [visibility, setVisibility] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<Omit<ServiceRow, "id"> & { id?: string }>({ ...EMPTY });
  const [formOpen, setFormOpen] = useState(false);
  const [formTab, setFormTab] = useState<"general" | "content" | "media" | "visibility">("general");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<ServiceRow | null>(null);
  const [toast, setToast] = useState<AdminToastState>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (specialtyFilter) params.set("specialtyId", specialtyFilter);
    if (visibility) params.set("public", visibility);
    if (activeFilter) params.set("active", activeFilter);
    if (archived) params.set("archived", "true");
    return params.toString();
  }, [activeFilter, archived, debouncedSearch, page, specialtyFilter, visibility]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const response = await apiRequest<{ services?: ServiceRow[]; total?: number }>(`/api/admin/catalog/services?${query}`);
    setLoading(false);
    if (!response.ok) {
      setLoadError("تعذر تحميل الخدمات حاليًا.");
      return;
    }
    setRows(response.data.services || []);
    setTotal(response.data.total || 0);
  }, [query]);

  useEffect(() => {
    if (!user) return;
    void load();
    void apiRequest<{ specialties?: SpecialtyOption[] }>("/api/admin/catalog/specialties?pageSize=100").then((response) => {
      if (response.ok) setSpecialties(response.data.specialties || []);
    });
  }, [load, user]);

  const patch = (value: Partial<typeof form>) => {
    setForm((current) => ({ ...current, ...value }));
    setDirty(true);
  };

  const openCreate = () => {
    setForm({ ...EMPTY });
    setFormTab("general");
    setFormError("");
    setDirty(false);
    setFormOpen(true);
  };

  const openEdit = async (row: ServiceRow) => {
    setSaving(true);
    const response = await apiRequest<{ service?: ServiceRow }>(`/api/admin/catalog/services/${row.id}`);
    setSaving(false);
    if (!response.ok || !response.data.service) {
      setToast({ type: "error", message: "تعذر تحميل تفاصيل الخدمة." });
      return;
    }
    setForm({ ...EMPTY, ...response.data.service });
    setFormTab("general");
    setFormError("");
    setDirty(false);
    setFormOpen(true);
  };

  const uploadImage = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setFormError("اختر صورة JPEG أو PNG أو WebP بحجم لا يتجاوز 5MB.");
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
    patch({ image: data.url });
  };

  const save = async (close: boolean) => {
    const message = validateService(form);
    if (message) {
      setFormError(message);
      return;
    }
    setSaving(true);
    setFormError("");
    const response = await apiRequest<{ message?: string }>("/api/admin/catalog/services", {
      method: form.id ? "PATCH" : "POST",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!response.ok) {
      setFormError(apiErrorMessage(response.data));
      return;
    }
    setDirty(false);
    setToast({ type: "success", message: form.id ? `تم حفظ تعديلات ${form.nameAr}.` : `تمت إضافة خدمة ${form.nameAr}.` });
    await load();
    if (close) setFormOpen(false);
  };

  const flag = async (row: ServiceRow, action: "publish" | "activate" | "feature" | "restore") => {
    const endpoint = `/api/admin/catalog/services/${action}`;
    const body =
      action === "publish" ? { id: row.id, publish: !row.isPublic } :
      action === "activate" ? { id: row.id, active: !row.isActive } :
      action === "feature" ? { id: row.id, featured: !row.isFeatured } :
      { id: row.id };
    setSaving(true);
    const response = await apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) });
    setSaving(false);
    setToast({ type: response.ok ? "success" : "error", message: response.ok ? "تم تحديث حالة الخدمة." : apiErrorMessage(response.data) });
    if (response.ok) await load();
  };

  const archiveService = async () => {
    if (!archiveTarget) return;
    setSaving(true);
    const response = await apiRequest("/api/admin/catalog/services/archive", {
      method: "POST",
      body: JSON.stringify({ id: archiveTarget.id }),
    });
    setSaving(false);
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      return;
    }
    setArchiveTarget(null);
    setToast({ type: "success", message: "تمت أرشفة الخدمة وإخفاؤها عن الموقع." });
    await load();
  };

  const duplicate = (row: ServiceRow) => {
    const { id: _id, archivedAt: _archivedAt, ...copy } = row;
    setForm({
      ...EMPTY,
      ...copy,
      nameAr: `${row.nameAr} — نسخة`,
      nameEn: `${row.nameEn} copy`,
      nameFr: `${row.nameFr} copie`,
      slug: `${row.slug}-copy`,
      isPublic: false,
      isActive: false,
    });
    setDirty(true);
    setFormTab("general");
    setFormOpen(true);
  };

  if (sessionLoading || !user) return <main className="dash-panel">{dict.loading}</main>;
  if (sessionError) return <main className="dash-panel alert-error">{sessionError}</main>;

  return (
    <DashboardShell locale={locale} dict={dict} role={user.role} userName={user.fullName} initialAdminMode={user.adminDashboardMode === "full" ? "full" : "quick"}>
      <div className="admin-doctors-page">
        <AdminPageHeader
          eyebrow="محتوى الموقع"
          title="إدارة الخدمات"
          description="إنشاء وتحرير ونشر خدمات العيادة وربطها بالتخصصات والحجز."
          breadcrumbs={[{ label: "لوحة التحكم", href: `/${locale}/doctor/specialist/dashboard` }, { label: "الخدمات" }]}
          primaryAction={<button type="button" className="btn btn-primary" onClick={openCreate}>+ إضافة خدمة</button>}
        />
        <section className="admin-list-card">
          <AdminTableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="ابحث باسم الخدمة أو الرابط"
            resultCount={total}
            filters={
              <>
                <select value={specialtyFilter} onChange={(event) => setSpecialtyFilter(event.target.value)} aria-label="التخصص">
                  <option value="">كل التخصصات</option>
                  {specialties.map((option) => <option key={option.id} value={option.id}>{option.nameAr}</option>)}
                </select>
                <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} aria-label="الحالة">
                  <option value="">كل الحالات</option><option value="true">نشطة</option><option value="false">غير نشطة</option>
                </select>
                <select value={visibility} onChange={(event) => setVisibility(event.target.value)} aria-label="النشر">
                  <option value="">كل النشر</option><option value="true">منشورة</option><option value="false">مسودة</option>
                </select>
                <label className="admin-filter-check"><input type="checkbox" checked={archived} onChange={(event) => setArchived(event.target.checked)} /> المؤرشفة</label>
              </>
            }
          />
          {loading ? <AdminLoadingSkeleton /> : loadError ? <AdminErrorState message={loadError} onRetry={() => void load()} /> : rows.length === 0 ? (
            <AdminEmptyState title="لا توجد خدمات مطابقة" description="أضف خدمة جديدة أو عدّل فلاتر البحث." action={<button type="button" className="btn btn-primary" onClick={openCreate}>إضافة خدمة</button>} />
          ) : (
            <>
              <div className="admin-doctors-table-wrap">
                <table className="admin-doctors-table">
                  <thead><tr><th>الخدمة</th><th>التخصصات</th><th>المدة</th><th>الحالة</th><th>النشر</th><th>الحجز</th><th><span className="sr-only">الإجراءات</span></th></tr></thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td><strong>{row.nameAr}</strong><small dir="ltr">/{row.slug}</small></td>
                        <td>{row.specialtyIds?.length || 0}</td>
                        <td>{row.durationMinutes ? `${row.durationMinutes} دقيقة` : "—"}</td>
                        <td><AdminStatusBadge tone={row.isActive ? "success" : "warning"}>{row.isActive ? "نشطة" : "غير نشطة"}</AdminStatusBadge></td>
                        <td>{row.isPublic ? "منشورة" : "مسودة"}</td>
                        <td>{row.isBookable ? "متاح" : "متوقف"}</td>
                        <td><AdminRowActions>
                          <button type="button" onClick={() => void openEdit(row)}>تعديل</button>
                          <a href={`/${locale}/services/${row.slug}`} target="_blank" rel="noreferrer">معاينة</a>
                          <button type="button" onClick={() => void flag(row, "publish")}>{row.isPublic ? "إلغاء النشر" : "نشر"}</button>
                          <button type="button" onClick={() => void flag(row, "activate")}>{row.isActive ? "تعطيل" : "تفعيل"}</button>
                          <button type="button" onClick={() => duplicate(row)}>إنشاء نسخة</button>
                          {row.archivedAt ? <button type="button" onClick={() => void flag(row, "restore")}>استعادة</button> : <button type="button" onClick={() => setArchiveTarget(row)}>أرشفة</button>}
                        </AdminRowActions></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-doctor-cards">
                {rows.map((row) => (
                  <article className="admin-doctor-card" key={row.id}>
                    <header><span className="admin-doctor-avatar"><span>{row.icon === "tooth" ? "🦷" : "خ"}</span></span><div><h3>{row.nameAr}</h3><p>{row.durationMinutes ? `${row.durationMinutes} دقيقة` : "المدة غير محددة"}</p></div><AdminRowActions><button type="button" onClick={() => void openEdit(row)}>تعديل</button><button type="button" onClick={() => duplicate(row)}>نسخ</button></AdminRowActions></header>
                    <div><AdminStatusBadge tone={row.isActive ? "success" : "warning"}>{row.isActive ? "نشطة" : "غير نشطة"}</AdminStatusBadge><span>{row.isPublic ? "منشورة" : "مسودة"}</span></div>
                  </article>
                ))}
              </div>
              <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / 20))} onPageChange={setPage} />
            </>
          )}
        </section>
      </div>

      <AdminDialog
        open={formOpen}
        title={form.id ? "تعديل الخدمة" : "إضافة خدمة"}
        description="نظّم البيانات حسب القسم؛ لن تُغلق النافذة عند فشل الحفظ."
        onClose={() => setFormOpen(false)}
        dirty={dirty}
        busy={saving}
        variant="dialog"
        size="xl"
        locale={locale}
        footer={<div className="admin-dialog-actions"><button type="button" className="btn btn-outline" disabled={!dirty || saving} onClick={() => void save(false)}>حفظ</button><button type="button" className="btn btn-primary" disabled={!dirty || saving} onClick={() => void save(true)}>{saving ? "جارٍ حفظ التعديلات..." : form.id ? "حفظ وإغلاق" : "إضافة الخدمة"}</button></div>}
      >
        <div className="admin-form-tabs" role="tablist">
          {(["general", "content", "media", "visibility"] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={formTab === tab} onClick={() => setFormTab(tab)}>{tab === "general" ? "عام" : tab === "content" ? "المحتوى" : tab === "media" ? "الوسائط" : "الظهور"}</button>)}
        </div>
        {formError ? <div className="admin-form-error" role="alert">{formError}</div> : null}
        {formTab === "general" ? (
          <AdminFormSection title="البيانات الأساسية">
            <AdminField label="الاسم بالعربية">{({ id }) => <AdminInput id={id} value={form.nameAr} onChange={(event) => patch({ nameAr: event.target.value })} />}</AdminField>
            <AdminField label="الاسم بالإنجليزية">{({ id }) => <AdminInput id={id} dir="ltr" value={form.nameEn} onChange={(event) => patch({ nameEn: event.target.value })} />}</AdminField>
            <AdminField label="الاسم بالفرنسية">{({ id }) => <AdminInput id={id} dir="ltr" value={form.nameFr} onChange={(event) => patch({ nameFr: event.target.value })} />}</AdminField>
            <AdminField label="الرابط المختصر">{({ id }) => <AdminInput id={id} dir="ltr" value={form.slug} onChange={(event) => patch({ slug: event.target.value.toLowerCase() })} />}</AdminField>
            <AdminField label="المدة بالدقائق" optional>{({ id }) => <AdminInput id={id} type="number" min={5} max={480} value={form.durationMinutes ?? ""} onChange={(event) => patch({ durationMinutes: event.target.value ? Number(event.target.value) : null })} />}</AdminField>
            <AdminField label="ترتيب العرض">{({ id }) => <AdminInput id={id} type="number" min={0} value={form.displayOrder || 0} onChange={(event) => patch({ displayOrder: Number(event.target.value) || 0 })} />}</AdminField>
            <div className="admin-form-full admin-choice-list"><strong>التخصصات المرتبطة</strong>{specialties.map((option) => <label key={option.id}><input type="checkbox" checked={form.specialtyIds.includes(option.id)} onChange={(event) => patch({ specialtyIds: event.target.checked ? [...form.specialtyIds, option.id] : form.specialtyIds.filter((id) => id !== option.id) })} />{option.nameAr}</label>)}</div>
          </AdminFormSection>
        ) : formTab === "content" ? (
          <AdminFormSection title="محتوى الخدمة">
            <div className="admin-form-full"><AdminField label="الوصف المختصر" optional>{({ id }) => <AdminTextarea id={id} rows={2} value={form.shortDescriptionAr || ""} onChange={(event) => patch({ shortDescriptionAr: event.target.value })} />}</AdminField></div>
            <AdminField label="الوصف العربي" optional>{({ id }) => <AdminTextarea id={id} rows={6} value={form.descriptionAr || ""} onChange={(event) => patch({ descriptionAr: event.target.value })} />}</AdminField>
            <AdminField label="الوصف الإنجليزي" optional>{({ id }) => <AdminTextarea id={id} dir="ltr" rows={6} value={form.descriptionEn || ""} onChange={(event) => patch({ descriptionEn: event.target.value })} />}</AdminField>
            <AdminField label="الوصف الفرنسي" optional>{({ id }) => <AdminTextarea id={id} dir="ltr" rows={6} value={form.descriptionFr || ""} onChange={(event) => patch({ descriptionFr: event.target.value })} />}</AdminField>
          </AdminFormSection>
        ) : formTab === "media" ? (
          <AdminFormSection title="الصورة والأيقونة">
            <AdminField label="الأيقونة" optional>{({ id }) => <AdminInput id={id} value={form.icon || ""} onChange={(event) => patch({ icon: event.target.value })} />}</AdminField>
            <div className="admin-field"><label htmlFor="service-image"><span>صورة الغلاف</span><small>اختياري</small></label><input id="service-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} />{form.image ? <div className="admin-media-preview">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={form.image} alt="معاينة صورة الخدمة" /><button type="button" className="btn btn-outline" onClick={() => patch({ image: "" })}>إزالة الصورة</button></div> : null}</div>
          </AdminFormSection>
        ) : (
          <AdminFormSection title="الحالة والظهور">
            <AdminSwitch label="الخدمة نشطة" checked={form.isActive !== false} onChange={(checked) => patch({ isActive: checked })} />
            <AdminSwitch label="منشورة في الموقع" checked={form.isPublic === true} onChange={(checked) => patch({ isPublic: checked })} />
            <AdminSwitch label="خدمة مميزة" checked={form.isFeatured === true} onChange={(checked) => patch({ isFeatured: checked })} />
            <AdminSwitch label="قابلة للحجز" checked={form.isBookable !== false} onChange={(checked) => patch({ isBookable: checked })} />
            <AdminSwitch label="تتطلب معاينة أولية" checked={form.requiresConsultation === true} onChange={(checked) => patch({ requiresConsultation: checked })} />
          </AdminFormSection>
        )}
      </AdminDialog>

      <ConfirmDialog open={!!archiveTarget} title="أرشفة الخدمة" description={`ستُخفى خدمة ${archiveTarget?.nameAr || ""} عن الموقع والحجز، مع إبقاء السجل محفوظًا للاستعادة.`} confirmLabel="أرشفة الخدمة" loading={saving} onCancel={() => setArchiveTarget(null)} onConfirm={() => void archiveService()} />
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardShell>
  );
}
