"use client";

import { useState } from "react";
import {
  PatientPortalPage,
} from "../../../../../components/patient/PatientPortalPage";

function Body() {
  const [msg, setMsg] = useState("");
  const [requestId, setRequestId] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestExport() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/patient/account/export-request", {
      method: "POST",
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    setMsg(json.message || (res.ok ? "تم إنشاء طلب التصدير" : "تعذر الطلب"));
    if (json.requestId) setRequestId(json.requestId);
  }

  return (
    <div className="card-surface dash-actions" style={{ maxWidth: 560 }}>
      <p>
        يشمل التصدير بياناتك المرئية للمريض فقط (الملف، المواعيد، ملخصات
        الحالات، التعليمات، قائمة الملفات، الرسائل، الموافقات) دون الملاحظات
        الداخلية.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        disabled={busy}
        onClick={() => void requestExport()}
      >
        {busy ? "جارٍ المعالجة..." : "طلب التصدير"}
      </button>
      {msg ? <p role="status">{msg}</p> : null}
      {requestId ? (
        <p>
          <a
            className="btn btn-outline"
            href={`/api/patient/account/export/${requestId}`}
          >
            تنزيل ملف التصدير
          </a>
        </p>
      ) : null}
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="تصدير بياناتي">
      <Body />
    </PatientPortalPage>
  );
}
