import type { Locale } from "./i18n/config";

/** Canonical clinic address used for map embeds when settings leave embed empty. */
export const CLINIC_ADDRESS_DEFAULT_AR =
  "حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009";

/** Canonical short link for the external directions button only (never as iframe src). */
export const CLINIC_DIRECTIONS_URL =
  "https://maps.app.goo.gl/1KtpHq8VWw98enw8A";

const SHORT_MAP_HOST =
  /maps\.app\.goo\.gl|goo\.gl\/|maps\.app\.google\.com/i;

export function isUnsafeMapsIframeSrc(url?: string | null): boolean {
  const value = String(url || "").trim();
  if (!value) return true;
  if (SHORT_MAP_HOST.test(value)) return true;
  if (!/^https:\/\//i.test(value)) return true;
  return false;
}

/** Build a no-API-key Google Maps query embed from a plain address. */
export function buildMapsQueryEmbedUrl(address: string): string {
  const q = address.trim() || CLINIC_ADDRESS_DEFAULT_AR;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=ar`;
}

/**
 * Prefer a stored embed URL when it is valid; otherwise derive from address.
 * Never returns a short goo.gl / maps.app link.
 */
export function resolveMapsEmbedUrl(opts: {
  mapsEmbedUrl?: string | null;
  address?: string | null;
}): string {
  const stored = String(opts.mapsEmbedUrl || "").trim();
  if (stored && !isUnsafeMapsIframeSrc(stored)) {
    return stored;
  }
  return buildMapsQueryEmbedUrl(
    opts.address?.trim() || CLINIC_ADDRESS_DEFAULT_AR,
  );
}

export function resolveDirectionsUrl(mapsLink?: string | null): string {
  const link = String(mapsLink || "").trim();
  return link || CLINIC_DIRECTIONS_URL;
}

export function mapsIframeTitle(locale: Locale): string {
  if (locale === "en") {
    return "Al Wissam Dental Clinic location on Google Maps";
  }
  if (locale === "fr") {
    return "Emplacement de la Clinique Dentaire El Wissam sur Google Maps";
  }
  return "موقع عيادة الوسام لطب الأسنان على خرائط Google";
}

export function mapsFallbackMessage(locale: Locale): string {
  if (locale === "en") {
    return "The map could not load right now. Use the directions button to reach the clinic.";
  }
  if (locale === "fr") {
    return "La carte n’a pas pu se charger pour le moment. Utilisez le bouton d’itinéraire pour rejoindre la clinique.";
  }
  return "تعذر تحميل الخريطة حاليًا. يمكنك استخدام زر الاتجاهات للوصول إلى العيادة.";
}
