"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  PASSWORD_MIN_LOGIN,
  loginSchema,
} from "@alwisam/shared-validation";
import { PasswordField } from "../../../../components/ui/PasswordField";
import { apiPost } from "../../../../lib/api";

type LoginResponse = {
  ok?: boolean;
  redirectTo?: string;
  error?: string;
  message?: string | string[];
  code?: string;
};

function PatientLoginForm() {
  const params = useParams();
  const locale = String(params?.locale || "ar");
  const router = useRouter();
  const search = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = loginSchema.safeParse({
      identifier,
      password,
      portal: "patient",
      rememberMe,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await apiPost<LoginResponse>("/api/auth/login", {
        identifier: parsed.data.loginId,
        password: parsed.data.password,
        portal: "patient",
        rememberMe,
      });
      if (!ok) {
        const code = data.code || "";
        if (code === "ACCOUNT_DISABLED") {
          setError("تم تعطيل هذا الحساب أو قفله مؤقتًا.");
        } else {
          setError(
            data.error ||
              (Array.isArray(data.message) ? data.message[0] : data.message) ||
              "بيانات الدخول غير صحيحة.",
          );
        }
        return;
      }
      const next = search.get("next");
      const safeNext =
        next && next.startsWith(`/${locale}/patient`) ? next : null;
      router.push(
        safeNext || data.redirectTo || `/${locale}/patient/dashboard`,
      );
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
          src="/images/stock/dental-care-hero.jpg"
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 48vw"
          priority
          className="patient-auth-image"
        />
        <div className="patient-auth-visual-copy">
          <h2>أنشئ حسابك وابقَ على اطلاع بحالتك العلاجية</h2>
          <p>
            من خلال حساب المريض يمكنك متابعة مواعيدك، وحالتك العلاجية، وصورك
            الطبية، وتعليمات الطبيب.
          </p>
          <Link className="btn btn-outline" href={`/${locale}/patient/register`}>
            إنشاء حساب مريض
          </Link>
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        className="patient-auth-form card-surface"
        noValidate
      >
        <h1>تسجيل الدخول إلى حساب المريض</h1>
        <p className="muted">
          ادخل إلى حسابك لمتابعة مواعيدك وحالتك العلاجية وصورك الطبية وتعليمات
          الطبيب.
        </p>
        {error ? (
          <div className="alert-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="identifier">
            رقم الهاتف أو البريد الإلكتروني <span className="required">*</span>
          </label>
          <input
            id="identifier"
            className="input"
            name="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            dir="ltr"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">
            كلمة المرور <span className="required">*</span>
          </label>
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
            minLength={PASSWORD_MIN_LOGIN}
          />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>تذكرني</span>
        </label>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        <p>
          <Link href={`/${locale}/forgot-password`}>نسيت كلمة المرور؟</Link>
          {" · "}
          <Link href={`/${locale}/patient/register`}>إنشاء حساب جديد</Link>
          {" · "}
          <Link href={`/${locale}`}>العودة إلى الصفحة الرئيسية</Link>
        </p>
      </form>
    </main>
  );
}

export default function PatientLoginPage() {
  return (
    <Suspense fallback={<main className="patient-auth-layout">...</main>}>
      <PatientLoginForm />
    </Suspense>
  );
}
