"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  PASSWORD_MIN_CREATE,
  createDoctorSchema,
  omitConfirmPassword,
  updateDoctorSchema,
  validationMessagesAr,
} from "@alwisam/shared-validation";
import { PasswordField } from "../../../../components/ui/PasswordField";
import { PhoneField } from "../../../../components/ui/PhoneField";
import { ConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import { LogoutButton } from "../../../../components/auth/LogoutButton";
import {
  apiDelete,
  apiErrorMessage,
  apiPatch,
  apiPost,
  mapFieldErrors,
} from "../../../../lib/api";

type DoctorRow = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  type?: string;
  specialtyAr?: string;
  isActive?: boolean;
  status?: string;
};

export default function DoctorsPage() {
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
  const [deactivate, setDeactivate] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [dialogError, setDialogError] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);

  const load = useCallback(async () => {
    const me = await fetch("/api/auth/me", { credentials: "include" });
    if (!me.ok) {
      window.location.href = "/staff/login";
      return;
    }
    const list = await fetch("/api/admin/doctors", { credentials: "include" });
    if (!list.ok) {
      setError("تعذر تحميل قائمة الأطباء");
      return;
    }
    const data = await list.json();
    setDoctors(data.doctors || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1rem", display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
        <h1 style={{ margin: 0, color: "var(--primary-navy)" }}>إدارة الأطباء</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <a className="btn btn-outline" href="/doctor/specialist/secretaries">السكرتارية</a>
          <LogoutButton />
        </div>
      </div>

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
          <input ref={emailRef} id="email" className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setEdit({ userId: d.id, email: d.email || "", phone: d.phone || "", newPassword: "" })}>تعديل الدخول</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setDialogError(""); setDeactivate({ userId: d.id, name: d.fullName }); }}>تعطيل</button>
                </div>
              </div>
              {edit?.userId === d.id ? (
                <form onSubmit={onUpdate} style={{ marginTop: "0.75rem", display: "grid", gap: "0.65rem" }}>
                  <div className="field">
                    <label>البريد</label>
                    <input className="input" type="email" autoComplete="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
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
    </main>
  );
}
