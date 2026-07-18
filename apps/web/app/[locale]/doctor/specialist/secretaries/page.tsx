"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  PASSWORD_MIN_CREATE,
  createSecretarySchema,
  omitConfirmPassword,
  updateSecretaryLoginSchema,
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

type SecretaryRow = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  shiftCode?: string;
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string;
  isActive?: boolean;
  status?: string;
};

const SHIFT_LABELS: Record<string, string> = {
  MORNING: "صباحية",
  EVENING: "مسائية",
  CUSTOM: "مخصصة",
};

function formatShiftTime(start?: string, end?: string) {
  if (!start && !end) return "—";
  return `${start || "—"} – ${end || "—"}`;
}

export default function SecretariesPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({
      roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"],
    });
  const [rows, setRows] = useState<SecretaryRow[]>([]);
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
    shiftCode: "MORNING" as "MORNING" | "EVENING" | "CUSTOM",
  });
  const [edit, setEdit] = useState<{
    userId: string;
    email: string;
    phone: string;
    newPassword: string;
  } | null>(null);
  const [shiftEdit, setShiftEdit] = useState<{
    userId: string;
    shiftCode: "MORNING" | "EVENING" | "CUSTOM";
    workStartTime: string;
    workEndTime: string;
  } | null>(null);
  const [deactivate, setDeactivate] = useState<{ userId: string; name: string } | null>(null);
  const [dialogError, setDialogError] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);

  const load = useCallback(async () => {
    const list = await fetch("/api/admin/secretaries", { credentials: "include" });
    if (!list.ok) {
      setError("تعذر تحميل قائمة السكرتارية");
      return;
    }
    const data = await list.json();
    setRows(data.secretaries || []);
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    const parsed = createSecretarySchema.safeParse(form);
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
      const { ok, data } = await apiPost<{ message?: string }>(
        "/api/admin/secretaries",
        body,
      );
      if (!ok) {
        const fields = mapFieldErrors(data);
        setFieldErrors(fields);
        setError(apiErrorMessage(data));
        if (fields.email) emailRef.current?.focus();
        return;
      }
      setSuccess(data.message || validationMessagesAr.secretaryCreated);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        shiftCode: "MORNING",
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
    const parsed = updateSecretaryLoginSchema.safeParse({
      section: "login",
      ...edit,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }
    setLoading(true);
    try {
      const { section: _s, ...payload } = parsed.data;
      const { ok, data } = await apiPatch<{ message?: string }>(
        "/api/admin/secretaries",
        payload,
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

  async function onSaveShift(e: FormEvent) {
    e.preventDefault();
    if (!shiftEdit) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { ok, data } = await apiPatch<{ message?: string }>(
        "/api/admin/secretaries",
        {
          userId: shiftEdit.userId,
          shiftCode: shiftEdit.shiftCode,
          workStartTime: shiftEdit.workStartTime,
          workEndTime: shiftEdit.workEndTime,
        },
      );
      if (!ok) {
        setError(apiErrorMessage(data));
        return;
      }
      setSuccess(data.message || validationMessagesAr.saved);
      setShiftEdit(null);
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
        "/api/admin/secretaries",
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
      title="إدارة السكرتارية"
      description="إنشاء وتعديل وتعطيل حسابات السكرتارية ومواعيد الورديات."
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
    >
      {error ? <div className="alert-error">{error}</div> : null}
      {success ? <div className="alert-success">{success}</div> : null}

      <form onSubmit={onCreate} className="card-surface" style={{ padding: "1.25rem", display: "grid", gap: "0.85rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>إنشاء سكرتير/ة</h2>
        <div className="field">
          <label htmlFor="fullName">الاسم الكامل <span className="required">*</span></label>
          <input id="fullName" className="input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          {fieldErrors.fullName ? <div className="error">{fieldErrors.fullName}</div> : null}
        </div>
        <div className="field">
          <label htmlFor="email">البريد <span className="required">*</span></label>
          <input ref={emailRef} id="email" className="input" type="email" autoComplete="email" required dir="ltr" spellCheck={false} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {fieldErrors.email ? <div className="error">{fieldErrors.email}</div> : null}
        </div>
        <div className="field">
          <label htmlFor="phone">الهاتف <span className="required">*</span></label>
          <PhoneField id="phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} required />
          {fieldErrors.phone ? <div className="error">{fieldErrors.phone}</div> : null}
        </div>
        <div className="field">
          <label htmlFor="shiftCode">الوردية <span className="required">*</span></label>
          <select id="shiftCode" className="select" value={form.shiftCode} onChange={(e) => setForm({ ...form, shiftCode: e.target.value as typeof form.shiftCode })}>
            <option value="MORNING">صباحية</option>
            <option value="EVENING">مسائية</option>
            <option value="CUSTOM">مخصصة</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="password">كلمة المرور <span className="required">*</span></label>
          <PasswordField id="password" value={form.password} onChange={(password) => setForm({ ...form, password })} autoComplete="new-password" required minLength={PASSWORD_MIN_CREATE} />
          {fieldErrors.password ? <div className="error">{fieldErrors.password}</div> : null}
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">تأكيد كلمة المرور <span className="required">*</span></label>
          <PasswordField id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} autoComplete="new-password" required minLength={PASSWORD_MIN_CREATE} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "جارٍ الحفظ..." : "إنشاء"}</button>
      </form>

      <section className="card-surface" style={{ padding: "1.25rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>السكرتارية</h2>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {rows.map((s) => (
            <div key={s.id} style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{s.fullName}</strong>
                  <div className="hint">
                    {s.email} · {s.phone} · {SHIFT_LABELS[s.shiftCode || ""] || s.shiftCode} · {s.status}
                  </div>
                  <div className="hint" style={{ marginTop: "0.25rem" }}>
                    أوقات العمل: {formatShiftTime(s.workStartTime, s.workEndTime)}
                    {s.workDays ? ` · ${s.workDays}` : ""}
                    {s.isActive === false ? " · غير نشط" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      setShiftEdit({
                        userId: s.id,
                        shiftCode: (s.shiftCode as "MORNING" | "EVENING" | "CUSTOM") || "MORNING",
                        workStartTime: s.workStartTime || "07:00",
                        workEndTime: s.workEndTime || "14:30",
                      })
                    }
                  >
                    أوقات العمل
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setEdit({ userId: s.id, email: s.email || "", phone: s.phone || "", newPassword: "" })}>تعديل الدخول</button>
                  <Link className="btn btn-outline" href={`/${locale}/doctor/specialist/staff/${s.id}/activity`}>النشاط</Link>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setDialogError(""); setDeactivate({ userId: s.id, name: s.fullName }); }}
                  >
                    <span>تعطيل</span>
                    <span className="hint" style={{ display: "block", fontSize: "0.75rem", marginTop: "0.1rem" }}>
                      حذف الحساب
                    </span>
                  </button>
                </div>
              </div>
              {shiftEdit?.userId === s.id ? (
                <form onSubmit={onSaveShift} style={{ marginTop: "0.75rem", display: "grid", gap: "0.65rem" }}>
                  <div className="field">
                    <label>الوردية</label>
                    <select
                      className="select"
                      value={shiftEdit.shiftCode}
                      onChange={(e) =>
                        setShiftEdit({
                          ...shiftEdit,
                          shiftCode: e.target.value as typeof shiftEdit.shiftCode,
                        })
                      }
                    >
                      <option value="MORNING">صباحية</option>
                      <option value="EVENING">مسائية</option>
                      <option value="CUSTOM">مخصصة</option>
                    </select>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label>بداية الدوام</label>
                      <input
                        className="input"
                        type="time"
                        dir="ltr"
                        value={shiftEdit.workStartTime}
                        onChange={(e) =>
                          setShiftEdit({ ...shiftEdit, workStartTime: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label>نهاية الدوام</label>
                      <input
                        className="input"
                        type="time"
                        dir="ltr"
                        value={shiftEdit.workEndTime}
                        onChange={(e) =>
                          setShiftEdit({ ...shiftEdit, workEndTime: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                      {loading ? "جارٍ الحفظ..." : "حفظ أوقات العمل"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShiftEdit(null)}
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : null}
              {edit?.userId === s.id ? (
                <form onSubmit={onUpdate} style={{ marginTop: "0.75rem", display: "grid", gap: "0.65rem" }}>
                  <div className="field">
                    <label>البريد</label>
                    <input className="input" type="email" autoComplete="email" dir="ltr" spellCheck={false} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>الهاتف</label>
                    <PhoneField id={`edit-phone-${s.id}`} value={edit.phone} onChange={(phone) => setEdit({ ...edit, phone })} />
                  </div>
                  <div className="field">
                    <label>كلمة مرور جديدة (اختياري)</label>
                    <PasswordField id={`edit-pass-${s.id}`} value={edit.newPassword} onChange={(newPassword) => setEdit({ ...edit, newPassword })} autoComplete="new-password" hint="اتركه فارغًا للإبقاء على كلمة المرور الحالية" />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading}>حفظ التعديل</button>
                </form>
              ) : null}
            </div>
          ))}
          {rows.length === 0 ? <p className="hint">لا يوجد سكرتارية بعد.</p> : null}
        </div>
      </section>

      <ConfirmDialog
        open={!!deactivate}
        title="تأكيد تعطيل الحساب"
        description={deactivate ? `هل أنت متأكد من تعطيل حساب السكرتير "${deactivate.name}"؟ لن يتمكن من تسجيل الدخول حتى إعادة تفعيل الحساب.` : ""}
        confirmLabel="تعطيل الحساب"
        loading={dialogLoading}
        error={dialogError}
        onCancel={() => { if (!dialogLoading) setDeactivate(null); }}
        onConfirm={() => void confirmDeactivate()}
      />
    </DashboardShell>
  );
}
