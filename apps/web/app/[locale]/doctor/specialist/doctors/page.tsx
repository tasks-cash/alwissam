"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  PASSWORD_MIN_CREATE,
  createDoctorSchema,
  omitConfirmPassword,
  updateDoctorSchema,
  validationMessagesAr,
} from "@alwisam/shared-validation";
import { PasswordField } from "../../../../../components/ui/PasswordField";
import { PhoneField } from "../../../../../components/ui/PhoneField";
import { ConfirmDialog } from "../../../../../components/ui/ConfirmDialog";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import {
  apiDelete,
  apiErrorMessage,
  apiPatch,
  apiPost,
  mapFieldErrors,
} from "../../../../../lib/api";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type DoctorRow = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  type?: string;
  specialtyAr?: string;
  professionalTitleAr?: string;
  bioAr?: string;
  isPublic?: boolean;
  isBookable?: boolean;
  isOwner?: boolean;
  isActive?: boolean;
  status?: string;
};

type PublicProfileForm = {
  userId: string;
  specialtyAr: string;
  professionalTitleAr: string;
  bioAr: string;
  isPublic: boolean;
  isBookable: boolean;
};

function DoctorBadges({ d }: { d: DoctorRow }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.35rem" }}>
      {d.specialtyAr ? (
        <span className="badge">{d.specialtyAr}</span>
      ) : null}
      <span className={`badge ${d.isPublic !== false ? "" : "muted"}`}>
        {d.isPublic !== false ? "عام" : "غير عام"}
      </span>
      <span className={`badge ${d.isBookable !== false ? "" : "muted"}`}>
        {d.isBookable !== false ? "قابل للحجز" : "غير قابل للحجز"}
      </span>
      {d.isOwner ? <span className="badge">صاحبة العيادة</span> : null}
      {d.isActive === false ? (
        <span className="badge muted">غير نشط</span>
      ) : null}
    </div>
  );
}

function PublicProfileFields({
  form,
  onChange,
  submitLabel,
  loading,
}: {
  form: PublicProfileForm;
  onChange: (next: PublicProfileForm) => void;
  submitLabel: string;
  loading: boolean;
}) {
  return (
    <>
      <div className="field">
        <label>التخصص (عربي)</label>
        <input
          className="input"
          value={form.specialtyAr}
          onChange={(e) => onChange({ ...form, specialtyAr: e.target.value })}
        />
      </div>
      <div className="field">
        <label>اللقب المهني (عربي)</label>
        <input
          className="input"
          value={form.professionalTitleAr}
          onChange={(e) =>
            onChange({ ...form, professionalTitleAr: e.target.value })
          }
        />
      </div>
      <div className="field">
        <label>نبذة / وصف (عربي)</label>
        <textarea
          className="input"
          rows={3}
          value={form.bioAr}
          onChange={(e) => onChange({ ...form, bioAr: e.target.value })}
        />
      </div>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={form.isPublic}
          onChange={(e) => onChange({ ...form, isPublic: e.target.checked })}
        />
        <span>عرض عام على الموقع</span>
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={form.isBookable}
          onChange={(e) => onChange({ ...form, isBookable: e.target.checked })}
        />
        <span>قابل للحجز</span>
      </label>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "جارٍ الحفظ..." : submitLabel}
      </button>
    </>
  );
}

