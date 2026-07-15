# Source Public Page Inventory

**Source:** `/home/xss/Downloads/projects/alwissam-main/alwissam-main`  
**Updated:** 2026-07-14

| ID | Source Route | Page | Source File | Content | Components | Forms | APIs | Assets | Current Status | Target Route | Transfer Status | Test Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PUB-001 | `/` | Home + walk-in | `src/app/page.tsx` | AR CMS + hero | PublicChrome, PublicRegisterForm | Walk-in | POST `/api/public/appointments` | SVG logo only | WORKING | `/{locale}` | TRANSFERRED (booking page, not home form) | MANUAL |
| PUB-002 | `/about` | About | `src/app/about/page.tsx` | `aboutAr` CMS | PublicChrome | — | Prisma CMS | — | WORKING | `/{locale}/about` | TRANSFERRED | MANUAL |
| PUB-003 | `/services` | Services | `src/app/services/page.tsx` | CMS services | PublicChrome | — | Prisma CMS | — | WORKING | `/{locale}/services` | TRANSFERRED + slug details | MANUAL |
| PUB-004 | `/faq` | FAQ | `src/app/faq/page.tsx` | CMS FAQs | PublicChrome | — | Prisma CMS | — | WORKING | `/{locale}/faq` | TRANSFERRED | MANUAL |
| PUB-005 | `/contact` | Contact | `src/app/contact/page.tsx` | clinic_info | PublicChrome | none | Prisma/env | map embed | PARTIAL | `/{locale}/contact` | IMPROVED (form added) | MANUAL |
| PUB-006 | `/doctors` | Doctors | `src/app/doctors/page.tsx` | DB + fallback | PublicChrome | — | Prisma | — | WORKING | `/{locale}/doctors` | TRANSFERRED + profiles | MANUAL |
| PUB-007 | `/surgery` | Surgery marketing | `src/app/surgery/page.tsx` | hardcoded AR | PublicChrome | — | — | — | PLACEHOLDER | specialty `surgery` | MERGED into specialties | MANUAL |
| PUB-008 | `/orthodontics` | Ortho marketing | `src/app/orthodontics/page.tsx` | hardcoded AR | PublicChrome | — | — | — | PLACEHOLDER | specialty/service orthodontics | MERGED | MANUAL |
| PUB-009 | `/register` | Register | `src/app/register/page.tsx` | — | — | — | — | — | REDIRECT | `/{locale}/book-appointment` | REPLACED | MANUAL |
| PUB-010 | `/book-appointment` | Book | `src/app/book-appointment/page.tsx` | — | — | — | — | — | REDIRECT | `/{locale}/book-appointment` | REBUILT | MANUAL |
| PUB-011 | `/patient/login` | Patient login | `src/app/patient/login/page.tsx` | AR | — | login | `/api/auth/login` | — | WORKING | `/{locale}/patient/login` | PRESERVED (auth, not dashboard) | MANUAL |
| PUB-012 | `/staff/login` | Staff login | `src/app/staff/login/page.tsx` | AR | — | login | `/api/auth/login` | — | WORKING | `/{locale}/staff/login` | PRESERVED discreet link | MANUAL |
| PUB-013 | `/forgot-password` | Forgot | `src/app/forgot-password/page.tsx` | AR | — | form | auth API | — | WORKING | `/{locale}/forgot-password` | PRESERVED | MANUAL |
| PUB-014 | `/reset-password` | Reset | `src/app/reset-password/page.tsx` | AR | — | form | auth API | — | WORKING | `/{locale}/reset-password` | PRESERVED | MANUAL |
| PUB-015 | `/activate-account` | Activate | `src/app/activate-account/page.tsx` | AR | — | form | auth API | — | WORKING | (auth helper; not marketing) | DEFERRED as marketing page | — |

Admin/secretary/doctor/patient portals excluded from public redesign scope.
