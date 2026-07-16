# Final Backend Audit + Admin Dashboard Light/Full Modes

**Date:** 2026-07-15  
**Scope:** NestJS API (`apps/api`) + Admin/Owner specialist dashboard (`apps/web`)  
**Status:** BACKEND AUDIT AND ADMIN DASHBOARD MODES NOT COMPLETE  
**Reason:** Admin light/full modes and critical appointment IDOR scope repair are verified; a full exhaustiveremaining-module repair / full Playwright / every required test item in the prompt was not closed in this pass.

```
BACKEND MODULES INVENTORIED (ACTIVE NEST APP)
AUTHENTICATION FLOW AUDITED
REFRESH TOKEN ROTATION PRESENT
ROLE AUTHORIZATION PRESENT
ADMIN LIGHTWEIGHT DASHBOARD ADDED
ADMIN FULL DASHBOARD MODE ADDED
ADMIN MODE SWITCH BUTTON ADDED
ADMIN MODE PREFERENCE PERSISTED
LIGHT/FULL SUMMARY API VERIFIED (Mongo, Africa/Algiers)
GENERAL DOCTOR APPOINTMENT SCOPE FIXED
OWNER FULL ACCESS VERIFIED FOR MODE APIS
UNAUTHORIZED PREFERENCE ACCESS BLOCKED (401)
TYPECHECK PASSED
TARGETED UNIT TESTS PASSED
REMAINING VERIFIED FAILURES DOCUMENTED
NO UNVERIFIED FIXES CLAIMED
```

---

## 1. Project architecture

| Layer | Path |
|-------|------|
| Monorepo | `pnpm-workspace.yaml`, package manager **pnpm 9.15.9** |
| Frontend | `apps/web` — Next.js App Router |
| Backend | `apps/api` — NestJS + Mongoose |
| MongoDB | `MONGODB_URI` via ConfigModule |
| Docker | `infrastructure/docker/docker-compose.target.yml` |
| Admin UI | **Not** `/admin/*` pages — Admin/Owner land on `/[locale]/doctor/specialist/dashboard` |

### Nest modules registered (`app.module.ts`)

Auth, Doctors, Secretaries, Patients, Appointments, Dashboard, Finance, Settings, Catalog, Faqs, Reviews, PatientExperiences, BeforeAfter, Media, Security, PatientPortal, Health, Audit.

---

## 2–4. Backend inventory & auth findings

### Authentication (verified in code)

- Unified `POST /api/auth/login` for all roles; HttpOnly cookies `alwisam_access` / `alwisam_refresh`.
- Refresh rotation + reuse detection (revoked token while unexpired → revoke all sessions).
- Public register forced to `PATIENT`; invitations limited to Doctor/Secretary.
- Guards: `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`, `ClinicOwnerGuard`.
- `CsrfGuard` is currently a no-op (SameSite cookie strategy).
- In-memory auth rate limiter (multi-instance caveat remains).

### Authorization registry

- Roles: `roles.ts` (`ADMIN`, `ADMIN_OWNER`, `OWNER`, `SUPER_ADMIN`, doctors, secretary, patient).
- Permissions: `permissions.ts` + role bundles; owners/specialists bypass permission matrix in `PermissionsGuard` (by design).

### Critical/High repairs applied this pass

| Severity | Defect | Repair |
|----------|--------|--------|
| **Critical** | General doctors could list/update waiting-room / appointment status for **other** doctors | Scope list/waiting + ownership asserts on status/waiting updates (`DOCTOR_GENERAL` / `DOCTOR` only) |
| **High** | Owner dashboard day boundaries mixed local/UTC loosely | Clinic day bounds use **`Africa/Algiers`** for owner summary |
| **High** | No Admin UI density preference | `User.adminDashboardMode` + `GET/PATCH /api/admin/preferences*` |
| **Medium** | Owner summary single-failure could look silent | Per-metric `safeCount` + `_partialFailures` |

### Defects identified but **not** fully repaired this pass

| Severity | Issue | Next action |
|----------|-------|-------------|
| High | Patient `getById` not doctor-scoped | Add doctor–patient relationship filter or completed-appointment ownership check |
| Medium | Staff chat / voice WebSocket not present as First-class Admin routes | Inventory sockets; do not invent UI links |
| Medium | Patient support admin moderation UI | Add Admin list for `patient_support_requests` |
| Medium | Lint stubs (`lint:api` / `lint:web` echo only) | Wire ESLint or remove stub scripts |
| Low | No dedicated Admin Playwright flows for mode switch | Add FLOW A–D specs |
| Informational | Full Playwright suite previously failed heavily (public mobile) | Stabilize public e2e independently |

