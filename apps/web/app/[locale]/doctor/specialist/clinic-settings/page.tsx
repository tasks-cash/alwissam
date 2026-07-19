"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPagination, AdminRowActions, AdminTableToolbar } from "../../../../../components/admin/AdminDataTable";
import {
  AdminErrorState,
  AdminLoadingSkeleton,
  AdminStatusBadge,
  AdminToast,
  type AdminToastState,
} from "../../../../../components/admin/AdminFeedback";
import {
  AdminField,
  AdminFormSection,
  AdminInput,
  AdminSwitch,
  AdminTextarea,
} from "../../../../../components/admin/AdminForm";
import { AdminPageHeader } from "../../../../../components/admin/AdminPageHeader";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../lib/api";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type ClinicInfo = {
  nameAr?: string; nameEn?: string; nameFr?: string;
  phone?: string; email?: string;
  addressAr?: string; addressEn?: string; addressFr?: string;
  mapsEmbedUrl?: string; directionsUrl?: string;
  whatsappNumber?: string; whatsappEnabled?: boolean; facebookUrl?: string;
  workingHoursAr?: string; workingHoursEn?: string; workingHoursFr?: string;
  fridayClosed?: boolean; timezone?: string;
  contactHeroTitleAr?: string; contactHeroDescriptionAr?: string;
  inquirySectionTitleAr?: string; inquirySectionDescriptionAr?: string;
  locationSectionTitleAr?: string; locationSectionDescriptionAr?: string;
  contactSeoTitleAr?: string; contactSeoDescriptionAr?: string;
  contactPublished?: boolean;
};

type Inquiry = {
  id: string;
  fullName: string;
  phone: string;
  subject?: string;
  message?: string;
  status: "NEW" | "IN_REVIEW" | "CONTACTED" | "RESOLVED" | "ARCHIVED";
  createdAt?: string;
};

const SECTIONS = [
  ["general", "معلومات العيادة"],
  ["contact", "التواصل"],
  ["address", "العنوان والخريطة"],
  ["hours", "ساعات العمل"],
  ["social", "واتساب وفيسبوك"],
  ["inquiries", "الاستفسارات"],
] as const;

