"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminRowActions,
} from "../../../../../../components/admin/AdminDataTable";
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
} from "../../../../../../components/admin/AdminForm";
import { AdminPageHeader } from "../../../../../../components/admin/AdminPageHeader";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../../lib/api";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

const PLACEMENTS = [
  ["global_floating", "الزر العائم العام"],
  ["homepage", "الصفحة الرئيسية"],
  ["contact_page", "صفحة التواصل"],
  ["footer", "تذييل الموقع"],
  ["patient_help", "مساعدة المريض"],
  ["booking_page", "صفحة الحجز"],
] as const;

type ChannelType =
  | "phone"
  | "whatsapp"
  | "viber"
  | "instagram"
  | "messenger"
  | "telegram"
  | "email"
  | "custom";

type ChannelForm = {
  type: ChannelType;
  labelAr: string;
  labelEn: string;
  labelFr: string;
  value: string;
  publicUrl: string;
  icon: string;
  isEnabled: boolean;
  isPrimary: boolean;
  displayOrder: number;
  placement: string[];
};

type ChannelRow = ChannelForm & {
  id: string;
  archivedAt?: string | null;
};

const EMPTY: ChannelForm = {
  type: "whatsapp",
  labelAr: "",
  labelEn: "",
  labelFr: "",
  value: "",
  publicUrl: "",
  icon: "whatsapp",
  isEnabled: true,
  isPrimary: false,
  displayOrder: 0,
  placement: ["global_floating"],
};

