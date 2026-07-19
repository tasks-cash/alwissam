"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "../../../../../components/admin/AdminForm";
import { AdminPageHeader } from "../../../../../components/admin/AdminPageHeader";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { ConfirmDialog } from "../../../../../components/ui/ConfirmDialog";
import { apiDelete, apiErrorMessage, apiRequest } from "../../../../../lib/api";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type SecretaryRow = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  status?: string;
  shiftCode?: "MORNING" | "EVENING" | "CUSTOM";
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string;
  updatedAt?: string;
  lastLoginAt?: string;
};

type SecretaryDraft = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  shiftCode: "MORNING" | "EVENING" | "CUSTOM";
  workStartTime: string;
  workEndTime: string;
  workDays: string;
  status: "ACTIVE" | "INACTIVE";
};

const EMPTY: SecretaryDraft = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  shiftCode: "MORNING",
  workStartTime: "07:00",
  workEndTime: "14:30",
  workDays: "SUN,MON,TUE,WED,THU,SAT",
  status: "ACTIVE",
};

const SHIFT_LABELS = {
  MORNING: "صباحية",
  EVENING: "مسائية",
  CUSTOM: "مخصصة",
};

function validate(draft: SecretaryDraft, creating: boolean) {
  if (draft.fullName.trim().length < 2) return "أدخل الاسم الكامل.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) return "أدخل بريدًا إلكترونيًا صالحًا.";
  if (!/^\d{8,15}$/.test(draft.phone)) return "رقم الهاتف يجب أن يحتوي على 8 إلى 15 رقمًا.";
  if (draft.workEndTime <= draft.workStartTime) return "وقت نهاية الوردية يجب أن يكون بعد البداية.";
  if (creating && draft.password.length < 10) return "كلمة المرور المؤقتة يجب ألا تقل عن 10 أحرف.";
  if (creating && draft.password !== draft.confirmPassword) return "تأكيد كلمة المرور غير مطابق.";
  return "";
}

