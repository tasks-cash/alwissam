# Legacy UI → API → Database Trace

Statuses: Fully functional | Functional with defects | UI only | API only | Mocked | Incomplete | Dead code | Not found

## Screenshot-visible features

| UI feature | Route | Component | API | Service / handler | Model(s) | Auth | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Brand logo | shell | `ClinicLogo` | — | — | — | session UI | Fully functional |
| Sidebar يوم العمل group | shell | `DashboardShell` / `NavGroup` | — | nav config `ar.ts` | — | page guard | Fully functional (dead parent href `/workday`) |
| Nav المعاينة | `/doctor/specialist/dashboard` | page SSR | Prisma on server | dashboard page | WaitingRoomEntry, Patient, Appointment, AppointmentRequest | requireUser | Fully functional |
| Nav لوحة اليوم | `/doctor/specialist/today` | `DoctorTodayBoard` | Prisma SSR | today page | Appointment, WaitingRoomEntry | requireUser | Fully functional |
| Nav مرضاي | `/doctor/specialist/patients` | `DoctorPatientsList` | Prisma via `loadDoctorPatients` | `doctor-patients.ts` | Appointment / WR derived list | requireUser | Fully functional |
| Nav الأطباء | `/doctor/specialist/doctors` | forms + list | `/api/admin/doctors` | admin doctors route | User, Doctor, WorkingHour | isClinicOwner | Fully functional |
| Nav السكرتارية | `/doctor/specialist/secretaries` | forms + list | `/api/admin/secretaries` | admin secretaries | User, SecretaryProfile | isClinicOwner | Fully functional |
| تواصل معنا | settings/contact | ContactSettingsForm | `PUT /api/admin/clinic-settings` | clinic-settings route | ClinicSetting | isClinicOwner | Fully functional |
| مواعيد العمل | settings/hours | WorkingHoursEditor | admin doctors PATCH / hours tooling | doctor hours | WorkingHour | owner | Fully functional |
| صفحات الموقع | settings/pages | PublicPagesContentForm | clinic-settings / public-pages lib | ClinicSetting JSON | ClinicSetting | owner | Fully functional |
| عرض الأطباء | settings/doctors | DoctorDisplayForm | clinic settings / doctor update | Doctor bio fields | Doctor | owner | Fully functional |
| Logout | shell | button | `POST /api/auth/logout` | logout route | Session | session | Fully functional |
| Floating FAB | shell | `StaffChatWidget` | `/api/staff/chat` | staff chat | Message | staff session | Fully functional (**not WhatsApp**) |
| Patient card expand | dashboard | `DoctorExamPanel` | — | props from SSR | Patient, Request | — | Fully functional |
| Button معاينة (start) | panel | `openExam` L55 | `POST /api/doctor/exam` action=start | exam route | WaitingRoomEntry, Appointment, AuditLog | doctor ownership | Fully functional |
| Complete exam + charge | panel modal | `completeExam` L79 | same, action=complete | exam route + Invoice create | Invoice, WR, Apt | doctor | Fully functional |
| «تسجيل من الجوال» | — | — | — | — | — | — | **Not found** |
| Secretary name on card | — | — | — | — | — | — | **Not found** on exam card |

## Related daily-work APIs (not on screenshot but required)

| Action | API | Models | Status |
| --- | --- | --- | --- |
| Public book | `POST /api/public/appointments` | AppointmentRequest | Fully functional |
| Direct to doctor | `POST /api/secretary/appointments/[id]` action=direct | Apt + WR via `directPatientFromRequest` | Fully functional |
| Scheduled check-in | `POST /api/secretary/scheduled-check-in` | Apt + WR | Fully functional |
| Walk-in | `POST /api/secretary/walk-in` | Apt + WR | Fully functional |
| WR status change | `POST /api/secretary/waiting-room/[id]` | WaitingRoomEntry | Functional with defects (ownership gap) |
| Schedule appointment (secretary) | `POST/PATCH /api/secretary/schedule-appointment` | — | **Stub 403 always** |

## Mock / hardcoded check

| Area | Result |
| --- | --- |
| Dashboard waiting list | **Database-backed** |
| Fake stats on معاينة | **Not found** for current page |
| `DoctorDashboardView` hardcoded? | Unused component — Dead code |
| recharts on specialist dashboard | **Not used** on this page |

## Trace: معاينة start (abbreviated)

```text
UI: DoctorExamPanel.openExam
→ POST /api/doctor/exam {entryId, action:"start"} + x-csrf-token
→ getCurrentUser + role + CSRF
→ prisma.waitingRoomEntry.update WITH_DOCTOR
→ prisma.appointment.update IN_TREATMENT + statusHistory
→ createAuditLog EXAM_STARTED
→ publishEvent clinic:waiting-room
→ JSON {ok:true}
→ router.refresh() reloads SSR list
```
