"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { apiErrorMessage, apiRequest } from "../../../../../../lib/api";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

type FaqRow = {
  id: string;
  questionAr: string;
  questionEn: string;
  questionFr: string;
  answerAr: string;
  answerEn: string;
  answerFr: string;
  slug: string;
  category: string;
  keywordsAr?: string[];
  keywordsEn?: string[];
  keywordsFr?: string[];
  relatedSpecialtySlugs?: string[];
  relatedServiceSlugs?: string[];
  isActive?: boolean;
  isPublic?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  archivedAt?: string | null;
};

const CATEGORIES = [
  "general",
  "contact-location",
  "working-hours",
  "appointments",
  "doctors",
  "before-visit",
  "after-visit",
  "pricing-payment",
  "general-dentistry",
  "cleaning-gums",
  "teeth-whitening",
  "fillings",
  "root-canal",
  "extraction",
  "wisdom-teeth",
  "implants",
  "crowns-bridges",
  "orthodontics",
  "pediatric-dentistry",
  "dental-emergency",
  "privacy",
  "patient-experiences",
  "before-after",
  "support",
];

const empty: Omit<FaqRow, "id"> = {
  questionAr: "",
  questionEn: "",
  questionFr: "",
  answerAr: "",
  answerEn: "",
  answerFr: "",
  slug: "",
  category: "general",
  keywordsAr: [],
  keywordsEn: [],
  keywordsFr: [],
  relatedSpecialtySlugs: [],
  relatedServiceSlugs: [],
  isActive: true,
  isPublic: false,
  isFeatured: false,
  displayOrder: 100,
};

