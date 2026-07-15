# Source → Target Feature Transfer Matrix

**Updated:** 2026-07-14  
**Source:** `alwissam-main/` (Next.js + Prisma + PostgreSQL)  
**Target:** `apps/web` + `apps/api` (Next.js + NestJS + MongoDB + JWT)

## Safety check

| Item | Value |
| --- | --- |
| pwd | `/home/xss/Downloads/projects/alwissam-main` |
| Git root | `/home/xss/Downloads/projects/alwissam-main` |
| Branch | `main` |
| HEAD | `e8900ea Initial commit - Al Wisam Dental Clinic` |
| Working tree | dirty (migration in progress; legacy nest kept) |

## Transfer status

| Module | Source truth | Target status |
| --- | --- | --- |
| Auth (login/logout/password) | Prisma Session cookie | TRANSFERRED — JWT access/refresh |
| Owner doctors CRUD | `/api/admin/doctors` | TRANSFERRED |
| Owner secretaries CRUD | `/api/admin/secretaries` | TRANSFERRED |
| Patients | Prisma Patient | TRANSFERRED — Mongo `patients` |
| Appointments + waiting | appointments APIs | TRANSFERRED |
| Role dashboards | role pages | TRANSFERRED — real Mongo stats |
| Payments / invoices / collect | secretary finance APIs | TRANSFERRED — Mongo `invoices`/`payments` |
| Clinic settings + public CMS | ClinicSetting JSON | TRANSFERRED — `clinic_settings` |
| Public site pages | about/services/faq/contact | TRANSFERRED — CMS-backed |
| Audit logs UI | admin stub in legacy | TRANSFERRED — list API + UI |
| Sessions revoke | session table | TRANSFERRED — list/revoke APIs |
| Dental chart / exam panel | doctor exam route | NOT YET |
| Orthodontics / surgery | specialist pages | NOT YET (many legacy stubs too) |
| Checkout ortho account flow | complex checkout | NOT YET |
| QR patient login | `/patient/qr/[token]` | NOT YET |
| Roles/permissions UI | admin stubs | NOT YET (guards exist) |
| Reports / charts | stubs | NOT YET |
| Email/SMS | env-only | DEFERRED |

## Architecture invariant

Target runtime must not call Prisma/PostgreSQL. Legacy tree preserved under `alwissam-main/` (and historical root `src/`) for reference only.
