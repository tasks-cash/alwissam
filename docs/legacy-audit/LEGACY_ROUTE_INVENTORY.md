# Legacy Route Inventory

**Base:** `old project/alwissam-main/src/app`  
**Total `page.tsx`:** 79  

Status keys: **LIVE** (real Prisma/SSR or forms), **REDIRECT**, **STUB** (EmptyState / placeholder), **PUBLIC**.

## Doctor specialist (screenshot portal)

| Route | File | Auth | Status | Notes |
| --- | --- | --- | --- | --- |
| `/doctor/specialist/dashboard` | `doctor/specialist/dashboard/page.tsx` | DOCTOR_SPECIALIST, ADMIN | LIVE | المعاينة — waiting exam queue |
| `/doctor/specialist/today` | `.../today/page.tsx` | same | LIVE | لوحة اليوم — day appointments board |
| `/doctor/specialist/workday` | **No page.tsx** | — | DEAD HREF | Nav parent only (`navDoctorSpecialistAr`) |
| `/doctor/specialist/patients` | `.../patients/page.tsx` | same | LIVE | مرضاي |
| `/doctor/specialist/doctors` | `.../doctors/page.tsx` | ADMIN, DOCTOR_SPECIALIST | LIVE | Owner CRUD doctors |
| `/doctor/specialist/secretaries` | `.../secretaries/page.tsx` | same | LIVE | Owner CRUD secretaries |
| `/doctor/specialist/settings` | `.../settings/page.tsx` | — | REDIRECT | → `/settings/contact` |
| `/doctor/specialist/settings/contact` | `settings/contact/page.tsx` | ADMIN, DOCTOR_SPECIALIST | LIVE | تواصل معنا / clinic_info |
| `/doctor/specialist/settings/hours` | `settings/hours/page.tsx` | same | LIVE | مواعيد العمل |
| `/doctor/specialist/settings/pages` | `settings/pages/page.tsx` | same | LIVE | صفحات الموقع CMS |
| `/doctor/specialist/settings/doctors` | `settings/doctors/page.tsx` | same | LIVE | عرض الأطباء public bios |
| `/doctor/specialist/staff/[userId]/activity` | `staff/.../activity/page.tsx` | owner | LIVE | Work log |
| `/doctor/specialist/account` | account/page.tsx | — | REDIRECT | → doctors |
| `/doctor/specialist/appointments` | appointments/page.tsx | — | REDIRECT | → dashboard |
| `/doctor/specialist/orthodontics` | orthodontics/page.tsx | — | REDIRECT | → dashboard |
| `/doctor/specialist/referrals` | referrals/page.tsx | — | STUB | EmptyState |
| `/doctor/specialist/follow-ups` | follow-ups/page.tsx | — | STUB | |
| `/doctor/specialist/operations` | operations/page.tsx | — | STUB | |
| `/doctor/specialist/surgeries` | surgeries/page.tsx | — | STUB | |
| `/doctor/specialist/reports` | reports/page.tsx | — | STUB | |

## Doctor general

| Route | Status |
| --- | --- |
| `/doctor/general/dashboard` | LIVE — same `DoctorExamPanel` pattern |
| `/doctor/general/patients` | LIVE |
| `/doctor/general/patients/[id]` | REDIRECT → `/patients/[id]` |
| `/doctor/general/account`, `appointments` | REDIRECT → dashboard |
| `/doctor/general/referrals`, `reports` | STUB |

## Shared clinical

| Route | Status |
| --- | --- |
| `/patients/[id]` | LIVE — multi-section patient record (Prisma) |

## Secretary (related to daily work)

| Route | Status |
| --- | --- |
| `/secretary/dashboard` | LIVE |
| `/secretary/today` | LIVE |
| `/secretary/directed` | LIVE — waiting / directed |
| `/secretary/waiting-room` | REDIRECT → directed |
| `/secretary/appointments`, `[id]` | LIVE |
| `/secretary/patients`, `[id]` | LIVE / redirect |
| `/secretary/payments` | LIVE |
| `/secretary/calendar`, `schedule` | LIVE (not all in sidebar) |
| `/secretary/messages`, `invoices`, `referrals` | STUB |
| `/secretary/account` | REDIRECT |

## Auth / public / patient / admin

| Area | Notable routes | Status pattern |
| --- | --- | --- |
| Auth | `/staff/login`, `/patient/login`, forgot/reset/activate | LIVE |
| Public | `/`, about, services, faq, contact, doctors, orthodontics, surgery, register, book-appointment | LIVE / redirects |
| Patient | `/patient/dashboard` LIVE; most other patient pages STUB | Mixed |
| Admin | Most redirect to specialist OR STUB | Legacy stubs |
| QR | `/patient/qr/[token]` route handler | LIVE passwordless |

## Non-page API-adjacent handlers

| Path | File |
| --- | --- |
| `/patient/qr/[token]` | `src/app/patient/qr/[token]/route.ts` |

## Middleware protection

`src/middleware.ts` gates UI prefixes `/admin`, `/secretary`, `/doctor`, selected `/patient/*`, `/patients` by cookie presence only. **`/api/*` not gated by middleware.**