function testLinkProps(url: string) {
  return /^https:/i.test(url)
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

export default function ContactChannelsAdminPage() {
  const {
    locale,
    dict,
    user,
    loading: sessionLoading,
    error: sessionError,
  } = useDashboardSession({
    roles: ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"],
  });
  const [rows, setRows] = useState<ChannelRow[]>([]);
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<ChannelForm>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<AdminToastState>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const response = await apiRequest<{ channels?: ChannelRow[] }>(
      `/api/admin/contact-channels?archived=${archived}`,
    );
    setLoading(false);
    if (!response.ok) {
      setLoadError("تعذر تحميل وسائل التواصل حاليًا.");
      return;
    }
    setRows(response.data.channels || []);
  }, [archived]);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  function patch(value: Partial<ChannelForm>) {
    setForm((current) => ({ ...current, ...value }));
    setDirty(true);
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setDirty(false);
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(row: ChannelRow) {
    setEditingId(row.id);
    setForm({
      type: row.type,
      labelAr: row.labelAr,
      labelEn: row.labelEn || "",
      labelFr: row.labelFr || "",
      value: row.value,
      publicUrl: row.publicUrl,
      icon: row.icon || row.type,
      isEnabled: row.isEnabled,
      isPrimary: row.isPrimary,
      displayOrder: row.displayOrder,
      placement: row.placement || [],
    });
    setDirty(false);
    setFormError("");
    setFormOpen(true);
  }

  async function save() {
    if (form.labelAr.trim().length < 2 || !form.value.trim()) {
      setFormError("أدخل التسمية العربية والقيمة.");
      return;
    }
    if (!form.publicUrl.trim() || form.placement.length === 0) {
      setFormError("أدخل رابطًا صالحًا واختر موضع عرض واحدًا على الأقل.");
      return;
    }
    setSaving(true);
    setFormError("");
    const response = await apiRequest(
      editingId
        ? `/api/admin/contact-channels/${editingId}`
        : "/api/admin/contact-channels",
      {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(form),
      },
    );
    setSaving(false);
    if (!response.ok) {
      setFormError(apiErrorMessage(response.data));
      return;
    }
    setFormOpen(false);
    setDirty(false);
    setToast({
      type: "success",
      message: editingId ? "تم تحديث وسيلة التواصل." : "تمت إضافة وسيلة التواصل.",
    });
    await load();
  }

  async function act(
    path: "enabled" | "primary" | "archive" | "restore",
    row: ChannelRow,
  ) {
    const response = await apiRequest(`/api/admin/contact-channels/${path}`, {
      method: "POST",
      body: JSON.stringify(
        path === "enabled"
          ? { id: row.id, enabled: !row.isEnabled }
          : { id: row.id },
      ),
    });
    setToast({
      type: response.ok ? "success" : "error",
      message: response.ok
        ? "تم تحديث وسيلة التواصل."
        : apiErrorMessage(response.data),
    });
    if (response.ok) await load();
  }

  async function move(row: ChannelRow, direction: -1 | 1) {
    const index = rows.findIndex((item) => item.id === row.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= rows.length) return;
    const ordered = rows.map((item) => item.id);
    [ordered[index], ordered[target]] = [ordered[target]!, ordered[index]!];
    const response = await apiRequest("/api/admin/contact-channels/reorder", {
      method: "POST",
      body: JSON.stringify({ orderedIds: ordered }),
    });
    if (response.ok) await load();
    else
      setToast({
        type: "error",
        message: apiErrorMessage(response.data),
      });
  }

  if (sessionLoading || !user)
    return <main className="dash-panel">{dict.loading}</main>;
  if (sessionError)
    return <main className="dash-panel alert-error">{sessionError}</main>;

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
    >
      <div className="admin-doctors-page">
        <AdminPageHeader
          eyebrow="إعدادات الموقع"
          title="وسائل التواصل"
          description="إدارة الهاتف وواتساب والقنوات العامة ومواضع ظهورها من مصدر واحد."
          breadcrumbs={[
            {
              label: "لوحة التحكم",
              href: `/${locale}/doctor/specialist/dashboard`,
            },
            { label: "وسائل التواصل" },
          ]}
          primaryAction={
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreate}
            >
              + إضافة وسيلة
            </button>
          }
        />

        <section className="admin-list-card">
          <div className="admin-contact-toolbar">
            <AdminSwitch
              label="عرض المؤرشف"
              checked={archived}
              onChange={setArchived}
            />
          </div>
          {loading ? (
            <AdminLoadingSkeleton />
          ) : loadError ? (
            <AdminErrorState message={loadError} onRetry={() => void load()} />
          ) : rows.length === 0 ? (
            <AdminEmptyState
              title={archived ? "لا توجد وسائل مؤرشفة" : "لا توجد وسائل تواصل"}
              description="أضف قناة آمنة ليتم عرضها في الموقع العام."
              action={
                archived ? undefined : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCreate}
                  >
                    إضافة وسيلة
                  </button>
                )
              }
            />
          ) : (
            <div className="admin-contact-channel-grid">
              {rows.map((row, index) => (
                <article className="admin-contact-channel-card" key={row.id}>
                  <header>
                    <span className={`contact-channel-icon is-${row.type}`}>
                      {row.type === "phone" ? "☎" : row.type === "whatsapp" ? "◉" : "↗"}
                    </span>
                    <div>
                      <h2>{row.labelAr}</h2>
                      <p dir="ltr">{row.value}</p>
                    </div>
                    <AdminStatusBadge tone={row.isEnabled ? "success" : "warning"}>
                      {row.isEnabled ? "مفعّل" : "معطّل"}
                    </AdminStatusBadge>
                  </header>
                  <div className="admin-contact-channel-meta">
                    {row.isPrimary ? (
                      <AdminStatusBadge tone="info">أساسي</AdminStatusBadge>
                    ) : null}
                    <span>الترتيب: {row.displayOrder}</span>
                    <span>
                      {row.placement
                        .map(
                          (placement) =>
                            PLACEMENTS.find(([key]) => key === placement)?.[1] ||
                            placement,
                        )
                        .join("، ")}
                    </span>
                  </div>
                  <div className="admin-contact-channel-actions">
                    <a
                      className="btn btn-outline"
                      href={row.publicUrl}
                      {...testLinkProps(row.publicUrl)}
                    >
                      اختبار الرابط
                    </a>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => openEdit(row)}
                    >
                      تعديل
                    </button>
                    {!archived ? (
                      <AdminRowActions>
                        <button type="button" onClick={() => void act("enabled", row)}>
                          {row.isEnabled ? "تعطيل" : "تفعيل"}
                        </button>
                        {!row.isPrimary ? (
                          <button type="button" onClick={() => void act("primary", row)}>
                            جعلها أساسية
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => void move(row, -1)}
                        >
                          تحريك لأعلى
                        </button>
                        <button
                          type="button"
                          disabled={index === rows.length - 1}
                          onClick={() => void move(row, 1)}
                        >
                          تحريك لأسفل
                        </button>
                        <button type="button" onClick={() => void act("archive", row)}>
                          أرشفة
                        </button>
                      </AdminRowActions>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => void act("restore", row)}
                      >
                        استعادة
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <AdminDialog
        open={formOpen}
        title={editingId ? "تعديل وسيلة التواصل" : "إضافة وسيلة تواصل"}
        description="يتم التحقق من البروتوكول ونوع الرابط على الخادم قبل الحفظ."
        onClose={() => setFormOpen(false)}
        dirty={dirty}
        busy={saving}
        locale={locale}
        size="lg"
        footer={
          <div className="admin-dialog-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!dirty || saving}
              onClick={() => void save()}
            >
              {saving ? "جارٍ الحفظ..." : "حفظ وسيلة التواصل"}
            </button>
          </div>
        }
      >
        {formError ? (
          <div className="admin-form-error" role="alert">
            {formError}
          </div>
        ) : null}
        <AdminFormSection title="القناة والرابط">
          <AdminField label="نوع القناة">
            {({ id }) => (
              <AdminSelect
                id={id}
                value={form.type}
                onChange={(event) =>
                  patch({
                    type: event.target.value as ChannelType,
                    icon: event.target.value,
                  })
                }
              >
                <option value="phone">اتصال هاتفي</option>
                <option value="whatsapp">واتساب</option>
                <option value="viber">Viber</option>
                <option value="instagram">Instagram</option>
                <option value="messenger">Messenger</option>
                <option value="telegram">Telegram</option>
                <option value="email">بريد إلكتروني</option>
                <option value="custom">رابط مخصص</option>
              </AdminSelect>
            )}
          </AdminField>
          <AdminField label="القيمة">
            {({ id }) => (
              <AdminInput
                id={id}
                dir="ltr"
                value={form.value}
                onChange={(event) => patch({ value: event.target.value })}
              />
            )}
          </AdminField>
          <AdminField label="الرابط العام">
            {({ id }) => (
              <AdminInput
                id={id}
                dir="ltr"
                value={form.publicUrl}
                onChange={(event) => patch({ publicUrl: event.target.value })}
              />
            )}
          </AdminField>
          <AdminField label="ترتيب العرض">
            {({ id }) => (
              <AdminInput
                id={id}
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(event) =>
                  patch({ displayOrder: Number(event.target.value) || 0 })
                }
              />
            )}
          </AdminField>
        </AdminFormSection>
        <AdminFormSection title="التسميات">
          <AdminField label="التسمية العربية">
            {({ id }) => (
              <AdminInput
                id={id}
                value={form.labelAr}
                onChange={(event) => patch({ labelAr: event.target.value })}
              />
            )}
          </AdminField>
          <AdminField label="التسمية الإنجليزية" optional>
            {({ id }) => (
              <AdminInput
                id={id}
                dir="ltr"
                value={form.labelEn}
                onChange={(event) => patch({ labelEn: event.target.value })}
              />
            )}
          </AdminField>
          <AdminField label="التسمية الفرنسية" optional>
            {({ id }) => (
              <AdminInput
                id={id}
                dir="ltr"
                value={form.labelFr}
                onChange={(event) => patch({ labelFr: event.target.value })}
              />
            )}
          </AdminField>
        </AdminFormSection>
        <AdminFormSection title="مواضع العرض">
          <div className="admin-form-full admin-placement-grid">
            {PLACEMENTS.map(([key, label]) => (
              <AdminSwitch
                key={key}
                label={label}
                checked={form.placement.includes(key)}
                onChange={(checked) =>
                  patch({
                    placement: checked
                      ? [...form.placement, key]
                      : form.placement.filter((value) => value !== key),
                  })
                }
              />
            ))}
          </div>
          <AdminSwitch
            label="مفعّلة"
            checked={form.isEnabled}
            onChange={(checked) => patch({ isEnabled: checked })}
          />
          <AdminSwitch
            label="وسيلة أساسية"
            description="يمكن أن توجد وسيلة أساسية مفعّلة واحدة فقط."
            checked={form.isPrimary}
            onChange={(checked) => patch({ isPrimary: checked })}
          />
        </AdminFormSection>
      </AdminDialog>
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardShell>
  );
}