export default function ClinicSettingsPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({ roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"] });
  const [active, setActive] = useState<(typeof SECTIONS)[number][0]>("general");
  const [settings, setSettings] = useState<ClinicInfo>({});
  const [baseline, setBaseline] = useState<ClinicInfo>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [toast, setToast] = useState<AdminToastState>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState("");
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryTotal, setInquiryTotal] = useState(0);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const dirty = JSON.stringify(settings) !== JSON.stringify(baseline);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const response = await apiRequest<{ clinicInfo?: ClinicInfo }>("/api/admin/clinic-settings");
    setLoading(false);
    if (!response.ok || !response.data.clinicInfo) {
      setLoadError("تعذر تحميل إعدادات العيادة حاليًا.");
      return;
    }
    setSettings(response.data.clinicInfo);
    setBaseline(response.data.clinicInfo);
  }, []);

  const loadInquiries = useCallback(async () => {
    setInquiryLoading(true);
    const params = new URLSearchParams({ page: String(inquiryPage), limit: "20" });
    if (inquirySearch.trim()) params.set("search", inquirySearch.trim());
    if (inquiryStatus) params.set("status", inquiryStatus);
    const response = await apiRequest<{ items?: Inquiry[]; total?: number }>(`/api/admin/contact-inquiries?${params}`);
    setInquiryLoading(false);
    if (response.ok) {
      setInquiries(response.data.items || []);
      setInquiryTotal(response.data.total || 0);
    }
  }, [inquiryPage, inquirySearch, inquiryStatus]);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.slice(1);
      if (SECTIONS.some(([id]) => id === hash)) setActive(hash as typeof active);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (active === "inquiries" && user) void loadInquiries();
  }, [active, loadInquiries, user]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const patch = (value: Partial<ClinicInfo>) => setSettings((current) => ({ ...current, ...value }));

  const save = async () => {
    setSaving(true);
    setSaveError("");
    const response = await apiRequest<{ clinicInfo?: ClinicInfo }>("/api/admin/clinic-settings", {
      method: "PUT",
      body: JSON.stringify({ section: "clinic_info", clinicInfo: settings }),
    });
    setSaving(false);
    if (!response.ok) {
      setSaveError(apiErrorMessage(response.data));
      return;
    }
    const next = response.data.clinicInfo || settings;
    setSettings(next);
    setBaseline(next);
    setToast({ type: "success", message: "تم حفظ إعدادات العيادة وتحديث البيانات العامة." });
  };

  const updateInquiry = async (inquiry: Inquiry, status: Inquiry["status"]) => {
    const response = await apiRequest(`/api/admin/contact-inquiries/${inquiry.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setToast({
      type: response.ok ? "success" : "error",
      message: response.ok ? "تم تحديث حالة الاستفسار." : apiErrorMessage(response.data),
    });
    if (response.ok) await loadInquiries();
  };

  if (sessionLoading || !user) return <main className="dash-panel">{dict.loading}</main>;
  if (sessionError) return <main className="dash-panel alert-error">{sessionError}</main>;

  return (
    <DashboardShell locale={locale} dict={dict} role={user.role} userName={user.fullName} initialAdminMode={user.adminDashboardMode === "full" ? "full" : "quick"}>
      <div className="admin-doctors-page">
        <AdminPageHeader
          eyebrow="تهيئة العيادة"
          title="إعدادات العيادة"
          description="إدارة معلومات التواصل والعنوان وساعات العمل والروابط العامة من سجل MongoDB مركزي واحد."
          breadcrumbs={[{ label: "لوحة التحكم", href: `/${locale}/doctor/specialist/dashboard` }, { label: "إعدادات العيادة" }]}
          status={dirty ? <AdminStatusBadge tone="warning">تغييرات غير محفوظة</AdminStatusBadge> : <AdminStatusBadge tone="success">محفوظ</AdminStatusBadge>}
          primaryAction={active !== "inquiries" ? <button type="button" className="btn btn-primary" disabled={!dirty || saving} onClick={() => void save()}>{saving ? "جارٍ حفظ التعديلات..." : "حفظ هذا القسم"}</button> : undefined}
        />
        {loading ? <AdminLoadingSkeleton rows={6} /> : loadError ? <AdminErrorState message={loadError} onRetry={() => void load()} /> : (
          <div className="admin-settings-layout">
            <nav className="admin-settings-nav" aria-label="أقسام إعدادات العيادة">
              {SECTIONS.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? "is-active" : ""} aria-current={active === id ? "page" : undefined} onClick={() => setActive(id)}>{label}</a>)}
            </nav>
            <main className="admin-settings-content">
              {saveError ? <div className="admin-form-error" role="alert">{saveError}</div> : null}
              {active === "general" ? <AdminFormSection title="معلومات العيادة" description="الأسماء الرسمية التي تظهر في الموقع والرسائل.">
                <AdminField label="اسم العيادة بالعربية">{({ id }) => <AdminInput id={id} value={settings.nameAr || ""} onChange={(event) => patch({ nameAr: event.target.value })} />}</AdminField>
                <AdminField label="اسم العيادة بالإنجليزية">{({ id }) => <AdminInput id={id} dir="ltr" value={settings.nameEn || ""} onChange={(event) => patch({ nameEn: event.target.value })} />}</AdminField>
                <AdminField label="اسم العيادة بالفرنسية">{({ id }) => <AdminInput id={id} dir="ltr" value={settings.nameFr || ""} onChange={(event) => patch({ nameFr: event.target.value })} />}</AdminField>
                <AdminField label="المنطقة الزمنية">{({ id }) => <AdminInput id={id} dir="ltr" readOnly value={settings.timezone || "Africa/Algiers"} />}</AdminField>
                <AdminSwitch label="صفحة التواصل منشورة" checked={settings.contactPublished !== false} onChange={(checked) => patch({ contactPublished: checked })} />
              </AdminFormSection> : null}
              {active === "contact" ? <AdminFormSection title="معلومات التواصل وصفحة الاتصال">
                <AdminField label="رقم الهاتف">{({ id }) => <AdminInput id={id} dir="ltr" inputMode="numeric" value={settings.phone || ""} onChange={(event) => patch({ phone: event.target.value })} />}</AdminField>
                <AdminField label="البريد الإلكتروني">{({ id }) => <AdminInput id={id} type="email" dir="ltr" value={settings.email || ""} onChange={(event) => patch({ email: event.target.value })} />}</AdminField>
                <AdminField label="عنوان قسم التواصل">{({ id }) => <AdminInput id={id} value={settings.contactHeroTitleAr || ""} onChange={(event) => patch({ contactHeroTitleAr: event.target.value })} />}</AdminField>
                <div className="admin-form-full"><AdminField label="وصف قسم التواصل">{({ id }) => <AdminTextarea id={id} rows={3} value={settings.contactHeroDescriptionAr || ""} onChange={(event) => patch({ contactHeroDescriptionAr: event.target.value })} />}</AdminField></div>
                <AdminField label="عنوان نموذج الاستفسار">{({ id }) => <AdminInput id={id} value={settings.inquirySectionTitleAr || ""} onChange={(event) => patch({ inquirySectionTitleAr: event.target.value })} />}</AdminField>
                <AdminField label="وصف نموذج الاستفسار">{({ id }) => <AdminTextarea id={id} rows={3} value={settings.inquirySectionDescriptionAr || ""} onChange={(event) => patch({ inquirySectionDescriptionAr: event.target.value })} />}</AdminField>
                <AdminField label="عنوان SEO" optional>{({ id }) => <AdminInput id={id} value={settings.contactSeoTitleAr || ""} onChange={(event) => patch({ contactSeoTitleAr: event.target.value })} />}</AdminField>
                <AdminField label="وصف SEO" optional>{({ id }) => <AdminTextarea id={id} rows={3} value={settings.contactSeoDescriptionAr || ""} onChange={(event) => patch({ contactSeoDescriptionAr: event.target.value })} />}</AdminField>
              </AdminFormSection> : null}
              {active === "address" ? <AdminFormSection title="العنوان والخريطة" description="لا يُقبل HTML أو iframe؛ أدخل روابط خرائط آمنة فقط.">
                <AdminField label="العنوان بالعربية">{({ id }) => <AdminTextarea id={id} rows={2} value={settings.addressAr || ""} onChange={(event) => patch({ addressAr: event.target.value })} />}</AdminField>
                <AdminField label="العنوان بالإنجليزية">{({ id }) => <AdminTextarea id={id} dir="ltr" rows={2} value={settings.addressEn || ""} onChange={(event) => patch({ addressEn: event.target.value })} />}</AdminField>
                <AdminField label="العنوان بالفرنسية">{({ id }) => <AdminTextarea id={id} dir="ltr" rows={2} value={settings.addressFr || ""} onChange={(event) => patch({ addressFr: event.target.value })} />}</AdminField>
                <AdminField label="رابط الاتجاهات">{({ id }) => <AdminInput id={id} type="url" dir="ltr" value={settings.directionsUrl || ""} onChange={(event) => patch({ directionsUrl: event.target.value })} />}</AdminField>
                <div className="admin-form-full"><AdminField label="رابط تضمين Google Maps الآمن" optional>{({ id }) => <AdminInput id={id} type="url" dir="ltr" value={settings.mapsEmbedUrl || ""} onChange={(event) => patch({ mapsEmbedUrl: event.target.value })} />}</AdminField></div>
              </AdminFormSection> : null}
              {active === "hours" ? <AdminFormSection title="ساعات عمل العيادة" description="هذه الساعات العامة منفصلة عن جداول الأطباء الفردية.">
                <AdminField label="الساعات بالعربية">{({ id }) => <AdminTextarea id={id} rows={5} value={settings.workingHoursAr || ""} onChange={(event) => patch({ workingHoursAr: event.target.value })} />}</AdminField>
                <AdminField label="الساعات بالإنجليزية">{({ id }) => <AdminTextarea id={id} dir="ltr" rows={5} value={settings.workingHoursEn || ""} onChange={(event) => patch({ workingHoursEn: event.target.value })} />}</AdminField>
                <AdminField label="الساعات بالفرنسية">{({ id }) => <AdminTextarea id={id} dir="ltr" rows={5} value={settings.workingHoursFr || ""} onChange={(event) => patch({ workingHoursFr: event.target.value })} />}</AdminField>
                <AdminSwitch label="الجمعة مغلق" checked={settings.fridayClosed !== false} onChange={(checked) => patch({ fridayClosed: checked })} />
              </AdminFormSection> : null}
              {active === "social" ? <AdminFormSection title="واتساب وفيسبوك">
                <AdminField label="رقم واتساب">{({ id }) => <AdminInput id={id} dir="ltr" inputMode="numeric" value={settings.whatsappNumber || ""} onChange={(event) => patch({ whatsappNumber: event.target.value })} />}</AdminField>
                <AdminField label="رابط فيسبوك" optional>{({ id }) => <AdminInput id={id} type="url" dir="ltr" value={settings.facebookUrl || ""} onChange={(event) => patch({ facebookUrl: event.target.value })} />}</AdminField>
                <AdminSwitch label="إظهار واتساب في الموقع العام" description="لا يظهر زر واتساب العام داخل صفحات الإدارة." checked={settings.whatsappEnabled === true} onChange={(checked) => patch({ whatsappEnabled: checked })} />
              </AdminFormSection> : null}
              {active === "inquiries" ? <section className="admin-list-card">
                <AdminTableToolbar search={inquirySearch} onSearchChange={(value) => { setInquirySearch(value); setInquiryPage(1); }} searchPlaceholder="ابحث بالاسم أو الهاتف أو الموضوع" resultCount={inquiryTotal} filters={<select value={inquiryStatus} onChange={(event) => { setInquiryStatus(event.target.value); setInquiryPage(1); }} aria-label="حالة الاستفسار"><option value="">كل الحالات</option><option value="NEW">جديد</option><option value="IN_REVIEW">قيد المراجعة</option><option value="CONTACTED">تم التواصل</option><option value="RESOLVED">مغلق</option><option value="ARCHIVED">مؤرشف</option></select>} />
                {inquiryLoading ? <AdminLoadingSkeleton /> : <div className="admin-doctors-table-wrap"><table className="admin-doctors-table"><thead><tr><th>المرسل</th><th>الموضوع</th><th>الرسالة</th><th>الحالة</th><th>التاريخ</th><th><span className="sr-only">الإجراءات</span></th></tr></thead><tbody>{inquiries.map((inquiry) => <tr key={inquiry.id}><td><strong>{inquiry.fullName}</strong><small dir="ltr">{inquiry.phone}</small></td><td>{inquiry.subject || "—"}</td><td>{(inquiry.message || "").slice(0, 100)}</td><td><AdminStatusBadge tone={inquiry.status === "RESOLVED" ? "success" : inquiry.status === "NEW" ? "warning" : "info"}>{inquiry.status}</AdminStatusBadge></td><td>{inquiry.createdAt ? new Intl.DateTimeFormat("ar-DZ").format(new Date(inquiry.createdAt)) : "—"}</td><td><AdminRowActions>{(["IN_REVIEW", "CONTACTED", "RESOLVED", "ARCHIVED"] as const).map((status) => <button type="button" key={status} onClick={() => void updateInquiry(inquiry, status)}>{status}</button>)}</AdminRowActions></td></tr>)}</tbody></table></div>}
                <AdminPagination page={inquiryPage} totalPages={Math.max(1, Math.ceil(inquiryTotal / 20))} onPageChange={setInquiryPage} />
              </section> : null}
            </main>
          </div>
        )}
      </div>
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardShell>
  );
}
