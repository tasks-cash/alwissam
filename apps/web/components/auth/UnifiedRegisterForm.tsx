"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  PASSWORD_MIN_CREATE,
  registerPatientSchema,
} from "@alwisam/shared-validation";
import { PasswordField } from "../ui/PasswordField";
import { PhoneField } from "../ui/PhoneField";
import { apiErrorMessage, apiPost } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";
import { getUnifiedAuthCopy } from "../../lib/i18n/unified-auth-copy";
import { AuthVisualPanel } from "./AuthVisualPanel";

type Props = { locale: Locale };

type InviteInfo = {
  role: "DOCTOR" | "SECRETARY";
  email?: string;
  phoneCanonical?: string;
  fullName?: string;
  mode: string;
};

function strengthScore(password: string) {
  let score = 0;
  if (password.length >= PASSWORD_MIN_CREATE) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function UnifiedRegisterForm({ locale }: Props) {
  const copy = getUnifiedAuthCopy(locale);
  const router = useRouter();
  const search = useSearchParams();
  const invitation = search.get("invitation") || "";
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(!!invitation);

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

  useEffect(() => {
    if (!invitation) {
      setInviteLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setInviteLoading(true);
      try {
        const res = await fetch(
          `/api/auth/invitations/${encodeURIComponent(invitation)}/validate`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setInviteError(data.message || copy.invitationInvalid);
          setInvite(null);
          return;
        }
        const inv = data.invitation as InviteInfo;
        setInvite(inv);
        if (inv.fullName) setFullName(inv.fullName);
        if (inv.email) setEmail(inv.email);
        if (inv.phoneCanonical) setPhone(inv.phoneCanonical);
      } catch {
        if (!cancelled) setInviteError(copy.invitationInvalid);
      } finally {
        if (!cancelled) setInviteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [copy.invitationInvalid, invitation]);

  const roleMode = !invitation
    ? "patient"
    : invite?.role === "DOCTOR"
      ? "doctor"
      : invite?.role === "SECRETARY"
        ? "secretary"
        : "pending";

  const title =
    roleMode === "doctor"
      ? copy.registerDoctorTitle
      : roleMode === "secretary"
        ? copy.registerSecretaryTitle
        : copy.registerPatientTitle;

  const lead =
    roleMode === "doctor"
      ? copy.registerDoctorLead
      : roleMode === "secretary"
        ? copy.registerSecretaryLead
        : copy.registerPatientLead;

  const modeBadge =
    roleMode === "doctor"
      ? copy.registerDoctorMode
      : roleMode === "secretary"
        ? copy.registerSecretaryMode
        : copy.registerPatientMode;

  const visual =
    roleMode === "doctor"
      ? {
          benefitsTitle: copy.doctorBenefitsTitle,
          benefits: copy.doctorBenefits,
        }
      : roleMode === "secretary"
        ? {
            benefitsTitle: copy.secretaryBenefitsTitle,
            benefits: copy.secretaryBenefits,
          }
        : {
            benefitsTitle: copy.patientBenefitsTitle,
            benefits: copy.patientBenefits,
          };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (invitation && !invite) {
      setError(copy.invitationInvalid);
      return;
    }

    setLoading(true);
    try {
      if (invitation && invite) {
        const { ok, data } = await apiPost<{ redirectTo?: string }>(
          "/api/auth/register/invitation",
          {
            invitationToken: invitation,
            fullName,
            phone,
            email: email || undefined,
            password,
            confirmPassword,
            locale,
            privacyAccepted,
            termsAccepted,
          },
        );
        if (!ok) {
          setError(apiErrorMessage(data));
          return;
        }
        const redirect =
          data.redirectTo?.replace(/^\/(ar|en|fr)/, `/${locale}`) ||
          `/${locale}/auth/account-created`;
        router.push(redirect);
        router.refresh();
        return;
      }

      const parsed = registerPatientSchema.safeParse({
        fullName,
        phone,
        email: email || undefined,
        password,
        confirmPassword,
        locale,
        privacyAccepted: privacyAccepted || undefined,
        termsAccepted: termsAccepted || undefined,
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Invalid data");
        return;
      }
      const { ok, data } = await apiPost<{ redirectTo?: string }>(
        "/api/auth/register",
        {
          ...parsed.data,
          privacyAccepted: true,
          termsAccepted: true,
        },
      );
      if (!ok) {
        setError(apiErrorMessage(data));
        return;
      }
      router.push(
        data.redirectTo?.replace(/^\/(ar|en|fr)/, `/${locale}`) ||
          `/${locale}/patient/dashboard`,
      );
      router.refresh();
    } catch {
      setError("تعذر إكمال العملية حاليًا. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  if (inviteLoading) {
    return (
      <div className="patient-auth-layout patient-auth-layout--premium">
        <div className="patient-auth-form card-surface" aria-busy="true">
          <header className="patient-auth-form-header">
            <h1>{copy.registerTitle}</h1>
            <p className="patient-auth-lead">{copy.invitationLoading}</p>
          </header>
        </div>
        <div className="patient-auth-visual patient-auth-visual--pending" aria-hidden>
          <div className="patient-auth-visual-copy">
            <p className="patient-auth-overlay-title">{copy.registerOverlay}</p>
          </div>
        </div>
      </div>
    );
  }

  if (invitation && inviteError) {
    return (
      <div className="patient-auth-layout patient-auth-layout--single patient-auth-layout--premium">
        <div className="patient-auth-form card-surface">
          <header className="patient-auth-form-header">
            <h1>{copy.registerTitle}</h1>
          </header>
          <div className="alert-error" role="alert">
            {inviteError}
          </div>
          <p className="patient-auth-switch">
            <Link className="btn btn-outline" href={`/${locale}/auth/login`}>
              {copy.loginLink}
            </Link>
          </p>
          <p className="patient-auth-home">
            <Link href={`/${locale}`}>{copy.homeLink}</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-auth-layout patient-auth-layout--premium">
      <form
        className="patient-auth-form card-surface"
        onSubmit={onSubmit}
        noValidate
        aria-labelledby="unified-register-title"
      >
        <header className="patient-auth-form-header">
          <p className="patient-auth-mode-badge">{modeBadge}</p>
          <h1 id="unified-register-title">{title}</h1>
          <p className="patient-auth-lead">{lead}</p>
        </header>

        {error ? (
          <div className="alert-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="fullName">
            {copy.fullName} <span className="required">*</span>
          </label>
          <input
            id="fullName"
            className="input"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="phone">
            {copy.phone} <span className="required">*</span>
          </label>
          <PhoneField
            id="phone"
            value={phone}
            onChange={setPhone}
            required
            disabled={!!invite?.phoneCanonical}
          />
        </div>
        <div className="field">
          <label htmlFor="email">{copy.emailOptional}</label>
          <input
            id="email"
            className="input"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!invite?.email}
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">
            {copy.password} <span className="required">*</span>
          </label>
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            required
            minLength={PASSWORD_MIN_CREATE}
            autoComplete="new-password"
          />
          <div className="password-strength" aria-hidden>
            <span data-active={score >= 1} />
            <span data-active={score >= 2} />
            <span data-active={score >= 3} />
            <span data-active={score >= 4} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">
            {copy.confirmPassword} <span className="required">*</span>
          </label>
          <PasswordField
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            minLength={PASSWORD_MIN_CREATE}
            autoComplete="new-password"
          />
        </div>
        <label className="checkbox-row" htmlFor="privacy">
          <input
            id="privacy"
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
          />
          <span>
            {copy.privacyAgree} (
            <Link href={`/${locale}/privacy`}>
              {locale === "en"
                ? "Privacy"
                : locale === "fr"
                  ? "Confidentialité"
                  : "الخصوصية"}
            </Link>
            )
          </span>
        </label>
        <label className="checkbox-row" htmlFor="terms">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <span>{copy.termsAgree}</span>
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? copy.registerSubmitting : copy.registerSubmit}
        </button>
        <p className="patient-auth-switch muted">
          {copy.hasAccount}{" "}
          <Link href={`/${locale}/auth/login`}>{copy.loginLink}</Link>
        </p>
        <p className="patient-auth-home">
          <Link href={`/${locale}`}>{copy.homeLink}</Link>
        </p>
      </form>

      <AuthVisualPanel
        imageSrc="/images/stock/dental-clinic-interior.jpg"
        imageAlt={copy.registerImageAlt}
        overlayTitle={copy.registerOverlay}
        benefitsTitle={visual.benefitsTitle}
        benefits={visual.benefits}
        securityNote={copy.registerSecurityNote}
        priority
      />
    </div>
  );
}
