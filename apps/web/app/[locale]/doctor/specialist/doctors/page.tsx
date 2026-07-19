"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdminPagination, AdminRowActions, AdminTableToolbar } from "../../../../../components/admin/AdminDataTable";
import { AdminDialog } from "../../../../../components/admin/AdminDialog";
import {
  AdminEmptyState,
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
  AdminSelect,
  AdminSwitch,
  AdminTextarea,
} from "../../../../../components/admin/AdminForm";
import { AdminPageHeader } from "../../../../../components/admin/AdminPageHeader";
import {
  DoctorScheduleEditor,
  emptyDoctorSchedule,
  scheduleFromApi,
  scheduleToApi,
  validateDoctorSchedule,
  type DoctorScheduleDay,
} from "../../../../../components/admin/doctors/DoctorScheduleEditor";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { ConfirmDialog } from "../../../../../components/ui/ConfirmDialog";
import { apiDelete, apiErrorMessage, apiRequest } from "../../../../../lib/api";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type DoctorRow = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  roleCode?: string;
  status?: string;
  type?: "GENERAL" | "SPECIALIST";
  specialtyAr?: string;
  professionalTitleAr?: string;
  bioAr?: string;
  profileImage?: string;
  isPublic?: boolean;
  isBookable?: boolean;
  isOwner?: boolean;
  isActive?: boolean;
  specialtyIds?: string[];
  serviceIds?: string[];
  weeklySchedule?: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isActive?: boolean;
  }>;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
};

type ReferenceOption = { id: string; nameAr: string };

const doctorSchema = z
  .object({
    fullName: z.string().trim().min(2, "أدخل الاسم الكامل للطبيب."),
    email: z.string().trim().email("أدخل بريدًا إلكترونيًا صالحًا."),
    phone: z
      .string()
      .trim()
      .regex(/^\d{8,15}$/, "رقم الهاتف يجب أن يحتوي على 8 إلى 15 رقمًا."),
    type: z.enum(["GENERAL", "SPECIALIST"]),
    specialtyAr: z.string().trim().max(160).optional(),
    professionalTitleAr: z.string().trim().max(160).optional(),
    bioAr: z.string().trim().max(2000).optional(),
    password: z.string().min(10, "كلمة المرور المؤقتة يجب ألا تقل عن 10 أحرف."),
    confirmPassword: z.string(),
    isPublic: z.boolean(),
    isBookable: z.boolean(),
    specialtyIds: z.array(z.string()),
    serviceIds: z.array(z.string()),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "تأكيد كلمة المرور غير مطابق.",
  });

type DoctorFormValues = z.infer<typeof doctorSchema>;

const DEFAULT_FORM: DoctorFormValues = {
  fullName: "",
  email: "",
  phone: "",
  type: "GENERAL",
  specialtyAr: "",
  professionalTitleAr: "",
  bioAr: "",
  password: "",
  confirmPassword: "",
  isPublic: false,
  isBookable: true,
  specialtyIds: [],
  serviceIds: [],
};

const STEPS = [
  "المعلومات الأساسية",
  "المعلومات المهنية",
  "الجدول والتوفر",
  "الحساب والأمان",
  "المراجعة",
];

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("") || "ط"
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("ar-DZ", { dateStyle: "medium" }).format(date);
}

function DoctorAvatar({ doctor, large = false }: { doctor: DoctorRow; large?: boolean }) {
  return (
    <span className={`admin-doctor-avatar${large ? " is-large" : ""}`}>
      {doctor.profileImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={doctor.profileImage} alt={`صورة ${doctor.fullName}`} />
      ) : (
        <span>{initials(doctor.fullName)}</span>
      )}
    </span>
  );
}

