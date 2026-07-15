import type { Locale } from "./i18n/config";
import type { PublicDoctor } from "./public-site";

const DAY_ORDER = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;

type DayCode = (typeof DAY_ORDER)[number];

const DAY_LABELS: Record<Locale, Record<DayCode, string>> = {
  ar: {
    SATURDAY: "السبت",
    SUNDAY: "الأحد",
    MONDAY: "الإثنين",
    TUESDAY: "الثلاثاء",
    WEDNESDAY: "الأربعاء",
    THURSDAY: "الخميس",
    FRIDAY: "الجمعة",
  },
  en: {
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
  },
  fr: {
    SATURDAY: "samedi",
    SUNDAY: "dimanche",
    MONDAY: "lundi",
    TUESDAY: "mardi",
    WEDNESDAY: "mercredi",
    THURSDAY: "jeudi",
    FRIDAY: "vendredi",
  },
};

function normalizeDay(raw: string): DayCode | null {
  const key = raw.trim().toUpperCase();
  return (DAY_ORDER as readonly string[]).includes(key)
    ? (key as DayCode)
    : null;
}

function labelWorkingDaysPrefix(locale: Locale) {
  if (locale === "en") return "Working days";
  if (locale === "fr") return "Jours de travail";
  return "أيام العمل";
}

function unpublishedSchedule(locale: Locale) {
  if (locale === "en") return "Working hours are not published yet.";
  if (locale === "fr") return "Les horaires ne sont pas publiés pour le moment.";
  return "جدول العمل غير منشور حاليًا";
}

/**
 * Compact localized schedule for doctor cards.
 * Never emits raw English enums like SATURDAY on Arabic pages.
 */
export function localizedDoctorScheduleSummary(
  locale: Locale,
  doctor: PublicDoctor,
): string {
  const rows = (doctor.workingHours || []).filter(
    (d) => d?.isActive !== false && d?.dayOfWeek,
  );
  if (!rows.length) return unpublishedSchedule(locale);

  const days = [
    ...new Set(
      rows
        .map((r) => normalizeDay(r.dayOfWeek))
        .filter((d): d is DayCode => Boolean(d)),
    ),
  ].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  if (!days.length) return unpublishedSchedule(locale);

  const labels = DAY_LABELS[locale];
  const satThu = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"] as DayCode[];
  const isSatThu =
    days.length === 6 && satThu.every((d) => days.includes(d));

  let dayPart: string;
  if (isSatThu) {
    dayPart =
      locale === "en"
        ? "Saturday to Thursday"
        : locale === "fr"
          ? "du samedi au jeudi"
          : "من السبت إلى الخميس";
  } else if (days.length === 1) {
    dayPart = labels[days[0]!];
  } else {
    dayPart = days.map((d) => labels[d]).join(locale === "ar" ? "، " : ", ");
  }

  const times = rows
    .map((r) => ({
      start: String(r.startTime || "").trim(),
      end: String(r.endTime || "").trim(),
    }))
    .filter((t) => t.start && t.end);
  const uniqueTimes = [
    ...new Set(times.map((t) => `${t.start}–${t.end}`)),
  ];

  const prefix = labelWorkingDaysPrefix(locale);
  if (uniqueTimes.length === 1) {
    return `${prefix}: ${dayPart} · ${uniqueTimes[0]}`;
  }
  return `${prefix}: ${dayPart}`;
}
