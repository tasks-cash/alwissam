"use client";

import Link from "next/link";
import {
  PatientPortalPage,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";

function Body() {
  const { locale } = usePatientPortal();

  return (
    <div className="patient-quick-actions">
      <Link className="btn btn-outline" href={`/${locale}/patient/profile`}>
        المعلومات الشخصية
      </Link>
      <Link className="btn btn-outline" href={`/${locale}/patient/security`}>
        الأمان
      </Link>
      <Link className="btn btn-outline" href={`/${locale}/patient/account/export`}>
        تصدير البيانات
      </Link>
      <Link className="btn btn-outline" href={`/${locale}/patient/account/delete`}>
        طلب حذف الحساب
      </Link>
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="إدارة الحساب">
      <Body />
    </PatientPortalPage>
  );
}
