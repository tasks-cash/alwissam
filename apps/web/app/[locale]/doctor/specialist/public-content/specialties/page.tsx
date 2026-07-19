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
  AdminSwitch,
  AdminTextarea,
} from "../../../../../../components/admin/AdminForm";
import { AdminPageHeader } from "../../../../../../components/admin/AdminPageHeader";
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
  doctorIds?: string[];
  archivedAt?: string | null;
};

const EMPTY: Omit<Specialty, "id"> = {
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
  doctorIds: [],
};

function validate(form: Omit<Specialty, "id"> & { id?: string }) {
  if (form.nameAr.trim().length < 2) return "أدخل اسم التخصص بالعربية.";
  if (form.nameEn.trim().length < 2) return "أدخل اسم التخصص بالإنجليزية.";
  if (form.nameFr.trim().length < 2) return "أدخل اسم التخصص بالفرنسية.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) return "الرابط المختصر غير صالح.";
  return "";
}

export default function SpecialtiesAdminPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({ roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"] });
  const [rows, setRows] = useState<Specialty[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [visibility, setVisibility] = useState("");
  const [featured, setFeatured] = useState("");
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<Omit<Specialty, "id"> & { id?: string }>({ ...EMPTY });
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState<"general" | "content" | "media" | "visibility">("general");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<Specialty | null>(null);
  const [linkedCounts, setLinkedCounts] = useState({ doctors: 0, services: 0 });
  const [replacementId, setReplacementId] = useState("");
  const [toast, setToast] = useState<AdminToastState>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (activeFilter) params.set("active", activeFilter);
    if (visibility) params.set("public", visibility);
    if (featured) params.set("featured", featured);
    if (archived) params.set("archived", "true");
    return params.toString();
  }, [activeFilter, archived, debouncedSearch, featured, page, visibility]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const response = await apiRequest<{ specialties?: Specialty[]; total?: number }>(`/api/admin/catalog/specialties?${query}`);
    setLoading(false);
    if (!response.ok) {
      setLoadError("تعذر تحميل التخصصات حاليًا.");
      return;
    }
    setRows(response.data.specialties || []);
    setTotal(response.data.total || 0);
  }, [query]);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  const patch = (value: Partial<typeof form>) => {
    setForm((current) => ({ ...current, ...value }));
    setDirty(true);
  };

  const openCreate = () => {
    setForm({ ...EMPTY });
    setTab("general");
    setFormError("");
    setDirty(false);
    setFormOpen(true);
  };

  const openEdit = async (row: Specialty) => {
    setSaving(true);
    const response = await apiRequest<{ specialty?: Specialty }>(`/api/admin/catalog/specialties/${row.id}`);
    setSaving(false);
    if (!response.ok || !response.data.specialty) {
      setToast({ type: "error", message: "تعذر تحميل تفاصيل التخصص." });
      return;
    }
    setForm({ ...EMPTY, ...response.data.specialty });
    setTab("general");
    setFormError("");
    setDirty(false);
    setFormOpen(true);
  };

  const save = async (close: boolean) => {
    const message = validate(form);
    if (message) {
      setFormError(message);
      return;
    }
    setSaving(true);
    setFormError("");
    const response = await apiRequest("/api/admin/catalog/specialties", {
      method: form.id ? "PATCH" : "POST",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!response.ok) {
      setFormError(apiErrorMessage(response.data));
      return;
    }
    setDirty(false);
    setToast({ type: "success", message: form.id ? `تم حفظ تعديلات ${form.nameAr}.` : `تمت إضافة تخصص ${form.nameAr}.` });
    await load();
    if (close) setFormOpen(false);
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

  const flag = async (row: Specialty, action: "publish" | "activate" | "feature" | "restore") => {
    const body =
      action === "publish" ? { id: row.id, publish: !row.isPublic } :
      action === "activate" ? { id: row.id, active: !row.isActive } :
      action === "feature" ? { id: row.id, featured: !row.isFeatured } :
      { id: row.id };
    setSaving(true);
    const response = await apiRequest(`/api/admin/catalog/specialties/${action}`, { method: "POST", body: JSON.stringify(body) });
    setSaving(false);
    setToast({ type: response.ok ? "success" : "error", message: response.ok ? "تم تحديث حالة التخصص." : apiErrorMessage(response.data) });
    if (response.ok) await load();
  };

  const prepareArchive = async (row: Specialty) => {
    setSaving(true);
    const response = await apiRequest<{ doctors?: unknown[]; services?: unknown[] }>(`/api/admin/catalog/specialties/${row.id}`);
    setSaving(false);
    if (!response.ok) {
      setToast({ type: "error", message: "تعذر التحقق من ارتباطات التخصص." });
      return;
    }
    setLinkedCounts({
      doctors: response.data.doctors?.length || 0,
      services: response.data.services?.length || 0,
    });
    setReplacementId("");
    setArchiveTarget(row);
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    if ((linkedCounts.doctors > 0 || linkedCounts.services > 0) && !replacementId) {
      setFormError("اختر تخصصًا بديلًا لنقل الارتباطات قبل الأرشفة.");
      return;
    }
    setSaving(true);
    const response = await apiRequest("/api/admin/catalog/specialties/archive", {
      method: "POST",
      body: JSON.stringify({ id: archiveTarget.id, replacementId: replacementId || undefined }),
    });
    setSaving(false);
    if (!response.ok) {
      setFormError(apiErrorMessage(response.data));
      return;
    }
    setArchiveTarget(null);
    setFormError("");
    setToast({ type: "success", message: "تمت أرشفة التخصص ونقل ارتباطاته بأمان." });
    await load();
  };

  const move = async (row: Specialty, direction: -1 | 1) => {
    const index = rows.findIndex((item) => item.id === row.id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) return;
    const ordered = [...rows];
    [ordered[index], ordered[nextIndex]] = [ordered[nextIndex], ordered[index]];
    setRows(ordered);
    const response = await apiRequest("/api/admin/catalog/specialties/reorder", {
      method: "POST",
      body: JSON.stringify({ orderedIds: ordered.map((item) => item.id) }),
    });
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      await load();
    }
  };

  if (sessionLoading || !user) return <main className="dash-panel">{dict.loading}</main>;
  if (sessionError) return <main className="dash-panel alert-error">{sessionError}</main>;

  return (
    <DashboardShell locale={locale} dict={dict} role={user.role} userName={user.fullName} initialAdminMode={user.adminDashboardMode === "full" ? "full" : "quick"}>
      <div className="admin-doctors-page">
        <AdminPageHeader
          eyebrow="محتوى الموقع"
          title="إدارة التخصصات"
          description="إدارة التخصصات المرتبطة بالأطباء والخدمات وترتيب ظهورها في الموقع."
          breadcrumbs={[{ label: "لوحة التحكم", href: `/${locale}/doctor/specialist/dashboard` }, { label: "التخصصات" }]}
          primaryAction={<button type="button" className="btn btn-primary" onClick={openCreate}>+ إضافة تخصص</button>}
        />
        <section className="admin-list-card">
          <AdminTableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="ابحث باسم التخصص أو الرابط"
            resultCount={total}
            filters={
              <>
                <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} aria-label="الحالة"><option value="">كل الحالات</option><option value="true">نشطة</option><option value="false">غير نشطة</option></select>
                <select value={visibility} onChange={(event) => setVisibility(event.target.value)} aria-label="النشر"><option value="">كل النشر</option><option value="true">منشورة</option><option value="false">مسودة</option></select>
                <select value={featured} onChange={(event) => setFeatured(event.target.value)} aria-label="التمييز"><option value="">الكل</option><option value="true">مميزة</option><option value="false">عادية</option></select>
                <label className="admin-filter-check"><input type="checkbox" checked={archived} onChange={(event) => setArchived(event.target.checked)} /> المؤرشفة</label>
              </>
            }
          />
          {loading ? <AdminLoadingSkeleton /> : loadError ? <AdminErrorState message={loadError} onRetry={() => void load()} /> : rows.length === 0 ? (
            <AdminEmptyState title="لا توجد تخصصات مطابقة" description="أضف تخصصًا جديدًا أو عدّل الفلاتر." action={<button type="button" className="btn btn-primary" onClick={openCreate}>إضافة تخصص</button>} />
          ) : (
            <>
              <div className="admin-doctors-table-wrap">
                <table className="admin-doctors-table">
                  <thead><tr><th>التخصص</th><th>الأطباء</th><th>الحالة</th><th>النشر</th><th>مميز</th><th>الترتيب</th><th><span className="sr-only">الإجراءات</span></th></tr></thead>
                  <tbody>{rows.map((row, index) => (
                    <tr key={row.id}>
                      <td><strong>{row.nameAr}</strong><small dir="ltr">/{row.slug}</small></td>
                      <td>{row.doctorIds?.length || 0}</td>
                      <td><AdminStatusBadge tone={row.isActive ? "success" : "warning"}>{row.isActive ? "نشط" : "غير نشط"}</AdminStatusBadge></td>
                      <td>{row.isPublic ? "منشور" : "مسودة"}</td>
                      <td>{row.isFeatured ? "نعم" : "لا"}</td>
                      <td><div className="admin-order-actions"><button type="button" disabled={index === 0} onClick={() => void move(row, -1)} aria-label="تحريك لأعلى">↑</button><button type="button" disabled={index === rows.length - 1} onClick={() => void move(row, 1)} aria-label="تحريك لأسفل">↓</button></div></td>
                      <td><AdminRowActions>
                        <button type="button" onClick={() => void openEdit(row)}>تعديل</button>
                        <a href={`/${locale}/specialties/${row.slug}`} target="_blank" rel="noreferrer">معاينة</a>
                        <button type="button" onClick={() => void flag(row, "publish")}>{row.isPublic ? "إلغاء النشر" : "نشر"}</button>
                        <button type="button" onClick={() => void flag(row, "feature")}>{row.isFeatured ? "إلغاء التمييز" : "إظهار ضمن المميزة"}</button>
                        {row.archivedAt ? <button type="button" onClick={() => void flag(row, "restore")}>استعادة</button> : <button type="button" onClick={() => void prepareArchive(row)}>أرشفة</button>}
                      </AdminRowActions></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="admin-doctor-cards">{rows.map((row) => <article className="admin-doctor-card" key={row.id}><header><span className="admin-doctor-avatar"><span>{row.icon === "tooth" ? "🦷" : "ت"}</span></span><div><h3>{row.nameAr}</h3><p>{row.doctorIds?.length || 0} أطباء</p></div><AdminRowActions><button type="button" onClick={() => void openEdit(row)}>تعديل</button><button type="button" onClick={() => void prepareArchive(row)}>أرشفة</button></AdminRowActions></header><div><AdminStatusBadge tone={row.isActive ? "success" : "warning"}>{row.isActive ? "نشط" : "غير نشط"}</AdminStatusBadge><span>{row.isPublic ? "منشور" : "مسودة"}</span></div></article>)}</div>
              <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / 20))} onPageChange={setPage} />
            </>
          )}
        </section>
      </div>

      <AdminDialog open={formOpen} title={form.id ? "تعديل التخصص" : "إضافة تخصص"} description="أدخل المحتوى المترجم والوسائط وحالة الظهور." onClose={() => setFormOpen(false)} dirty={dirty} busy={saving} size="xl" locale={locale} footer={<div className="admin-dialog-actions"><button type="button" className="btn btn-outline" disabled={!dirty || saving} onClick={() => void save(false)}>حفظ</button><button type="button" className="btn btn-primary" disabled={!dirty || saving} onClick={() => void save(true)}>{saving ? "جارٍ الحفظ..." : form.id ? "حفظ وإغلاق" : "إضافة التخصص"}</button></div>}>
        <div className="admin-form-tabs" role="tablist">{(["general", "content", "media", "visibility"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item === "general" ? "عام" : item === "content" ? "المحتوى" : item === "media" ? "الوسائط" : "الظهور"}</button>)}</div>
        {formError ? <div className="admin-form-error" role="alert">{formError}</div> : null}
        {tab === "general" ? <AdminFormSection title="المعلومات الأساسية">
          <AdminField label="الاسم بالعربية">{({ id }) => <AdminInput id={id} value={form.nameAr} onChange={(event) => patch({ nameAr: event.target.value })} />}</AdminField>
          <AdminField label="الاسم بالإنجليزية">{({ id }) => <AdminInput id={id} dir="ltr" value={form.nameEn} onChange={(event) => patch({ nameEn: event.target.value })} />}</AdminField>
          <AdminField label="الاسم بالفرنسية">{({ id }) => <AdminInput id={id} dir="ltr" value={form.nameFr} onChange={(event) => patch({ nameFr: event.target.value })} />}</AdminField>
          <AdminField label="الرابط المختصر">{({ id }) => <AdminInput id={id} dir="ltr" value={form.slug} onChange={(event) => patch({ slug: event.target.value.toLowerCase() })} />}</AdminField>
          <AdminField label="ترتيب العرض">{({ id }) => <AdminInput id={id} type="number" min={0} value={form.displayOrder || 0} onChange={(event) => patch({ displayOrder: Number(event.target.value) || 0 })} />}</AdminField>
        </AdminFormSection> : tab === "content" ? <AdminFormSection title="الأوصاف">
          <AdminField label="الوصف المختصر بالعربية" optional>{({ id }) => <AdminTextarea id={id} rows={2} value={form.shortDescriptionAr || ""} onChange={(event) => patch({ shortDescriptionAr: event.target.value })} />}</AdminField>
          <AdminField label="الوصف المختصر بالإنجليزية" optional>{({ id }) => <AdminTextarea id={id} dir="ltr" rows={2} value={form.shortDescriptionEn || ""} onChange={(event) => patch({ shortDescriptionEn: event.target.value })} />}</AdminField>
          <AdminField label="الوصف العربي" optional>{({ id }) => <AdminTextarea id={id} rows={5} value={form.descriptionAr || ""} onChange={(event) => patch({ descriptionAr: event.target.value })} />}</AdminField>
          <AdminField label="الوصف الإنجليزي" optional>{({ id }) => <AdminTextarea id={id} dir="ltr" rows={5} value={form.descriptionEn || ""} onChange={(event) => patch({ descriptionEn: event.target.value })} />}</AdminField>
          <AdminField label="الوصف الفرنسي" optional>{({ id }) => <AdminTextarea id={id} dir="ltr" rows={5} value={form.descriptionFr || ""} onChange={(event) => patch({ descriptionFr: event.target.value })} />}</AdminField>
        </AdminFormSection> : tab === "media" ? <AdminFormSection title="الصورة والأيقونة">
          <AdminField label="الأيقونة" optional>{({ id }) => <AdminInput id={id} value={form.icon || ""} onChange={(event) => patch({ icon: event.target.value })} />}</AdminField>
          <div className="admin-field"><label htmlFor="specialty-image"><span>صورة التخصص</span><small>اختياري</small></label><input id="specialty-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} />{form.image ? <div className="admin-media-preview">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={form.image} alt="معاينة صورة التخصص" /><button type="button" className="btn btn-outline" onClick={() => patch({ image: "" })}>إزالة الصورة</button></div> : null}</div>
        </AdminFormSection> : <AdminFormSection title="الحالة والظهور">
          <AdminSwitch label="التخصص نشط" checked={form.isActive !== false} onChange={(checked) => patch({ isActive: checked })} />
          <AdminSwitch label="منشور في الموقع" checked={form.isPublic === true} onChange={(checked) => patch({ isPublic: checked })} />
          <AdminSwitch label="إظهار ضمن تخصصات مميزة" checked={form.isFeatured === true} onChange={(checked) => patch({ isFeatured: checked })} />
          <AdminSwitch label="قابل للحجز" checked={form.isBookable !== false} onChange={(checked) => patch({ isBookable: checked })} />
        </AdminFormSection>}
      </AdminDialog>

      <AdminDialog open={!!archiveTarget} title="أرشفة التخصص" description={`ستتم إزالة ${archiveTarget?.nameAr || "التخصص"} من الموقع مع الحفاظ على السجل.`} onClose={() => { setArchiveTarget(null); setFormError(""); }} busy={saving} size="md" locale={locale} footer={<div className="admin-dialog-actions"><button type="button" className="btn btn-outline" onClick={() => setArchiveTarget(null)}>إلغاء</button><button type="button" className="btn admin-btn-danger" disabled={saving || ((linkedCounts.doctors > 0 || linkedCounts.services > 0) && !replacementId)} onClick={() => void confirmArchive()}>{saving ? "جارٍ الأرشفة..." : "أرشفة التخصص"}</button></div>}>
        {formError ? <div className="admin-form-error" role="alert">{formError}</div> : null}
        <div className="admin-impact-summary"><strong>تأثير الأرشفة</strong><p>{linkedCounts.doctors} أطباء مرتبطون · {linkedCounts.services} خدمات مرتبطة</p><p>لن تُحذف البيانات. ستُنقل الارتباطات إلى التخصص البديل المحدد.</p></div>
        {(linkedCounts.doctors > 0 || linkedCounts.services > 0) ? <AdminField label="التخصص البديل">{({ id }) => <select id={id} className="admin-control" value={replacementId} onChange={(event) => setReplacementId(event.target.value)}><option value="">اختر تخصصًا</option>{rows.filter((row) => row.id !== archiveTarget?.id && row.isActive && !row.archivedAt).map((row) => <option key={row.id} value={row.id}>{row.nameAr}</option>)}</select>}</AdminField> : null}
      </AdminDialog>
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardShell>
  );
}
