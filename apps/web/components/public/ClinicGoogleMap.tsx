"use client";

import { useState } from "react";
import type { Locale } from "../../lib/i18n/config";
import {
  mapsFallbackMessage,
  mapsIframeTitle,
  resolveDirectionsUrl,
  resolveMapsEmbedUrl,
} from "../../lib/maps";
import { ClinicDirectionsButton } from "./ClinicDirectionsButton";
import type { PublicCopy } from "../../lib/i18n/public-copy";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  address?: string | null;
  mapsEmbedUrl?: string | null;
  mapsLink?: string | null;
  className?: string;
  /** Show the directions CTA under the map when the iframe fails. */
  showFallbackDirections?: boolean;
};

/**
 * Visible Google Maps embed. Short maps.app links are never used as iframe src.
 */
export function ClinicGoogleMap({
  locale,
  copy,
  address,
  mapsEmbedUrl,
  mapsLink,
  className = "",
  showFallbackDirections = true,
}: Props) {
  const [failed, setFailed] = useState(false);
  const embedSrc = resolveMapsEmbedUrl({ mapsEmbedUrl, address });
  const directions = resolveDirectionsUrl(mapsLink);
  const title = mapsIframeTitle(locale);

  if (failed) {
    return (
      <div className={`clinic-google-map clinic-google-map--fallback ${className}`.trim()}>
        <p className="clinic-google-map-fallback-text">
          {mapsFallbackMessage(locale)}
        </p>
        {showFallbackDirections ? (
          <ClinicDirectionsButton
            locale={locale}
            copy={copy}
            href={directions}
            className="btn btn-primary clinic-directions-btn"
            label={copy.openDirectionsMaps}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={`clinic-google-map ${className}`.trim()}>
      <iframe
        title={title}
        src={embedSrc}
        className="clinic-google-map-frame"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        onError={() => setFailed(true)}
      />
    </div>
  );
}
