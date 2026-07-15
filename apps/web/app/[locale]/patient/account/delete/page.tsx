"use client";

import { FormEvent, useState } from "react";
import {
  PatientPortalPage,
} from "../../../../../components/patient/PatientPortalPage";

function Body() {
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!confirm) {
      setMsg("يلزم التأكيد.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/patient/account/delete-request", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    setMsg(json.message || (res.ok ? "تم إرسال الطلب" : "تعذر إرسال الطلب"));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-surface patient-auth-form"
      style={{ maxWidth: 560 }}
    >
      <p>
        طلب الحذف لا يعني بالضرورة محو السجلات الطبية التي يجب الاحتفاظ بها
        قانونًا أو وفق سياسة العيادة. قد يتم إخفاء الحساب أو تعطيل الدخول مع
        الإبقاء على السجلات اللازمة.
      </p>
      <div className="field">
        <label htmlFor="reason">سبب الطلب (اختياري)</label>
        <textarea
          id="reason"
          className="input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </div>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
        />
        <span>أفهم العواقب وأرغب في تقديم الطلب</span>
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "جارٍ الإرسال..." : "إرسال طلب الحذف"}
      </button>
      {msg ? <p role="status">{msg}</p> : null}
    </form>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="طلب حذف الحساب">
      <Body />
    </PatientPortalPage>
  );
}
