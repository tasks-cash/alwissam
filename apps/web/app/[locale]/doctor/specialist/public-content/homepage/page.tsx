"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../../lib/api";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

type SectionKey = "specialties" | "services" | "doctors" | "reviews";

type SectionForm = {
  badgeAr: string;
  titleAr: string;
  titleEn: string;
  titleFr: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionFr: string;
  image: string;
  imageAltAr: string;
  ctaLabelAr: string;
  ctaRoute: string;
  published: boolean;
  displayOrder: number;
};

const KEYS: SectionKey[] = ["specialties", "services", "doctors", "reviews"];
const LABELS: Record<SectionKey, string> = {
  specialties: "تخصصاتنا الطبية",
  services: "خدمات طب الأسنان",
  doctors: "الأطباء",
  reviews: "التقييمات",
};

const empty: SectionForm = {
  badgeAr: "",
  titleAr: "",
  titleEn: "",
  titleFr: "",
  descriptionAr: "",
  descriptionEn: "",
  descriptionFr: "",
  image: "",
  imageAltAr: "",
  ctaLabelAr: "",
  ctaRoute: "/",
  published: true,
  displayOrder: 0,
};

export default function HomepageSectionsAdminPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [sections, setSections] = useState<Record<SectionKey, SectionForm>>({
    specialties: { ...empty },
    services: { ...empty },
    doctors: { ...empty },
    reviews: { ...empty },
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<SectionKey | null>(null);

  const load = useCallback(async () => {
    const { ok, data } = await apiRequest<{
      homepageSections?: Record<string, Partial<SectionForm>>;
    }>("/api/admin/homepage-sections");
    if (!ok || !data.homepageSections) return;
    setSections((prev) => {
      const next = { ...prev };
      for (const key of KEYS) {
        next[key] = {
          ...empty,
          ...prev[key],
          ...(data.homepageSections?.[key] || {}),
        } as SectionForm;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function uploadImage(key: SectionKey, file: File) {
    setUploading(key);
    setErr("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        credentials: "include",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.message || "تعذر رفع الصورة.");
        return;
      }
      setSections((s) => ({
        ...s,
        [key]: { ...s[key], image: String(data.url || "") },
      }));
    } catch {
      setErr("تعذر رفع الصورة.");
    } finally {
      setUploading(null);
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    const { ok, data } = await apiRequest<{ message?: string }>(
      "/api/admin/clinic-settings",
      {
        method: "PUT",
        body: JSON.stringify({
          section: "homepage_sections",
          homepageSections: sections,
        }),
      },
    );
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(data.message || "تم الحفظ.");
  }

  if (loading || !user) {
    return <main className="dash-panel">{dict.loading}</main>;
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
      title="أقسام الصفحة الرئيسية"
      description="إدارة عناوين وصور أقسام التخصصات والخدمات والأطباء والتقييمات."
    >
      {msg ? <div className="alert-success">{msg}</div> : null}
      {err ? <div className="alert-error">{err}</div> : null}

      <form className="stack-form" onSubmit={onSave}>
        {KEYS.map((key) => {
          const s = sections[key];
          return (
            <section key={key} className="card-surface dash-actions">
              <h2>{LABELS[key]}</h2>
              <div className="row-2">
                <div className="field">
                  <label>شارة (AR)</label>
                  <input
                    className="input"
                    value={s.badgeAr}
                    onChange={(e) =>
                      setSections((v) => ({
                        ...v,
                        [key]: { ...v[key], badgeAr: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>ترتيب العرض</label>
                  <input
                    className="input"
                    type="number"
                    value={s.displayOrder}
                    onChange={(e) =>
                      setSections((v) => ({
                        ...v,
                        [key]: {
                          ...v[key],
                          displayOrder: Number(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label>العنوان (AR)</label>
                <input
                  className="input"
                  value={s.titleAr}
                  onChange={(e) =>
                    setSections((v) => ({
                      ...v,
                      [key]: { ...v[key], titleAr: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="row-2">
                <div className="field">
                  <label>Title (EN)</label>
                  <input
                    className="input"
                    value={s.titleEn}
                    onChange={(e) =>
                      setSections((v) => ({
                        ...v,
                        [key]: { ...v[key], titleEn: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Titre (FR)</label>
                  <input
                    className="input"
                    value={s.titleFr}
                    onChange={(e) =>
                      setSections((v) => ({
                        ...v,
                        [key]: { ...v[key], titleFr: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label>الوصف (AR)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={s.descriptionAr}
                  onChange={(e) =>
                    setSections((v) => ({
                      ...v,
                      [key]: { ...v[key], descriptionAr: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="row-2">
                <div className="field">
                  <label>صورة القسم</label>
                  <input
                    className="input"
                    value={s.image}
                    onChange={(e) =>
                      setSections((v) => ({
                        ...v,
                        [key]: { ...v[key], image: e.target.value },
                      }))
                    }
                    placeholder="/images/homepage/..."
                  />
                </div>
                <div className="field">
                  <label>رفع صورة</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading === key}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadImage(key, file);
                    }}
                  />
                </div>
              </div>
              <div className="row-2">
                <div className="field">
                  <label>نص الزر (AR)</label>
                  <input
                    className="input"
                    value={s.ctaLabelAr}
                    onChange={(e) =>
                      setSections((v) => ({
                        ...v,
                        [key]: { ...v[key], ctaLabelAr: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>مسار الزر</label>
                  <input
                    className="input"
                    value={s.ctaRoute}
                    onChange={(e) =>
                      setSections((v) => ({
                        ...v,
                        [key]: { ...v[key], ctaRoute: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={s.published !== false}
                  onChange={(e) =>
                    setSections((v) => ({
                      ...v,
                      [key]: { ...v[key], published: e.target.checked },
                    }))
                  }
                />
                <span>منشور على الصفحة الرئيسية</span>
              </label>
              {s.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.image}
                  alt=""
                  style={{
                    width: "100%",
                    maxWidth: 360,
                    borderRadius: 12,
                    marginTop: 8,
                  }}
                />
              ) : null}
            </section>
          );
        })}
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? dict.saving : dict.save}
        </button>
      </form>
    </DashboardShell>
  );
}
