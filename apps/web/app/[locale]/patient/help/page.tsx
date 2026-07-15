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
      <h2>كيف تستخدم لوحة التحكم؟</h2>
      <p>
        من القائمة الجانبية يمكنك فتح المواعيد والحالات والملفات والرسائل
        والمتابعة والإعدادات.
      </p>
      <h2>لماذا الرسائل مرتبطة بالزيارات المكتملة؟</h2>
      <p>
        لحماية الخصوصية وضمان أن المحادثة مرتبطة برعاية فعلية مع الطبيب
        المعيّن — وليست تشخيصًا عامًا أو طوارئ.
      </p>
      <p className="alert-error">
        في حالة النزيف الشديد أو تورم الوجه أو صعوبة التنفس أو البلع أو الألم
        غير المحتمل، تواصل مع العيادة فورًا أو اطلب الرعاية العاجلة المناسبة.
      </p>
      <div className="patient-quick-actions">
        <Link className="btn btn-primary" href={`/${locale}/contact`}>
          صفحة التواصل
        </Link>
        <Link className="btn btn-outline" href={`/${locale}/book-appointment`}>
          حجز موعد
        </Link>
        <Link className="btn btn-outline" href={`/${locale}/faq`}>
          الأسئلة الشائعة
        </Link>
      </div>
    </article>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="المساعدة والدعم">
      <Body />
    </PatientPortalPage>
  );
}