export default function SecretariesPage() {
  const { locale, dict, user, loading: sessionLoading, error: sessionError } =
    useDashboardSession({ roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"] });
  const [rows, setRows] = useState<SecretaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [shift, setShift] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<SecretaryRow | null>(null);
  const [draft, setDraft] = useState<SecretaryDraft>(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [deactivate, setDeactivate] = useState<SecretaryRow | null>(null);
  const [resetTarget, setResetTarget] = useState<SecretaryRow | null>(null);
  const [resetValue, setResetValue] = useState("");
  const [toast, setToast] = useState<AdminToastState>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    if (shift) params.set("shiftCode", shift);
    return params.toString();
  }, [debouncedSearch, page, shift, status]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const response = await apiRequest<{
      secretaries?: SecretaryRow[];
      total?: number;
      totalPages?: number;
    }>(`/api/admin/secretaries?${query}`);
    setLoading(false);
    if (!response.ok) {
      setLoadError("تعذر تحميل قائمة السكرتارية حاليًا.");
      return;
    }
    setRows(response.data.secretaries || []);
    setTotal(response.data.total ?? response.data.secretaries?.length ?? 0);
    setTotalPages(response.data.totalPages || 1);
  }, [query]);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  const patch = (value: Partial<SecretaryDraft>) => {
    setDraft((current) => ({ ...current, ...value }));
    setDirty(true);
  };

  const openCreate = () => {
    setDraft(EMPTY);
    setEditing(null);
    setFormError("");
    setDirty(false);
    setStep(0);
    setDialog("create");
  };

  const openEdit = (row: SecretaryRow) => {
    setEditing(row);
    setDraft({
      ...EMPTY,
      fullName: row.fullName,
      email: row.email || "",
      phone: row.phone || "",
      shiftCode: row.shiftCode || "MORNING",
      workStartTime: row.workStartTime || "07:00",
      workEndTime: row.workEndTime || "14:30",
      workDays: row.workDays || "SUN,MON,TUE,WED,THU,SAT",
      status: row.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
    });
    setFormError("");
    setDirty(false);
    setDialog("edit");
  };

  const save = async (close = true) => {
    const message = validate(draft, dialog === "create");
    if (message) {
      setFormError(message);
      return;
    }
    setSaving(true);
    setFormError("");
    const response = await apiRequest<{ message?: string }>("/api/admin/secretaries", {
      method: dialog === "create" ? "POST" : "PATCH",
      body: JSON.stringify(
        dialog === "create"
          ? {
              fullName: draft.fullName,
              email: draft.email,
              phone: draft.phone,
              password: draft.password,
              shiftCode: draft.shiftCode,
              workStartTime: draft.workStartTime,
              workEndTime: draft.workEndTime,
              workDays: draft.workDays,
            }
          : {
              userId: editing?.id,
              fullName: draft.fullName,
              email: draft.email,
              phone: draft.phone,
              shiftCode: draft.shiftCode,
              workStartTime: draft.workStartTime,
              workEndTime: draft.workEndTime,
              workDays: draft.workDays,
              status: draft.status,
            },
      ),
    });
    setSaving(false);
    if (!response.ok) {
      setFormError(apiErrorMessage(response.data));
      return;
    }
    setDirty(false);
    setToast({
      type: "success",
      message:
        dialog === "create"
          ? `تمت إضافة ${draft.fullName} إلى فريق السكرتارية.`
          : `تم حفظ تعديلات ${draft.fullName}.`,
    });
    await load();
    if (close) setDialog(null);
  };

  const confirmDeactivate = async () => {
    if (!deactivate) return;
    setSaving(true);
    const response = await apiDelete<{ message?: string }>("/api/admin/secretaries", {
      userId: deactivate.id,
    });
    setSaving(false);
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      return;
    }
    setDeactivate(null);
    setToast({ type: "success", message: "تم تعطيل الحساب وإنهاء جلساته." });
    await load();
  };

  const submitReset = async () => {
    if (!resetTarget || resetValue.length < 10) return;
    setSaving(true);
    const response = await apiRequest(`/api/admin/secretaries/${resetTarget.id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword: resetValue }),
    });
    setSaving(false);
    if (!response.ok) {
      setToast({ type: "error", message: apiErrorMessage(response.data) });
      return;
    }
    setResetTarget(null);
    setResetValue("");
    setToast({ type: "success", message: "تم تعيين كلمة مرور مؤقتة وإنهاء الجلسات السابقة." });
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
          title="إدارة السكرتارية"
          description="إدارة حسابات فريق الاستقبال وورديات العمل وحالة الوصول بطريقة آمنة."
          breadcrumbs={[
            { label: "لوحة التحكم", href: `/${locale}/doctor/specialist/dashboard` },
            { label: "السكرتارية" },
          ]}
          primaryAction={<button type="button" className="btn btn-primary" onClick={openCreate}>+ إضافة سكرتير/ة</button>}
        />
        <section className="admin-list-card">
          <AdminTableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="ابحث بالاسم أو البريد أو الهاتف"
            resultCount={total}
            filters={
              <>
                <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="الحالة">
                  <option value="">كل الحالات</option>
                  <option value="ACTIVE">نشط</option>
                  <option value="INACTIVE">غير نشط</option>
                  <option value="LOCKED">مقفل</option>
                </select>
                <select value={shift} onChange={(event) => setShift(event.target.value)} aria-label="الوردية">
                  <option value="">كل الورديات</option>
                  <option value="MORNING">صباحية</option>
                  <option value="EVENING">مسائية</option>
                  <option value="CUSTOM">مخصصة</option>
                </select>
              </>
            }
          />
          {loading ? <AdminLoadingSkeleton /> : loadError ? (
            <AdminErrorState message={loadError} onRetry={() => void load()} />
          ) : rows.length === 0 ? (
            <AdminEmptyState
              title="لا توجد حسابات مطابقة"
              description="أضف عضو استقبال جديدًا أو عدّل فلاتر البحث."
              action={<button type="button" className="btn btn-primary" onClick={openCreate}>إضافة سكرتير/ة</button>}
            />
          ) : (
            <>
              <div className="admin-doctors-table-wrap">
                <table className="admin-doctors-table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>التواصل</th>
                      <th>الوردية</th>
                      <th>ساعات العمل</th>
                      <th>الحالة</th>
                      <th><span className="sr-only">الإجراءات</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td><strong>{row.fullName}</strong></td>
                        <td><span dir="ltr">{row.email}</span><small dir="ltr">{row.phone}</small></td>
                        <td>{SHIFT_LABELS[row.shiftCode || "MORNING"]}</td>
                        <td dir="ltr">{row.workStartTime || "—"} – {row.workEndTime || "—"}</td>
                        <td><AdminStatusBadge tone={row.status === "ACTIVE" ? "success" : "warning"}>{row.status === "ACTIVE" ? "نشط" : "غير نشط"}</AdminStatusBadge></td>
                        <td>
                          <AdminRowActions>
                            <button type="button" onClick={() => openEdit(row)}>تعديل الحساب والوردية</button>
                            <button type="button" onClick={() => setResetTarget(row)}>إعادة تعيين كلمة المرور</button>
                            {row.status === "ACTIVE" ? <button type="button" onClick={() => setDeactivate(row)}>تعطيل الحساب</button> : null}
                          </AdminRowActions>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-doctor-cards">
                {rows.map((row) => (
                  <article key={row.id} className="admin-doctor-card">
                    <header>
                      <span className="admin-doctor-avatar"><span>{row.fullName.charAt(0)}</span></span>
                      <div><h3>{row.fullName}</h3><p>{SHIFT_LABELS[row.shiftCode || "MORNING"]} · <span dir="ltr">{row.workStartTime}–{row.workEndTime}</span></p></div>
                      <AdminRowActions>
                        <button type="button" onClick={() => openEdit(row)}>تعديل</button>
                        <button type="button" onClick={() => setResetTarget(row)}>كلمة المرور</button>
                      </AdminRowActions>
                    </header>
                    <div><AdminStatusBadge tone={row.status === "ACTIVE" ? "success" : "warning"}>{row.status === "ACTIVE" ? "نشط" : "غير نشط"}</AdminStatusBadge></div>
                  </article>
                ))}
              </div>
              <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </section>
      </div>

      <AdminDialog
        open={dialog === "create"}
        title="إضافة حساب سكرتارية"
        description="أنشئ بيانات الدخول والوردية ثم راجعها قبل الإضافة."
        onClose={() => setDialog(null)}
        dirty={dirty}
        busy={saving}
        size="lg"
        locale={locale}
        footer={
          <>
            <span className="admin-step-count">الخطوة {step + 1} من 3</span>
            <div className="admin-dialog-actions">
              {step > 0 ? <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)}>السابق</button> : null}
              {step < 2 ? <button type="button" className="btn btn-primary" onClick={() => {
                const message = step === 0 ? validate({ ...draft, workEndTime: "23:59", workStartTime: "00:00" }, true) : draft.workEndTime <= draft.workStartTime ? "وقت نهاية الوردية يجب أن يكون بعد البداية." : "";
                if (message && step === 0) { setFormError(message); return; }
                if (message) { setFormError(message); return; }
                setFormError("");
                setStep(step + 1);
              }}>التالي</button> : <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void save()}>{saving ? "جارٍ إضافة الحساب..." : "إضافة الحساب"}</button>}
            </div>
          </>
        }
      >
        {formError ? <div className="admin-form-error" role="alert">{formError}</div> : null}
        {step === 0 ? (
          <AdminFormSection title="المعلومات الأساسية">
            <AdminField label="الاسم الكامل">{({ id }) => <AdminInput id={id} autoFocus value={draft.fullName} onChange={(event) => patch({ fullName: event.target.value })} />}</AdminField>
            <AdminField label="البريد الإلكتروني">{({ id }) => <AdminInput id={id} type="email" dir="ltr" value={draft.email} onChange={(event) => patch({ email: event.target.value })} />}</AdminField>
            <AdminField label="رقم الهاتف">{({ id }) => <AdminInput id={id} inputMode="numeric" dir="ltr" value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} />}</AdminField>
            <AdminField label="كلمة المرور المؤقتة">{({ id }) => <AdminInput id={id} type="password" dir="ltr" autoComplete="new-password" value={draft.password} onChange={(event) => patch({ password: event.target.value })} />}</AdminField>
            <AdminField label="تأكيد كلمة المرور">{({ id }) => <AdminInput id={id} type="password" dir="ltr" autoComplete="new-password" value={draft.confirmPassword} onChange={(event) => patch({ confirmPassword: event.target.value })} />}</AdminField>
          </AdminFormSection>
        ) : step === 1 ? (
          <AdminFormSection title="الوردية وساعات العمل">
            <AdminField label="نوع الوردية">{({ id }) => <AdminSelect id={id} value={draft.shiftCode} onChange={(event) => patch({ shiftCode: event.target.value as SecretaryDraft["shiftCode"] })}><option value="MORNING">صباحية</option><option value="EVENING">مسائية</option><option value="CUSTOM">مخصصة</option></AdminSelect>}</AdminField>
            <AdminField label="بداية الدوام">{({ id }) => <AdminInput id={id} type="time" dir="ltr" value={draft.workStartTime} onChange={(event) => patch({ workStartTime: event.target.value })} />}</AdminField>
            <AdminField label="نهاية الدوام">{({ id }) => <AdminInput id={id} type="time" dir="ltr" value={draft.workEndTime} onChange={(event) => patch({ workEndTime: event.target.value })} />}</AdminField>
            <AdminField label="أيام العمل" description="رموز الأيام مفصولة بفاصلة.">{({ id }) => <AdminInput id={id} dir="ltr" value={draft.workDays} onChange={(event) => patch({ workDays: event.target.value })} />}</AdminField>
          </AdminFormSection>
        ) : (
          <div className="admin-review-grid">
            <section><h3>الحساب</h3><p>{draft.fullName}</p><p dir="ltr">{draft.email}</p><p dir="ltr">{draft.phone}</p></section>
            <section><h3>الوردية</h3><p>{SHIFT_LABELS[draft.shiftCode]}</p><p dir="ltr">{draft.workStartTime} – {draft.workEndTime}</p></section>
            <section><h3>الصلاحيات</h3><p>دور السكرتارية المعتمد في النظام. لا يمنح صلاحيات إدارية.</p></section>
          </div>
        )}
      </AdminDialog>

      <AdminDialog
        open={dialog === "edit"}
        title="تعديل حساب السكرتارية"
        description={editing?.fullName}
        onClose={() => setDialog(null)}
        dirty={dirty}
        busy={saving}
        variant="drawer"
        size="lg"
        locale={locale}
        footer={
          <div className="admin-dialog-actions">
            <button type="button" className="btn btn-outline" disabled={!dirty || saving} onClick={() => void save(false)}>حفظ</button>
            <button type="button" className="btn btn-primary" disabled={!dirty || saving} onClick={() => void save(true)}>{saving ? "جارٍ الحفظ..." : "حفظ وإغلاق"}</button>
          </div>
        }
      >
        {formError ? <div className="admin-form-error" role="alert">{formError}</div> : null}
        <AdminFormSection title="بيانات الحساب">
          <AdminField label="الاسم الكامل">{({ id }) => <AdminInput id={id} value={draft.fullName} onChange={(event) => patch({ fullName: event.target.value })} />}</AdminField>
          <AdminField label="البريد الإلكتروني">{({ id }) => <AdminInput id={id} type="email" dir="ltr" value={draft.email} onChange={(event) => patch({ email: event.target.value })} />}</AdminField>
          <AdminField label="رقم الهاتف">{({ id }) => <AdminInput id={id} inputMode="numeric" dir="ltr" value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} />}</AdminField>
          <AdminSwitch label="الحساب نشط" checked={draft.status === "ACTIVE"} onChange={(checked) => patch({ status: checked ? "ACTIVE" : "INACTIVE" })} />
        </AdminFormSection>
        <AdminFormSection title="الوردية">
          <AdminField label="نوع الوردية">{({ id }) => <AdminSelect id={id} value={draft.shiftCode} onChange={(event) => patch({ shiftCode: event.target.value as SecretaryDraft["shiftCode"] })}><option value="MORNING">صباحية</option><option value="EVENING">مسائية</option><option value="CUSTOM">مخصصة</option></AdminSelect>}</AdminField>
          <AdminField label="بداية الدوام">{({ id }) => <AdminInput id={id} type="time" dir="ltr" value={draft.workStartTime} onChange={(event) => patch({ workStartTime: event.target.value })} />}</AdminField>
          <AdminField label="نهاية الدوام">{({ id }) => <AdminInput id={id} type="time" dir="ltr" value={draft.workEndTime} onChange={(event) => patch({ workEndTime: event.target.value })} />}</AdminField>
          <AdminField label="أيام العمل">{({ id }) => <AdminInput id={id} dir="ltr" value={draft.workDays} onChange={(event) => patch({ workDays: event.target.value })} />}</AdminField>
        </AdminFormSection>
      </AdminDialog>

      <AdminDialog
        open={!!resetTarget}
        title="إعادة تعيين كلمة المرور"
        description={`ستنتهي كل جلسات ${resetTarget?.fullName || "المستخدم"} الحالية.`}
        onClose={() => { setResetTarget(null); setResetValue(""); }}
        dirty={resetValue.length > 0}
        busy={saving}
        size="sm"
        locale={locale}
        footer={<button type="button" className="btn btn-primary" disabled={resetValue.length < 10 || saving} onClick={() => void submitReset()}>{saving ? "جارٍ إعادة التعيين..." : "إعادة تعيين كلمة المرور"}</button>}
      >
        <AdminField label="كلمة المرور المؤقتة" description="10 أحرف على الأقل.">{({ id }) => <AdminInput id={id} type="password" dir="ltr" value={resetValue} onChange={(event) => setResetValue(event.target.value)} />}</AdminField>
      </AdminDialog>

      <ConfirmDialog
        open={!!deactivate}
        title="تعطيل حساب السكرتارية"
        description={`سيُمنع ${deactivate?.fullName || "المستخدم"} من الدخول وتُنهي جميع جلساته. تبقى سجلات الإجراءات السابقة مرتبطة بهويته.`}
        confirmLabel="تعطيل الحساب"
        loading={saving}
        onCancel={() => setDeactivate(null)}
        onConfirm={() => void confirmDeactivate()}
      />
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardShell>
  );
}
