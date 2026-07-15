"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";

type Res = {
  profile: {
    fullName: string;
    phone: string;
    email?: string;
    city?: string;
    address?: string;
    locale?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    patientNumber: string;
  };
};

function Body() {
  const { reloadKey, bump } = usePatientPortal();
  const { data, error, loading, reload } = usePatientFetch<Res>(
    "/api/patient/profile",
    reloadKey,
  );
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    city: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    locale: "ar",
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setForm({
        fullName: data.profile.fullName || "",
        email: data.profile.email || "",
        city: data.profile.city || "",
        address: data.profile.address || "",
        emergencyContact: data.profile.emergencyContact || "",
        emergencyPhone: data.profile.emergencyPhone || "",
        locale: data.profile.locale || "ar",
      });
    }
  }, [data]);

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/patient/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    setMsg(json.message || (res.ok ? "تم الحفظ" : "تعذر الحفظ"));
    if (res.ok) bump();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-surface patient-auth-form"
      style={{ maxWidth: 560 }}
    >
      <p className="muted">
        رقم المريض: {data?.profile.patientNumber} · الهاتف:{" "}
        {data?.profile.phone}
      </p>
      <div className="field">
        <label htmlFor="fullName">الاسم الكامل</label>
        <input
          id="fullName"
          className="input"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="email">البريد</label>
        <input
          id="email"
          className="input"
          dir="ltr"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="city">المدينة</label>
        <input
          id="city"
          className="input"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="address">العنوان</label>
        <input
          id="address"
          className="input"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="emergencyContact">جهة اتصال للطوارئ</label>
        <input
          id="emergencyContact"
          className="input"
          value={form.emergencyContact}
          onChange={(e) =>
            setForm({ ...form, emergencyContact: e.target.value })
          }
        />
      </div>
      <div className="field">
        <label htmlFor="emergencyPhone">هاتف الطوارئ</label>
        <input
          id="emergencyPhone"
          className="input"
          dir="ltr"
          value={form.emergencyPhone}
          onChange={(e) =>
            setForm({ ...form, emergencyPhone: e.target.value })
          }
        />
      </div>
      <button className="btn btn-primary" disabled={busy} type="submit">
        {busy ? "جارٍ الحفظ..." : "حفظ"}
      </button>
      {msg ? <p role="status">{msg}</p> : null}
    </form>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="المعلومات الشخصية">
      <Body />
    </PatientPortalPage>
  );
}