function DoctorFormFields({
  step,
  form,
  schedule,
  setSchedule,
  specialties,
  services,
  imagePreview,
  onImage,
}: {
  step: number;
  form: ReturnType<typeof useForm<DoctorFormValues>>;
  schedule: DoctorScheduleDay[];
  setSchedule: (value: DoctorScheduleDay[]) => void;
  specialties: ReferenceOption[];
  services: ReferenceOption[];
  imagePreview: string;
  onImage: (file: File | null) => void;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const values = watch();

  if (step === 0) {
    return (
      <AdminFormSection
        title="المعلومات الأساسية"
        description="بيانات الهوية والتواصل التي سيستخدمها فريق العيادة."
      >
        <AdminField label="الاسم الكامل" error={errors.fullName?.message}>
          {({ id, errorId }) => (
            <AdminInput
              id={id}
              autoFocus
              autoComplete="name"
              aria-invalid={!!errors.fullName}
              aria-describedby={errorId}
              {...register("fullName")}
            />
          )}
        </AdminField>
        <AdminField label="البريد الإلكتروني" error={errors.email?.message}>
          {({ id, errorId }) => (
            <AdminInput
              id={id}
              type="email"
              dir="ltr"
              autoComplete="email"
              spellCheck={false}
              aria-invalid={!!errors.email}
              aria-describedby={errorId}
              {...register("email")}
            />
          )}
        </AdminField>
        <AdminField
          label="رقم الهاتف"
          description="أرقام فقط؛ سيُحتفظ بالصفر في بداية الرقم."
          error={errors.phone?.message}
        >
          {({ id, descriptionId, errorId }) => (
            <AdminInput
              id={id}
              type="text"
              inputMode="numeric"
              dir="ltr"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ")}
              {...register("phone")}
            />
          )}
        </AdminField>
        <div className="admin-field admin-avatar-upload">
          <label htmlFor="doctor-avatar-file">
            <span>الصورة الشخصية</span>
            <small>اختياري</small>
          </label>
          <div>
            <span className="admin-doctor-avatar is-large">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="معاينة صورة الطبيب" />
              ) : (
                <span>{initials(values.fullName)}</span>
              )}
            </span>
            <label className="btn btn-outline" htmlFor="doctor-avatar-file">
              اختيار صورة
            </label>
            {imagePreview ? (
              <button type="button" className="btn btn-outline" onClick={() => onImage(null)}>
                إزالة
              </button>
            ) : null}
          </div>
          <input
            id="doctor-avatar-file"
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onImage(event.target.files?.[0] || null)}
          />
          <p>JPEG أو PNG أو WebP، بحد أقصى 5MB. تُرفع مرة واحدة عند الإنشاء.</p>
        </div>
      </AdminFormSection>
    );
  }

  if (step === 1) {
    return (
      <>
        <AdminFormSection
          title="الملف المهني"
          description="المعلومات المهنية التي تدعم الحجز والظهور العام."
        >
          <AdminField label="نوع الطبيب" error={errors.type?.message}>
            {({ id }) => (
              <AdminSelect id={id} {...register("type")}>
                <option value="GENERAL">طبيب عام</option>
                <option value="SPECIALIST">طبيب مختص</option>
              </AdminSelect>
            )}
          </AdminField>
          <AdminField label="التخصص الرئيسي" optional error={errors.specialtyAr?.message}>
            {({ id }) => <AdminInput id={id} {...register("specialtyAr")} />}
          </AdminField>
          <AdminField label="اللقب المهني" optional error={errors.professionalTitleAr?.message}>
            {({ id }) => <AdminInput id={id} {...register("professionalTitleAr")} />}
          </AdminField>
          <AdminField label="نبذة عامة" optional error={errors.bioAr?.message}>
            {({ id }) => <AdminTextarea id={id} rows={4} {...register("bioAr")} />}
          </AdminField>
        </AdminFormSection>
        <AdminFormSection
          title="التخصصات والخدمات"
          description="اختر السجلات الموجودة في الكتالوج؛ لا تُنشأ نسخ جديدة."
        >
          <div className="admin-choice-list">
            <strong>التخصصات</strong>
            {specialties.map((option) => (
              <label key={option.id}>
                <input
                  type="checkbox"
                  checked={values.specialtyIds.includes(option.id)}
                  onChange={(event) =>
                    setValue(
                      "specialtyIds",
                      event.target.checked
                        ? [...values.specialtyIds, option.id]
                        : values.specialtyIds.filter((id) => id !== option.id),
                      { shouldDirty: true },
                    )
                  }
                />
                {option.nameAr}
              </label>
            ))}
            {specialties.length === 0 ? <small>لا توجد تخصصات متاحة.</small> : null}
          </div>
          <div className="admin-choice-list">
            <strong>الخدمات</strong>
            {services.map((option) => (
              <label key={option.id}>
                <input
                  type="checkbox"
                  checked={values.serviceIds.includes(option.id)}
                  onChange={(event) =>
                    setValue(
                      "serviceIds",
                      event.target.checked
                        ? [...values.serviceIds, option.id]
                        : values.serviceIds.filter((id) => id !== option.id),
                      { shouldDirty: true },
                    )
                  }
                />
                {option.nameAr}
              </label>
            ))}
            {services.length === 0 ? <small>لا توجد خدمات متاحة.</small> : null}
          </div>
        </AdminFormSection>
        <AdminFormSection title="الظهور والحجز">
          <AdminSwitch
            label="إظهار الملف في الموقع"
            description="لن يظهر الطبيب للعامة إلا بعد اكتمال المعلومات المطلوبة."
            checked={values.isPublic}
            onChange={(checked) => setValue("isPublic", checked, { shouldDirty: true })}
          />
          <AdminSwitch
            label="السماح بالحجز"
            description="يرتبط أيضًا بحالة الحساب وأيام العمل المفعّلة."
            checked={values.isBookable}
            onChange={(checked) => setValue("isBookable", checked, { shouldDirty: true })}
          />
        </AdminFormSection>
      </>
    );
  }

  if (step === 2) {
    return (
      <AdminFormSection
        title="جدول الطبيب الأسبوعي"
        description="هذا جدول الطبيب الفردي، وليس ساعات عمل العيادة العامة."
      >
        <div className="admin-form-full">
          <DoctorScheduleEditor value={schedule} onChange={setSchedule} />
        </div>
      </AdminFormSection>
    );
  }

  if (step === 3) {
    return (
      <AdminFormSection
        title="الدخول والأمان"
        description="ستُعرض كلمة المرور المؤقتة في هذه الخطوة فقط، ولا تُخزّن كنص صريح."
      >
        <AdminField label="كلمة المرور المؤقتة" error={errors.password?.message}>
          {({ id, errorId }) => (
            <AdminInput
              id={id}
              type="password"
              dir="ltr"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errorId}
              {...register("password")}
            />
          )}
        </AdminField>
        <AdminField label="تأكيد كلمة المرور" error={errors.confirmPassword?.message}>
          {({ id, errorId }) => (
            <AdminInput
              id={id}
              type="password"
              dir="ltr"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errorId}
              {...register("confirmPassword")}
            />
          )}
        </AdminField>
        <div className="admin-password-guidance admin-form-full">
          <strong>متطلبات كلمة المرور</strong>
          <span>10 أحرف على الأقل، ويفضّل الجمع بين أحرف وأرقام ورموز.</span>
        </div>
      </AdminFormSection>
    );
  }

  return (
    <div className="admin-review-grid">
      <section>
        <h3>الطبيب</h3>
        <p><strong>{values.fullName}</strong></p>
        <p>{values.type === "SPECIALIST" ? "طبيب مختص" : "طبيب عام"}</p>
        <button type="button" onClick={() => document.getElementById("doctor-step-1")?.click()}>
          تعديل
        </button>
      </section>
      <section>
        <h3>التواصل</h3>
        <p dir="ltr">{values.email}</p>
        <p dir="ltr">{values.phone}</p>
      </section>
      <section>
        <h3>الملف المهني</h3>
        <p>{values.specialtyAr || "لم يُحدد تخصص نصي"}</p>
        <p>{values.serviceIds.length} خدمات · {values.specialtyIds.length} تخصصات</p>
      </section>
      <section>
        <h3>جدول العمل</h3>
        <p>{schedule.filter((day) => day.enabled).map((day) => day.label).join("، ") || "لا توجد أيام مفعّلة"}</p>
      </section>
      <section>
        <h3>الظهور</h3>
        <p>{values.isPublic ? "ظاهر للعامة" : "مخفي عن الموقع"}</p>
        <p>{values.isBookable ? "قابل للحجز" : "غير قابل للحجز"}</p>
      </section>
    </div>
  );
}

