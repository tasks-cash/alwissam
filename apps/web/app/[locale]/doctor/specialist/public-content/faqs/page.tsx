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

type FaqRow = {
  id: string;
  questionAr: string;
  questionEn: string;
  questionFr: string;
  answerAr: string;
  answerEn: string;
  answerFr: string;
  slug: string;
  category: string;
  keywordsAr?: string[];
  keywordsEn?: string[];
  keywordsFr?: string[];
  relatedSpecialtySlugs?: string[];
  relatedServiceSlugs?: string[];
  isActive?: boolean;
  isPublic?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  archivedAt?: string | null;
};

const CATEGORIES = ["general", "contact-location", "working-hours", "appointments", "doctors", "before-visit", "after-visit", "pricing-payment", "general-dentistry", "cleaning-gums", "teeth-whitening", "fillings", "root-canal", "extraction", "wisdom-teeth", "implants", "crowns-bridges", "orthodontics", "pediatric-dentistry", "dental-emergency", "privacy", "support"];

const EMPTY: Omit<FaqRow, "id"> = {
  questionAr: "", questionEn: "", questionFr: "",
  answerAr: "", answerEn: "", answerFr: "",
  slug: "", category: "general",
  keywordsAr: [], keywordsEn: [], keywordsFr: [],
  relatedSpecialtySlugs: [], relatedServiceSlugs: [],
  isActive: true, isPublic: false, isFeatured: false, displayOrder: 100,
};

