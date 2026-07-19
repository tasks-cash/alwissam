"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import {
  apiErrorMessage,
  apiRequest,
  mapFieldErrors,
} from "../../../../../lib/api";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type SectionId =
  | "personal"
  | "professional"
  | "avatar"
  | "schedule"
  | "notifications"
  | "security"
  | "sessions"
  | "preferences";

type PersonalSettings = {
  fullName: string;
  email: string;
  phone: string;
  locale: "ar" | "en" | "fr";
  address: string;
  emailVerified: boolean;
};

type ProfessionalSettings = {
  type: "GENERAL" | "SPECIALIST";
  specialtyAr: string;
  specialtyEn: string;
  specialtyFr: string;
  professionalTitleAr: string;
  professionalTitleEn: string;
  professionalTitleFr: string;
  shortDescriptionAr: string;
  bioAr: string;
  bioEn: string;
  bioFr: string;
  licenseNumber: string;
  yearsExperience?: number;
  languages: string[];
  specialtyIds: string[];
  serviceIds: string[];
  isPublic: boolean;
  isBookable: boolean;
};

type ScheduleWindow = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};

type ScheduleSettings = {
  timezone: string;
  workingHours: ScheduleWindow[];
  appointmentDurationMinutes: number;
  leaveDates: string[];
};

type NotificationSettings = {
  appointmentNotifications: boolean;
  patientWaitingNotifications: boolean;
  staffMessageNotifications: boolean;
  followUpReminders: boolean;
  scheduleChanges: boolean;
  securityAlerts: boolean;
  inAppNotifications: boolean;
  soundNotifications: boolean;
  emailNotifications: boolean;
};

type PreferenceSettings = {
  locale: "ar" | "en" | "fr";
  dateFormat: "dd/MM/yyyy" | "yyyy-MM-dd";
  timeFormat: "12h" | "24h";
  reducedMotion: boolean;
  compactDashboard: boolean;
  notificationSound: boolean;
};

type DoctorSettings = {
  personal: PersonalSettings;
  professional: ProfessionalSettings;
  avatar: { url: string };
  schedule: ScheduleSettings;
  notifications: NotificationSettings;
  preferences: PreferenceSettings;
};

type SessionRow = {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string;
  lastActivityAt?: string;
  expiresAt?: string;
  rememberMe?: boolean;
  current?: boolean;
};

type DayEditor = {
  code: string;
  label: string;
  enabled: boolean;
  morningEnabled: boolean;
  morningStart: string;
  morningEnd: string;
  eveningEnabled: boolean;
  eveningStart: string;
  eveningEnd: string;
};

const DAYS = [
  ["SATURDAY", "السبت"],
  ["SUNDAY", "الأحد"],
  ["MONDAY", "الإثنين"],
  ["TUESDAY", "الثلاثاء"],
  ["WEDNESDAY", "الأربعاء"],
  ["THURSDAY", "الخميس"],
  ["FRIDAY", "الجمعة"],
] as const;

const SECTIONS: Array<{
  id: SectionId;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: "personal",
    label: "المعلومات الشخصية",
    description: "بيانات الحساب ووسائل التواصل",
    icon: "01",
  },
  {
    id: "professional",
    label: "الملف المهني",
    description: "المعلومات الظاهرة في ملف الطبيب",
    icon: "02",
  },
  {
    id: "avatar",
    label: "الصورة الشخصية",
    description: "صورة مهنية معتمدة",
    icon: "03",
  },
  {
    id: "schedule",
    label: "مواعيد العمل",
    description: "الفترات والإجازات ومدّة الموعد",
    icon: "04",
  },
  {
    id: "notifications",
    label: "الإشعارات",
    description: "اختيار التنبيهات المهمة",
    icon: "05",
  },
  {
    id: "security",
    label: "الأمان وكلمة المرور",
    description: "حماية الحساب وتحديث كلمة المرور",
    icon: "06",
  },
  {
    id: "sessions",
    label: "الجلسات والأجهزة",
    description: "الأجهزة المسجّل دخولها",
    icon: "07",
  },
  {
    id: "preferences",
    label: "تفضيلات الحساب",
    description: "التاريخ والوقت وتجربة الاستخدام",
    icon: "08",
  },
];

function toDayEditors(windows: ScheduleWindow[]): DayEditor[] {
  return DAYS.map(([code, label]) => {
    const rows = windows
      .filter((row) => row.dayOfWeek === code && row.isActive !== false)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return {
      code,
      label,
      enabled: rows.length > 0,
      morningEnabled: Boolean(rows[0]),
      morningStart: rows[0]?.startTime || "08:00",
      morningEnd: rows[0]?.endTime || "12:00",
      eveningEnabled: Boolean(rows[1]),
      eveningStart: rows[1]?.startTime || "14:00",
      eveningEnd: rows[1]?.endTime || "17:00",
    };
  });
}

function fromDayEditors(days: DayEditor[]): ScheduleWindow[] {
  return days.flatMap((day) => {
    if (!day.enabled) return [];
    const windows: ScheduleWindow[] = [];
    if (day.morningEnabled) {
      windows.push({
        dayOfWeek: day.code,
        startTime: day.morningStart,
        endTime: day.morningEnd,
        isActive: true,
      });
    }
    if (day.eveningEnabled) {
      windows.push({
        dayOfWeek: day.code,
        startTime: day.eveningStart,
        endTime: day.eveningEnd,
        isActive: true,
      });
    }
    return windows;
  });
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("") || "ط"
  );
}

