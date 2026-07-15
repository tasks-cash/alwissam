# Legacy Doctor / Specialist Dashboard Audit

**Route (verified):** `/doctor/specialist/dashboard`  
**Page file:** `old project/alwissam-main/src/app/doctor/specialist/dashboard/page.tsx`  
**Export:** `SpecialistDoctorDashboardPage`  
**Rendering:** Server Component, `export const dynamic = "force-dynamic"` (line 9)

## Screenshot mapping (verified in source)

| Screenshot element | Source | Status |
| --- | --- | --- |
| Brand «عيادة الوسام» / «لطب الأسنان» | `src/components/branding/ClinicLogo.tsx` | Found |
| Heading «المعاينة» | `TopHeader title` lines 42–44 in dashboard page | Found |
| Subtitle «يوم العمل — المرضى في الانتظار…» | `TopHeader subtitle` same | Found |
| Nav group «يوم العمل» | `navDoctorSpecialistAr` in `src/i18n/ar.ts` L149–164 | Found |
| «المعاينة» nav | href `/doctor/specialist/dashboard` | Found / LIVE |
| «لوحة اليوم» | href `/doctor/specialist/today` | Found / LIVE |
| «مرضاي» | `/doctor/specialist/patients` | Found / LIVE |
| «الأطباء» | `/doctor/specialist/doctors` | Found / LIVE |
| «السكرتارية» | `/doctor/specialist/secretaries` | Found / LIVE |
| «الإعدادات» children | contact / hours / pages / doctors settings | Found / LIVE (parent redirects) |
| Logged-in doctor name | `DashboardShell` `userName={user.fullName}` | Found |
| «تسجيل الخروج» | `POST /api/auth/logout` in `DashboardShell` | Found |
| Floating teal button | `StaffChatWidget` (MessageCircle) — **not WhatsApp** | Found — **mislabel risk** |
| Patient preview card | `DoctorExamPanel` | Found |
| Button «معاينة» | `DoctorExamPanel` L166–168 → `openExam` | Found |

### Screenshot claims **not found** in this tree

| Claim | Search result |
| --- | --- |
| Label «تسجيل من الجوال» | **Not found** (repo-wide grep) |
| Explicit secretary name on exam card | **Not found** on `DoctorExamPanel` (only “ملاحظة للسكرتير” / “إرسال للسكرتير”) |

Registration-related fields on the card come from `patient` + `appointment.request` (`phone`, `age`, `city`, `chronicIllnesses`, `reason`, `isPreviousPatient`, `entry.note`) — lines 66–81 of the dashboard page.

## Auth / authorization

| Layer | Behavior | File |
| --- | --- | --- |
| Middleware | Cookie `alwisam_session` presence for `/doctor/*` | `src/middleware.ts` |
| Page guard | `requireUser(["DOCTOR_SPECIALIST", "ADMIN"])` | `current-user.ts` + dashboard L12 |
| API exam | Role allowlist + CSRF + `entry.doctorId` ownership | `api/doctor/exam/route.ts` L12–45 |
| DB permissions | Seeded `Permission` tables | **Not enforced** at runtime |

## Data loading (not mock)

```text
requireUser → prisma.doctor.findFirst({ userId })
  → prisma.waitingRoomEntry.findMany({
       doctorId, status in ["WAITING","WITH_DOCTOR"],
       include patient.account, appointment.request,
       orderBy arrivedAt asc
     })
```

**Classification:** Fully functional SSR from PostgreSQL via Prisma — **not** localStorage, static JSON, or hardcoded patient rows.

## Auto-refresh

| Mechanism | Specialist dashboard |
| --- | --- |
| Page polling | **Not found** |
| SSE consumer | **Not found** on this page |
| Refresh | `router.refresh()` after exam start/complete |
| Staff chat poll | Every ~8s inside `StaffChatWidget` only |

## Component tree

```text
SpecialistDoctorDashboardPage
└─ DashboardShell(items=navDoctorSpecialistAr)
   ├─ ClinicLogo + AppSidebar + Logout
   ├─ TopHeader «المعاينة»
   ├─ Card → DoctorExamPanel[] (one per waiting entry)
   └─ StaffChatWidget (FAB)
```

`DoctorDashboardView` (`src/components/dashboard/DoctorDashboardView.tsx`) — **dead code** (no imports).

## Empty / loading / error

| State | Behavior |
| --- | --- |
| Empty | `EmptyState title="لا مرضى بانتظار المعاينة"` L47–48 |
| Loading | Next SSR; client button `loading` on actions |
| Error | Exam API errors shown in panel state (`setError`) |

## معاينة button — complete trace

| Step | Location | Operation |
| --- | --- | --- |
| 1 | `DoctorExamPanel.tsx` L166–168 | Click «معاينة» |
| 2 | L55–77 `openExam` | If `status==="WAITING"`, POST `/api/doctor/exam` `{entryId, action:"start"}` + `x-csrf-token` |
| 3 | `api/doctor/exam/route.ts` L47–75 | Update `WaitingRoomEntry` → `WITH_DOCTOR`; `Appointment` → `IN_TREATMENT` + history; audit `EXAM_STARTED`; Redis pub |
| 4 | Panel L74–76 | Open modal, `router.refresh()` |
| 5 | Panel L79–104 `completeExam` | POST `{action:"complete", amount, note, covered}` |
| 6 | Exam route L78–166 | Entry → `SESSION_DONE`; Apt → `FOLLOW_UP_REQUIRED`; optional `Invoice` ISSUED; audit `EXAM_COMPLETED_CHARGE` |

**Result after complete:** patient leaves exam queue UI (`done` statuses hide panel L106); secretary collects via payment/checkout APIs.