function csv(value?: string[] | string) {
  if (Array.isArray(value)) return value.join(", ");
  return String(value || "");
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function FaqsAdminPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [rows, setRows] = useState<FaqRow[]>([]);
  const [form, setForm] = useState<Omit<FaqRow, "id"> & { id?: string }>({
    ...empty,
  });
  const [kwAr, setKwAr] = useState("");
  const [kwEn, setKwEn] = useState("");
  const [kwFr, setKwFr] = useState("");
  const [specSlugs, setSpecSlugs] = useState("");
  const [svcSlugs, setSvcSlugs] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [previewLocale, setPreviewLocale] = useState<"ar" | "en" | "fr">("ar");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ pageSize: "200", page: "1" });
    if (search.trim()) params.set("search", search.trim());
    if (category !== "all") params.set("category", category);
    const { ok, data } = await apiRequest<{ faqs?: FaqRow[] }>(
      `/api/admin/faqs?${params}`,
    );
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setRows(data.faqs || []);
  }, [search, category]);

  useEffect(() => {
    if (!loading && user) void load();
  }, [loading, user, load]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function editRow(row: FaqRow) {
    setForm({ ...row });
    setKwAr(csv(row.keywordsAr));
    setKwEn(csv(row.keywordsEn));
    setKwFr(csv(row.keywordsFr));
    setSpecSlugs(csv(row.relatedSpecialtySlugs));
    setSvcSlugs(csv(row.relatedServiceSlugs));
    setDirty(false);
    setMsg("");
    setErr("");
  }

  function resetForm() {
    setForm({ ...empty });
    setKwAr("");
    setKwEn("");
    setKwFr("");
    setSpecSlugs("");
    setSvcSlugs("");
    setDirty(false);
  }

  async function onSeed() {
    setSaving(true);
    setErr("");
    setMsg("");
    const { ok, data } = await apiRequest("/api/admin/faqs/seed", {
      method: "POST",
    });
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(
      locale === "en"
        ? "FAQ seed completed."
        : locale === "fr"
          ? "Seed FAQ terminé."
          : "تم زرع الأسئلة الشائعة.",
    );
    await load();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setErr("");
    setMsg("");
    const payload = {
      ...form,
      keywordsAr: splitCsv(kwAr),
      keywordsEn: splitCsv(kwEn),
      keywordsFr: splitCsv(kwFr),
      relatedSpecialtySlugs: splitCsv(specSlugs),
      relatedServiceSlugs: splitCsv(svcSlugs),
    };
    const { ok, data } = await apiRequest("/api/admin/faqs", {
      method: form.id ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    setMsg(dict.successSaved);
    setDirty(false);
    resetForm();
    await load();
  }

  async function flag(
    id: string,
    endpoint: string,
    body: Record<string, unknown>,
  ) {
    setSaving(true);
    const { ok, data } = await apiRequest(`/api/admin/faqs/${endpoint}`, {
      method: "POST",
      body: JSON.stringify({ id, ...body }),
    });
    setSaving(false);
    if (!ok) {
      setErr(apiErrorMessage(data));
      return;
    }
    await load();
  }

  const previewQ =
    previewLocale === "en"
      ? form.questionEn
      : previewLocale === "fr"
        ? form.questionFr
        : form.questionAr;
  const previewA =
    previewLocale === "en"
      ? form.answerEn
      : previewLocale === "fr"
        ? form.answerFr
        : form.answerAr;

  if (loading) {
    return (
      <DashboardShell
        locale={locale}
        dict={dict}
        role={user?.role || "ADMIN"}
        userName={user?.fullName || ""}
        title="FAQ"
      >
        <p>…</p>
      </DashboardShell>
    );
  }
  if (error || !user) {
    return (
      <DashboardShell locale={locale} dict={dict} role="ADMIN" userName="" title="FAQ">
        <p>{error || dict.emptyState}</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title={dict.navFaqsAdmin}
    >
      <div className="card-surface" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.search}
            aria-label={dict.search}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="category"
          >
            <option value="all">all</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => void onSeed()}
          >
            Seed FAQs
          </button>
        </div>
        {msg ? <p style={{ color: "green" }}>{msg}</p> : null}
        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      </div>

      <form
        className="card-surface"
        style={{ padding: "1rem", marginBottom: "1.25rem", display: "grid", gap: "0.65rem" }}
        onSubmit={onSubmit}
        onChange={() => setDirty(true)}
      >
        <h2>{form.id ? "Edit FAQ" : "Create FAQ"}</h2>
        <label>
          Question (AR)
          <textarea
            required
            value={form.questionAr}
            onChange={(e) => setForm({ ...form, questionAr: e.target.value })}
          />
        </label>
        <label>
          Question (EN)
          <textarea
            required
            value={form.questionEn}
            onChange={(e) => setForm({ ...form, questionEn: e.target.value })}
          />
        </label>
        <label>
          Question (FR)
          <textarea
            required
            value={form.questionFr}
            onChange={(e) => setForm({ ...form, questionFr: e.target.value })}
          />
        </label>
        <label>
          Answer (AR)
          <textarea
            required
            rows={4}
            value={form.answerAr}
            onChange={(e) => setForm({ ...form, answerAr: e.target.value })}
          />
        </label>
        <label>
          Answer (EN)
          <textarea
            required
            rows={4}
            value={form.answerEn}
            onChange={(e) => setForm({ ...form, answerEn: e.target.value })}
          />
        </label>
        <label>
          Answer (FR)
          <textarea
            required
            rows={4}
            value={form.answerFr}
            onChange={(e) => setForm({ ...form, answerFr: e.target.value })}
          />
        </label>
        <label>
          Slug
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </label>
        <label>
          Category
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Keywords AR (comma)
          <input value={kwAr} onChange={(e) => setKwAr(e.target.value)} />
        </label>
        <label>
          Keywords EN (comma)
          <input value={kwEn} onChange={(e) => setKwEn(e.target.value)} />
        </label>
        <label>
          Keywords FR (comma)
          <input value={kwFr} onChange={(e) => setKwFr(e.target.value)} />
        </label>
        <label>
          Related specialty slugs
          <input value={specSlugs} onChange={(e) => setSpecSlugs(e.target.value)} />
        </label>
        <label>
          Related service slugs
          <input value={svcSlugs} onChange={(e) => setSvcSlugs(e.target.value)} />
        </label>
        <label>
          Display order
          <input
            type="number"
            value={form.displayOrder ?? 100}
            onChange={(e) =>
              setForm({ ...form, displayOrder: Number(e.target.value) || 0 })
            }
          />
        </label>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label>
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />{" "}
            Active
          </label>
          <label>
            <input
              type="checkbox"
              checked={Boolean(form.isPublic)}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
            />{" "}
            Public
          </label>
          <label>
            <input
              type="checkbox"
              checked={Boolean(form.isFeatured)}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
            />{" "}
            Featured
          </label>
        </div>
        <div className="card-surface" style={{ padding: "0.85rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            {(["ar", "en", "fr"] as const).map((l) => (
              <button
                key={l}
                type="button"
                className={`btn btn-outline${previewLocale === l ? " is-active" : ""}`}
                onClick={() => setPreviewLocale(l)}
              >
                Preview {l.toUpperCase()}
              </button>
            ))}
          </div>
          <strong>{previewQ || "—"}</strong>
          <p>{previewA || "—"}</p>
        </div>
        <div style={{ display: "flex", gap: "0.65rem" }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? dict.saving : dict.save}
          </button>
          <button type="button" className="btn btn-outline" onClick={resetForm}>
            {dict.cancel}
          </button>
        </div>
      </form>

      <div className="card-surface" style={{ padding: "1rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Order</th>
              <th align="left">Question AR</th>
              <th align="left">Category</th>
              <th align="left">Flags</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.displayOrder}</td>
                <td>{row.questionAr}</td>
                <td>{row.category}</td>
                <td>
                  {row.isActive ? "A" : "-"}/{row.isPublic ? "P" : "-"}/
                  {row.isFeatured ? "F" : "-"}
                </td>
                <td style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  <button type="button" className="btn btn-outline" onClick={() => editRow(row)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={saving}
                    onClick={() =>
                      void flag(row.id, "publish", { publish: !row.isPublic })
                    }
                  >
                    {row.isPublic ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={saving}
                    onClick={() =>
                      void flag(row.id, "activate", { active: !row.isActive })
                    }
                  >
                    {row.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={saving}
                    onClick={() =>
                      void flag(row.id, "feature", {
                        featured: !row.isFeatured,
                      })
                    }
                  >
                    {row.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={saving}
                    onClick={() =>
                      void flag(
                        row.id,
                        row.archivedAt ? "restore" : "archive",
                        {},
                      )
                    }
                  >
                    {row.archivedAt ? "Restore" : "Archive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