const csv = (value?: string[]) => value?.join(", ") || "";
const splitCsv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export default function FaqsAdminPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({ roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"] });
  const [rows, setRows] = useState<FaqRow[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<Omit<FaqRow, "id"> & { id?: string }>({ ...EMPTY });
  const [keywords, setKeywords] = useState({ ar: "", en: "", fr: "", specialties: "", services: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [preview, setPreview] = useState<FaqRow | null>(null);
  const [previewLocale, setPreviewLocale] = useState<"ar" | "en" | "fr">("ar");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<FaqRow | null>(null);
  const [toast, setToast] = useState<AdminToastState>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category !== "all") params.set("category", category);
    return params.toString();
  }, [category, debouncedSearch, page]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const response = await apiRequest<{ faqs?: FaqRow[]; total?: number }>(`/api/admin/faqs?${query}`);
    setLoading(false);
    if (!response.ok) {
      setLoadError("تعذر تحميل الأسئلة الشائعة حاليًا.");
      return;
    }
    setRows(response.data.faqs || []);
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
    setKeywords({ ar: "", en: "", fr: "", specialties: "", services: "" });
    setDirty(false);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (row: FaqRow) => {
    setForm({ ...EMPTY, ...row });
    setKeywords({
      ar: csv(row.keywordsAr), en: csv(row.keywordsEn), fr: csv(row.keywordsFr),
      specialties: csv(row.relatedSpecialtySlugs), services: csv(row.relatedServiceSlugs),
    });
    setDirty(false);
    setFormError("");
    setFormOpen(true);
  };

  const save = async (close: boolean) => {
    if (form.questionAr.trim().length < 3 || form.answerAr.trim().length < 8) {
      setFormError("أدخل السؤال والإجابة بالعربية بشكل واضح.");
      return;
    }
    setSaving(true);
    setFormError("");
    const response = await apiRequest("/api/admin/faqs", {
      method: form.id ? "PATCH" : "POST",
      body: JSON.stringify({
        ...form,
        keywordsAr: splitCsv(keywords.ar), keywordsEn: splitCsv(keywords.en), keywordsFr: splitCsv(keywords.fr),
        relatedSpecialtySlugs: splitCsv(keywords.specialties), relatedServiceSlugs: splitCsv(keywords.services),
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setFormError(apiErrorMessage(response.data));
      return;
    }
    setDirty(false);
    setToast({ type: "success", message: form.id ? "تم حفظ السؤال الشائع." : "تمت إضافة السؤال الشائع كمسودة." });
    await load();
    if (close) setFormOpen(false);
  };

  const flag = async (row: FaqRow, endpoint: "publish" | "activate" | "feature" | "restore") => {
    const body = endpoint === "publish" ? { id: row.id, publish: !row.isPublic } : endpoint === "activate" ? { id: row.id, active: !row.isActive } : endpoint === "feature" ? { id: row.id, featured: !row.isFeatured } : { id: row.id };
    setSaving(true);
    const response = await apiRequest(`/api/admin/faqs/${endpoint}`, { method: "POST", body: JSON.stringify(body) });
    setSaving(false);
    setToast({ type: response.ok ? "success" : "error", message: response.ok ? "تم تحديث حالة السؤال." : apiErrorMessage(response.data) });
    if (response.ok) await load();
  };

  const archive = async () => {
    if (!archiveTarget) return;
    setSaving(true);
    const response = await apiRequest("/api/admin/faqs/archive", { method: "POST", body: JSON.stringify({ id: archiveTarget.id }) });
    setSaving(false);
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      return;
    }
    setArchiveTarget(null);
    setToast({ type: "success", message: "تمت أرشفة السؤال وإخفاؤه." });
    await load();
  };

  if (sessionLoading || !user) return <main className="dash-panel">{dict.loading}</main>;
  if (sessionError) return <main className="dash-panel alert-error">{sessionError}</main>;

  return (
    <DashboardShell locale={locale} dict={dict} role={user.role} userName={user.fullName} initialAdminMode={user.adminDashboardMode === "full" ? "full" : "quick"}>
      <div className="admin-doctors-page">
        <AdminPageHeader eyebrow="محتوى الموقع" title="إدارة الأسئلة الشائعة" description="إنشاء وترجمة وترتيب الأسئلة التي تساعد المرضى قبل الحجز وبعد الزيارة." breadcrumbs={[{ label: "لوحة التحكم", href: `/${locale}/doctor/specialist/dashboard` }, { label: "الأسئلة الشائعة" }]} primaryAction={<button type="button" className="btn btn-primary" onClick={openCreate}>+ إضافة سؤال</button>} />
        <section className="admin-list-card">
          <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="ابحث في السؤال أو الإجابة" resultCount={total} filters={<select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="الفئة"><option value="all">كل الفئات</option>{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select>} />
          {loading ? <AdminLoadingSkeleton /> : loadError ? <AdminErrorState message={loadError} onRetry={() => void load()} /> : rows.length === 0 ? <AdminEmptyState title="لا توجد أسئلة مطابقة" description="أضف سؤالًا جديدًا أو غيّر البحث والفئة." action={<button type="button" className="btn btn-primary" onClick={openCreate}>إضافة سؤال</button>} /> : (
            <>
              <div className="admin-doctors-table-wrap"><table className="admin-doctors-table"><thead><tr><th>الترتيب</th><th>السؤال</th><th>الفئة</th><th>الحالة</th><th>النشر</th><th>مميز</th><th><span className="sr-only">الإجراءات</span></th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.displayOrder}</td><td><button type="button" className="admin-text-button" onClick={() => setPreview(row)}>{row.questionAr}</button></td><td>{row.category}</td><td><AdminStatusBadge tone={row.isActive ? "success" : "warning"}>{row.isActive ? "نشط" : "غير نشط"}</AdminStatusBadge></td><td>{row.isPublic ? "منشور" : "مسودة"}</td><td>{row.isFeatured ? "نعم" : "لا"}</td><td><AdminRowActions><button type="button" onClick={() => setPreview(row)}>معاينة</button><button type="button" onClick={() => openEdit(row)}>تعديل</button><button type="button" onClick={() => void flag(row, "publish")}>{row.isPublic ? "إلغاء النشر" : "نشر"}</button><button type="button" onClick={() => void flag(row, "activate")}>{row.isActive ? "تعطيل" : "تفعيل"}</button>{row.archivedAt ? <button type="button" onClick={() => void flag(row, "restore")}>استعادة</button> : <button type="button" onClick={() => setArchiveTarget(row)}>أرشفة</button>}</AdminRowActions></td></tr>)}</tbody></table></div>
              <div className="admin-doctor-cards">{rows.map((row) => <article key={row.id} className="admin-doctor-card"><header><span className="admin-doctor-avatar"><span>؟</span></span><div><h3>{row.questionAr}</h3><p>{row.category}</p></div><AdminRowActions><button type="button" onClick={() => setPreview(row)}>معاينة</button><button type="button" onClick={() => openEdit(row)}>تعديل</button></AdminRowActions></header><div><AdminStatusBadge tone={row.isActive ? "success" : "warning"}>{row.isActive ? "نشط" : "غير نشط"}</AdminStatusBadge><span>{row.isPublic ? "منشور" : "مسودة"}</span></div></article>)}</div>
              <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / 20))} onPageChange={setPage} />
            </>
          )}
        </section>
      </div>

      <AdminDialog open={formOpen} title={form.id ? "تعديل السؤال الشائع" : "إضافة سؤال شائع"} description="استخدم إجابات مباشرة وواضحة؛ لا حاجة إلى محرر صفحات ثقيل." onClose={() => setFormOpen(false)} dirty={dirty} busy={saving} size="xl" locale={locale} footer={<div className="admin-dialog-actions"><button type="button" className="btn btn-outline" disabled={!dirty || saving} onClick={() => void save(false)}>حفظ</button><button type="button" className="btn btn-primary" disabled={!dirty || saving} onClick={() => void save(true)}>{saving ? "جارٍ الحفظ..." : form.id ? "حفظ وإغلاق" : "إضافة السؤال"}</button></div>}>
        {formError ? <div className="admin-form-error" role="alert">{formError}</div> : null}
        <AdminFormSection title="السؤال والإجابة">
          <AdminField label="السؤال بالعربية">{({ id }) => <AdminTextarea id={id} rows={2} value={form.questionAr} onChange={(event) => patch({ questionAr: event.target.value })} />}</AdminField>
          <AdminField label="الإجابة بالعربية">{({ id }) => <AdminTextarea id={id} rows={5} value={form.answerAr} onChange={(event) => patch({ answerAr: event.target.value })} />}</AdminField>
          <AdminField label="السؤال بالإنجليزية">{({ id }) => <AdminTextarea id={id} dir="ltr" rows={2} value={form.questionEn} onChange={(event) => patch({ questionEn: event.target.value })} />}</AdminField>
          <AdminField label="الإجابة بالإنجليزية">{({ id }) => <AdminTextarea id={id} dir="ltr" rows={5} value={form.answerEn} onChange={(event) => patch({ answerEn: event.target.value })} />}</AdminField>
          <AdminField label="السؤال بالفرنسية">{({ id }) => <AdminTextarea id={id} dir="ltr" rows={2} value={form.questionFr} onChange={(event) => patch({ questionFr: event.target.value })} />}</AdminField>
          <AdminField label="الإجابة بالفرنسية">{({ id }) => <AdminTextarea id={id} dir="ltr" rows={5} value={form.answerFr} onChange={(event) => patch({ answerFr: event.target.value })} />}</AdminField>
        </AdminFormSection>
        <AdminFormSection title="التصنيف والظهور">
          <AdminField label="الفئة">{({ id }) => <AdminSelect id={id} value={form.category} onChange={(event) => patch({ category: event.target.value })}>{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</AdminSelect>}</AdminField>
          <AdminField label="الرابط المختصر">{({ id }) => <AdminInput id={id} dir="ltr" value={form.slug} onChange={(event) => patch({ slug: event.target.value.toLowerCase() })} />}</AdminField>
          <AdminField label="ترتيب العرض">{({ id }) => <AdminInput id={id} type="number" min={0} value={form.displayOrder || 0} onChange={(event) => patch({ displayOrder: Number(event.target.value) || 0 })} />}</AdminField>
          <AdminField label="كلمات مفتاحية عربية" optional>{({ id }) => <AdminInput id={id} value={keywords.ar} onChange={(event) => { setKeywords({ ...keywords, ar: event.target.value }); setDirty(true); }} />}</AdminField>
          <AdminField label="روابط التخصصات" optional>{({ id }) => <AdminInput id={id} dir="ltr" value={keywords.specialties} onChange={(event) => { setKeywords({ ...keywords, specialties: event.target.value }); setDirty(true); }} />}</AdminField>
          <AdminField label="روابط الخدمات" optional>{({ id }) => <AdminInput id={id} dir="ltr" value={keywords.services} onChange={(event) => { setKeywords({ ...keywords, services: event.target.value }); setDirty(true); }} />}</AdminField>
          <AdminSwitch label="نشط" checked={form.isActive !== false} onChange={(checked) => patch({ isActive: checked })} />
          <AdminSwitch label="منشور" checked={form.isPublic === true} onChange={(checked) => patch({ isPublic: checked })} />
          <AdminSwitch label="مميز" checked={form.isFeatured === true} onChange={(checked) => patch({ isFeatured: checked })} />
        </AdminFormSection>
      </AdminDialog>

      <AdminDialog open={!!preview} title="معاينة السؤال" description={preview?.category} onClose={() => setPreview(null)} size="md" locale={locale}>
        <div className="admin-form-tabs">{(["ar", "en", "fr"] as const).map((item) => <button key={item} type="button" aria-selected={previewLocale === item} onClick={() => setPreviewLocale(item)}>{item.toUpperCase()}</button>)}</div>
        {preview ? <article className="admin-faq-preview" dir={previewLocale === "ar" ? "rtl" : "ltr"}><h3>{previewLocale === "ar" ? preview.questionAr : previewLocale === "en" ? preview.questionEn : preview.questionFr}</h3><p>{previewLocale === "ar" ? preview.answerAr : previewLocale === "en" ? preview.answerEn : preview.answerFr}</p></article> : null}
      </AdminDialog>
      <ConfirmDialog open={!!archiveTarget} title="أرشفة السؤال" description={`سيُخفى السؤال "${archiveTarget?.questionAr || ""}" عن الموقع، ويمكن استعادته لاحقًا.`} confirmLabel="أرشفة السؤال" loading={saving} onCancel={() => setArchiveTarget(null)} onConfirm={() => void archive()} />
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardShell>
  );
}
