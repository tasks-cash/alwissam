"use client";

import { useEffect, useState } from "react";
import type { Locale } from "../../lib/i18n/config";

type Channel = {
  id: string;
  labelAr: string;
  labelEn?: string;
  labelFr?: string;
  value: string;
  publicUrl: string;
};

export function PublicContactChannelList({
  locale,
  placement,
}: {
  locale: Locale;
  placement: "footer" | "homepage" | "patient_help" | "booking_page";
}) {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `/api/public/contact-channels?placement=${encodeURIComponent(placement)}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) return { channels: [] };
        return response.json();
      })
      .then((data) =>
        setChannels(Array.isArray(data.channels) ? data.channels : []),
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, [placement]);

  return (
    <>
      {channels.map((channel) => {
        const label =
          locale === "en"
            ? channel.labelEn || channel.labelAr
            : locale === "fr"
              ? channel.labelFr || channel.labelEn || channel.labelAr
              : channel.labelAr;
        const external = /^https:/i.test(channel.publicUrl);
        return (
          <li key={channel.id}>
            <a
              href={channel.publicUrl}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {label}
            </a>
          </li>
        );
      })}
    </>
  );
}
