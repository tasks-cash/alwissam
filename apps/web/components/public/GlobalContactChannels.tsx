"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "../../lib/i18n/config";

type PublicContactChannel = {
  id: string;
  type:
    | "phone"
    | "whatsapp"
    | "viber"
    | "instagram"
    | "messenger"
    | "telegram"
    | "email"
    | "custom";
  labelAr: string;
  labelEn?: string;
  labelFr?: string;
  value: string;
  publicUrl: string;
  icon?: string;
  isPrimary?: boolean;
};

function labelFor(locale: Locale, channel: PublicContactChannel) {
  if (locale === "en") return channel.labelEn || channel.labelAr;
  if (locale === "fr")
    return channel.labelFr || channel.labelEn || channel.labelAr;
  return channel.labelAr;
}

function ChannelIcon({ type }: { type: PublicContactChannel["type"] }) {
  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3H4.8A1.8 1.8 0 0 0 3 4.9C3.5 13.4 10.6 20.5 19.1 21a1.8 1.8 0 0 0 1.9-1.8V17l-4.2-1-1.4 2.1a15.5 15.5 0 0 1-9.5-9.5L8 7.2 7 3Z" />
      </svg>
    );
  }
  if (type === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a9.7 9.7 0 0 0-8.3 14.7L2.5 21.5l4.9-1.2A9.7 9.7 0 1 0 12 2Zm4.7 13.7c-.2.7-1.2 1.3-1.9 1.5-.5.1-1.2.2-3.6-.8-3-1.3-4.9-4.4-5.1-4.6-.1-.2-1.2-1.6-1.2-3s.7-2.2 1-2.5c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.6.6c-.2.2-.4.4-.2.7.2.4.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.4.2.6.1.8-.1l1.1-1.3c.2-.3.5-.3.8-.2l2.2 1c.4.2.6.3.7.5.1.1.1.8-.1 1.6Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function externalProps(url: string) {
  return /^https:/i.test(url)
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

export function GlobalContactChannels({ locale }: { locale: Locale }) {
  const [channels, setChannels] = useState<PublicContactChannel[]>([]);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public/contact-channels?placement=global_floating", {
      signal: controller.signal,
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("contact channels unavailable");
        return response.json() as Promise<{
          channels?: PublicContactChannel[];
        }>;
      })
      .then((data) => {
        setChannels(Array.isArray(data.channels) ? data.channels : []);
        setFailed(false);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function closeOnOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  if (failed) {
    return (
      <p className="contact-float-error" role="status">
        {locale === "ar"
          ? "تعذر تحميل وسائل التواصل حاليًا."
          : locale === "fr"
            ? "Les moyens de contact sont indisponibles."
            : "Contact channels are unavailable."}
      </p>
    );
  }
  if (channels.length === 0) return null;

  const primary = channels.find((channel) => channel.isPrimary) || channels[0]!;
  if (channels.length === 1) {
    return (
      <a
        className={`contact-float contact-float--${primary.type}`}
        href={primary.publicUrl}
        aria-label={labelFor(locale, primary)}
        {...externalProps(primary.publicUrl)}
      >
        <ChannelIcon type={primary.type} />
        <span>{labelFor(locale, primary)}</span>
      </a>
    );
  }

  return (
    <div
      className="contact-float-wrap"
      ref={rootRef}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {open ? (
        <div className="contact-float-menu" id="public-contact-channels">
          {channels.map((channel) => (
            <a
              key={channel.id}
              href={channel.publicUrl}
              {...externalProps(channel.publicUrl)}
            >
              <span className={`contact-channel-icon is-${channel.type}`}>
                <ChannelIcon type={channel.type} />
              </span>
              <span>
                <strong>{labelFor(locale, channel)}</strong>
                <small dir="ltr">{channel.value}</small>
              </span>
            </a>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        className={`contact-float contact-float--${primary.type}`}
        aria-expanded={open}
        aria-controls="public-contact-channels"
        aria-label={labelFor(locale, primary)}
        onClick={() => setOpen((current) => !current)}
      >
        <ChannelIcon type={primary.type} />
        <span>{labelFor(locale, primary)}</span>
      </button>
    </div>
  );
}
