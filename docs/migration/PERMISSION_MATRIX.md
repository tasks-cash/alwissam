# Permission Matrix

## Summary

| Layer | What exists | What is enforced at runtime |
| --- | --- | --- |
| Database | `Permission`, `RolePermission`, `UserPermission` | Seed links **all** permission codes to **ADMIN** only (`prisma/seed/index.ts`). Not read by API handlers. |
| In-memory map | `PERMISSIONS` + `ROLE_PERMISSIONS` in `src/lib/auth/permissions.ts` | Used by helpers `roleHasPermission` / `permissionsForRole`. |
| Guard helpers | `requirePermission()` in `current-user.ts` | **Zero call sites** under `src/` (as of 2026-07-13). |
| Actual enforcement | `requireUser([RoleCode...])`, inline `user.role.code` checks, `isClinicOwner()` | **Role-only** on pages and APIs. |
| UI visibility | Sidebar nav arrays by role (`src/i18n/ar.ts`) | Not permission-key based. |

**Migration rule:** Preserve actual (role-based) enforcement first. Closing the gap to DB-driven permissions is a security enhancement, not silent redesign of existing allowed workflows.

---

## Declared permission keys

| Permission ID | Permission Key | Description (from code naming) | Roles in `ROLE_PERMISSIONS` map | Seeded to DB RolePermission | Pages enforcing this key | APIs enforcing this key | Actions | Current Enforcement | NestJS Enforcement (target) | Next.js Enforcement (target) | Test Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PERM-001 | manage_users | Manage users | ADMIN | ADMIN | none (admin/users stub) | none | CRUD users UI intended | **declared only** | TBD role or permission guard | hide until real | none |
| PERM-002 | manage_doctors | Manage doctors | ADMIN | ADMIN | specialist/doctors uses **roles** ADMIN/DOCTOR_SPECIALIST | `/api/admin/doctors` uses `isClinicOwner` | create/patch/delete doctors | **role/owner**, not key | Preserve owner/role | Role nav | none |
| PERM-003 | manage_secretaries | Manage secretaries | ADMIN | ADMIN | specialist/secretaries role check | `/api/admin/secretaries` owner | CRUD secretaries | **role/owner** | Preserve | Role nav | none |
| PERM-004 | manage_roles | Manage roles | ADMIN | ADMIN | admin/roles stub | none | — | declared / stub UI | — | stub | none |
| PERM-005 | manage_services | Manage services | ADMIN | ADMIN | admin/services stub | none | — | declared / stub | — | stub | none |
| PERM-006 | manage_schedules | Manage schedules | ADMIN | ADMIN | settings/hours role | clinic-settings working hours | edit hours | **role** | Preserve | Role | none |
| PERM-007 | manage_settings | Clinic settings | ADMIN | ADMIN | settings/* role | clinic-settings owner | upsert settings | **role/owner** | Preserve | Role | none |
| PERM-008 | view_audit_logs | View audits | ADMIN | ADMIN | admin/audit-logs stub (no data UI) | writes happen; no list API | — | write complete / read UI stub | Add read API if needed | stub | none |
| PERM-009 | view_all_reports | Reports | ADMIN | ADMIN | report stubs | none | — | stub | stub | stub | none |
| PERM-010 | manage_appointments | Appointment ops | ADMIN, SECRETARY | ADMIN only in DB | secretary appointment pages (role) | secretary appointment APIs (role) | create/update requests | **role SECRETARY/ADMIN** | Role guard | Role | none |
| PERM-011 | manage_waiting_room | Waiting room | ADMIN, SECRETARY | ADMIN DB | directed/waiting (role) | waiting-room, arrive (role; doctors allowed some) | status updates | **role** | Role | Role | none |
| PERM-012 | manage_patients | Patients | ADMIN, SECRETARY, DOCTOR_* | ADMIN DB | patients pages (role) | secretary/patients, doctor/patient (role) | CRUD/soft-delete | **role** | Role | Role | none |
| PERM-013 | record_payments | Record payments | ADMIN, SECRETARY | ADMIN DB | secretary/payments | payments, checkout, collect-charge | create/void money | **role** | Role + Decimal safety | Role | none |
| PERM-014 | view_payments | View payments | ADMIN, SECRETARY, DOCTOR_* | ADMIN DB | payments page / patient record | — | read | role / server query | Role | Role | none |
| PERM-015 | edit_diagnosis | Diagnosis | ADMIN, DOCTOR_* | ADMIN DB | exam flows | exam API (role) | clinical write | **role** | Role | Role | none |
| PERM-016 | edit_prescription | Prescription | DOCTOR_* map | ADMIN DB | partial on record | limited | — | partial | Role | Role | none |
| PERM-017 | edit_surgery | Surgery | DOCTOR_SPECIALIST map | ADMIN DB | surgeries stub | — | — | stub UI | Role when implemented | stub | none |
| PERM-018 | edit_orthodontics | Orthodontics | DOCTOR_SPECIALIST map | ADMIN DB | redirects/stubs; ortho-approval API | ortho-approval (role) | approve account/case | **role on API** | Role | Role | none |
| PERM-019 | edit_dental_chart | Dental chart | DOCTOR_* map | ADMIN DB | patient record / exam | dental-chart | tooth state | **role** | Role | Role | none |
| PERM-020 | approve_patient_account | Approve patient accounts | DOCTOR_* map | ADMIN DB | create-patient-account flows | create-patient-account, ortho-approval | activate | **role** | Role | Role | none |
| PERM-021 | view_own_medical | Patient self data | PATIENT map | ADMIN DB only (patient not seeded perms) | patient dashboard | — | read own | **role PATIENT** | ownership checks | Role | none |
| PERM-022 | request_appointment_change | Patient change request | PATIENT map | ADMIN DB | not implemented UI | — | — | unimplemented | — | — | none |

---

## Routes using only role checks (representative)

All protected `page.tsx` files using `requireUser([...])` and all API handlers using `user.role.code` arrays. **None** use `requirePermission(PERM)`.

Notable owner helper: `isClinicOwner()` (`ADMIN` or specialist doctor profile) on `/api/admin/*` and clinic settings.

---

## Routes / APIs missing granular permission enforcement (gap list)

| Surface | Gap |
| --- | --- |
| Entire API surface | No `Permission` / `UserPermission` DB lookup |
| `/api/files/upload` | Any authenticated role; no `patientId` ownership |
| `/api/realtime/stream` | Any authenticated role receives clinic-wide counts |
| Admin stub pages | Role gate only; no feature behind them |
| UI buttons | Visibility by nav role, not permission keys |

---

## UI-only visibility

Sidebar definitions in `navSecretaryAr`, `navDoctorGeneralAr`, `navDoctorSpecialistAr`, `navAdminAr`, `navPatientAr` — **role-segmented menus**, not permission-key driven.

---

## Target NestJS recommendation

1. Ship **RoleGuard** matching current role arrays for parity.
2. Add **PermissionGuard** reading Mongo (migrated) permissions only after tests prove no privilege regression.
3. Never treat hiding a button as authorization.