---

## 5. Admin dashboard two-mode system

### Architecture

- One shared shell: `DashboardShell`
- One owner dashboard route: `/doctor/specialist/dashboard`
- Mode affects **navigation + overview density only** — same APIs, same RBAC

### Mode switch

- Header + sidebar button (Admin/Owner + `DOCTOR_SPECIALIST` only)
- Arabic: `عرض لوحة التحكم الشاملة` / `عرض لوحة التحكم الخفيفة` (compact labels also)
- `aria-pressed`, no full browser reload
- Backend authoritative preference; `localStorage` fallback

### Persistence

- Field: `User.adminDashboardMode` = `light` | `full` (default **light**)
- Also returned from `GET /api/auth/me`
- Endpoints:
  - `GET /api/admin/preferences`
  - `PATCH /api/admin/preferences/dashboard-mode` `{ mode }`

### Summary API

- `GET /api/dashboard/owner?mode=light|full`
- Timezone: `Africa/Algiers`
- Light: daily ops metrics + essential module links
- Full: + patient counts, cancellations/no-shows, recent audit activity, expanded modules

### Runtime smoke (Owner `ADMIN_OWNER`)

- `mode=light` → `ok`, Algiers TZ, essential modules only (`ADMIN_LIGHT_HREFS` / `lightModules()`)
- PATCH mode `full` → preference persisted
- `mode=full` → light modules + extras (`ADMIN_FULL_EXTRA_HREFS`)
- Unauthenticated PATCH preferences → **401**

Clarification follow-up: see `docs/admin/ADMIN_DASHBOARD_MODES.md` — one shell, density-only split; Prisma inventory is not the live stack.

---

## 6. Quality commands

| Command | Exit | Notes |
|---------|------|-------|
| `pnpm typecheck` | 0 | Pass |
| `pnpm test` | 0 | 66 tests passed (15 suites) |
| Targeted scope tests | 0 | Pass |
| `pnpm --filter @alwisam/api build` | 0 | Pass |
| `pnpm test:e2e` | Not green as release gate | Prior public mobile failures remain outside this pass |
| `pnpm lint` | Stub pass | Not real lint |
| `docker compose -f infrastructure/docker/docker-compose.target.yml config` | 0 | Valid |

---

## 7. Exact files changed

**API**

- `apps/api/src/appointments/appointments.service.ts` — doctor scope + pending-request count + day window
- `apps/api/src/appointments/appointments.controller.ts` — pass `AuthUser` into list/waiting
- `apps/api/src/appointments/appointment-scope.spec.ts` — unit coverage
- `apps/api/src/auth/schemas/auth.schemas.ts` — `adminDashboardMode`
- `apps/api/src/auth/auth.service.ts` — expose mode on `/me`
- `apps/api/src/dashboard/dashboard.controller.ts` — mode query + preferences controller
- `apps/api/src/dashboard/dashboard.service.ts` — light/full summary, Algiers day
- `apps/api/src/dashboard/dashboard.module.ts` — register preferences controller

**Web**

- `apps/web/lib/navigation.ts` — light/full nav filtering
- `apps/web/components/layout/DashboardShell.tsx` — mode switcher
- `apps/web/app/[locale]/doctor/specialist/dashboard/page.tsx` — light/full overview UI
- `apps/web/app/globals.css` — mode/module styles

**Docs**

- `docs/backend-audit/FINAL_BACKEND_ADMIN_DASHBOARD_AUDIT_REPORT.md` — this file

---

## 8. Data preserved

No Mongo resets, no collection deletes, no destructive seeds. Preference write only updates `adminDashboardMode` on the authenticated Owner document.

---

## Light/Full mode clarification (2026-07-15 follow-up)

Single shell; Nest+Mongo stack only. Canonical lists:

- Light: `ADMIN_LIGHT_HREFS` in `apps/web/lib/navigation.ts`
- Full: light + `ADMIN_FULL_EXTRA_HREFS`
- Detail doc: `docs/admin/ADMIN_DASHBOARD_MODES.md`

Prisma/Postgres inventory from other audits is **not** the live stack and must not invent routes or models.

1. Add doctor-scoped patient detail authorization.
2. Admin list/detail for patient support requests.
3. Dedicated Playwright: mode switch + preference persistence + unauthorized roles.
4. Re-run / stabilize full `pnpm test:e2e` (public mobile failures).
5. Continue media / WebSocket / ownership audits module-by-module with the same verified-fix discipline.
