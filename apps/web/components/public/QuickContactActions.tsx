"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import { resolveClinicContact, type ClinicContact } from "../../lib/clinic-contact";
import { pickLocalized } from "../../lib/public-site";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  clinic?: ClinicContact | null;
};

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path
        d="M7.5 3.5h3.2l1.2 4.2-2 1.2a12.5 12.5 0 0 0 5.2 5.2l1.2-2 4.2 1.2v3.2c0 .9-.7 1.7-1.6 1.8A16.5 16.5 0 0 1 3.7 5.1c.1-.9.9-1.6 1.8-1.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path
        d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L4 21l4.8-.7A8.5 8.5 0 1 0 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9.2 9.4c.3-.3.7-.4 1-.2l1.1.7c.3.2.3.6.1.9l-.5.7c.5.9 1.4 1.7 2.4 2.2l.7-.5c.3-.2.7-.2.9.1l.7 1.1c.2.3.1.7-.2 1-.7.6-1.7.8-2.6.5A8.8 8.8 0 0 1 8.7 12c-.3-.9-.1-1.9.5-2.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m4.5 7.5 7.5 5.5 7.5-5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMaps() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function QuickContactActions({ locale, copy, clinic }: Props) {
  const [channels, setChannels] = useState<
    Array<{
      id: string;
      type: string;
      labelAr: string;
      labelEn?: string;
      labelFr?: string;
      value: string;
      publicUrl: string;
    }>
  >([]);
  const [channelsFailed, setChannelsFailed] = useState(false);
  const clinicName = pickLocalized(
    locale,
    clinic?.nameAr || clinic?.clinicNameAr,
    clinic?.nameEn || clinic?.clinicNameEn,
    clinic?.nameFr || clinic?.clinicNameFr,
    "",
  );
  const contact = resolveClinicContact(locale, clinic, clinicName);
  const mapsHref = contact.mapsLink || "";

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public/contact-channels?placement=contact_page", {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("contact channels unavailable");
        return response.json();
      })
      .then((data) => {
        setChannels(Array.isArray(data.channels) ? data.channels : []);
        setChannelsFailed(false);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") {
          setChannelsFailed(true);
        }
      });
    return () => controller.abort();
  }, []);

  const actions = [
    ...channels.map((channel) => ({
      key: channel.id,
      href: channel.publicUrl,
      label:
        locale === "en"
          ? channel.labelEn || channel.labelAr
          : locale === "fr"
            ? channel.labelFr || channel.labelEn || channel.labelAr
            : channel.labelAr,
      support:
        channel.type === "phone"
          ? copy.quickCallSupport
          : channel.type === "whatsapp"
            ? copy.quickWaSupport
            : channel.value,
      icon:
        channel.type === "phone" ? (
          <IconPhone />
        ) : channel.type === "whatsapp" ? (
          <IconWhatsApp />
        ) : channel.type === "email" ? (
          <IconEmail />
        ) : (
          <IconMaps />
        ),
      external: /^https:/i.test(channel.publicUrl),
    })),
    mapsHref
      ? {
          key: "maps",
          href: mapsHref,
          label: copy.directionsLabel,
          support: copy.quickMapsSupport,
          icon: <IconMaps />,
          external: true,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    href: string;
    label: string;
    support: string;
    icon: ReactNode;
    external: boolean;
  }>;

  if (channelsFailed && !mapsHref) {
    return (
      <p className="alert-error" role="status">
        {locale === "ar"
          ? "تعذر تحميل وسائل التواصل حاليًا."
          : locale === "fr"
            ? "Les moyens de contact sont indisponibles."
            : "Contact channels are unavailable."}
      </p>
    );
  }
  if (!actions.length) return null;

  return (
    <nav className="contact-quick-actions" aria-label={copy.contactClinic}>
      <ul className="contact-quick-actions-list">
        {actions.map((action) => (
          <li key={action.key}>
            <a
              className="contact-quick-action"
              href={action.href}
              {...(action.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <span className="contact-quick-action-icon">{action.icon}</span>
              <span className="contact-quick-action-copy">
                <strong>{action.label}</strong>
                <span>{action.support}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