function describeDevice(userAgent = "") {
  const browser = /Edg\//.test(userAgent)
    ? "Microsoft Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "متصفح غير معروف";
  const device = /Mobile|Android|iPhone/i.test(userAgent)
    ? "هاتف أو جهاز لوحي"
    : "حاسوب";
  return `${browser} — ${device}`;
}

function formatDate(value?: string) {
  if (!value) return "غير متاح";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "غير متاح";
  return new Intl.DateTimeFormat("ar-DZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function SpecialistSettingsPage() {
  const router = useRouter();
  const { locale, dict, user, loading, error, refresh } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
    loginPath: "staff",
  });
  const [settings, setSettings] = useState<DoctorSettings | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("personal");
  const [dirty, setDirty] = useState<Set<SectionId>>(new Set());
  const [saving, setSaving] = useState<SectionId | null>(null);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionsError, setSessionsError] = useState("");
  const [sessionBusy, setSessionBusy] = useState("");
  const [scheduleDays, setScheduleDays] = useState<DayEditor[]>([]);
  const [leaveDatesText, setLeaveDatesText] = useState("");
  const [password, setPassword] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const markDirty = useCallback((section: SectionId) => {
    setDirty((current) => new Set(current).add(section));
    setMessage("");
    setSaveError("");
  }, []);

  const clearDirty = useCallback((section: SectionId) => {
    setDirty((current) => {
      const next = new Set(current);
      next.delete(section);
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    setLoadError("");
    const [settingsResult, sessionsResult] = await Promise.all([
      apiRequest<{ settings?: DoctorSettings }>("/api/doctor/settings"),
      apiRequest<{ sessions?: SessionRow[] }>("/api/auth/sessions"),
    ]);
    if (!settingsResult.ok || !settingsResult.data.settings) {
      setLoadError("تعذر تحميل إعدادات الحساب حاليًا.");
      return;
    }
    const next = settingsResult.data.settings;
    setSettings(next);
    setScheduleDays(toDayEditors(next.schedule.workingHours || []));
    setLeaveDatesText((next.schedule.leaveDates || []).join("\n"));
    setDirty(new Set());
    if (sessionsResult.ok) {
      setSessions(sessionsResult.data.sessions || []);
      setSessionsError("");
    } else {
      setSessionsError("تعذر تحميل الجلسات النشطة حاليًا.");
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  useEffect(() => {
    const applyHash = () => {
      const sectionByHash: Record<string, SectionId> = {
        "#contact": "personal",
        "#hours": "schedule",
        "#pages": "professional",
      };
      const next = sectionByHash[window.location.hash];
      if (next) setActiveSection(next);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty.size === 0) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );

  const updateSettings = useCallback(
    <K extends keyof DoctorSettings>(
      key: K,
      patch: Partial<DoctorSettings[K]>,
      section: SectionId,
    ) => {
      setSettings((current) =>
        current
          ? {
              ...current,
              [key]: { ...current[key], ...patch },
            }
          : current,
      );
      markDirty(section);
    },
    [markDirty],
  );

  async function saveJson(
    section: SectionId,
    path: string,
    body: unknown,
    successMessage: string,
  ) {
    setSaving(section);
    setMessage("");
    setSaveError("");
    setFieldErrors({});
    const result = await apiRequest<{ settings?: DoctorSettings; message?: string }>(
      path,
      { method: "PATCH", body: JSON.stringify(body) },
    );
    setSaving(null);
    if (!result.ok) {
      setFieldErrors(mapFieldErrors(result.data));
      setSaveError(
        apiErrorMessage(
          result.data,
          "تعذر حفظ التغييرات. تحقق من البيانات وحاول مرة أخرى.",
        ),
      );
      return false;
    }
    if (result.data.settings) setSettings(result.data.settings);
    clearDirty(section);
    setMessage(result.data.message || successMessage);
    return true;
  }

  async function savePersonal(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    const saved = await saveJson(
      "personal",
      "/api/doctor/settings/personal",
      {
        fullName: settings.personal.fullName,
        email: settings.personal.email,
        phone: settings.personal.phone,
        locale: settings.personal.locale,
        address: settings.personal.address,
      },
      "تم حفظ التغييرات بنجاح.",
    );
    if (saved) await refresh();
  }

  async function saveProfessional(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    const profile = settings.professional;
    await saveJson(
      "professional",
      "/api/doctor/settings/professional",
      {
        professionalTitleAr: profile.professionalTitleAr,
        professionalTitleEn: profile.professionalTitleEn,
        professionalTitleFr: profile.professionalTitleFr,
        shortDescriptionAr: profile.shortDescriptionAr,
        bioAr: profile.bioAr,
        bioEn: profile.bioEn,
        bioFr: profile.bioFr,
        languages: profile.languages,
      },
      "تم حفظ الملف المهني.",
    );
  }

  async function saveSchedule(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    if (
      scheduleDays.some(
        (day) =>
          day.enabled && !day.morningEnabled && !day.eveningEnabled,
      )
    ) {
      setSaveError("اختر فترة عمل واحدة على الأقل لكل يوم مفعّل.");
      return;
    }
    const leaveDates = leaveDatesText
      .split(/[\n,\s]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    await saveJson(
      "schedule",
      "/api/doctor/settings/schedule",
      {
        workingHours: fromDayEditors(scheduleDays),
        appointmentDurationMinutes:
          settings.schedule.appointmentDurationMinutes,
        leaveDates,
      },
      "تم حفظ مواعيد العمل.",
    );
  }

  async function saveNotifications(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    await saveJson(
      "notifications",
      "/api/doctor/settings/notifications",
      settings.notifications,
      "تم حفظ إعدادات الإشعارات.",
    );
  }

  async function savePreferences(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    await saveJson(
      "preferences",
      "/api/doctor/settings/preferences",
      {
        ...settings.preferences,
        locale: settings.personal.locale,
      },
      "تم حفظ تفضيلات الحساب.",
    );
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setSaveError("");
    setFieldErrors({});
    if (password.password !== password.confirmPassword) {
      setFieldErrors({ confirmPassword: "تأكيد كلمة المرور غير مطابق." });
      return;
    }
    setSaving("security");
    const result = await apiRequest<{ message?: string }>(
      "/api/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify({
          currentPassword: password.currentPassword,
          password: password.password,
        }),
      },
    );
    setSaving(null);
    if (!result.ok) {
      setFieldErrors(mapFieldErrors(result.data));
      setSaveError(
        apiErrorMessage(
          result.data,
          "تعذر تغيير كلمة المرور. تحقق من البيانات وحاول مرة أخرى.",
        ),
      );
      return;
    }
    setPassword({ currentPassword: "", password: "", confirmPassword: "" });
    setMessage("تم تغيير كلمة المرور بنجاح.");
    window.setTimeout(() => router.replace(`/${locale}/staff/login`), 900);
  }

  function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaveError("");
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setSaveError("يُسمح فقط بصور JPEG أو PNG.");
      event.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setSaveError("حجم الصورة يجب ألا يتجاوز 3 ميغابايت.");
      event.target.value = "";
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
    markDirty("avatar");
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    setSaving("avatar");
    setSaveError("");
    setMessage("");
    setUploadProgress(0);
    const form = new FormData();
    form.append("file", avatarFile);
    const response = await new Promise<{
      ok: boolean;
      status: number;
      data: { settings?: DoctorSettings; message?: string; error?: string };
    }>((resolve) => {
      const request = new XMLHttpRequest();
      request.open("PATCH", "/api/doctor/settings/avatar");
      request.withCredentials = true;
      request.upload.onprogress = (progress) => {
        if (progress.lengthComputable) {
          setUploadProgress(
            Math.round((progress.loaded / progress.total) * 100),
          );
        }
      };
      request.onload = () => {
        let data = {};
        try {
          data = JSON.parse(request.responseText);
        } catch {
          data = {};
        }
        resolve({
          ok: request.status >= 200 && request.status < 300,
          status: request.status,
          data,
        });
      };
      request.onerror = () =>
        resolve({ ok: false, status: 0, data: {} });
      request.send(form);
    });
    setSaving(null);
    if (!response.ok) {
      setSaveError(
        response.data.message ||
          response.data.error ||
          "تعذر رفع الصورة. تحقق من الملف وحاول مرة أخرى.",
      );
      return;
    }
    if (response.data.settings) setSettings(response.data.settings);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
    setAvatarFile(null);
    setUploadProgress(0);
    clearDirty("avatar");
    setMessage(response.data.message || "تم تحديث الصورة الشخصية.");
  }

  async function removeAvatar() {
    setSaving("avatar");
    setSaveError("");
    const result = await apiRequest<{
      settings?: DoctorSettings;
      message?: string;
    }>("/api/doctor/settings/avatar", { method: "DELETE" });
    setSaving(null);
    if (!result.ok) {
      setSaveError("تعذر حذف الصورة الشخصية حاليًا.");
      return;
    }
    if (result.data.settings) setSettings(result.data.settings);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
    setAvatarFile(null);
    clearDirty("avatar");
    setMessage(result.data.message || "تم حذف الصورة الشخصية.");
  }

  async function revokeSession(id: string) {
    setSessionBusy(id);
    setSessionsError("");
    const result = await apiRequest(`/api/auth/sessions/${id}`, {
      method: "DELETE",
    });
    setSessionBusy("");
    if (!result.ok) {
      setSessionsError("تعذر إنهاء الجلسة حاليًا.");
      return;
    }
    setSessions((current) => current.filter((session) => session.id !== id));
  }

  async function logoutOtherSessions() {
    setSessionBusy("others");
    setSessionsError("");
    const result = await apiRequest<{ message?: string }>(
      "/api/auth/sessions/logout-others",
      { method: "POST", body: JSON.stringify({}) },
    );
    setSessionBusy("");
    if (!result.ok) {
      setSessionsError(
        apiErrorMessage(
          result.data,
          "تعذر تسجيل الخروج من الأجهزة الأخرى حاليًا.",
        ),
      );
      return;
    }
    setSessions((current) =>
      current.filter((session) => session.current),
    );
    setMessage(
      result.data.message || "تم تسجيل الخروج من جميع الأجهزة الأخرى.",
    );
  }

  const activeMeta = useMemo(
    () => SECTIONS.find((section) => section.id === activeSection)!,
    [activeSection],
  );

  if (loading || !user) {
    return <main className="dash-panel">جارٍ تحميل إعدادات الحساب...</main>;
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
      title="إعدادات حساب الطبيب"
      description="إدارة معلوماتك الشخصية والمهنية، مواعيد العمل، الأمان، والإشعارات من مكان واحد."
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
      pageLanguage={locale}
      pageDirection={locale === "ar" ? "rtl" : "ltr"}
      pageClassName="doctor-settings-shell"
    >
      {loadError ? (
        <section className="doctor-settings-load-error" role="alert">
          <strong>تعذر تحميل إعدادات الحساب حاليًا.</strong>
          <button className="btn btn-outline" type="button" onClick={() => void load()}>
            إعادة المحاولة
          </button>
        </section>
      ) : null}

      {!loadError && settings ? (
        <div className="doctor-settings-layout">
          <aside className="doctor-settings-nav" aria-label="أقسام الإعدادات">
            <div className="doctor-settings-identity">
              <span className="doctor-settings-avatar-small">
                {settings.avatar.url ? (
                  <Image
                    src={settings.avatar.url}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                  />
                ) : (
                  initials(settings.personal.fullName)
                )}
              </span>
              <span>
                <strong>{settings.personal.fullName}</strong>
                <small>
                  {settings.professional.type === "SPECIALIST"
                    ? "طبيب مختص"
                    : "طبيب عام"}
                </small>
              </span>
            </div>
            <div className="doctor-settings-nav-list">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={
                    activeSection === section.id
                      ? "doctor-settings-nav-item active"
                      : "doctor-settings-nav-item"
                  }
                  aria-current={
                    activeSection === section.id ? "page" : undefined
                  }
                  onClick={() => setActiveSection(section.id)}
                >
                  <span aria-hidden="true">{section.icon}</span>
                  <span>
                    <strong>{section.label}</strong>
                    <small>{section.description}</small>
                  </span>
                  {dirty.has(section.id) ? (
                    <i title="تغييرات غير محفوظة" aria-label="تغييرات غير محفوظة" />
                  ) : null}
                </button>
              ))}
            </div>
          </aside>

          <main className="doctor-settings-content">
            <header className="doctor-settings-section-head">
              <span className="doctor-settings-section-number" aria-hidden="true">
                {activeMeta.icon}
              </span>
              <div>
                <h2>{activeMeta.label}</h2>
                <p>{activeMeta.description}</p>
              </div>
            </header>

            {dirty.size > 0 ? (
              <div className="doctor-settings-dirty" role="status">
                <span>لديك تغييرات غير محفوظة.</span>
                <small>احفظ القسم الحالي قبل مغادرة الصفحة.</small>
              </div>
            ) : null}
            {message ? (
              <div className="alert-success doctor-settings-feedback" role="status">
                {message}
              </div>
            ) : null}
            {saveError ? (
              <div className="alert-error doctor-settings-feedback" role="alert">
                {saveError}
              </div>
            ) : null}

            {activeSection === "personal" ? (
              <form className="doctor-settings-card" onSubmit={savePersonal}>
                <div className="doctor-settings-card-intro">
                  <h3>بيانات الحساب الأساسية</h3>
                  <p>
                    تُستخدم هذه البيانات لتسجيل الدخول والتواصل المهني. لا يمكن
                    تعديل الدور أو الصلاحيات من هنا.
                  </p>
                </div>
                <div className="doctor-settings-grid">
                  <label className="field">
                    <span>الاسم الكامل <b aria-hidden="true">*</b></span>
                    <input
                      className="input"
                      autoComplete="name"
                      value={settings.personal.fullName}
                      onChange={(event) =>
                        updateSettings(
                          "personal",
                          { fullName: event.target.value },
                          "personal",
                        )
                      }
                      required
                    />
                    {fieldErrors.fullName ? (
                      <small className="error">{fieldErrors.fullName}</small>
                    ) : null}
                  </label>
                  <label className="field">
                    <span>
                      البريد الإلكتروني
                      <em
                        className={
                          settings.personal.emailVerified
                            ? "verification-badge verified"
                            : "verification-badge"
                        }
                      >
                        {settings.personal.emailVerified
                          ? "موثّق"
                          : "غير موثّق"}
                      </em>
                    </span>
                    <input
                      className="input"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      value={settings.personal.email}
                      onChange={(event) =>
                        updateSettings(
                          "personal",
                          { email: event.target.value },
                          "personal",
                        )
                      }
                    />
                    {fieldErrors.email ? (
                      <small className="error">{fieldErrors.email}</small>
                    ) : null}
                  </label>
                  <label className="field">
                    <span>رقم الهاتف</span>
                    <input
                      className="input"
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      autoComplete="tel"
                      value={settings.personal.phone}
                      onChange={(event) =>
                        updateSettings(
                          "personal",
                          { phone: event.target.value },
                          "personal",
                        )
                      }
                    />
                    <small>يُحفظ الصفر الأول في أرقام الهاتف الجزائرية.</small>
                    {fieldErrors.phone ? (
                      <small className="error">{fieldErrors.phone}</small>
                    ) : null}
                  </label>
                  <label className="field">
                    <span>اللغة المفضلة</span>
                    <select
                      className="input"
                      value={settings.personal.locale}
                      onChange={(event) =>
                        updateSettings(
                          "personal",
                          {
                            locale: event.target
                              .value as PersonalSettings["locale"],
                          },
                          "personal",
                        )
                      }
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </label>
                  <label className="field doctor-settings-span-2">
                    <span>العنوان (اختياري)</span>
                    <input
                      className="input"
                      autoComplete="street-address"
                      value={settings.personal.address}
                      onChange={(event) =>
                        updateSettings(
                          "personal",
                          { address: event.target.value },
                          "personal",
                        )
                      }
                    />
                  </label>
                </div>
                <div className="doctor-settings-savebar">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={saving === "personal" || !dirty.has("personal")}
                  >
                    {saving === "personal"
                      ? "جارٍ حفظ التغييرات..."
                      : "حفظ المعلومات الشخصية"}
                  </button>
                </div>
              </form>
            ) : null}

            {activeSection === "professional" ? (
              <form className="doctor-settings-card" onSubmit={saveProfessional}>
                <div className="doctor-settings-card-intro">
                  <h3>ملفك المهني</h3>
                  <p>
                    حدّث وصفك المهني. الحقول التنظيمية التي تحددها الإدارة ظاهرة
                    للقراءة فقط.
                  </p>
                </div>
                <div className="doctor-settings-readonly-grid">
                  <div>
                    <span>نوع الطبيب</span>
                    <strong>
                      {settings.professional.type === "SPECIALIST"
                        ? "طبيب مختص"
                        : "طبيب عام"}
                    </strong>
                    <small>تتحكم به الإدارة</small>
                  </div>
                  <div>
                    <span>التخصص</span>
                    <strong>
                      {settings.professional.specialtyAr || "غير محدد"}
                    </strong>
                    <small>تتحكم به الإدارة</small>
                  </div>
                  <div>
                    <span>رقم الترخيص</span>
                    <strong dir="ltr">
                      {settings.professional.licenseNumber || "غير مسجل"}
                    </strong>
                    <small>يتطلب اعتماد الإدارة</small>
                  </div>
                  <div>
                    <span>الظهور والحجز</span>
                    <strong>
                      {settings.professional.isPublic ? "ظاهر" : "غير ظاهر"} ·{" "}
                      {settings.professional.isBookable
                        ? "متاح للحجز"
                        : "غير متاح للحجز"}
                    </strong>
                    <small>تتحكم به الإدارة</small>
                  </div>
                </div>
                <div className="doctor-settings-grid">
                  <label className="field">
                    <span>المسمى المهني بالعربية</span>
                    <input
                      className="input"
                      value={settings.professional.professionalTitleAr}
                      onChange={(event) =>
                        updateSettings(
                          "professional",
                          { professionalTitleAr: event.target.value },
                          "professional",
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Professional title</span>
                    <input
                      className="input"
                      dir="ltr"
                      value={settings.professional.professionalTitleEn}
                      onChange={(event) =>
                        updateSettings(
                          "professional",
                          { professionalTitleEn: event.target.value },
                          "professional",
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Titre professionnel (FR)</span>
                    <input
                      className="input"
                      dir="ltr"
                      value={settings.professional.professionalTitleFr}
                      onChange={(event) =>
                        updateSettings(
                          "professional",
                          { professionalTitleFr: event.target.value },
                          "professional",
                        )
                      }
                    />
                  </label>
                  <label className="field doctor-settings-span-2">
                    <span>وصف عام قصير</span>
                    <textarea
                      className="input"
                      rows={2}
                      maxLength={350}
                      value={settings.professional.shortDescriptionAr}
                      onChange={(event) =>
                        updateSettings(
                          "professional",
                          { shortDescriptionAr: event.target.value },
                          "professional",
                        )
                      }
                    />
                    <small>
                      {settings.professional.shortDescriptionAr.length}/350
                    </small>
                  </label>
                  <label className="field doctor-settings-span-2">
                    <span>السيرة المهنية الكاملة</span>
                    <textarea
                      className="input"
                      rows={7}
                      maxLength={3000}
                      value={settings.professional.bioAr}
                      onChange={(event) =>
                        updateSettings(
                          "professional",
                          { bioAr: event.target.value },
                          "professional",
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Professional biography (EN)</span>
                    <textarea
                      className="input"
                      rows={5}
                      dir="ltr"
                      maxLength={3000}
                      value={settings.professional.bioEn}
                      onChange={(event) =>
                        updateSettings(
                          "professional",
                          { bioEn: event.target.value },
                          "professional",
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Biographie professionnelle (FR)</span>
                    <textarea
                      className="input"
                      rows={5}
                      dir="ltr"
                      maxLength={3000}
                      value={settings.professional.bioFr}
                      onChange={(event) =>
                        updateSettings(
                          "professional",
                          { bioFr: event.target.value },
                          "professional",
                        )
                      }
                    />
                  </label>
                  <label className="field doctor-settings-span-2">
                    <span>اللغات</span>
                    <input
                      className="input"
                      placeholder="العربية، الفرنسية، الإنجليزية"
                      value={settings.professional.languages.join("، ")}
                      onChange={(event) =>
                        updateSettings(
                          "professional",
                          {
                            languages: event.target.value
                              .split(/[,،]/)
                              .map((value) => value.trim())
                              .filter(Boolean),
                          },
                          "professional",
                        )
                      }
                    />
                  </label>
                </div>
                <div className="doctor-settings-savebar">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={
                      saving === "professional" ||
                      !dirty.has("professional")
                    }
                  >
                    {saving === "professional"
                      ? "جارٍ حفظ التغييرات..."
                      : "حفظ الملف المهني"}
                  </button>
                </div>
              </form>
            ) : null}

            {activeSection === "avatar" ? (
              <section className="doctor-settings-card">
                <div className="doctor-settings-card-intro">
                  <h3>الصورة الشخصية المهنية</h3>
                  <p>
                    استخدم صورة واضحة بصيغة JPEG أو PNG، بحجم لا يتجاوز 3
                    ميغابايت وأبعاد بين 128 و4096 بكسل.
                  </p>
                </div>
                <div className="doctor-avatar-editor">
                  <div className="doctor-avatar-preview">
                    {avatarPreview || settings.avatar.url ? (
                      <Image
                        src={avatarPreview || settings.avatar.url}
                        alt={`صورة ${settings.personal.fullName}`}
                        fill
                        sizes="180px"
                        unoptimized
                      />
                    ) : (
                      <span>{initials(settings.personal.fullName)}</span>
                    )}
                  </div>
                  <div className="doctor-avatar-actions">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      hidden
                      onChange={chooseAvatar}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {settings.avatar.url ? "تغيير الصورة" : "رفع صورة جديدة"}
                    </button>
                    {avatarFile ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={saving === "avatar"}
                        onClick={() => void uploadAvatar()}
                      >
                        {saving === "avatar"
                          ? `جارٍ الرفع ${uploadProgress}%`
                          : "حفظ الصورة"}
                      </button>
                    ) : null}
                    {settings.avatar.url ? (
                      <button
                        type="button"
                        className="btn btn-outline doctor-danger-button"
                        disabled={saving === "avatar"}
                        onClick={() => void removeAvatar()}
                      >
                        حذف الصورة
                      </button>
                    ) : null}
                    {saving === "avatar" ? (
                      <progress value={uploadProgress} max={100}>
                        {uploadProgress}%
                      </progress>
                    ) : null}
                    <small>
                      تُحفظ إشارة الوسائط فقط في MongoDB، ولا تُحفظ الصورة
                      بصيغة Base64.
                    </small>
                  </div>
                </div>
              </section>
            ) : null}

            {activeSection === "schedule" ? (
              <form className="doctor-settings-card" onSubmit={saveSchedule}>
                <div className="doctor-settings-card-intro">
                  <h3>جدول العمل الأسبوعي</h3>
                  <p>
                    المنطقة الزمنية: <b>Africa/Algiers</b>. الفاصل بين الفترتين
                    لا ينتج مواعيد حجز.
                  </p>
                </div>
                <div className="doctor-schedule-summary">
                  <div>
                    <span>أيام العمل</span>
                    <strong>
                      {scheduleDays.filter((day) => day.enabled).length} أيام
                    </strong>
                  </div>
                  <div>
                    <span>مدة الموعد</span>
                    <strong>
                      {settings.schedule.appointmentDurationMinutes} دقيقة
                    </strong>
                  </div>
                  <div>
                    <span>الإجازات المسجلة</span>
                    <strong>{settings.schedule.leaveDates.length}</strong>
                  </div>
                </div>
                <div className="doctor-schedule-days">
                  {scheduleDays.map((day, index) => (
                    <article
                      key={day.code}
                      className={
                        day.enabled
                          ? "doctor-schedule-day enabled"
                          : "doctor-schedule-day"
                      }
                    >
                      <header>
                        <div>
                          <strong>{day.label}</strong>
                          <small>{day.enabled ? "يوم عمل" : "مغلق"}</small>
                        </div>
                        <label className="doctor-switch">
                          <input
                            type="checkbox"
                            checked={day.enabled}
                            onChange={(event) => {
                              setScheduleDays((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        enabled: event.target.checked,
                                        morningEnabled: event.target.checked
                                          ? true
                                          : item.morningEnabled,
                                      }
                                    : item,
                                ),
                              );
                              markDirty("schedule");
                            }}
                          />
                          <span />
                        </label>
                      </header>
                      {day.enabled ? (
                        <div className="doctor-shifts">
                          {(["morning", "evening"] as const).map((shift) => {
                            const enabledKey =
                              `${shift}Enabled` as keyof DayEditor;
                            const startKey =
                              `${shift}Start` as keyof DayEditor;
                            const endKey = `${shift}End` as keyof DayEditor;
                            const enabled = Boolean(day[enabledKey]);
                            return (
                              <div className="doctor-shift-row" key={shift}>
                                <label className="checkbox-row">
                                  <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(event) => {
                                      setScheduleDays((current) =>
                                        current.map((item, itemIndex) =>
                                          itemIndex === index
                                            ? {
                                                ...item,
                                                [enabledKey]:
                                                  event.target.checked,
                                              }
                                            : item,
                                        ),
                                      );
                                      markDirty("schedule");
                                    }}
                                  />
                                  <span>
                                    {shift === "morning"
                                      ? "الفترة الصباحية"
                                      : "الفترة المسائية"}
                                  </span>
                                </label>
                                <input
                                  className="input"
                                  type="time"
                                  dir="ltr"
                                  disabled={!enabled}
                                  value={String(day[startKey])}
                                  aria-label={`${day.label} بداية ${shift}`}
                                  onChange={(event) => {
                                    setScheduleDays((current) =>
                                      current.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              [startKey]: event.target.value,
                                            }
                                          : item,
                                      ),
                                    );
                                    markDirty("schedule");
                                  }}
                                />
                                <span aria-hidden="true">—</span>
                                <input
                                  className="input"
                                  type="time"
                                  dir="ltr"
                                  disabled={!enabled}
                                  value={String(day[endKey])}
                                  aria-label={`${day.label} نهاية ${shift}`}
                                  onChange={(event) => {
                                    setScheduleDays((current) =>
                                      current.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              [endKey]: event.target.value,
                                            }
                                          : item,
                                      ),
                                    );
                                    markDirty("schedule");
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
                <div className="doctor-settings-grid">
                  <label className="field">
                    <span>مدة الموعد</span>
                    <select
                      className="input"
                      value={settings.schedule.appointmentDurationMinutes}
                      onChange={(event) =>
                        updateSettings(
                          "schedule",
                          {
                            appointmentDurationMinutes: Number(
                              event.target.value,
                            ),
                          },
                          "schedule",
                        )
                      }
                    >
                      {[15, 20, 30, 45, 60, 90, 120].map((minutes) => (
                        <option key={minutes} value={minutes}>
                          {minutes} دقيقة
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>فترات الإجازة</span>
                    <textarea
                      className="input"
                      rows={4}
                      dir="ltr"
                      placeholder={"2026-08-10\n2026-08-11"}
                      value={leaveDatesText}
                      onChange={(event) => {
                        setLeaveDatesText(event.target.value);
                        markDirty("schedule");
                      }}
                    />
                    <small>تاريخ واحد في كل سطر بصيغة YYYY-MM-DD.</small>
                  </label>
                </div>
                <div className="doctor-settings-savebar">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={saving === "schedule" || !dirty.has("schedule")}
                  >
                    {saving === "schedule"
                      ? "جارٍ حفظ التغييرات..."
                      : "حفظ مواعيد العمل"}
                  </button>
                </div>
              </form>
            ) : null}

            {activeSection === "notifications" ? (
              <form className="doctor-settings-card" onSubmit={saveNotifications}>
                <div className="doctor-settings-card-intro">
                  <h3>التنبيهات المهمة</h3>
                  <p>
                    اختر التنبيهات التي تريد استقبالها داخل النظام. لا تظهر
                    قنوات خارجية كفعّالة دون مزود إرسال حقيقي.
                  </p>
                </div>
                <div className="doctor-toggle-list">
                  {(
                    [
                      ["appointmentNotifications", "المواعيد", "طلبات المواعيد والتأكيدات والتغييرات"],
                      ["patientWaitingNotifications", "انتظار المريض", "تنبيه عند وصول مريض إلى قائمة الانتظار"],
                      ["staffMessageNotifications", "رسائل الطاقم", "تنبيه عند وصول رسالة داخلية جديدة"],
                      ["followUpReminders", "تذكيرات المتابعة", "التذكير بالمتابعات المرتبطة بالمرضى"],
                      ["scheduleChanges", "تغييرات الجدول", "التعديلات والاستثناءات في مواعيد العمل"],
                      ["securityAlerts", "تنبيهات الأمان", "تسجيل الدخول وتغييرات الأمان المهمة"],
                      ["inAppNotifications", "إشعارات داخل التطبيق", "عرض التنبيهات داخل لوحة الطبيب"],
                      ["soundNotifications", "صوت الإشعارات", "تشغيل صوت عند وصول تنبيه مدعوم"],
                    ] as const
                  ).map(([key, label, description]) => (
                    <label className="doctor-toggle-row" key={key}>
                      <span>
                        <strong>{label}</strong>
                        <small>{description}</small>
                      </span>
                      <span className="doctor-switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications[key]}
                          onChange={(event) =>
                            updateSettings(
                              "notifications",
                              { [key]: event.target.checked },
                              "notifications",
                            )
                          }
                        />
                        <span />
                      </span>
                    </label>
                  ))}
                  <label className="doctor-toggle-row disabled">
                    <span>
                      <strong>إشعارات البريد الإلكتروني</strong>
                      <small>غير متاحة حتى تهيئة مزود بريد إلكتروني فعلي.</small>
                    </span>
                    <span className="doctor-switch">
                      <input type="checkbox" checked={false} disabled />
                      <span />
                    </span>
                  </label>
                </div>
                <div className="doctor-settings-savebar">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={
                      saving === "notifications" ||
                      !dirty.has("notifications")
                    }
                  >
                    {saving === "notifications"
                      ? "جارٍ حفظ التغييرات..."
                      : "حفظ إعدادات الإشعارات"}
                  </button>
                </div>
              </form>
            ) : null}

            {activeSection === "security" ? (
              <form className="doctor-settings-card" onSubmit={changePassword}>
                <div className="doctor-settings-card-intro">
                  <h3>تغيير كلمة المرور</h3>
                  <p>
                    سيؤدي تغيير كلمة المرور إلى إنهاء الجلسات النشطة لحماية
                    الحساب.
                  </p>
                </div>
                <div className="doctor-security-form">
                  <label className="field">
                    <span>كلمة المرور الحالية</span>
                    <input
                      className="input"
                      type={showPasswords ? "text" : "password"}
                      dir="ltr"
                      autoComplete="current-password"
                      value={password.currentPassword}
                      onChange={(event) =>
                        setPassword((current) => ({
                          ...current,
                          currentPassword: event.target.value,
                        }))
                      }
                      required
                    />
                    {fieldErrors.currentPassword ? (
                      <small className="error">
                        {fieldErrors.currentPassword}
                      </small>
                    ) : null}
                  </label>
                  <label className="field">
                    <span>كلمة المرور الجديدة</span>
                    <input
                      className="input"
                      type={showPasswords ? "text" : "password"}
                      dir="ltr"
                      autoComplete="new-password"
                      minLength={8}
                      value={password.password}
                      onChange={(event) =>
                        setPassword((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      required
                    />
                    <small>
                      استخدم 8 أحرف على الأقل ومزيجًا يصعب تخمينه.
                    </small>
                  </label>
                  <label className="field">
                    <span>تأكيد كلمة المرور الجديدة</span>
                    <input
                      className="input"
                      type={showPasswords ? "text" : "password"}
                      dir="ltr"
                      autoComplete="new-password"
                      minLength={8}
                      value={password.confirmPassword}
                      onChange={(event) =>
                        setPassword((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                      required
                    />
                    {fieldErrors.confirmPassword ? (
                      <small className="error">
                        {fieldErrors.confirmPassword}
                      </small>
                    ) : null}
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={showPasswords}
                      onChange={(event) => setShowPasswords(event.target.checked)}
                    />
                    <span>إظهار كلمات المرور</span>
                  </label>
                </div>
                <div className="doctor-settings-savebar">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={saving === "security"}
                  >
                    {saving === "security"
                      ? "جارٍ حفظ التغييرات..."
                      : "تغيير كلمة المرور"}
                  </button>
                </div>
              </form>
            ) : null}

            {activeSection === "sessions" ? (
              <section className="doctor-settings-card">
                <div className="doctor-settings-card-intro">
                  <h3>الجلسات النشطة</h3>
                  <p>
                    راجع الأجهزة التي تستخدم حسابك وأنهِ أي جلسة لا تتعرف
                    عليها.
                  </p>
                </div>
                <div className="doctor-session-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={
                      sessionBusy === "others" ||
                      !sessions.some((session) => session.current) ||
                      sessions.filter((session) => !session.current).length === 0
                    }
                    onClick={() => void logoutOtherSessions()}
                  >
                    {sessionBusy === "others"
                      ? "جارٍ تسجيل الخروج..."
                      : "تسجيل الخروج من جميع الأجهزة الأخرى"}
                  </button>
                  {!sessions.some((session) => session.current) ? (
                    <small>
                      أعد تسجيل الدخول مرة واحدة لتمييز الجهاز الحالي بأمان.
                    </small>
                  ) : null}
                </div>
                {sessionsError ? (
                  <div className="alert-error">{sessionsError}</div>
                ) : null}
                {!sessionsError && sessions.length === 0 ? (
                  <div className="doctor-settings-empty">
                    لا توجد جلسات نشطة أخرى حاليًا.
                  </div>
                ) : null}
                <div className="doctor-session-list">
                  {sessions.map((session) => (
                    <article key={session.id} className="doctor-session-row">
                      <span className="doctor-session-icon" aria-hidden="true">
                        ◫
                      </span>
                      <div>
                        <span className="doctor-session-title">
                          <strong dir="auto">
                            {describeDevice(session.userAgent)}
                          </strong>
                          {session.current ? (
                            <em>الجهاز الحالي</em>
                          ) : null}
                        </span>
                        <small>
                          آخر نشاط: {formatDate(session.lastActivityAt)}
                        </small>
                        <small>
                          بدأت الجلسة: {formatDate(session.createdAt)}
                        </small>
                      </div>
                      {session.current ? (
                        <span className="doctor-current-session-status">
                          نشط الآن
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={sessionBusy === session.id}
                          onClick={() => void revokeSession(session.id)}
                        >
                          {sessionBusy === session.id
                            ? "جارٍ الإنهاء..."
                            : "إنهاء الجلسة"}
                        </button>
                      )}
                    </article>
                  ))}
                </div>
                <p className="doctor-settings-note">
                  لا تُعرض المواقع الدقيقة. قد يظهر نوع الجهاز والمتصفح فقط
                  وفق معلومات الجلسة المتاحة.
                </p>
              </section>
            ) : null}

            {activeSection === "preferences" ? (
              <form className="doctor-settings-card" onSubmit={savePreferences}>
                <div className="doctor-settings-card-intro">
                  <h3>تفضيلات العرض</h3>
                  <p>
                    تُحفظ هذه التفضيلات في حسابك وتنتقل معك بين الأجهزة.
                  </p>
                </div>
                <div className="doctor-settings-grid">
                  <label className="field">
                    <span>تنسيق التاريخ</span>
                    <select
                      className="input"
                      value={settings.preferences.dateFormat}
                      onChange={(event) =>
                        updateSettings(
                          "preferences",
                          {
                            dateFormat: event.target
                              .value as PreferenceSettings["dateFormat"],
                          },
                          "preferences",
                        )
                      }
                    >
                      <option value="dd/MM/yyyy">31/12/2026</option>
                      <option value="yyyy-MM-dd">2026-12-31</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>تنسيق الوقت</span>
                    <select
                      className="input"
                      value={settings.preferences.timeFormat}
                      onChange={(event) =>
                        updateSettings(
                          "preferences",
                          {
                            timeFormat: event.target
                              .value as PreferenceSettings["timeFormat"],
                          },
                          "preferences",
                        )
                      }
                    >
                      <option value="24h">24 ساعة</option>
                      <option value="12h">12 ساعة</option>
                    </select>
                  </label>
                </div>
                <div className="doctor-toggle-list">
                  {(
                    [
                      ["reducedMotion", "تقليل الحركة", "تقليل المؤثرات الانتقالية غير الضرورية"],
                      ["compactDashboard", "عرض لوحة مدمج", "تقليل المسافات في واجهة لوحة الطبيب"],
                      ["notificationSound", "صوت الإشعارات", "السماح بصوت التنبيهات المدعومة"],
                    ] as const
                  ).map(([key, label, description]) => (
                    <label className="doctor-toggle-row" key={key}>
                      <span>
                        <strong>{label}</strong>
                        <small>{description}</small>
                      </span>
                      <span className="doctor-switch">
                        <input
                          type="checkbox"
                          checked={settings.preferences[key]}
                          onChange={(event) =>
                            updateSettings(
                              "preferences",
                              { [key]: event.target.checked },
                              "preferences",
                            )
                          }
                        />
                        <span />
                      </span>
                    </label>
                  ))}
                </div>
                <div className="doctor-settings-savebar">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={
                      saving === "preferences" || !dirty.has("preferences")
                    }
                  >
                    {saving === "preferences"
                      ? "جارٍ حفظ التغييرات..."
                      : "حفظ تفضيلات الحساب"}
                  </button>
                </div>
              </form>
            ) : null}
          </main>
        </div>
      ) : null}
    </DashboardShell>
  );
}