export default function DoctorsPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({ roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"] });
  const [rows, setRows] = useState<DoctorRow[]>([]);
  const [specialties, setSpecialties] = useState<ReferenceOption[]>([]);
  const [services, setServices] = useState<ReferenceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [publicFilter, setPublicFilter] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState<AdminToastState>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [schedule, setSchedule] = useState<DoctorScheduleDay[]>(emptyDoctorSchedule());
  const [scheduleDirty, setScheduleDirty] = useState(false);
  const [createError, setCreateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [details, setDetails] = useState<DoctorRow | null>(null);
  const [editing, setEditing] = useState<DoctorRow | null>(null);
  const [editSchedule, setEditSchedule] = useState<DoctorScheduleDay[]>(emptyDoctorSchedule());
  const [editDraft, setEditDraft] = useState<Partial<DoctorRow>>({});
  const [editDirty, setEditDirty] = useState(false);
  const [editError, setEditError] = useState("");
  const [archive, setArchive] = useState<DoctorRow | null>(null);
  const [statusChange, setStatusChange] = useState<DoctorRow | null>(null);
  const [resetPassword, setResetPassword] = useState<DoctorRow | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const createForm = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: DEFAULT_FORM,
    mode: "onBlur",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      sort,
      order: sort === "createdAt" ? "desc" : "asc",
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (publicFilter) params.set("public", publicFilter);
    return params.toString();
  }, [debouncedSearch, page, publicFilter, sort, statusFilter, typeFilter]);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/admin/doctors?${queryString}`, {
        credentials: "include",
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(apiErrorMessage(data));
      setRows(data.doctors || []);
      setTotal(data.total ?? (data.doctors || []).length);
      setTotalPages(data.totalPages || 1);
      window.history.replaceState(null, "", `${window.location.pathname}?${queryString}`);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setLoadError("تعذر تحميل قائمة الأطباء حاليًا.");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    if (user) void load();
    return () => abortRef.current?.abort();
  }, [load, user]);

  useEffect(() => {
    if (!user) return;
    void Promise.all([
      apiRequest<{ specialties?: ReferenceOption[] }>("/api/admin/catalog/specialties?pageSize=100"),
      apiRequest<{ services?: ReferenceOption[] }>("/api/admin/catalog/services?pageSize=100"),
    ]).then(([specialtyResponse, serviceResponse]) => {
      if (specialtyResponse.ok) setSpecialties(specialtyResponse.data.specialties || []);
      if (serviceResponse.ok) setServices(serviceResponse.data.services || []);
    });
  }, [user]);

  const chooseImage = (file: File | null) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setCreateError("");
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setCreateError("اختر صورة JPEG أو PNG أو WebP بحجم لا يتجاوز 5MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetCreate = () => {
    createForm.reset(DEFAULT_FORM);
    setStep(0);
    setSchedule(emptyDoctorSchedule());
    setScheduleDirty(false);
    chooseImage(null);
    setCreateError("");
  };

  const nextStep = async () => {
    const fieldsByStep: Array<Array<keyof DoctorFormValues>> = [
      ["fullName", "email", "phone"],
      ["type", "specialtyAr", "professionalTitleAr", "bioAr", "isPublic", "isBookable"],
      [],
      ["password", "confirmPassword"],
    ];
    const valid = await createForm.trigger(fieldsByStep[step]);
    if (!valid) return;
    if (step === 2) {
      const scheduleError = validateDoctorSchedule(schedule);
      if (scheduleError) {
        setCreateError(scheduleError);
        return;
      }
    }
    setCreateError("");
    setStep((current) => Math.min(4, current + 1));
  };

  const uploadImage = async () => {
    if (!imageFile) return "";
    const body = new FormData();
    body.append("file", imageFile);
    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      credentials: "include",
      body,
    });
    const data = await response.json();
    if (!response.ok || typeof data.url !== "string") {
      throw new Error("تعذر رفع صورة الطبيب. يمكنك المحاولة مجددًا دون فقدان النموذج.");
    }
    return data.url;
  };

  const submitCreate = createForm.handleSubmit(async (values) => {
    const scheduleError = validateDoctorSchedule(schedule);
    if (scheduleError) {
      setStep(2);
      setCreateError(scheduleError);
      return;
    }
    setSubmitting(true);
    setCreateError("");
    try {
      const profileImage = await uploadImage();
      const { confirmPassword: _confirmPassword, ...payload } = values;
      const result = await apiRequest<{ message?: string; user?: DoctorRow }>(
        "/api/admin/doctors",
        {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            profileImage: profileImage || undefined,
            weeklySchedule: scheduleToApi(schedule),
          }),
        },
      );
      if (!result.ok) {
        setCreateError(apiErrorMessage(result.data));
        return;
      }
      setCreateOpen(false);
      resetCreate();
      setToast({
        type: "success",
        message: `تمت إضافة الطبيب ${values.fullName} بنجاح.`,
        actionLabel: "عرض الطبيب",
        onAction: () => {
          if (result.data.user) setDetails(result.data.user);
        },
      });
      await load();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "تعذر إنشاء الطبيب.");
    } finally {
      setSubmitting(false);
    }
  });

  const openEdit = (doctor: DoctorRow) => {
    setEditing(doctor);
    setEditDraft({ ...doctor });
    setEditSchedule(scheduleFromApi(doctor.weeklySchedule));
    setEditDirty(false);
    setEditError("");
  };

  const saveEdit = async (close: boolean) => {
    if (!editing) return;
    const scheduleError = validateDoctorSchedule(editSchedule);
    if (scheduleError) {
      setEditError(scheduleError);
      return;
    }
    setSubmitting(true);
    setEditError("");
    const response = await apiRequest<{ message?: string; doctor?: DoctorRow }>(
      "/api/admin/doctors",
      {
        method: "PATCH",
        body: JSON.stringify({
          userId: editing.id,
          fullName: editDraft.fullName,
          email: editDraft.email,
          phone: editDraft.phone,
          type: editDraft.type,
          specialtyAr: editDraft.specialtyAr,
          professionalTitleAr: editDraft.professionalTitleAr,
          bioAr: editDraft.bioAr,
          isPublic: editDraft.isPublic,
          isBookable: editDraft.isBookable,
          status: editDraft.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
          weeklySchedule: scheduleToApi(editSchedule),
        }),
      },
    );
    setSubmitting(false);
    if (!response.ok) {
      setEditError(apiErrorMessage(response.data));
      return;
    }
    setEditDirty(false);
    if (response.data.doctor) {
      setEditing(response.data.doctor);
      setEditDraft(response.data.doctor);
    }
    setToast({ type: "success", message: `تم حفظ تعديلات ${editDraft.fullName}.` });
    await load();
    if (close) setEditing(null);
  };

  const changeStatus = async () => {
    if (!statusChange) return;
    setSubmitting(true);
    const nextActive = statusChange.status !== "ACTIVE";
    const response = await apiRequest("/api/admin/doctors", {
      method: "PATCH",
      body: JSON.stringify({
        userId: statusChange.id,
        status: nextActive ? "ACTIVE" : "INACTIVE",
      }),
    });
    setSubmitting(false);
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      return;
    }
    setStatusChange(null);
    setToast({
      type: "success",
      message: nextActive ? "تم تفعيل حساب الطبيب." : "تم تعطيل حساب الطبيب وإنهاء جلساته.",
    });
    await load();
  };

  const archiveDoctor = async () => {
    if (!archive) return;
    setSubmitting(true);
    const response = await apiDelete<{ message?: string }>("/api/admin/doctors", {
      userId: archive.id,
    });
    setSubmitting(false);
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      return;
    }
    setArchive(null);
    setToast({ type: "success", message: response.data.message || "تمت أرشفة الطبيب." });
    await load();
  };

  const restoreDoctor = async (doctor: DoctorRow) => {
    setSubmitting(true);
    const response = await apiRequest(`/api/admin/doctors/${doctor.id}/restore`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    setSubmitting(false);
    setToast({
      type: response.ok ? "success" : "error",
      message: response.ok ? "تمت استعادة الطبيب." : apiErrorMessage(response.data),
    });
    if (response.ok) await load();
  };

  const submitResetPassword = async () => {
    if (!resetPassword || temporaryPassword.length < 10) return;
    setSubmitting(true);
    const response = await apiRequest(`/api/admin/doctors/${resetPassword.id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword: temporaryPassword }),
    });
    setSubmitting(false);
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      return;
    }
    setResetPassword(null);
    setTemporaryPassword("");
    setToast({ type: "success", message: "تمت إعادة تعيين كلمة المرور وإنهاء الجلسات السابقة." });
  };

  if (sessionLoading || !user) return <main className="dash-panel">{dict.loading}</main>;
  if (sessionError) return <main className="dash-panel alert-error">{sessionError}</main>;

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      initialAdminMode={user.adminDashboardMode === "full" ? "full" : "quick"}
    >
      <div className="admin-doctors-page">
        <AdminPageHeader
          eyebrow="إدارة العيادة"
          title="إدارة الأطباء"
          description="إضافة وتعديل حسابات الأطباء، التخصصات، أوقات العمل وحالة الظهور في الموقع."
          breadcrumbs={[
            { label: "لوحة التحكم", href: `/${locale}/doctor/specialist/dashboard` },
            { label: "الأطباء" },
          ]}
          primaryAction={
            <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              + إضافة طبيب
            </button>
          }
        />

        <section className="admin-list-card" aria-label="قائمة الأطباء">
          <AdminTableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="ابحث بالاسم أو التخصص أو البريد أو الهاتف"
            resultCount={total}
            filters={
              <>
                <select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }} aria-label="نوع الطبيب">
                  <option value="">كل الأنواع</option>
                  <option value="GENERAL">طبيب عام</option>
                  <option value="SPECIALIST">طبيب مختص</option>
                </select>
                <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} aria-label="حالة الطبيب">
                  <option value="">كل الحالات</option>
                  <option value="ACTIVE">نشط</option>
                  <option value="INACTIVE">غير نشط</option>
                  <option value="LOCKED">مقفل</option>
                  <option value="ARCHIVED">مؤرشف</option>
                </select>
                <select value={publicFilter} onChange={(event) => { setPublicFilter(event.target.value); setPage(1); }} aria-label="الظهور العام">
                  <option value="">كل الظهور</option>
                  <option value="true">ظاهر للعامة</option>
                  <option value="false">مخفي</option>
                </select>
                <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="ترتيب النتائج">
                  <option value="name">الاسم</option>
                  <option value="createdAt">تاريخ الإضافة</option>
                  <option value="specialty">التخصص</option>
                  <option value="status">الحالة</option>
                </select>
                {(search || typeFilter || statusFilter || publicFilter) ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setSearch("");
                      setTypeFilter("");
                      setStatusFilter("");
                      setPublicFilter("");
                      setPage(1);
                    }}
                  >
                    مسح الفلاتر
                  </button>
                ) : null}
              </>
            }
          />

          {loading ? (
            <AdminLoadingSkeleton rows={6} />
          ) : loadError ? (
            <AdminErrorState message={loadError} onRetry={() => void load()} />
          ) : rows.length === 0 ? (
            <AdminEmptyState
              title={debouncedSearch || typeFilter || statusFilter || publicFilter ? "لا توجد نتائج مطابقة" : "لا يوجد أطباء بعد"}
              description={debouncedSearch || typeFilter || statusFilter || publicFilter ? "جرّب تعديل البحث أو مسح الفلاتر." : "ابدأ بإضافة أول طبيب إلى فريق العيادة."}
              action={
                <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
                  إضافة طبيب
                </button>
              }
            />
          ) : (
            <>
              <div className="admin-doctors-table-wrap">
                <table className="admin-doctors-table">
                  <thead>
                    <tr>
                      <th>الطبيب</th>
                      <th>النوع والتخصص</th>
                      <th>الحالة</th>
                      <th>الظهور والحجز</th>
                      <th>أيام العمل</th>
                      <th>آخر تحديث</th>
                      <th><span className="sr-only">الإجراءات</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((doctor) => (
                      <tr key={doctor.id}>
                        <td>
                          <button type="button" className="admin-doctor-identity" onClick={() => setDetails(doctor)}>
                            <DoctorAvatar doctor={doctor} />
                            <span>
                              <strong>{doctor.fullName}</strong>
                              <small dir="ltr">{doctor.email || doctor.phone || "—"}</small>
                            </span>
                          </button>
                        </td>
                        <td>
                          <strong>{doctor.type === "SPECIALIST" ? "طبيب مختص" : "طبيب عام"}</strong>
                          <small>{doctor.specialtyAr || "غير محدد"}</small>
                        </td>
                        <td>
                          <AdminStatusBadge tone={doctor.archivedAt ? "neutral" : doctor.status === "ACTIVE" ? "success" : "warning"}>
                            {doctor.archivedAt ? "مؤرشف" : doctor.status === "ACTIVE" ? "نشط" : "غير نشط"}
                          </AdminStatusBadge>
                        </td>
                        <td>
                          <span>{doctor.isPublic ? "ظاهر" : "مخفي"}</span>
                          <small>{doctor.isBookable ? "الحجز متاح" : "الحجز متوقف"}</small>
                        </td>
                        <td>{new Set(doctor.weeklySchedule?.filter((item) => item.isActive !== false).map((item) => item.dayOfWeek)).size || "—"}</td>
                        <td>{formatDate(doctor.updatedAt)}</td>
                        <td>
                          <AdminRowActions>
                            <button type="button" role="menuitem" onClick={() => setDetails(doctor)}>عرض التفاصيل</button>
                            <button type="button" role="menuitem" onClick={() => openEdit(doctor)}>تعديل الطبيب</button>
                            {!doctor.archivedAt ? (
                              <>
                                <button type="button" role="menuitem" disabled={doctor.isOwner} onClick={() => setStatusChange(doctor)}>
                                  {doctor.status === "ACTIVE" ? "تعطيل الحساب" : "تفعيل الحساب"}
                                </button>
                                <button type="button" role="menuitem" onClick={() => setResetPassword(doctor)}>إعادة تعيين كلمة المرور</button>
                                <button type="button" role="menuitem" disabled={doctor.isOwner} onClick={() => setArchive(doctor)}>أرشفة الطبيب</button>
                              </>
                            ) : (
                              <button type="button" role="menuitem" onClick={() => void restoreDoctor(doctor)}>استعادة الطبيب</button>
                            )}
                          </AdminRowActions>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-doctor-cards">
                {rows.map((doctor) => (
                  <article key={doctor.id} className="admin-doctor-card">
                    <header>
                      <DoctorAvatar doctor={doctor} />
                      <div>
                        <h3>{doctor.fullName}</h3>
                        <p>{doctor.type === "SPECIALIST" ? "طبيب مختص" : "طبيب عام"} · {doctor.specialtyAr || "غير محدد"}</p>
                      </div>
                      <AdminRowActions>
                        <button type="button" onClick={() => setDetails(doctor)}>التفاصيل</button>
                        <button type="button" onClick={() => openEdit(doctor)}>تعديل</button>
                        {!doctor.archivedAt ? (
                          <button type="button" disabled={doctor.isOwner} onClick={() => setArchive(doctor)}>أرشفة</button>
                        ) : (
                          <button type="button" onClick={() => void restoreDoctor(doctor)}>استعادة</button>
                        )}
                      </AdminRowActions>
                    </header>
                    <div>
                      <AdminStatusBadge tone={doctor.status === "ACTIVE" && !doctor.archivedAt ? "success" : "warning"}>
                        {doctor.archivedAt ? "مؤرشف" : doctor.status === "ACTIVE" ? "نشط" : "غير نشط"}
                      </AdminStatusBadge>
                      <span>{doctor.isPublic ? "ظاهر للعامة" : "مخفي"}</span>
                      <span>{doctor.isBookable ? "الحجز متاح" : "الحجز متوقف"}</span>
                    </div>
                    <small>آخر تحديث: {formatDate(doctor.updatedAt)}</small>
                  </article>
                ))}
              </div>
              <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </section>
      </div>

      <AdminDialog
        open={createOpen}
        title="إضافة طبيب جديد"
        description="أنشئ الملف المهني وجدول العمل وحساب الدخول في عملية واحدة."
        onClose={() => { setCreateOpen(false); resetCreate(); }}
        dirty={createForm.formState.isDirty || scheduleDirty || !!imageFile}
        busy={submitting}
        variant="dialog"
        size="xl"
        locale={locale}
        footer={
          <>
            <span className="admin-step-count">الخطوة {step + 1} من {STEPS.length}</span>
            <div className="admin-dialog-actions">
              {step > 0 ? (
                <button type="button" className="btn btn-outline" disabled={submitting} onClick={() => setStep((current) => current - 1)}>
                  السابق
                </button>
              ) : null}
              {step < 4 ? (
                <button type="button" className="btn btn-primary" onClick={() => void nextStep()}>
                  التالي
                </button>
              ) : (
                <button type="button" className="btn btn-primary" disabled={submitting} onClick={() => void submitCreate()}>
                  {submitting ? "جارٍ إضافة الطبيب..." : "إضافة الطبيب"}
                </button>
              )}
            </div>
          </>
        }
      >
        <ol className="admin-stepper" aria-label="خطوات إضافة الطبيب">
          {STEPS.map((label, index) => (
            <li key={label} className={index === step ? "is-active" : index < step ? "is-complete" : ""}>
              <button id={`doctor-step-${index + 1}`} type="button" disabled={index > step} onClick={() => setStep(index)}>
                <span>{index < step ? "✓" : index + 1}</span>
                <small>{label}</small>
              </button>
            </li>
          ))}
        </ol>
        {createError ? <div className="admin-form-error" role="alert">{createError}</div> : null}
        <form onSubmit={(event) => { event.preventDefault(); void submitCreate(); }}>
          <DoctorFormFields
            step={step}
            form={createForm}
            schedule={schedule}
            setSchedule={(value) => { setSchedule(value); setScheduleDirty(true); }}
            specialties={specialties}
            services={services}
            imagePreview={imagePreview}
            onImage={chooseImage}
          />
        </form>
      </AdminDialog>

      <AdminDialog
        open={!!details}
        title="تفاصيل الطبيب"
        description={details?.fullName}
        onClose={() => setDetails(null)}
        variant="drawer"
        size="lg"
        locale={locale}
        footer={
          details ? (
            <div className="admin-dialog-actions">
              <button type="button" className="btn btn-outline" onClick={() => { openEdit(details); setDetails(null); }}>تعديل الطبيب</button>
              <button type="button" className="btn btn-primary" onClick={() => { openEdit(details); setDetails(null); }}>إدارة الجدول</button>
            </div>
          ) : null
        }
      >
        {details ? (
          <div className="admin-doctor-details">
            <header>
              <DoctorAvatar doctor={details} large />
              <div>
                <h3>{details.fullName}</h3>
                <p>{details.professionalTitleAr || (details.type === "SPECIALIST" ? "طبيب مختص" : "طبيب عام")}</p>
                <AdminStatusBadge tone={details.status === "ACTIVE" ? "success" : "warning"}>
                  {details.status === "ACTIVE" ? "حساب نشط" : "حساب غير نشط"}
                </AdminStatusBadge>
              </div>
            </header>
            <dl>
              <div><dt>التخصص</dt><dd>{details.specialtyAr || "—"}</dd></div>
              <div><dt>البريد</dt><dd dir="ltr">{details.email || "—"}</dd></div>
              <div><dt>الهاتف</dt><dd dir="ltr">{details.phone || "—"}</dd></div>
              <div><dt>الظهور العام</dt><dd>{details.isPublic ? "ظاهر" : "مخفي"}</dd></div>
              <div><dt>الحجز</dt><dd>{details.isBookable ? "متاح" : "متوقف"}</dd></div>
              <div><dt>آخر دخول</dt><dd>{formatDate(details.lastLoginAt)}</dd></div>
              <div><dt>تاريخ الإنشاء</dt><dd>{formatDate(details.createdAt)}</dd></div>
              <div><dt>آخر تحديث</dt><dd>{formatDate(details.updatedAt)}</dd></div>
            </dl>
            <section>
              <h3>النبذة المهنية</h3>
              <p>{details.bioAr || "لم تُضف نبذة مهنية بعد."}</p>
            </section>
            <section>
              <h3>الجدول الأسبوعي</h3>
              <DoctorScheduleEditor value={scheduleFromApi(details.weeklySchedule)} onChange={() => undefined} disabled />
            </section>
          </div>
        ) : null}
      </AdminDialog>

      <AdminDialog
        open={!!editing}
        title="تعديل الطبيب"
        description="حدّث الملف والجدول دون تغيير كلمة المرور."
        onClose={() => setEditing(null)}
        dirty={editDirty}
        busy={submitting}
        variant="drawer"
        size="xl"
        locale={locale}
        footer={
          <div className="admin-dialog-actions">
            <button type="button" className="btn btn-outline" disabled={submitting || !editDirty} onClick={() => void saveEdit(false)}>
              حفظ
            </button>
            <button type="button" className="btn btn-primary" disabled={submitting || !editDirty} onClick={() => void saveEdit(true)}>
              {submitting ? "جارٍ حفظ التعديلات..." : "حفظ وإغلاق"}
            </button>
          </div>
        }
      >
        {editing ? (
          <div className="admin-edit-doctor">
            {editDirty ? <p className="admin-unsaved">لديك تغييرات غير محفوظة.</p> : null}
            {editError ? <div className="admin-form-error" role="alert">{editError}</div> : null}
            <AdminFormSection title="المعلومات الأساسية">
              <AdminField label="الاسم الكامل">
                {({ id }) => <AdminInput id={id} value={editDraft.fullName || ""} onChange={(event) => { setEditDraft({ ...editDraft, fullName: event.target.value }); setEditDirty(true); }} />}
              </AdminField>
              <AdminField label="البريد الإلكتروني">
                {({ id }) => <AdminInput id={id} type="email" dir="ltr" value={editDraft.email || ""} onChange={(event) => { setEditDraft({ ...editDraft, email: event.target.value }); setEditDirty(true); }} />}
              </AdminField>
              <AdminField label="رقم الهاتف">
                {({ id }) => <AdminInput id={id} inputMode="numeric" dir="ltr" value={editDraft.phone || ""} onChange={(event) => { setEditDraft({ ...editDraft, phone: event.target.value }); setEditDirty(true); }} />}
              </AdminField>
              <AdminField label="نوع الطبيب">
                {({ id }) => <AdminSelect id={id} value={editDraft.type || "GENERAL"} onChange={(event) => { setEditDraft({ ...editDraft, type: event.target.value as DoctorRow["type"] }); setEditDirty(true); }}><option value="GENERAL">طبيب عام</option><option value="SPECIALIST">طبيب مختص</option></AdminSelect>}
              </AdminField>
            </AdminFormSection>
            <AdminFormSection title="الملف المهني">
              <AdminField label="التخصص الرئيسي" optional>
                {({ id }) => <AdminInput id={id} value={editDraft.specialtyAr || ""} onChange={(event) => { setEditDraft({ ...editDraft, specialtyAr: event.target.value }); setEditDirty(true); }} />}
              </AdminField>
              <AdminField label="اللقب المهني" optional>
                {({ id }) => <AdminInput id={id} value={editDraft.professionalTitleAr || ""} onChange={(event) => { setEditDraft({ ...editDraft, professionalTitleAr: event.target.value }); setEditDirty(true); }} />}
              </AdminField>
              <div className="admin-form-full">
                <AdminField label="النبذة المهنية" optional>
                  {({ id }) => <AdminTextarea id={id} rows={5} value={editDraft.bioAr || ""} onChange={(event) => { setEditDraft({ ...editDraft, bioAr: event.target.value }); setEditDirty(true); }} />}
                </AdminField>
              </div>
              <AdminSwitch label="ظاهر للعامة" checked={editDraft.isPublic === true} onChange={(value) => { setEditDraft({ ...editDraft, isPublic: value }); setEditDirty(true); }} />
              <AdminSwitch label="قابل للحجز" checked={editDraft.isBookable !== false} onChange={(value) => { setEditDraft({ ...editDraft, isBookable: value }); setEditDirty(true); }} />
            </AdminFormSection>
            <AdminFormSection title="جدول الطبيب" description="لا يؤثر على ساعات العيادة العامة.">
              <div className="admin-form-full">
                <DoctorScheduleEditor value={editSchedule} onChange={(value) => { setEditSchedule(value); setEditDirty(true); }} />
              </div>
            </AdminFormSection>
            <AdminFormSection title="الحساب والأمان" description="إعادة كلمة المرور إجراء مستقل؛ التعديل العادي لا يغيّرها.">
              <AdminSwitch label="الحساب نشط" checked={editDraft.status === "ACTIVE"} disabled={editing.isOwner} onChange={(value) => { setEditDraft({ ...editDraft, status: value ? "ACTIVE" : "INACTIVE" }); setEditDirty(true); }} />
              <button type="button" className="btn btn-outline" onClick={() => setResetPassword(editing)}>
                إعادة تعيين كلمة المرور
              </button>
            </AdminFormSection>
          </div>
        ) : null}
      </AdminDialog>

      <AdminDialog
        open={!!resetPassword}
        title="إعادة تعيين كلمة المرور"
        description={`سيتم إنهاء جميع جلسات ${resetPassword?.fullName || "الطبيب"} بعد نجاح العملية.`}
        onClose={() => { setResetPassword(null); setTemporaryPassword(""); }}
        busy={submitting}
        dirty={temporaryPassword.length > 0}
        size="sm"
        locale={locale}
        footer={
          <div className="admin-dialog-actions">
            <button type="button" className="btn btn-outline" onClick={() => { setResetPassword(null); setTemporaryPassword(""); }}>إلغاء</button>
            <button type="button" className="btn btn-primary" disabled={temporaryPassword.length < 10 || submitting} onClick={() => void submitResetPassword()}>
              {submitting ? "جارٍ إعادة التعيين..." : "إعادة تعيين كلمة المرور"}
            </button>
          </div>
        }
      >
        <AdminField label="كلمة المرور المؤقتة" description="10 أحرف على الأقل. لن تظهر بعد إغلاق النافذة.">
          {({ id, descriptionId }) => <AdminInput id={id} type="password" dir="ltr" autoComplete="new-password" value={temporaryPassword} aria-describedby={descriptionId} onChange={(event) => setTemporaryPassword(event.target.value)} />}
        </AdminField>
      </AdminDialog>

      <ConfirmDialog
        open={!!statusChange}
        title={statusChange?.status === "ACTIVE" ? "تعطيل حساب الطبيب" : "تفعيل حساب الطبيب"}
        description={statusChange?.status === "ACTIVE" ? `سيُمنع ${statusChange.fullName} من تسجيل الدخول وستُنهي جلساته الحالية. لن تُحذف السجلات الطبية أو المواعيد السابقة.` : `سيتمكن ${statusChange?.fullName || "الطبيب"} من تسجيل الدخول مجددًا.`}
        confirmLabel={statusChange?.status === "ACTIVE" ? "تعطيل الحساب" : "تفعيل الحساب"}
        loading={submitting}
        onCancel={() => setStatusChange(null)}
        onConfirm={() => void changeStatus()}
      />

      <ConfirmDialog
        open={!!archive}
        title="أرشفة الطبيب"
        description={`ستُخفى صفحة ${archive?.fullName || "الطبيب"} العامة، ويتوقف الحجز وتسجيل الدخول. ستبقى المواعيد والسجلات التاريخية محفوظة ولن يحدث حذف دائم.`}
        confirmLabel="أرشفة الطبيب"
        loading={submitting}
        onCancel={() => setArchive(null)}
        onConfirm={() => void archiveDoctor()}
      />

      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardShell>
  );
}
