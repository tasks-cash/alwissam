"use client";

export type DoctorScheduleShift = {
  startTime: string;
  endTime: string;
};

export type DoctorScheduleDay = {
  dayOfWeek: string;
  label: string;
  enabled: boolean;
  shifts: DoctorScheduleShift[];
};

const DAYS = [
  ["SATURDAY", "السبت"],
  ["SUNDAY", "الأحد"],
  ["MONDAY", "الاثنين"],
  ["TUESDAY", "الثلاثاء"],
  ["WEDNESDAY", "الأربعاء"],
  ["THURSDAY", "الخميس"],
  ["FRIDAY", "الجمعة"],
] as const;

export function emptyDoctorSchedule(): DoctorScheduleDay[] {
  return DAYS.map(([dayOfWeek, label], index) => ({
    dayOfWeek,
    label,
    enabled: index < 6,
    shifts: index < 6 ? [{ startTime: "09:00", endTime: "14:00" }] : [],
  }));
}

export function scheduleFromApi(
  entries?: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isActive?: boolean;
  }>,
): DoctorScheduleDay[] {
  if (!entries?.length) return emptyDoctorSchedule();
  return DAYS.map(([dayOfWeek, label]) => {
    const shifts = entries
      .filter((entry) => entry.dayOfWeek === dayOfWeek && entry.isActive !== false)
      .map(({ startTime, endTime }) => ({ startTime, endTime }));
    return { dayOfWeek, label, enabled: shifts.length > 0, shifts };
  });
}

export function scheduleToApi(days: DoctorScheduleDay[]) {
  return days.flatMap((day) =>
    day.enabled
      ? day.shifts.map((shift) => ({
          dayOfWeek: day.dayOfWeek,
          startTime: shift.startTime,
          endTime: shift.endTime,
          isActive: true,
        }))
      : [],
  );
}

export function validateDoctorSchedule(days: DoctorScheduleDay[]): string | null {
  for (const day of days) {
    if (!day.enabled) continue;
    if (day.shifts.length === 0) return `أضف وردية ليوم ${day.label}.`;
    const periods = day.shifts
      .map((shift) => ({
        ...shift,
        start: Number(shift.startTime.slice(0, 2)) * 60 + Number(shift.startTime.slice(3)),
        end: Number(shift.endTime.slice(0, 2)) * 60 + Number(shift.endTime.slice(3)),
      }))
      .sort((a, b) => a.start - b.start);
    for (let index = 0; index < periods.length; index += 1) {
      if (periods[index].end <= periods[index].start) {
        return `وقت نهاية الدوام في ${day.label} يجب أن يكون بعد البداية.`;
      }
      if (index > 0 && periods[index].start < periods[index - 1].end) {
        return `توجد ورديات متداخلة في ${day.label}.`;
      }
    }
  }
  return null;
}

export function DoctorScheduleEditor({
  value,
  onChange,
  disabled,
}: {
  value: DoctorScheduleDay[];
  onChange: (value: DoctorScheduleDay[]) => void;
  disabled?: boolean;
}) {
  const patchDay = (index: number, patch: Partial<DoctorScheduleDay>) => {
    onChange(value.map((day, dayIndex) => (dayIndex === index ? { ...day, ...patch } : day)));
  };

  return (
    <div className="admin-schedule-editor">
      {value.map((day, dayIndex) => (
        <section key={day.dayOfWeek} className={`admin-schedule-day${day.enabled ? " is-enabled" : ""}`}>
          <header>
            <label>
              <input
                type="checkbox"
                checked={day.enabled}
                disabled={disabled}
                onChange={(event) =>
                  patchDay(dayIndex, {
                    enabled: event.target.checked,
                    shifts:
                      event.target.checked && day.shifts.length === 0
                        ? [{ startTime: "09:00", endTime: "14:00" }]
                        : day.shifts,
                  })
                }
              />
              <strong>{day.label}</strong>
            </label>
            <div>
              {dayIndex > 0 ? (
                <button
                  type="button"
                  disabled={disabled || !value[dayIndex - 1].enabled}
                  onClick={() =>
                    patchDay(dayIndex, {
                      enabled: value[dayIndex - 1].enabled,
                      shifts: value[dayIndex - 1].shifts.map((shift) => ({ ...shift })),
                    })
                  }
                >
                  نسخ اليوم السابق
                </button>
              ) : null}
              <button
                type="button"
                disabled={disabled || !day.enabled}
                onClick={() =>
                  onChange(
                    value.map((target) => ({
                      ...target,
                      enabled: true,
                      shifts: day.shifts.map((shift) => ({ ...shift })),
                    })),
                  )
                }
              >
                نسخ للجميع
              </button>
            </div>
          </header>

          {day.enabled ? (
            <div className="admin-schedule-shifts">
              {day.shifts.map((shift, shiftIndex) => (
                <div key={`${day.dayOfWeek}-${shiftIndex}`} className="admin-schedule-shift">
                  <label>
                    <span>من</span>
                    <input
                      type="time"
                      dir="ltr"
                      value={shift.startTime}
                      disabled={disabled}
                      onChange={(event) =>
                        patchDay(dayIndex, {
                          shifts: day.shifts.map((item, index) =>
                            index === shiftIndex
                              ? { ...item, startTime: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>إلى</span>
                    <input
                      type="time"
                      dir="ltr"
                      value={shift.endTime}
                      disabled={disabled}
                      onChange={(event) =>
                        patchDay(dayIndex, {
                          shifts: day.shifts.map((item, index) =>
                            index === shiftIndex
                              ? { ...item, endTime: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </label>
                  {day.shifts.length > 1 ? (
                    <button
                      type="button"
                      aria-label={`حذف الوردية ${shiftIndex + 1} من ${day.label}`}
                      disabled={disabled}
                      onClick={() =>
                        patchDay(dayIndex, {
                          shifts: day.shifts.filter((_, index) => index !== shiftIndex),
                        })
                      }
                    >
                      حذف
                    </button>
                  ) : null}
                </div>
              ))}
              {day.shifts.length < 2 ? (
                <button
                  type="button"
                  className="admin-schedule-add"
                  disabled={disabled}
                  onClick={() =>
                    patchDay(dayIndex, {
                      shifts: [
                        ...day.shifts,
                        { startTime: "16:00", endTime: "19:00" },
                      ],
                    })
                  }
                >
                  + إضافة وردية ثانية
                </button>
              ) : null}
            </div>
          ) : (
            <p>لا تتوفر مواعيد حجز في هذا اليوم.</p>
          )}
        </section>
      ))}
    </div>
  );
}
