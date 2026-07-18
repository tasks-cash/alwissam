"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../lib/api";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type WeeklyScheduleDay = {
  dayOfWeek: string;
  morningEnabled: boolean;
  morningStart: string;
  morningEnd: string;
  eveningEnabled: boolean;
  eveningStart: string;
  eveningEnd: string;
  isActive: boolean;
};

type ClinicInfo = {
  nameAr?: string;
  nameEn?: string;
  nameFr?: string;
  phone?: string;
  phoneDisplay?: string;
  phoneInternational?: string;
  email?: string;
  address?: string;
  addressAr?: string;
  addressEn?: string;
  addressFr?: string;
  city?: string;
  stateOrWilaya?: string;
  postalCode?: string;
  countryAr?: string;
  countryEn?: string;
  countryFr?: string;
  whatsappNumber?: string;
  whatsappEnabled?: boolean;
  facebookUrl?: string;
  mapsEmbedUrl?: string;
  mapsLink?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  fridayClosed?: boolean;
  workingHoursAr?: string;
  workingHoursEn?: string;
  workingHoursFr?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  contactHeroTitleAr?: string;
  contactHeroTitleEn?: string;
  contactHeroTitleFr?: string;
  contactHeroDescriptionAr?: string;
  contactHeroDescriptionEn?: string;
  contactHeroDescriptionFr?: string;
  contactHeroImage?: string;
  inquirySectionTitleAr?: string;
  inquirySectionDescriptionAr?: string;
  locationSectionTitleAr?: string;
  locationSectionDescriptionAr?: string;
  contactSeoTitleAr?: string;
  contactSeoDescriptionAr?: string;
  contactPublished?: boolean;
  weeklySchedule?: WeeklyScheduleDay[];
};

type PublicPages = {
  aboutAr?: string;
  aboutEn?: string;
  aboutFr?: string;
  services?: { name: string; description?: string }[];
  faqs?: { question: string; answer: string }[];
};

type SpecialtiesPage = {
  badgeAr?: string;
  badgeEn?: string;
  badgeFr?: string;
  titleAr?: string;
  titleEn?: string;
  titleFr?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  image?: string;
  imageAltAr?: string;
  imageAltEn?: string;
  imageAltFr?: string;
  primaryCtaLabelAr?: string;
  primaryCtaRoute?: string;
  secondaryCtaLabelAr?: string;
  secondaryCtaRoute?: string;
  published?: boolean;
};

type InquiryStatus =
  | "new"
  | "in_review"
  | "contacted"
  | "resolved"
  | "archived";

type ContactInquiry = {
  id: string;
  fullName: string;
  phone: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt?: string;
};

const INQUIRY_STATUSES: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "جديد" },
  { value: "in_review", label: "قيد المراجعة" },
  { value: "contacted", label: "تم التواصل" },
  { value: "resolved", label: "مغلق" },
  { value: "archived", label: "مؤرشف" },
];

const WEEK_DAYS: { code: string; label: string }[] = [
  { code: "SAT", label: "السبت" },
  { code: "SUN", label: "الأحد" },
  { code: "MON", label: "الإثنين" },
  { code: "TUE", label: "الثلاثاء" },
  { code: "WED", label: "الأربعاء" },
  { code: "THU", label: "الخميس" },
  { code: "FRI", label: "الجمعة" },
];

function defaultWeeklySchedule(): WeeklyScheduleDay[] {
  return WEEK_DAYS.map(({ code }) => ({
    dayOfWeek: code,
    morningEnabled: code !== "FRI",
    morningStart: "08:00",
    morningEnd: "12:00",
    eveningEnabled: code !== "FRI",
    eveningStart: "14:00",
    eveningEnd: "17:00",
    isActive: code !== "FRI",
  }));
}

