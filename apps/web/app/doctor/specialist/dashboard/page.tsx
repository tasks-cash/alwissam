import { LogoutButton } from "../../../../components/auth/LogoutButton";

export default function SpecialistDashboardPlaceholder() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
        <h1 style={{ margin: 0, color: "var(--primary-navy)" }}>لوحة الطبيبة / الإدارة</h1>
        <LogoutButton />
      </div>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        هذه صفحة مؤقتة بعد نجاح تسجيل الدخول عبر Nest + Mongo. سيتم استبدالها بمسارات
        الاستقبال والفحص في الخطوات التالية — وليست صفحة منتج نهائية فارغة الأزرار.
      </p>
    </main>
  );
}
