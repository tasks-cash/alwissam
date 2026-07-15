/**
 * Secretary shift validation — Africa/Algiers wall clock.
 * Uses stored secretary.workDays (e.g. "SUN,MON,TUE,WED,THU,SAT"),
 * workStartTime / workEndTime as HH:mm.
 */

const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function algiersParts(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Algiers",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "Sun";
  const hour = parts.find((p) => p.type === "hour")?.value || "00";
  const minute = parts.find((p) => p.type === "minute")?.value || "00";
  const map: Record<string, (typeof DAY_CODES)[number]> = {
    Sun: "SUN",
    Mon: "MON",
    Tue: "TUE",
    Wed: "WED",
    Thu: "THU",
    Fri: "FRI",
    Sat: "SAT",
  };
  return {
    day: map[weekday] || "SUN",
    minutes: Number(hour) * 60 + Number(minute),
  };
}

function parseHm(hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export type SecretarySchedule = {
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string;
  shiftCode?: string;
};

export function isWithinSecretaryShift(
  schedule: SecretarySchedule | undefined | null,
  now = new Date(),
): boolean {
  if (!schedule) return false;
  const start = parseHm(schedule.workStartTime || "07:00");
  const end = parseHm(schedule.workEndTime || "14:30");
  if (start === null || end === null) return false;

  const daysRaw = (schedule.workDays || "SUN,MON,TUE,WED,THU,SAT")
    .split(/[,;\s]+/)
    .map((d) => d.trim().toUpperCase())
    .filter(Boolean);
  const days = new Set(daysRaw);
  const { day, minutes } = algiersParts(now);
  if (!days.has(day)) return false;

  if (end >= start) {
    return minutes >= start && minutes < end;
  }
  // Overnight shift
  return minutes >= start || minutes < end;
}

export const SECRETARY_OUTSIDE_SHIFT_MESSAGE =
  "لا يمكنك تسجيل الدخول خارج وقت العمل المحدد لك. راجع جدولك أو تواصل مع إدارة العيادة.";

export const SECRETARY_SHIFT_ENDED_MESSAGE =
  "انتهى وقت العمل المحدد لك، وتم إنهاء جلسة الدخول.";