function normalizeWeeklySchedule(raw: unknown): WeeklyScheduleDay[] {
  const defaults = defaultWeeklySchedule();
  if (!Array.isArray(raw)) return defaults;
  return defaults.map((def) => {
    const row = raw.find(
      (r) =>
        r &&
        typeof r === "object" &&
        String((r as WeeklyScheduleDay).dayOfWeek).toUpperCase() === def.dayOfWeek,
    ) as WeeklyScheduleDay | undefined;
    if (!row) return def;
    return {
      dayOfWeek: def.dayOfWeek,
      morningEnabled: row.morningEnabled !== false,
      morningStart: row.morningStart || def.morningStart,
      morningEnd: row.morningEnd || def.morningEnd,
      eveningEnabled: row.eveningEnabled !== false,
      eveningStart: row.eveningStart || def.eveningStart,
      eveningEnd: row.eveningEnd || def.eveningEnd,
      isActive: row.isActive !== false,
    };
  });
}

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ClinicSettingsPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [info, setInfo] = useState<ClinicInfo>({});
  const [pages, setPages] = useState<PublicPages>({});
  const [specialtiesPage, setSpecialtiesPage] = useState<SpecialtiesPage>({});
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquiriesTotal, setInquiriesTotal] = useState(0);
  const [inquiriesPage, setInquiriesPage] = useState(1);
  const [inquiriesStatus, setInquiriesStatus] = useState("");
  const [inquiriesSearch, setInquiriesSearch] = useState("");
  const [inquiriesError, setInquiriesError] = useState("");
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [mapsLinkError, setMapsLinkError] = useState("");

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      fetch("/api/admin/clinic-settings", { credentials: "include" }),
      fetch("/api/admin/public-pages", { credentials: "include" }),
      fetch("/api/admin/specialties-page", { credentials: "include" }),
    ]);
    if (a.ok) {
      const d = await a.json();
      const clinicInfo = d.clinicInfo || {};
      setInfo({
        ...clinicInfo,
        weeklySchedule: normalizeWeeklySchedule(clinicInfo.weeklySchedule),
      });
    }
    if (b.ok) {
      const d = await b.json();
      setPages(d.publicPages || {});
    }
    if (c.ok) {
      const d = await c.json();
      setSpecialtiesPage(d.specialtiesPage || {});
    }
  }, []);

  const loadInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    setInquiriesError("");
    const qs = new URLSearchParams({
      page: String(inquiriesPage),
      limit: "20",
    });
    if (inquiriesStatus) qs.set("status", inquiriesStatus);
    if (inquiriesSearch.trim()) qs.set("search", inquiriesSearch.trim());
    const { ok, data } = await apiRequest<{
      items?: ContactInquiry[];
      total?: number;
    }>(`/api/admin/contact-inquiries?${qs}`);
    setInquiriesLoading(false);
    if (!ok) {
      setInquiriesError("تعذر تحميل استفسارات التواصل.");
      return;
    }
    setInquiries(data.items || []);
    setInquiriesTotal(data.total || 0);
  }, [inquiriesPage, inquiriesSearch, inquiriesStatus]);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  useEffect(() => {
    if (user) void loadInquiries();
  }, [loadInquiries, user]);

  function validateMapsLink(link: string | undefined) {
    const trimmed = (link || "").trim();
    if (!trimmed) {
      setMapsLinkError("");
      return true;
    }
    if (!isValidHttpUrl(trimmed)) {
      setMapsLinkError("رابط الخريطة يجب أن يبدأ بـ http:// أو https://");
      return false;
    }
    setMapsLinkError("");
    return true;
  }

  async function persistInfo(partial: ClinicInfo, successMsg?: string) {
    setSaving(true);
    setMsg("");
    setErr("");
    const payload = { ...info, ...partial };
    const { ok, data } = await apiRequest<{ message?: string }>(
      "/api/admin/clinic-settings",
      {
        method: "PUT",
        body: JSON.stringify({ section: "clinic_info", clinicInfo: payload }),
      },
    );
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return false;
    }
    setInfo(payload);
    setMsg(data.message || successMsg || dict.successSaved);
    return true;
  }

  async function saveContact(e: FormEvent) {
    e.preventDefault();
    if (!validateMapsLink(info.mapsLink)) return;
    await persistInfo(info, "تم حفظ التواصل.");
  }

  async function saveHours(e: FormEvent) {
    e.preventDefault();
    await persistInfo(
      {
        weeklySchedule: info.weeklySchedule,
        workingHoursAr: info.workingHoursAr,
        workingHoursEn: info.workingHoursEn,
        workingHoursFr: info.workingHoursFr,
        fridayClosed: info.fridayClosed,
      },
      "تم حفظ الدوام.",
    );
  }

  async function savePages(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    const { ok, data } = await apiRequest<{ message?: string }>(
      "/api/admin/clinic-settings",
      {
        method: "PUT",
        body: JSON.stringify({
          section: "public_pages",
          publicPages: {
            aboutAr: pages.aboutAr,
            aboutEn: pages.aboutEn,
            aboutFr: pages.aboutFr,
            services: pages.services || [],
            faqs: pages.faqs || [],
          },
        }),
      },
    );
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || dict.successSaved);
  }

  async function saveSpecialtiesPage(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    const { ok, data } = await apiRequest<{
      message?: string;
      specialtiesPage?: SpecialtiesPage;
    }>("/api/admin/clinic-settings", {
      method: "PUT",
      body: JSON.stringify({
        section: "specialties_page",
        specialtiesPage,
      }),
    });
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    if (data.specialtiesPage) setSpecialtiesPage(data.specialtiesPage);
    setMsg(data.message || "تم حفظ واجهة صفحة التخصصات.");
  }

  async function updateInquiryStatus(id: string, status: InquiryStatus) {
    setInquiriesError("");
    const { ok } = await apiRequest(
      `/api/admin/contact-inquiries/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
    if (!ok) {
      setInquiriesError("تعذر تحديث حالة الاستفسار.");
      return;
    }
    setInquiries((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  function updateScheduleDay(index: number, patch: Partial<WeeklyScheduleDay>) {
    setInfo((prev) => {
      const schedule = [...(prev.weeklySchedule || defaultWeeklySchedule())];
      schedule[index] = { ...schedule[index], ...patch };
      return { ...prev, weeklySchedule: schedule };
    });
  }

  function updateSpecialtiesPage(
    field: keyof SpecialtiesPage,
    value: string | boolean,
  ) {
    setSpecialtiesPage((current) => ({ ...current, [field]: value }));
  }

  if (loading || !user) {
    return <main className="dash-panel">{dict.loading}</main>;
  }
  if (error) {
    return <main className="dash-panel alert-error">{error}</main>;
  }

  const schedule = info.weeklySchedule || defaultWeeklySchedule();

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title={dict.navSettings}
      description={dict.dashboardLead}
    >
      {msg ? <div className="alert-success">{msg}</div> : null}
      {err ? <div className="alert-error">{err}</div> : null}

      <section id="contact" className="card-surface dash-actions">
        <h2>Clinic info</h2>
        <form className="stack-form" onSubmit={saveContact}>
          <div className="row-2">
            <div className="field">
              <label>Name (AR)</label>
              <input
                className="input"
                value={info.nameAr || ""}
                onChange={(e) => setInfo((i) => ({ ...i, nameAr: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Name (EN)</label>
              <input
                className="input"
                value={info.nameEn || ""}
                onChange={(e) => setInfo((i) => ({ ...i, nameEn: e.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label>Name (FR)</label>
            <input
              className="input"
              value={info.nameFr || ""}
              onChange={(e) => setInfo((i) => ({ ...i, nameFr: e.target.value }))}
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>{dict.phone}</label>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                value={info.phone || ""}
                onChange={(e) => setInfo((i) => ({ ...i, phone: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>{dict.email}</label>
              <input
                className="input"
                type="email"
                dir="ltr"
                spellCheck={false}
                autoComplete="email"
                value={info.email || ""}
                onChange={(e) => setInfo((i) => ({ ...i, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label>Address (AR)</label>
            <textarea
              className="input"
              rows={2}
              value={info.addressAr || info.address || ""}
              onChange={(e) =>
                setInfo((i) => ({
                  ...i,
                  addressAr: e.target.value,
                  address: e.target.value,
                }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Address (EN)</label>
              <textarea
                className="input"
                rows={2}
                value={info.addressEn || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, addressEn: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Address (FR)</label>
              <textarea
                className="input"
                rows={2}
                value={info.addressFr || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, addressFr: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>City</label>
              <input
                className="input"
                value={info.city || ""}
                onChange={(e) => setInfo((i) => ({ ...i, city: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Wilaya</label>
              <input
                className="input"
                value={info.stateOrWilaya || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, stateOrWilaya: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>Postal code</label>
              <input
                className="input"
                dir="ltr"
                value={info.postalCode || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, postalCode: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Timezone</label>
              <input
                className="input"
                dir="ltr"
                value={info.timezone || "Africa/Algiers"}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, timezone: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>Country (AR)</label>
              <input
                className="input"
                value={info.countryAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, countryAr: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Country (EN)</label>
              <input
                className="input"
                value={info.countryEn || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, countryEn: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="field">
            <label>Country (FR)</label>
            <input
              className="input"
              value={info.countryFr || ""}
              onChange={(e) =>
                setInfo((i) => ({ ...i, countryFr: e.target.value }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Phone display</label>
              <input
                className="input"
                dir="ltr"
                value={info.phoneDisplay || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, phoneDisplay: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Phone international</label>
              <input
                className="input"
                dir="ltr"
                value={info.phoneInternational || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    phoneInternational: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>WhatsApp number</label>
              <input
                className="input"
                dir="ltr"
                value={info.whatsappNumber || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, whatsappNumber: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>WhatsApp enabled</label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={info.whatsappEnabled !== false}
                  onChange={(e) =>
                    setInfo((i) => ({
                      ...i,
                      whatsappEnabled: e.target.checked,
                    }))
                  }
                />
                <span>Show WhatsApp on public site</span>
              </label>
            </div>
          </div>
          <div className="field">
            <label>Facebook URL</label>
            <input
              className="input"
              dir="ltr"
              value={info.facebookUrl || ""}
              onChange={(e) =>
                setInfo((i) => ({ ...i, facebookUrl: e.target.value }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Maps link (directions)</label>
              <input
                className="input"
                dir="ltr"
                value={info.mapsLink || ""}
                onChange={(e) => {
                  const mapsLink = e.target.value;
                  setInfo((i) => ({ ...i, mapsLink }));
                  validateMapsLink(mapsLink);
                }}
                onBlur={() => validateMapsLink(info.mapsLink)}
              />
              {mapsLinkError ? (
                <div className="error">{mapsLinkError}</div>
              ) : null}
            </div>
            <div className="field">
              <label>Maps embed URL</label>
              <input
                className="input"
                dir="ltr"
                value={info.mapsEmbedUrl || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, mapsEmbedUrl: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>Latitude</label>
              <input
                className="input"
                dir="ltr"
                value={info.latitude || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, latitude: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Longitude</label>
              <input
                className="input"
                dir="ltr"
                value={info.longitude || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, longitude: e.target.value }))
                }
              />
            </div>
          </div>
          <h3>محتوى صفحة التواصل</h3>
          <div className="row-2">
            <div className="field">
              <label>عنوان الواجهة (AR)</label>
              <input
                className="input"
                value={info.contactHeroTitleAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    contactHeroTitleAr: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>عنوان الواجهة (EN)</label>
              <input
                className="input"
                value={info.contactHeroTitleEn || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    contactHeroTitleEn: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="field">
            <label>عنوان الواجهة (FR)</label>
            <input
              className="input"
              value={info.contactHeroTitleFr || ""}
              onChange={(e) =>
                setInfo((i) => ({
                  ...i,
                  contactHeroTitleFr: e.target.value,
                }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>وصف الواجهة (AR)</label>
              <textarea
                className="input"
                rows={3}
                value={info.contactHeroDescriptionAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    contactHeroDescriptionAr: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>وصف الواجهة (EN)</label>
              <textarea
                className="input"
                rows={3}
                value={info.contactHeroDescriptionEn || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    contactHeroDescriptionEn: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>وصف الواجهة (FR)</label>
              <textarea
                className="input"
                rows={3}
                value={info.contactHeroDescriptionFr || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    contactHeroDescriptionFr: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>مسار صورة الواجهة</label>
              <input
                className="input"
                dir="ltr"
                placeholder="/api/media/..."
                value={info.contactHeroImage || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    contactHeroImage: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>عنوان قسم الاستفسار</label>
              <input
                className="input"
                value={info.inquirySectionTitleAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    inquirySectionTitleAr: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>وصف قسم الاستفسار</label>
              <textarea
                className="input"
                rows={2}
                value={info.inquirySectionDescriptionAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    inquirySectionDescriptionAr: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>عنوان قسم الموقع</label>
              <input
                className="input"
                value={info.locationSectionTitleAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    locationSectionTitleAr: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>وصف قسم الموقع</label>
              <textarea
                className="input"
                rows={2}
                value={info.locationSectionDescriptionAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    locationSectionDescriptionAr: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label>عنوان SEO لصفحة التواصل</label>
              <input
                className="input"
                value={info.contactSeoTitleAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    contactSeoTitleAr: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>وصف SEO لصفحة التواصل</label>
              <textarea
                className="input"
                rows={2}
                value={info.contactSeoDescriptionAr || ""}
                onChange={(e) =>
                  setInfo((i) => ({
                    ...i,
                    contactSeoDescriptionAr: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={info.contactPublished !== false}
              onChange={(e) =>
                setInfo((i) => ({
                  ...i,
                  contactPublished: e.target.checked,
                }))
              }
            />
            <span>نشر صفحة التواصل</span>
          </label>
          <button className="btn btn-primary" type="submit" disabled={saving || !!mapsLinkError}>
            {saving ? dict.saving : "حفظ التواصل"}
          </button>
        </form>
      </section>

      <section id="specialties-page" className="card-surface dash-actions">
        <h2>واجهة صفحة التخصصات</h2>
        <form className="stack-form" onSubmit={saveSpecialtiesPage}>
          <div className="row-2">
            {(
              [
                ["badgeAr", "الشارة (AR)"],
                ["badgeEn", "الشارة (EN)"],
                ["badgeFr", "الشارة (FR)"],
                ["titleAr", "العنوان (AR)"],
                ["titleEn", "العنوان (EN)"],
                ["titleFr", "العنوان (FR)"],
              ] as const
            ).map(([field, label]) => (
              <div className="field" key={field}>
                <label>{label}</label>
                <input
                  className="input"
                  value={specialtiesPage[field] || ""}
                  onChange={(e) =>
                    updateSpecialtiesPage(field, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <div className="row-2">
            {(
              [
                ["descriptionAr", "الوصف (AR)"],
                ["descriptionEn", "الوصف (EN)"],
                ["descriptionFr", "الوصف (FR)"],
              ] as const
            ).map(([field, label]) => (
              <div className="field" key={field}>
                <label>{label}</label>
                <textarea
                  className="input"
                  rows={3}
                  value={specialtiesPage[field] || ""}
                  onChange={(e) =>
                    updateSpecialtiesPage(field, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <div className="field">
            <label>مسار الصورة</label>
            <input
              className="input"
              dir="ltr"
              placeholder="/api/media/..."
              value={specialtiesPage.image || ""}
              onChange={(e) => updateSpecialtiesPage("image", e.target.value)}
            />
          </div>
          <div className="row-2">
            {(
              [
                ["imageAltAr", "النص البديل للصورة (AR)"],
                ["imageAltEn", "النص البديل للصورة (EN)"],
                ["imageAltFr", "النص البديل للصورة (FR)"],
              ] as const
            ).map(([field, label]) => (
              <div className="field" key={field}>
                <label>{label}</label>
                <input
                  className="input"
                  value={specialtiesPage[field] || ""}
                  onChange={(e) =>
                    updateSpecialtiesPage(field, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <div className="row-2">
            {(
              [
                ["primaryCtaLabelAr", "نص الزر الرئيسي"],
                ["primaryCtaRoute", "مسار الزر الرئيسي"],
                ["secondaryCtaLabelAr", "نص الزر الثانوي"],
                ["secondaryCtaRoute", "مسار الزر الثانوي"],
              ] as const
            ).map(([field, label]) => (
              <div className="field" key={field}>
                <label>{label}</label>
                <input
                  className="input"
                  dir={field.endsWith("Route") ? "ltr" : undefined}
                  placeholder={field.endsWith("Route") ? "/..." : undefined}
                  value={specialtiesPage[field] || ""}
                  onChange={(e) =>
                    updateSpecialtiesPage(field, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={specialtiesPage.published !== false}
              onChange={(e) =>
                updateSpecialtiesPage("published", e.target.checked)
              }
            />
            <span>نشر صفحة التخصصات</span>
          </label>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? dict.saving : "حفظ واجهة التخصصات"}
          </button>
        </form>
      </section>

      <section id="contact-inquiries" className="card-surface dash-actions">
        <h2>استفسارات التواصل</h2>
        <div className="row-2" style={{ marginBottom: "1rem" }}>
          <div className="field">
            <label>بحث</label>
            <input
              className="input"
              placeholder="الاسم، الهاتف، الموضوع أو الرسالة"
              value={inquiriesSearch}
              onChange={(e) => {
                setInquiriesPage(1);
                setInquiriesSearch(e.target.value);
              }}
            />
          </div>
          <div className="field">
            <label>الحالة</label>
            <select
              className="input"
              value={inquiriesStatus}
              onChange={(e) => {
                setInquiriesPage(1);
                setInquiriesStatus(e.target.value);
              }}
            >
              <option value="">كل الحالات</option>
              {INQUIRY_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {inquiriesError ? (
          <p className="alert-error">{inquiriesError}</p>
        ) : null}
        {inquiriesLoading ? <p className="muted">جارٍ التحميل…</p> : null}
        {!inquiriesLoading && !inquiriesError && inquiries.length === 0 ? (
          <p className="muted">لا توجد استفسارات مطابقة.</p>
        ) : null}
        {inquiries.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="pc-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الهاتف</th>
                  <th>الموضوع</th>
                  <th>الرسالة</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fullName || "—"}</td>
                    <td dir="ltr">{item.phone || "—"}</td>
                    <td>{item.subject || "—"}</td>
                    <td title={item.message}>
                      {item.message
                        ? `${item.message.slice(0, 100)}${
                            item.message.length > 100 ? "…" : ""
                          }`
                        : "—"}
                    </td>
                    <td>
                      <select
                        className="input"
                        aria-label={`حالة استفسار ${item.fullName}`}
                        value={item.status}
                        onChange={(e) =>
                          void updateInquiryStatus(
                            item.id,
                            e.target.value as InquiryStatus,
                          )
                        }
                      >
                        {INQUIRY_STATUSES.map((statusItem) => (
                          <option
                            key={statusItem.value}
                            value={statusItem.value}
                          >
                            {statusItem.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {item.createdAt
                        ? new Intl.DateTimeFormat("ar-DZ", {
                            dateStyle: "medium",
                          }).format(new Date(item.createdAt))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div className="cta-row" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={inquiriesPage <= 1 || inquiriesLoading}
            onClick={() => setInquiriesPage((page) => Math.max(1, page - 1))}
          >
            السابق
          </button>
          <span className="muted">
            الصفحة {inquiriesPage} — الإجمالي {inquiriesTotal}
          </span>
          <button
            type="button"
            className="btn btn-outline"
            disabled={
              inquiriesLoading || inquiriesPage * 20 >= inquiriesTotal
            }
            onClick={() => setInquiriesPage((page) => page + 1)}
          >
            التالي
          </button>
        </div>
      </section>

      <section id="hours" className="card-surface dash-actions">
        <h2>ساعات العمل</h2>
        <form className="stack-form" onSubmit={saveHours}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {schedule.map((day, index) => {
              const label =
                WEEK_DAYS.find((d) => d.code === day.dayOfWeek)?.label ||
                day.dayOfWeek;
              return (
                <div
                  key={day.dayOfWeek}
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "0.75rem",
                    display: "grid",
                    gap: "0.5rem",
                  }}
                >
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={day.isActive}
                      onChange={(e) =>
                        updateScheduleDay(index, { isActive: e.target.checked })
                      }
                    />
                    <strong>{label}</strong>
                  </label>
                  <div className="row-2">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={day.morningEnabled}
                        disabled={!day.isActive}
                        onChange={(e) =>
                          updateScheduleDay(index, {
                            morningEnabled: e.target.checked,
                          })
                        }
                      />
                      <span>صباح</span>
                    </label>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={day.eveningEnabled}
                        disabled={!day.isActive}
                        onChange={(e) =>
                          updateScheduleDay(index, {
                            eveningEnabled: e.target.checked,
                          })
                        }
                      />
                      <span>مساء</span>
                    </label>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label>صباح — من</label>
                      <input
                        className="input"
                        type="time"
                        dir="ltr"
                        disabled={!day.isActive || !day.morningEnabled}
                        value={day.morningStart}
                        onChange={(e) =>
                          updateScheduleDay(index, { morningStart: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label>صباح — إلى</label>
                      <input
                        className="input"
                        type="time"
                        dir="ltr"
                        disabled={!day.isActive || !day.morningEnabled}
                        value={day.morningEnd}
                        onChange={(e) =>
                          updateScheduleDay(index, { morningEnd: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label>مساء — من</label>
                      <input
                        className="input"
                        type="time"
                        dir="ltr"
                        disabled={!day.isActive || !day.eveningEnabled}
                        value={day.eveningStart}
                        onChange={(e) =>
                          updateScheduleDay(index, { eveningStart: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label>مساء — إلى</label>
                      <input
                        className="input"
                        type="time"
                        dir="ltr"
                        disabled={!day.isActive || !day.eveningEnabled}
                        value={day.eveningEnd}
                        onChange={(e) =>
                          updateScheduleDay(index, { eveningEnd: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="field">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={info.fridayClosed !== false}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, fridayClosed: e.target.checked }))
                }
              />
              <span>Friday closed</span>
            </label>
          </div>
          <div className="field">
            <label>Working hours (AR) — نص إضافي</label>
            <textarea
              className="input"
              rows={3}
              value={info.workingHoursAr || ""}
              onChange={(e) =>
                setInfo((i) => ({ ...i, workingHoursAr: e.target.value }))
              }
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Working hours (EN)</label>
              <textarea
                className="input"
                rows={3}
                value={info.workingHoursEn || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, workingHoursEn: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Working hours (FR)</label>
              <textarea
                className="input"
                rows={3}
                value={info.workingHoursFr || ""}
                onChange={(e) =>
                  setInfo((i) => ({ ...i, workingHoursFr: e.target.value }))
                }
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? dict.saving : "حفظ الدوام (صباح / مساء)"}
          </button>
        </form>
      </section>

      <section id="pages" className="card-surface dash-actions">
        <h2>Public content</h2>
        <form className="stack-form" onSubmit={savePages}>
          <div className="field">
            <label>About (AR)</label>
            <textarea
              className="input"
              rows={4}
              value={pages.aboutAr || ""}
              onChange={(e) =>
                setPages((p) => ({ ...p, aboutAr: e.target.value }))
              }
            />
          </div>
          <div className="field">
            <label>About (EN)</label>
            <textarea
              className="input"
              rows={3}
              value={pages.aboutEn || ""}
              onChange={(e) =>
                setPages((p) => ({ ...p, aboutEn: e.target.value }))
              }
            />
          </div>
          <div className="field">
            <label>About (FR)</label>
            <textarea
              className="input"
              rows={3}
              value={pages.aboutFr || ""}
              onChange={(e) =>
                setPages((p) => ({ ...p, aboutFr: e.target.value }))
              }
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? dict.saving : dict.save}
          </button>
        </form>
      </section>
    </DashboardShell>
  );
}
