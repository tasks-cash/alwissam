# Existing Feature Audit — Clinic Dashboard

**Updated:** 2026-07-14 (post core ops wiring)

**Canonical stacks:**

| Stack | Location | Runtime status |
| --- | --- | --- |
| **Target (active)** | `apps/web` + `apps/api` + MongoDB | JWT cookies, Nest+Mongoose |
| **Legacy (reference)** | `alwissam-main/` + root `src/` Prisma | Reference only; do not cut over to Prisma |

## Safety check (executed)

| Check | Result |
| --- | --- |
| `pwd` | `/home/xss/Downloads/projects/alwissam-main` |
| Git root | same |
| Branch | `main` |
| HEAD | `e8900ea Initial commit - Al Wisam Dental Clinic` |
| Source project | nested `alwissam-main/` (Next+Prisma clinic) |
| Target project | `apps/*` + `packages/*` monorepo |

## Executive summary

Core operational backend for patients, appointments, waiting room, and role dashboards is implemented in Nest+Mongo. Frontend now has locale-aware owner/secretary/doctor/patient dashboards with `DashboardShell`, live Mongo stats, patient registration, appointment scheduling, check-in, and waiting-queue actions. Legacy still holds many specialty clinical modules (ortho/surgery/payments CMS) not yet ported.

## Target Nest modules

| Module | Capability | Status |
| --- | --- | --- |
| Health | `/health`, `/api/health` | EXISTING_WORKING |
| Auth | JWT login/refresh/logout/me/locale/password | EXISTING_WORKING |
| Doctors | Owner CRUD + staff roster `GET /api/doctors` | EXISTING_WORKING |
| Secretaries | Owner CRUD | EXISTING_WORKING |
| Patients | List/create/update + patient `me` | EXISTING_WORKING |
| Appointments | Create/list/status/check-in/waiting | EXISTING_WORKING |
| Dashboard | Owner/secretary/doctor real aggregates | EXISTING_WORKING |
| Audit | Write path for mutations | EXISTING_PARTIAL (API list UI missing) |

## Target web pages (locale `ar|en|fr`)

| Route | Status |
| --- | --- |
| `/{locale}` | EXISTING_WORKING |
| `/{locale}/staff/login` | EXISTING_WORKING |
| `/{locale}/patient/login` | EXISTING_WORKING |
| `/{locale}/forgot-password` | EXISTING_WORKING |
| `/{locale}/reset-password` | EXISTING_WORKING |
| `/{locale}/doctor/specialist/dashboard` | EXISTING_WORKING (real owner KPIs + activity) |
| `/{locale}/doctor/specialist/doctors` | EXISTING_WORKING |
| `/{locale}/doctor/specialist/secretaries` | EXISTING_WORKING |
| `/{locale}/doctor/general/dashboard` | EXISTING_WORKING |
| `/{locale}/secretary/dashboard` | EXISTING_WORKING |
| `/{locale}/secretary/today` | EXISTING_WORKING |
| `/{locale}/secretary/directed` | EXISTING_WORKING |
| `/{locale}/secretary/patients` | EXISTING_WORKING |
| `/{locale}/secretary/appointments` | EXISTING_WORKING |
| `/{locale}/patient/dashboard` | EXISTING_WORKING |

## Bugs

| Bug ID | Severity | Status | Notes |
| --- | --- | --- | --- |
| BUG-001 | High | FIXED | Patient dashboard route exists |
| BUG-002 | High | PARTIAL | Cookie gate added in middleware; JWT validation still on APIs |
| BUG-003 | High | FIXED | `PermissionsGuard` on patients/appointments/dashboard |
| BUG-004 | Medium | FIXED | Audit on patient/appointment/doctor/secretary mutations |
| BUG-005 | Medium | OPEN | Password reset still in-app /devToken (no email) |
| BUG-007 | Medium | FIXED | Owner dashboard uses `/api/dashboard/owner` |
| BUG-008 | Medium | FIXED | `DashboardShell` sidebar |
| BUG-009 | Low | PARTIAL | Core dashboard strings localized; some CRUD forms still AR-first |

## Legacy parity still missing (P1+)

Payments/invoices, clinic settings CMS, public marketing pages (about/services/faq), roles UI, audit UI, sessions UI, dental chart, exam panel, orthodontics, surgery, QR login, reports, notifications, files upload UI.

## Exact next action

Port payments + clinic settings + audit/sessions UI; wrap doctor/secretary management pages in `DashboardShell`; expand Playwright journeys for register→schedule→check-in→complete.
