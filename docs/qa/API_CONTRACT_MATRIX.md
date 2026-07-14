# API Contract Matrix

**Audited:** 2026-07-14  
**Primary FE:** legacy `src/`  
**Legacy API:** `src/app/api/**`  
**Nest API:** `apps/api` — `POST /api/auth/login` + health only  
**Target FE:** `apps/web` — **does not call Nest product APIs** (health link only)

## Shared plumbing

| Concern | Contract |
| --- | --- |
| Session cookie | `alwisam_session` (httpOnly, SameSite=lax, path `/`) |
| CSRF header | `x-csrf-token` (must match session `csrfToken`) |
| Public auth endpoints | login / forgot / reset / activate — no CSRF |
| Error shape (legacy) | `{ error: string }` |
| Success login shape | `{ ok, redirectTo, user: { id, fullName, role } }` |
| Nest product surface | login + health (+ Swagger `/docs`) |

---

## Critical form contracts

| Form ID | Method + Path | Auth | Request body | Success | Store | Nest? | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FORM-001 | `POST /api/auth/login` | Public | `email`, `password`, `rememberMe`, `portal:"staff"` | `200` + Set-Cookie | **Mongo** | Yes | Password min inconsistency with create (6 vs 8) |
| FORM-002 | `POST /api/auth/login` | Public | `identifier`, `password`, `portal:"patient"` | same | **Mongo** | Yes | No show/hide password |
| FORM-003 | `POST /api/auth/password-reset` | Public + rate limit | `identifier` | `200` `{ok,message}` (+`devToken` in dev) | **Prisma** | No | Dual-store vs Mongo login |
| FORM-004 | `PUT /api/auth/password-reset` | Public | `token`, `password` | `200` | **Prisma** | No | Dual-store; no confirm; always → staff login |
| FORM-005 | `POST /api/auth/activate` | Public | `token`, `password` | `200` | **Prisma** | No | Dual-store; no confirm |
| FORM-009 | `POST /api/admin/doctors` | Owner + CSRF | `fullName`, `email`, `phone`, `password`, `type`, `specialtyAr` | `200` `{ok,user}` | **Prisma** | No | Dual-store: cannot Mongo-login |
| FORM-010 | `PATCH /api/admin/doctors` | Owner + CSRF | `userId`, `email`, `phone`, `newPassword?` | `200` `{ok}` | **Prisma** | No | Dual-store |
| FORM-012 | `DELETE /api/admin/doctors` | Owner + CSRF | `userId` | `200` soft inactive | **Prisma** | No | FE ignores errors; Mongo orphan risk |
| FORM-013 | `POST /api/admin/secretaries` | Owner + CSRF | `fullName`, `email`, `phone`, `password`, `shiftCode` | `200` | **Prisma** | No | Dual-store; weak uniqueness UX |
| FORM-014 | `PATCH /api/admin/secretaries` | Owner + CSRF | `section:"login"`, `userId`, `email`, `phone`, `newPassword?` | `200` | **Prisma** | No | Dual-store |
| FORM-015 | `PATCH /api/admin/secretaries` | Owner + CSRF | `section:"hours"`, `userId`, shift times, `workDays` | `200` | **Prisma** | No | Preset overwrite |
| FORM-016 | `DELETE /api/admin/secretaries` | Owner + CSRF | `userId` | `200` inactive | **Prisma** | No | Dual-store |
| FORM-017 | `PUT /api/admin/clinic-settings` | Owner + CSRF | `section:"contact"`, contact fields | `200` | **Prisma** | No | Weak FE error surfacing |
| FORM-022 | `POST /api/secretary/walk-in` | SECRETARY/ADMIN + CSRF | `fullName`, `phone`, `age?`, `city?` | `200` `{ok,requestId,queueNumber}` | **Prisma** | No | age `type=number` |
| FORM-023 | `POST /api/secretary/patients` | SECRETARY/ADMIN + CSRF | patient fields | `200` `{ok,patient}` | **Prisma** | No | Returns full patient |
| FORM-024 | `POST`/`PATCH /api/secretary/schedule-appointment` | — | patient/doctor/date/time | **Always `403`** | None | No | **Dead form** |
| FORM-027 | `POST /api/secretary/collect-charge` | SECRETARY/ADMIN + CSRF | `invoiceId`, `method`, optional ids | `200` `{ok}` | **Prisma** | No | — |
| FORM-031 | `POST /api/doctor/exam` | DOCTOR/ADMIN + CSRF | `entryId`, `action`, complete fields | `200` | **Prisma** | No | amount `type=number` |
| FORM-032 | Multiple doctor patient/account/schedule APIs | Specialist/ADMIN + CSRF | see inventory | mixed | **Prisma** | No | **Returns plaintext password** on create-account |

---

## Severity ranking for STEP 3–8

1. Eliminate dual-store for auth-capable accounts (Mongo only in Nest).
2. Stop returning plaintext passwords (FORM-032).
3. Fix or remove dead FORM-024 secretary schedule (or replace with working Nest schedule).
4. Unify password/phone validation constants.
5. Wire `apps/web` → Nest with credentials + CSRF.

## STEP 2 verification

| Check | Result |
| --- | --- |
| Contracts documented | OK |
| Code changes | None (audit only) |
| Lint/typecheck | N/A |
