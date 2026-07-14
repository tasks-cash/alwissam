/** Simple className join (cn-like stub without clsx/tailwind-merge). */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}

const LATN = { numberingSystem: "latn" as const };

/**
 * Format amount as Algerian Dinar, matching legacy semantics:
 * Latin digits via ar-DZ Intl + " د.ج" suffix.
 */
export function formatCurrencyDZD(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const formatted = new Intl.NumberFormat("ar-DZ", LATN).format(
    Number.isFinite(value) ? value : 0,
  );
  return `${toLatinDigits(formatted)} د.ج`;
}

/** Convert Arabic/Persian digits to Western 0-9 (legacy parity). */
export function toLatinDigits(input: string | number): string {
  return String(input)
    .replace(/[٠-٩]/g, (d) => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)]!)
    .replace(/[۰-۹]/g, (d) => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)]!);
}
