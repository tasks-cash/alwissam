import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <p style={{ color: "var(--medical-teal)", fontWeight: 700, margin: 0 }}>عيادة الوسام</p>
      <h1 style={{ fontSize: "2rem", color: "var(--primary-navy)", marginTop: "0.5rem" }}>
        الواجهة الهدف (Next.js + NestJS + MongoDB)
      </h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        نماذج المصادقة متصلة بواجهة Nest عبر وكيل `/api`. أكمل بقية الوحدات حسب خطة QA.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
        <Link className="btn btn-primary" href="/staff/login">
          دخول الطاقم
        </Link>
        <Link className="btn btn-outline" href="/patient/login">
          دخول المريض
        </Link>
        <Link className="btn btn-outline" href="/forgot-password">
          استعادة كلمة المرور
        </Link>
      </div>
    </main>
  );
}
