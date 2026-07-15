import type { Locale } from "./i18n/config";
import type { PublicSitePayload } from "./public-site";
import { localizedWorkingHours, pickLocalized } from "./public-site";

export type ClinicContact = NonNullable<PublicSitePayload["clinic"]>;

export type ResolvedClinicContact = {
  phoneRaw: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  address: string;
  hours: string;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  facebookUrl: string;
  mapsEmbedUrl: string;
  mapsLink: string;
  name: string;
};

const DEFAULT_WHATSAPP_MESSAGES: Record<Locale, string> = {
  ar: "مرحبًا، أريد الاستفسار عن خدمات عيادة الوسام لطب الأسنان وحجز موعد.",
  en: "Hello, I would like to ask about Al Wissam Dental Clinic services and book an appointment.",
  fr: "Bonjour, je souhaite obtenir des informations sur les services de la Clinique Dentaire El Wissam et prendre rendez-vous.",
};

export function localizedAddress(
  locale: Locale,
  clinic?: ClinicContact | null,
): string {
  if (!clinic) return "";
  return pickLocalized(
    locale,
    clinic.addressAr || clinic.address,
    clinic.addressEn,
    clinic.addressFr,
    clinic.address || "",
  );
}

export function formatPhoneDisplay(phone?: string, display?: string): string {
  if (display?.trim()) return display.trim();
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits === "0663098208" || digits === "213663098208") {
    return "0663 09 82 08";
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }
  return phone || "";
}

export function phoneTelHref(clinic?: ClinicContact | null): string {
  if (!clinic) return "";
  if (clinic.telephoneUrl?.startsWith("tel:")) return clinic.telephoneUrl;
  const intl = String(clinic.phoneInternational || "").trim();
  if (intl) return `tel:${intl.replace(/\s/g, "")}`;
  const digits = String(clinic.phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("213")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+213${digits.slice(1)}`;
  return `tel:+${digits}`;
}

export function normalizeWhatsappNumber(clinic?: ClinicContact | null): string {
  if (!clinic) return "";
  const raw = String(
    clinic.whatsappNumber || clinic.phoneInternational || clinic.phone || "",
  ).replace(/\D/g, "");
  if (!raw) return "";
  if (raw.startsWith("213")) return raw;
  if (raw.startsWith("0")) return `213${raw.slice(1)}`;
  return raw;
}

export function buildWhatsAppUrl(
  locale: Locale,
  clinic?: ClinicContact | null,
  message?: string,
): string {
  const number = normalizeWhatsappNumber(clinic);
  if (!number) return "";
  const text = message?.trim() || DEFAULT_WHATSAPP_MESSAGES[locale];
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export type WhatsAppContext =
  | { kind: "doctor"; name: string }
  | { kind: "service"; name: string }
  | { kind: "specialty"; name: string }
  | { kind: "booking" }
  | { kind: "confirmation"; publicReference: string };

export function contextualWhatsAppMessage(
  locale: Locale,
  context?: WhatsAppContext | null,
): string {
  if (!context) return DEFAULT_WHATSAPP_MESSAGES[locale];
  if (context.kind === "doctor" && context.name.trim()) {
    if (locale === "en") {
      return `Hello, I would like to ask about Dr. ${context.name} and book an appointment.`;
    }
    if (locale === "fr") {
      return `Bonjour, je souhaite obtenir des informations sur le Dr ${context.name} et prendre rendez-vous.`;
    }
    return `مرحبًا، أريد الاستفسار عن الطبيب ${context.name} وحجز موعد.`;
  }
  if (context.kind === "service" && context.name.trim()) {
    if (locale === "en") {
      return `Hello, I would like to ask about the ${context.name} service and book an appointment.`;
    }
    if (locale === "fr") {
      return `Bonjour, je souhaite obtenir des informations sur le service ${context.name} et prendre rendez-vous.`;
    }
    return `مرحبًا، أريد الاستفسار عن خدمة ${context.name} وحجز موعد.`;
  }
  if (context.kind === "specialty" && context.name.trim()) {
    if (locale === "en") {
      return `Hello, I would like to ask about the ${context.name} specialty and book an appointment.`;
    }
    if (locale === "fr") {
      return `Bonjour, je souhaite obtenir des informations sur la spécialité ${context.name} et prendre rendez-vous.`;
    }
    return `مرحبًا، أريد الاستفسار عن تخصص ${context.name} وحجز موعد.`;
  }
  if (context.kind === "booking") {
    if (locale === "en") {
      return "Hello, I need help with booking an appointment at Al Wissam Dental Clinic.";
    }
    if (locale === "fr") {
      return "Bonjour, j’ai besoin d’aide pour prendre rendez-vous à la Clinique Dentaire El Wissam.";
    }
    return "مرحبًا، أحتاج إلى مساعدة بخصوص حجز موعد في عيادة الوسام.";
  }
  if (context.kind === "confirmation" && context.publicReference.trim()) {
    if (locale === "en") {
      return `Hello, I would like to ask about booking request ${context.publicReference}.`;
    }
    if (locale === "fr") {
      return `Bonjour, je souhaite obtenir des informations concernant la demande de rendez-vous ${context.publicReference}.`;
    }
    return `مرحبًا، أريد الاستفسار بخصوص طلب الحجز رقم ${context.publicReference}.`;
  }
  return DEFAULT_WHATSAPP_MESSAGES[locale];
}

export function resolveClinicContact(
  locale: Locale,
  clinic?: ClinicContact | null,
  clinicName = "",
): ResolvedClinicContact {
  const whatsappNumber = normalizeWhatsappNumber(clinic);
  const enabled =
    clinic?.whatsappEnabled !== false && Boolean(whatsappNumber);
  return {
    phoneRaw: String(clinic?.phone || ""),
    phoneDisplay: formatPhoneDisplay(clinic?.phone, clinic?.phoneDisplay),
    phoneTel: phoneTelHref(clinic),
    email: String(clinic?.email || clinic?.publicEmail || "").trim(),
    address: localizedAddress(locale, clinic),
    hours: localizedWorkingHours(locale, clinic || undefined),
    whatsappNumber,
    whatsappEnabled: enabled,
    facebookUrl: String(clinic?.facebookUrl || "").trim(),
    mapsEmbedUrl: String(clinic?.mapsEmbedUrl || clinic?.mapUrl || "").trim(),
    mapsLink: String(clinic?.mapsLink || clinic?.directionsUrl || "").trim(),
    name: clinicName,
  };
}

export function whatsappAriaLabel(locale: Locale): string {
  if (locale === "en") {
    return "Open a WhatsApp conversation with Al Wissam Dental Clinic";
  }
  if (locale === "fr") {
    return "Ouvrir une conversation WhatsApp avec la Clinique Dentaire El Wissam";
  }
  return "فتح محادثة واتساب مع عيادة الوسام لطب الأسنان";
}

export function whatsappButtonLabel(locale: Locale): string {
  if (locale === "en") return "Contact us on WhatsApp";
  if (locale === "fr") return "Contactez-nous sur WhatsApp";
  return "تواصل معنا عبر واتساب";
}

export function facebookAriaLabel(locale: Locale): string {
  if (locale === "en") {
    return "Visit Al Wissam Dental Clinic on Facebook";
  }
  if (locale === "fr") {
    return "Visiter la page Facebook de la Clinique Dentaire El Wissam";
  }
  return "زيارة صفحة عيادة الوسام على فيسبوك";
}
