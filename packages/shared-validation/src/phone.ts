import {
  PHONE_MAX_DIGITS,
  PHONE_MIN_DIGITS,
  validationMessagesAr,
} from "./constants";

/** Convert Eastern Arabic / Persian digits to Latin, then strip non-digits. */
export function normalizePhoneDigits(raw: string): string {
  const mapped = raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - "٠".charCodeAt(0)))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - "۰".charCodeAt(0)));
  return mapped.replace(/\D/g, "");
}

/**
 * Phone identifiers: digits only.
 * Reject letters, spaces, +, -, decimals, and scientific notation characters.
 */
export function isPhoneInputFormatAllowed(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  // Only Latin or Eastern Arabic digits (no separators).
  return /^[\d٠-٩۰-۹]+$/.test(trimmed);
}

export function isValidPhoneDigits(raw: string): boolean {
  if (!isPhoneInputFormatAllowed(raw)) return false;
  const digits = normalizePhoneDigits(raw);
  return digits.length >= PHONE_MIN_DIGITS && digits.length <= PHONE_MAX_DIGITS;
}

export function phoneValidationMessage(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return validationMessagesAr.phoneRequired;
  if (!isPhoneInputFormatAllowed(trimmed)) {
    return validationMessagesAr.phoneDigitsOnly;
  }
  const digits = normalizePhoneDigits(trimmed);
  if (digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS) {
    return validationMessagesAr.phoneLength;
  }
  return null;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isEmailLike(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}
