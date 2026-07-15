/** Phone / WhatsApp normalization for Algeria clinic public contact. */

export function formatClinicPhoneDisplay(
  phone?: string,
  display?: string,
): string {
  if (display?.trim()) return display.trim();
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits === "0663098208" || digits === "213663098208") {
    return "0663 09 82 08";
  }
  return phone || "";
}

export function toInternationalAlgeriaPhone(phone?: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("213")) return `+${digits}`;
  if (digits.startsWith("0")) return `+213${digits.slice(1)}`;
  return `+${digits}`;
}

export function toWhatsAppNumber(phoneOrWhatsapp?: string): string {
  const digits = String(phoneOrWhatsapp || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("213")) return digits;
  if (digits.startsWith("0")) return `213${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const n = toWhatsAppNumber(number);
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
