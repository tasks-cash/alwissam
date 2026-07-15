"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";
import type { Dictionary } from "../../lib/i18n/dictionaries";
import type { Locale } from "../../lib/i18n/config";
import { getPublicCopy } from "../../lib/i18n/public-copy";
import {
  buildWhatsAppUrl,
  facebookAriaLabel,
  resolveClinicContact,
  type ClinicContact,
} from "../../lib/clinic-contact";
import { BidiSafeValue } from "./BidiSafeValue";
import { GlobalWhatsAppButton } from "./GlobalWhatsAppButton";

type Props = {
  locale: Locale;
  dict: Dictionary;
  brand?: string;
  children: ReactNode;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  clinic?: ClinicContact | null;
  whatsappMessage?: string;
};

function ClinicMark({ name }: { name: string }) {
  return (
    <span className="clinic-mark" aria-hidden>
      <svg viewBox="0 0 40 40" width="36" height="36">
        <circle cx="20" cy="20" r="18" fill="#0B7A68" opacity="0.14" />
        <path
          d="M20 8c-3 4-5 7-5 11a5 5 0 0 0 10 0c0-4-2-7-5-11Z"
          fill="#0B7A68"
        />
        <path
          d="M13 22c2 6 4 9 7 10 3-1 5-4 7-10"
          fill="none"
          stroke="#14241F"
          strokeWidth="1.6"
        />
      </svg>
      <span className="sr-only">{name}</span>
    </span>
  );
}

export function PublicChrome({
  locale,
  dict,
  brand,
  children,
  phone,
  email,
  address,
  hours,
  clinic,
  whatsappMessage,
}: Props) {
  const copy = getPublicCopy(locale);
  const name = brand || dict.brand;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const year = new Date().getFullYear();
  const contact = resolveClinicContact(
    locale,
    {
      ...clinic,
      phone: clinic?.phone || phone,
      email: clinic?.email || email,
      address: clinic?.address || address,
      addressAr: clinic?.addressAr || address,
    },
    name,
  );
  const displayHours = contact.hours || hours || "";
  const waHref = contact.whatsappEnabled
    ? buildWhatsAppUrl(locale, {
        ...clinic,
        whatsappNumber: contact.whatsappNumber,
        whatsappEnabled: true,
      })
    : "";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const links = [
    { href: `/${locale}`, label: copy.navHome },
    { href: `/${locale}/about`, label: copy.navAbout },
    { href: `/${locale}/services`, label: copy.navServices },
    { href: `/${locale}/specialties`, label: copy.navSpecialties },
    { href: `/${locale}/doctors`, label: copy.navDoctors },
    { href: `/${locale}/reviews`, label: copy.navReviews },
    { href: `/${locale}/faq`, label: copy.navFaq },
    { href: `/${locale}/contact`, label: copy.navContact },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== `/${locale}` && pathname.startsWith(`${href}/`));

  return (
    <div className="public-shell">
      <header className="public-header">
        <Link href={`/${locale}`} className="public-brand">
          <ClinicMark name={name} />
          <span>
            <strong>{name}</strong>
            <span>{dict.brandSubtitle}</span>
          </span>
        </Link>

        <nav className="public-nav desktop-only" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "active" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="public-header-actions">
          <Suspense fallback={<div className="lang-switcher" aria-hidden />}>
            <LanguageSwitcher locale={locale} label={dict.language} />
          </Suspense>
          <Link className="btn btn-primary public-book-btn" href={`/${locale}/book-appointment`}>
            {copy.navBook}
          </Link>
          <button
            type="button"
            className="btn btn-outline mobile-only"
            aria-expanded={open}
            aria-controls="public-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? copy.closeMenu : copy.openMenu}
          </button>
        </div>
      </header>

      {open ? (
        <div
          id="public-mobile-nav"
          className="public-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={copy.openMenu}
        >
          <nav className="public-mobile-nav">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : undefined}>
                {l.label}
              </Link>
            ))}
            <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
              {copy.navBook}
            </Link>
          </nav>
          <button
            type="button"
            className="public-mobile-backdrop"
            aria-label={copy.closeMenu}
            onClick={() => setOpen(false)}
          />
        </div>
      ) : null}

      <div className="public-main">{children}</div>

      <footer className="public-footer-xl">
        <div className="public-footer-grid">
          <div>
            <h2>{copy.footerClinic}</h2>
            <p>{dict.brandSubtitle}</p>
            <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
              {copy.navBook}
            </Link>
          </div>
          <div>
            <h2>{copy.footerQuick}</h2>
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{copy.footerPatients}</h2>
            <ul>
              <li>
                <Link href={`/${locale}/patient-information`}>{copy.patientInfo}</Link>
              </li>
              <li>
                <Link href={`/${locale}/before-your-visit`}>{copy.beforeVisit}</Link>
              </li>
              <li>
                <Link href={`/${locale}/after-your-visit`}>{copy.afterVisit}</Link>
              </li>
              <li>
                <Link href={`/${locale}/support`}>{copy.support}</Link>
              </li>
              <li>
                <Link href={`/${locale}/refund-policy`}>{copy.refund}</Link>
              </li>
              <li>
                <Link href={`/${locale}/cancellation-policy`}>{copy.cancellation}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>{copy.footerLegal}</h2>
            <ul>
              <li>
                <Link href={`/${locale}/privacy`}>{copy.privacy}</Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`}>{copy.terms}</Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`}>{copy.cookies}</Link>
              </li>
              <li>
                <Link href={`/${locale}/accessibility`}>{copy.accessibility}</Link>
              </li>
              <li>
                <Link href={`/${locale}/medical-disclaimer`}>{copy.disclaimer}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>{copy.footerContact}</h2>
            <ul>
              {contact.phoneDisplay && contact.phoneTel ? (
                <li>
                  <a href={contact.phoneTel}>
                    <BidiSafeValue>{contact.phoneDisplay}</BidiSafeValue>
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`}>
                    <BidiSafeValue>{contact.email}</BidiSafeValue>
                  </a>
                </li>
              ) : null}
              {contact.address ? <li>{contact.address}</li> : null}
              {displayHours ? (
                <li className="working-hours-footer" style={{ whiteSpace: "pre-line" }}>
                  <BidiSafeValue>{displayHours}</BidiSafeValue>
                </li>
              ) : null}
              {waHref ? (
                <li>
                  <a href={waHref} target="_blank" rel="noopener noreferrer">
                    {copy.whatsappLabel}
                  </a>
                </li>
              ) : null}
              {contact.facebookUrl ? (
                <li>
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={facebookAriaLabel(locale)}
                  >
                    {copy.facebookLabel}
                  </a>
                </li>
              ) : null}
              <li>
                <Link href={`/${locale}/contact`}>{copy.navContact}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="public-footer-bottom">
          <span>
            © {year} {name}
          </span>
          <div className="public-footer-bottom-links">
            <Link href={`/${locale}/privacy`}>{copy.privacy}</Link>
            <Link href={`/${locale}/terms`}>{copy.terms}</Link>
            <Suspense fallback={null}>
              <LanguageSwitcher locale={locale} label={dict.language} />
            </Suspense>
          </div>
        </div>
      </footer>

      <GlobalWhatsAppButton
        locale={locale}
        clinic={{
          ...clinic,
          phone: clinic?.phone || phone,
          whatsappNumber: contact.whatsappNumber,
          whatsappEnabled: contact.whatsappEnabled,
        }}
        message={whatsappMessage}
      />
    </div>
  );
}
