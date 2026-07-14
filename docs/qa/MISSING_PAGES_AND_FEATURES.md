# Missing Pages and Features

**Audited:** 2026-07-14  
**Rule:** Target stack must not ship placeholders. Stub pages must become real Mongo-backed features or be removed from navigation after product confirmation.

## Target stack (`apps/web`) missing everything

| Area | Status |
| --- | --- |
| All 79 legacy routes | Not ported |
| Staff/patient login pages | Missing |
| Dashboards | Missing |
| CRUD staff / patients / appointments | Missing |
| Settings / CMS | Missing |
| Design system / RTL shell | Missing (scaffold homepage only) |

## NestJS (`apps/api`) missing modules

| Module | Needed by forms | Status |
| --- | --- | --- |
| Auth logout / password-reset / activate / CSRF helpers | FORM-003–006 | Missing (login only) |
| Doctors | FORM-009–012 | Missing |
| Secretaries | FORM-013–016 | Missing |
| Clinic settings | FORM-011, 017–019 | Missing |
| Patients | FORM-023, 032 | Missing |
| Appointments / walk-in / schedule | FORM-007, 022, 024–026 | Missing |
| Waiting room / exam | FORM-031 | Missing |
| Payments / invoices | FORM-027–029 | Missing |
| Files | upload | Missing |
| Roles / permissions management | admin stubs | Missing |
| Audit | admin audit stub | Missing |
| Health | present | OK |

## Dual-store risk (must eliminate for Mongo-only)

| Flow | Store today |
| --- | --- |
| Login (`src/app/api/auth/login`) | **Mongo** (`UserModel`) |
| Password reset / activate | **Prisma / PostgreSQL** |
| Admin doctors / secretaries | **Prisma** |
| Patients / appointments / payments | **Prisma** |
| Nest AuthModule | **Mongo** |

**Implication:** Creating staff in Prisma does not create Mongo login users (and vice versa) unless a sync seed exists. Target architecture forbids restoring Prisma for product path.

## Empty stub pages (legacy navigation / reachable)

### Admin

- `/admin/users`
- `/admin/roles`
- `/admin/permissions`
- `/admin/services`
- `/admin/reports`
- `/admin/audit-logs`
- `/admin/backups`

### Secretary

- `/secretary/invoices`
- `/secretary/messages`
- `/secretary/referrals`

### Doctor specialist

- `/doctor/specialist/follow-ups`
- `/doctor/specialist/operations`
- `/doctor/specialist/reports`
- `/doctor/specialist/surgeries`
- `/doctor/specialist/referrals`

### Doctor general

- `/doctor/general/reports`
- `/doctor/general/referrals`

### Patient portal

- `/patient/profile`
- `/patient/files`
- `/patient/operations`
- `/patient/prescriptions`
- `/patient/sessions`
- `/patient/payments`
- `/patient/treatment-plan`
- `/patient/orthodontics`

## Redirect-only routes (feature consolidated)

| Route | Redirect |
| --- | --- |
| `/admin/dashboard` | specialist dashboard |
| `/admin/doctors` | `/doctor/specialist/doctors` |
| `/admin/secretaries` | `/doctor/specialist/secretaries` |
| `/admin/settings`, `/admin/schedules` | specialist settings |
| `/secretary/account` | secretary dashboard |
| `/secretary/waiting-room` | `/secretary/directed` |
| doctor account / appointments aliases | dashboards |
| `/register`, `/book-appointment` | home register |
| `/patient/appointments` | patient dashboard |

## Orphaned components (present in repo, unused)

- `ClinicInfoForm`
- `StaffLoginForm`
- `RecordPaymentForm`
- `PostVisitCheckout` + `WaitingRoomActions` (after waiting-room redirect)
- `SpecialistPatientRow`
- `OrthoApprovalActions`

## Feature completion priority for STEPS 4–10

1. Auth (login / logout / reset / activate) on Nest + Mongo — unblock everything.
2. Doctor + secretary CRUD + hours + deletes.
3. Patients + walk-in + schedule + request directing.
4. Exam completion + payment collect.
5. Settings / public CMS.
6. Stub page decisions: implement real data views or remove from nav (STEP 10).
7. Roles/permissions UI only if dynamic RBAC is activated (currently unused at runtime).
