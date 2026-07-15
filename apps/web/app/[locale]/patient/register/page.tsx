"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  PASSWORD_MIN_CREATE,
  omitConfirmPassword,
  registerPatientSchema,
} from "@alwisam/shared-validation";
import { PasswordField } from "../../../../components/ui/PasswordField";
import { apiPost } from "../../../../lib/api";

type RegisterResponse = {
  ok?: boolean;
  redirectTo?: string;
  error?: string;
  message?: string | string[];
};

function strengthScore(password: string) {
  let score = 0;
  if (password.length >= PASSWORD_MIN_CREATE) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function PatientRegisterPage() {
  const params = useParams();
  const locale = String(params?.locale || "ar");
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const score = useMemo(() => strengthScore(password), [password]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = registerPatientSchema.safeParse({
      fullName,
      phone,
      email: email || undefined,
      password,
      confirmPassword,
      locale: locale as "ar" | "en" | "fr",
      privacyAccepted: privacyAccepted || undefined,
      termsAccepted: termsAccepted || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }
    setLoading(true);
    try {
      const payload = omitConfirmPassword(parsed.data);
      const { ok, data } = await apiPost<RegisterResponse>("/api/auth/register", {
        ...payload,
        confirmPassword: parsed.data.confirmPassword,
        privacyAccepted: true,
        termsAccepted: true,
      });
      if (!ok) {
        setError(
          data.error ||
            (Array.isArray(data.message) ? data.message[0] : data.message) ||
            "تعذر إنشاء الحساب",
        );
        return;
      }
      router.push(data.redirectTo || `/${locale}/patient/dashboard`);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="patient-auth-layout">
      <div className="patient-auth-visual">
        <Image
          src="/images/stock/dental-clinic-interior.jpg"
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 48vw"
          priority
          className="patient-auth-image"
        />
        <div className="patient-auth-visual-copy">
          <h2>أنشئ حسابك وابقَ على اطلاع بحالتك العلاجية</h2>
          <p>
            من خلال حساب المريض يمكنك متابعة مواعيدك، والاطلاع على زياراتك السابقة،
            وحفظ صورك وتقاريرك الطبية، ومراجعة تعليمات الطبيب دون نسيان تفاصيل حالتك.
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="patient-auth-form card-surface" noValidate>
        <h1>أنشئ حسابك واحتفظ بمتابعة حالتك الطبية</h1>
        <p className="muted">
          يساعدك حساب المريض على متابعة مواعيدك وحالتك العلاجية وصورك الطبية وتعليمات
          الطبيب دون نسيان تفاصيل زياراتك السابقة.
        </p>
        {error ? <div className="alert-error" role="alert">{error}</div> : null}

        <div className="field">
          <label htmlFor="fullName">الاسم الكامل <span className="required">*</span></label>
          <input id="fullName" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="phone">رقم الهاتف <span className="required">*</span></label>
          <input id="phone" className="input" type="text" inputMode="numeric" autoComplete="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="email">البريد الإلكتروني (اختياري)</label>
          <input id="email" className="input" type="email" autoComplete="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">كلمة المرور <span className="required">*</span></label>
          <PasswordField id="password" value={password} onChange={setPassword} autoComplete="new-password" required minLength={PASSWORD_MIN_CREATE} />
          <div className="password-strength" aria-hidden>
            <span data-active={score >= 1} /><span data-active={score >= 2} /><span data-active={score >= 3} /><span data-active={score >= 4} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">تأكيد كلمة المرور <span className="required">*</span></label>
          <PasswordField id="confirmPassword" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" required minLength={PASSWORD_MIN_CREATE} />
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} />
          <span>أوافق على سياسة الخصوصية</span>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
          <span>أوافق على شروط الاستخدام</span>
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب مريض"}
        </button>
        <p>
          لديك حساب؟ <Link href={`/${locale}/patient/login`}>تسجيل الدخول</Link>
          {" · "}
          <Link href={`/${locale}`}>العودة إلى الصفحة الرئيسية</Link>
        </p>
      </form>
    </main>
  );
}
