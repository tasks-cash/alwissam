"use client";

import Link from "next/link";
import {
  PatientPortalPage,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";

function Body() {
  const { locale } = usePatientPortal();

  return (
    <article className="card-surface dash-actions patient-policy">
      <h2>ما البيانات التي تُخزَّن؟</h2>
      <p>
        بيانات الحساب، المواعيد المرتبطة بحسابك، والملفات والتعليمات والحالات
        العلاجية المعلمة بأنها مرئية للمريض، والرسائل المتعلقة بالزيارات
        المكتملة، وسجلات الموافقات.
      </p>
      <h2>من يمكنه الوصول؟</h2>
      <p>
        أنت عبر بوابتك، والأطباء والاستقبال المخولون ضمن سير عمل العيادة،
        والمسؤولون وفق الصلاحيات — وليس الجمهور.
      </p>
      <h2>حماية الملفات</h2>
      <p>
        تُعرض الملفات عبر مسارات مصادق عليها بعد التحقق من الملكية والرؤية، دون
        روابط عامة دائمة قابلة للتخمين.
      </p>
      <h2>المراسلة</h2>
      <p>
        المراسلة متاحة فقط بخصوص زيارة مكتملة ومع طبيب معيّن، وليست خدمة
        طوارئ.
      </p>
      <p>
        هذه الصفحة تلخص ممارسات المنصة؛ التفاصيل القانونية الرسمية موجودة في
        سياسة العيادة.
      </p>
      <div className="patient-quick-actions">
        <Link className="btn btn-outline" href={`/${locale}/patient/consents`}>
          الموافقات
        </Link>
        <Link
          className="btn btn-outline"
          href={`/${locale}/patient/account/export`}
        >
          طلب تصدير البيانات
        </Link>
        <Link
          className="btn btn-outline"
          href={`/${locale}/patient/account/delete`}
        >
          طلب حذف الحساب
        </Link>
      </div>
    </article>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="الخصوصية">
      <Body />
    </PatientPortalPage>
  );
}