export default function DoctorsPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({
      roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"],
    });
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    type: "GENERAL" as "GENERAL" | "SPECIALIST",
    specialtyAr: "",
  });
  const [edit, setEdit] = useState<{
    userId: string;
    email: string;
    phone: string;
    newPassword: string;
  } | null>(null);
  const [publicEdit, setPublicEdit] = useState<PublicProfileForm | null>(null);
  const [displayDrafts, setDisplayDrafts] = useState<
    Record<string, { specialtyAr: string; bioAr: string }>
  >({});
  const [deactivate, setDeactivate] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [dialogError, setDialogError] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);

  const load = useCallback(async () => {
    const list = await fetch("/api/admin/doctors", { credentials: "include" });
    if (!list.ok) {
      setError("تعذر تحميل قائمة الأطباء");
      return;
    }
    const data = await list.json();
    const rows: DoctorRow[] = data.doctors || [];
    setDoctors(rows);
    setDisplayDrafts((prev) => {
      const next = { ...prev };
      for (const d of rows) {
        if (!next[d.id]) {
          next[d.id] = {
            specialtyAr: d.specialtyAr || "",
            bioAr: d.bioAr || "",
          };
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function savePublicProfile(
    e: FormEvent,
    payload: PublicProfileForm,
    onDone?: () => void,
  ) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { ok, data } = await apiPatch<{ message?: string }>(
        "/api/admin/doctors",
        {
          userId: payload.userId,
          specialtyAr: payload.specialtyAr,
          professionalTitleAr: payload.professionalTitleAr,
          bioAr: payload.bioAr,
          isPublic: payload.isPublic,
          isBookable: payload.isBookable,
        },
      );
      if (!ok) {
        setFieldErrors(mapFieldErrors(data));
        setError(apiErrorMessage(data));
        return;
      }
      setSuccess(data.message || validationMessagesAr.saved);
      onDone?.();
      await load();
    } catch {
      setError(validationMessagesAr.backendUnavailable);
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    const parsed = createDoctorSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "_form");
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      setError(parsed.error.issues[0]?.message || validationMessagesAr.validationFailed);
      return;
    }
    setLoading(true);
    try {
      const body = omitConfirmPassword(parsed.data);
      const { ok, data } = await apiPost<{ message?: string }>("/api/admin/doctors", body);
      if (!ok) {
        const fields = mapFieldErrors(data);
        setFieldErrors(fields);
        setError(apiErrorMessage(data));
        if (fields.email) emailRef.current?.focus();
        return;
      }
      setSuccess(data.message || validationMessagesAr.doctorCreated);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        type: "GENERAL",
        specialtyAr: "",
      });
      await load();
    } catch {
      setError(validationMessagesAr.backendUnavailable);
    } finally {
      setLoading(false);
    }
  }

  async function onUpdate(e: FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setError("");
    setSuccess("");
    setFieldErrors({});
    const parsed = updateDoctorSchema.safeParse(edit);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await apiPatch<{ message?: string }>(
        "/api/admin/doctors",
        parsed.data,
      );
      if (!ok) {
        setFieldErrors(mapFieldErrors(data));
        setError(apiErrorMessage(data));
        return;
      }
      setSuccess(data.message || validationMessagesAr.saved);
      setEdit(null);
      await load();
    } catch {
      setError(validationMessagesAr.backendUnavailable);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeactivate() {
    if (!deactivate) return;
    setDialogError("");
    setDialogLoading(true);
    try {
      const { ok, data } = await apiDelete<{ message?: string }>(
        "/api/admin/doctors",
        { userId: deactivate.userId },
      );
      if (!ok) {
        setDialogError(apiErrorMessage(data));
        return;
      }
      setDeactivate(null);
      setSuccess(data.message || "تم تعطيل الحساب بنجاح.");
      await load();
    } catch {
      setDialogError(validationMessagesAr.backendUnavailable);
    } finally {
      setDialogLoading(false);
    }
  }

  if (sessionLoading || !user) {
    return <main className="dash-panel">{dict.loading}</main>;
  }
  if (sessionError) {
    return <main className="dash-panel alert-error">{sessionError}</main>;
  }

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title="إدارة الأطباء"
      description="إنشاء وتعديل وتعطيل حسابات الأطباء."
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
    >
      {error ? <div className="alert-error">{error}</div> : null}
      {success ? <div className="alert-success">{success}</div> : null}

      <form onSubmit={onCreate} className="card-surface" style={{ padding: "1.25rem", display: "grid", gap: "0.85rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>إنشاء طبيب</h2>
        <div className="field">
          <label htmlFor="fullName">الاسم الكامل <span className="required">*</span></label>
          <input id="fullName" className="input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          {fieldErrors.fullName ? <div className="error">{fieldErrors.fullName}</div> : null}
        </div>
        <div className="field">
          <label htmlFor="email">البريد <span className="required">*</span></label>
          <input ref={emailRef} id="email" className="input" type="email" required autoComplete="email" dir="ltr" spellCheck={false} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {fieldErrors.email ? <div className="error">{fieldErrors.email}</div> : null}
        </div>
        <div className="field">
          <label htmlFor="phone">الهاتف <span className="required">*</span></label>
          <PhoneField id="phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} required />
          <div className="hint">أرقام فقط · يُحتفظ بالأصفار البادئة</div>
          {fieldErrors.phone ? <div className="error">{fieldErrors.phone}</div> : null}
        </div>
        <div className="field">
          <label htmlFor="type">النوع <span className="required">*</span></label>
          <select id="type" className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "GENERAL" | "SPECIALIST" })}>
            <option value="GENERAL">طبيب عام</option>
            <option value="SPECIALIST">طبيب أخصائي</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="specialtyAr">التخصص</label>
          <input id="specialtyAr" className="input" value={form.specialtyAr} onChange={(e) => setForm({ ...form, specialtyAr: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="password">كلمة المرور <span className="required">*</span></label>
          <PasswordField id="password" value={form.password} onChange={(password) => setForm({ ...form, password })} autoComplete="new-password" required minLength={PASSWORD_MIN_CREATE} hint={`مطلوبة عند الإنشاء · الحد الأدنى ${PASSWORD_MIN_CREATE}`} />
          {fieldErrors.password ? <div className="error">{fieldErrors.password}</div> : null}
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">تأكيد كلمة المرور <span className="required">*</span></label>
          <PasswordField id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} autoComplete="new-password" required minLength={PASSWORD_MIN_CREATE} />
          {fieldErrors.confirmPassword ? <div className="error">{fieldErrors.confirmPassword}</div> : null}
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "جارٍ الحفظ..." : "إنشاء"}</button>
      </form>

      <section className="card-surface" style={{ padding: "1.25rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>الأطباء</h2>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {doctors.map((d) => (
            <div key={d.id} style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{d.fullName}</strong>
                  <div className="hint">{d.email} · {d.phone} · {d.type} · {d.status}</div>
                  <DoctorBadges d={d} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      setPublicEdit({
                        userId: d.id,
                        specialtyAr: d.specialtyAr || "",
                        professionalTitleAr: d.professionalTitleAr || "",
                        bioAr: d.bioAr || "",
                        isPublic: d.isPublic !== false,
                        isBookable: d.isBookable !== false,
                      })
                    }
                  >
                    عرض عام
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setEdit({ userId: d.id, email: d.email || "", phone: d.phone || "", newPassword: "" })}>تعديل الدخول</button>
                  <Link className="btn btn-outline" href={`/${locale}/doctor/specialist/staff/${d.id}/activity`}>النشاط</Link>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={d.isOwner}
                    title={d.isOwner ? "لا يمكن تعطيل حساب صاحبة العيادة" : undefined}
                    onClick={() => { if (!d.isOwner) { setDialogError(""); setDeactivate({ userId: d.id, name: d.fullName }); } }}
                  >
                    تعطيل
                  </button>
                </div>
              </div>
              {publicEdit?.userId === d.id ? (
                <form
                  onSubmit={(e) =>
                    void savePublicProfile(e, publicEdit, () => setPublicEdit(null))
                  }
                  style={{ marginTop: "0.75rem", display: "grid", gap: "0.65rem" }}
                >
                  <PublicProfileFields
                    form={publicEdit}
                    onChange={setPublicEdit}
                    submitLabel="حفظ العرض العام"
                    loading={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setPublicEdit(null)}
                  >
                    إلغاء
                  </button>
                </form>
              ) : null}
              {edit?.userId === d.id ? (
                <form onSubmit={onUpdate} style={{ marginTop: "0.75rem", display: "grid", gap: "0.65rem" }}>
                  <div className="field">
                    <label>البريد</label>
                    <input className="input" type="email" autoComplete="email" dir="ltr" spellCheck={false} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>الهاتف</label>
                    <PhoneField id={`edit-phone-${d.id}`} value={edit.phone} onChange={(phone) => setEdit({ ...edit, phone })} />
                  </div>
                  <div className="field">
                    <label>كلمة مرور جديدة (اختياري)</label>
                    <PasswordField id={`edit-pass-${d.id}`} value={edit.newPassword} onChange={(newPassword) => setEdit({ ...edit, newPassword })} autoComplete="new-password" hint="اتركه فارغًا للإبقاء على كلمة المرور الحالية" />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading}>حفظ التعديل</button>
                </form>
              ) : null}
            </div>
          ))}
          {doctors.length === 0 ? <p className="hint">لا يوجد أطباء بعد.</p> : null}
        </div>
      </section>

      <section id="doctor-display" className="card-surface" style={{ padding: "1.25rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>عرض الأطباء</h2>
        <p className="hint">تعديل التخصص والوصف الظاهر للمرضى على الموقع.</p>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {doctors.map((d) => {
            const draft = displayDrafts[d.id] || {
              specialtyAr: d.specialtyAr || "",
              bioAr: d.bioAr || "",
            };
            return (
              <div key={`display-${d.id}`} style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                <strong>{d.fullName}</strong>
                <div style={{ marginTop: "0.65rem", display: "grid", gap: "0.65rem" }}>
                  <div className="field">
                    <label>التخصص</label>
                    <input
                      className="input"
                      value={draft.specialtyAr}
                      onChange={(e) =>
                        setDisplayDrafts((prev) => ({
                          ...prev,
                          [d.id]: { ...draft, specialtyAr: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label>الوصف</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={draft.bioAr}
                      onChange={(e) =>
                        setDisplayDrafts((prev) => ({
                          ...prev,
                          [d.id]: { ...draft, bioAr: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={() => {
                      const fakeEvent = { preventDefault: () => {} } as FormEvent;
                      void savePublicProfile(fakeEvent, {
                        userId: d.id,
                        specialtyAr: draft.specialtyAr,
                        professionalTitleAr: d.professionalTitleAr || "",
                        bioAr: draft.bioAr,
                        isPublic: d.isPublic !== false,
                        isBookable: d.isBookable !== false,
                      });
                    }}
                  >
                    {loading ? "جارٍ الحفظ..." : "حفظ وصف الطبيب"}
                  </button>
                </div>
              </div>
            );
          })}
          {doctors.length === 0 ? <p className="hint">لا يوجد أطباء بعد.</p> : null}
        </div>
      </section>

      <ConfirmDialog
        open={!!deactivate}
        title="تأكيد تعطيل الحساب"
        description={deactivate ? `هل أنت متأكد من تعطيل حساب الطبيب "${deactivate.name}"؟ لن يتمكن من تسجيل الدخول حتى إعادة تفعيل الحساب.` : ""}
        confirmLabel="تعطيل الحساب"
        loading={dialogLoading}
        error={dialogError}
        onCancel={() => { if (!dialogLoading) setDeactivate(null); }}
        onConfirm={() => void confirmDeactivate()}
      />
    </DashboardShell>
  );
}
