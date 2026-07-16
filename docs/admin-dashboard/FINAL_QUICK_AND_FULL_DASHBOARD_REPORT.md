# Final Quick & Full Admin Dashboard Report

**Stamp:** `QUICK AND FULL ADMIN DASHBOARD MODES NOT COMPLETE`

**Date:** 2026-07-16  
**Stack under audit:** Next.js App Router (`apps/web`) → NestJS (`apps/api`) → MongoDB/Mongoose  
**Specification source:** `dashboard-spec/ALWISSAM_COMPLETE_DASHBOARD_SPECIFICATION.md`  
**pnpm:** 9.15.9  

**Formula required by product owner:**

```
QUICK MODE = ALL FEATURES DOCUMENTED IN ALWISSAM_COMPLETE_DASHBOARD_SPECIFICATION.md
FULL MODE  = QUICK MODE + ALL ADDITIONAL WORKING FEATURES IN THE CURRENT PROJECT
```

This report does **not** claim completion. Quick mode cannot yet equal the entire specification document: several documented live legacy surfaces still lack NestJS + MongoDB + Next.js implementations. Incomplete features remain **hidden** from navigation.

---

## 0. Authentication flow (Nest + Next — active stack)

| Step | Behavior |
|------|----------|
| Staff/patient login | `POST /api/auth/login` (Nest) validates credentials; sets HttpOnly cookies `alwisam_access` + `alwisam_refresh` |
| Session read | `GET /api/auth/me` via JwtAuthGuard; returns role, permissions, `adminDashboardMode` |
| Refresh | `POST /api/auth/refresh` rotates refresh cookie |
| Logout | Clears cookies / revokes session server-side |
| Authorization | Nest `RolesGuard` + `PermissionsGuard` + ownership/clinic-owner guards on sensitive admin routes |
| Mode preference | `GET/PATCH /api/admin/preferences` (+ `dashboard-mode`); persisted on User in MongoDB |
| Proxy | Next.js rewrites/proxies `/api/*` to Nest — **no** Next business API routes for clinic data |

**Not used in active path:** Prisma, PostgreSQL, Redis, opaque legacy cookie sessions, Next.js API routes for business logic.

**Legacy note:** Root `docker-compose.yml` still defines postgres/redis for the old monolith. Active local stack is `infrastructure/docker/docker-compose.target.yml` (Mongo + Nest API + Next web).

---

## 1. Complete specification-file audit

The specification documents a **legacy** Next monolith (Prisma + PostgreSQL, opaque cookie sessions). Rebuild constraint: NestJS + MongoDB only.

### 1.1 Auth (spec §4)

| Spec item | Nest/Mongo status |
|-----------|-------------------|
| Staff login | **Working** — JWT cookies |
| Patient login / register | **Working** |
| Staff via invitations | **Working** |
| QR patient login | **Missing** (hidden) |
| Opaque non-JWT sessions | Intentionally not reintroduced |

### 1.2 Roles & permissions (spec §5–6)

| Spec item | Nest/Mongo |
|-----------|------------|
| ADMIN / DOCTOR_SPECIALIST owner board | Working (`/doctor/specialist/*`) |
| DOCTOR_GENERAL exam board | Partial (queue start/complete only) |
| SECRETARY reception | Working as split pages + hub strip |
| PATIENT portal | Working |
| `/admin/roles`, `/admin/permissions` stubs | Hidden |

### 1.3 Admin/Owner live map (spec §9.1)

| Spec live feature | Nest status |
|-------------------|-------------|
| Specialist dashboard | Owner overview (not full legacy exam board) |
| Doctors CRUD | Working |
| Secretaries CRUD + hours | Partial (shift on create + login gate; no post-create hours UI) |
| Staff activity `/staff/[userId]/activity` | **Working** (audit filter `?userId=`) |
| Specialist patients board | **Partial** — searchable list only (no QR/account/schedule tabs) |
| Settings contact/hours/pages | Collapsed to one settings page |
| Reviews / Before-After / Specialties CMS | Spec **NOT FOUND** in legacy → Nest working → **Full extras** |

### 1.4 Doctor / secretary / clinical (spec §10–20)

| Area | Nest status |
|------|-------------|
| General thin exam board | Partial |
| Clinical exam notes / charge on complete | Missing |
| Dental chart | Missing |
| Staff chat + voice | Missing |
| Ortho workflows | Missing |
| Reception ops (patients, appointments, today, directed, assignment, payments) | Working |
| Patient↔doctor messages | Patient UI + **doctor UI (Full)** + Nest APIs |

### 1.5 Spec items marked NOT FOUND

Must not invent for Quick. Nest CMS modules that exist → **Full**, not invented Quick “legacy parity.”

---

## 2. Current-project feature audit

### 2.1 Working staff UI (Admin/Owner relevant)

**Quick surfaces:** owner dashboard, doctors, secretaries, specialist patients (list), invitations, settings, audit-logs, staff activity (deep-link), general doctor dashboard, secretary hub + today/directed/patients/appointments/assignment-queue/payments  

**Full extras:** public-content CMS (experiences, before-after, specialties, services, faqs, reviews) + doctor patient-messages inbox  

### 2.2 Classification

| Class | Examples |
|-------|----------|
| Working | Doctors/secretaries CRUD, invitations, audit + per-user activity, reception ops, CMS, JWT auth, mode preference, doctor messages |
| Incomplete vs spec | Exam clinical depth, dental chart, staff chat/voice, QR login, specialist patient deep tabs, nested settings routes |
| Hidden | All incomplete/missing above |
| Obsolete | Legacy Prisma root stack; classic `/admin` stubs |

---

## 3. Features included in Quick mode (shipping set)

**Reality gate:** Quick lists every **working** Nest+Next feature that maps to documented live clinic-day / owner / reception / thin-exam surfaces — not the entire 2860-line document.

`ADMIN_QUICK_HREFS` / `quickModules()`:

- `/doctor/specialist/dashboard`
- `/doctor/specialist/doctors`
- `/doctor/specialist/secretaries`
- `/doctor/specialist/patients`
- `/doctor/specialist/invitations`
- `/doctor/specialist/settings`
- `/doctor/specialist/audit-logs`
- `/doctor/general/dashboard`
- `/secretary/dashboard`
- `/secretary/patients`
- `/secretary/appointments`
- `/secretary/today`
- `/secretary/directed`
- `/secretary/assignment-queue`
- `/secretary/payments`

Deep-link (not sidebar): `/doctor/specialist/staff/[userId]/activity`

Header when Quick is active: **عرض لوحة التحكم الشاملة**

---

## 4. Additional features included in Full mode

Full = Quick ∪ `ADMIN_FULL_EXTRA_HREFS`:

- `/doctor/specialist/public-content/patient-experiences`
- `/doctor/specialist/public-content/before-after`
- `/doctor/specialist/public-content/specialties`
- `/doctor/specialist/public-content/services`
- `/doctor/specialist/public-content/faqs`
- `/doctor/specialist/public-content/reviews`
- `/doctor/specialist/messages` (+ `/messages/[threadId]`)

Full never removes Quick hrefs (contract test enforced).

Header when Full is active: **عرض لوحة التحكم السريعة**

---

## 5. Features repaired this pass

| Repair | Detail |
|--------|--------|
| Specialist patients (Quick) | New page → `GET /api/patients`; wired into Quick nav + owner modules |
| Staff activity (Quick) | Page + `GET /api/admin/audit-logs?userId=`; links from doctors/secretaries |
| Doctors/secretaries shell | Wrapped in `DashboardShell` + session; activity links use Next `Link` |
| Doctor messages (Full) | `GET /api/doctor/messages/:threadId`; list/reply/close UI; patient names on list |
| Mode contract tests | Quick includes patients; Full extras include messages |
| i18n | `navSpecialistPatients`, `navDoctorMessages` (ar/en/fr) |

---

## 6. Features hidden because incomplete

| Spec-required / live-legacy feature | Reason hidden |
|-------------------------------------|---------------|
| Staff chat + voice | No Nest module / UI |
| Dental chart | Permission string only |
| Full clinical exam board + notes/charges | Thin waiting-room only |
| Specialist patients QR/account/schedule tabs | List-only board |
| QR patient login / create-patient-account | Absent |
| Ortho approval workflow | Absent |
| Nested settings contact/hours/pages routes | Collapsed to one working settings page |
| Classic `/admin/*` stubs | Intentionally not shown |
| Admin session-revoke UI | API exists; no admin UI yet |

---

## 7. Backend changes

| File | Change |
|------|--------|
| `apps/api/src/security/security.controller.ts` | Audit logs filter by `userId` |
| `apps/api/src/dashboard/dashboard.service.ts` | `specialistPatients` in quick; `doctorMessages` in full |
| `apps/api/src/dashboard/admin-dashboard-modes.spec.ts` | Contract updated |
| `apps/api/src/patient-portal/patient-portal.service.ts` | `doctorGetThread`; richer `doctorListThreads` |
| `apps/api/src/patient-portal/patient-portal.controller.ts` | `GET :threadId` for doctor messages |
| (prior) auth/dashboard mode helpers | `quick`/`full` + legacy `light` normalize |

---

## 8. Frontend changes

| File | Change |
|------|--------|
| `apps/web/lib/navigation.ts` | Quick + patients; Full + messages |
| `apps/web/lib/i18n/dictionaries.ts` | New nav labels |
| `apps/web/app/.../specialist/patients/page.tsx` | **New** Quick patients list |
| `apps/web/app/.../specialist/staff/[userId]/activity/page.tsx` | **New** activity viewer |
| `apps/web/app/.../specialist/messages/page.tsx` | **New** Full doctor inbox |
| `apps/web/app/.../specialist/messages/[threadId]/page.tsx` | **New** thread reply/close |
| `apps/web/app/.../specialist/doctors/page.tsx` | DashboardShell + activity link |
| `apps/web/app/.../specialist/secretaries/page.tsx` | DashboardShell + activity link |
| (prior) `DashboardShell.tsx` | Mode toggle + Arabic labels + Mongo persistence |

---

## 9. MongoDB changes

- No collection reset; no duplicate users.
- Preference field: `users.adminDashboardMode` (`quick` \| `full`; legacy `light` → `quick` on read).
- Medical message threads/messages unchanged; doctor read path marks patient messages read.
- No destructive migration required.

---

## 10. Permission verification

- Mode switch: Owner / `DOCTOR_SPECIALIST` only (`canUseAdminDashboardModes` + ClinicOwnerGuard on preferences).
- Mode never grants/removes permissions.
- Doctor messages: Nest requires `DOCTOR_GENERAL` \| `DOCTOR_SPECIALIST` (treating doctor ownership on threads).
- Patients / Secretaries / General doctors do not get Admin mode switch unless role qualifies.

---

## 11. Mode-switch verification

1. Login as Admin/Owner → `/ar/doctor/specialist/dashboard`
2. Click **عرض لوحة التحكم الشاملة** → nav gains CMS + doctor messages; session/locale unchanged
3. Click **عرض لوحة التحكم السريعة** → Full-only links hide; Quick links remain
4. No full browser reload (client state + `PATCH`)

---

## 12. Mode-persistence verification

1. `PATCH /api/admin/preferences/dashboard-mode` `{ "mode": "full" }` → Mongo `adminDashboardMode: "full"`
2. `GET /api/admin/preferences` → `"full"`
3. Relogin / refresh → `/api/auth/me` returns same mode
4. Legacy `"light"` → treated as `"quick"`

---

## 13. Exact files changed (this completion pass)

- `apps/web/lib/navigation.ts`
- `apps/web/lib/i18n/dictionaries.ts`
- `apps/web/app/[locale]/doctor/specialist/patients/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/staff/[userId]/activity/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/messages/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/messages/[threadId]/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/doctors/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/secretaries/page.tsx`
- `apps/api/src/dashboard/dashboard.service.ts`
- `apps/api/src/dashboard/admin-dashboard-modes.spec.ts`
- `apps/api/src/patient-portal/patient-portal.service.ts`
- `apps/api/src/patient-portal/patient-portal.controller.ts`
- `apps/api/src/security/security.controller.ts` (userId filter — prior turn)
- `docs/admin-dashboard/FINAL_QUICK_AND_FULL_DASHBOARD_REPORT.md` (this file)

---

## 14. Commands executed

| Command | Result |
|---------|--------|
| `pnpm lint` | Pass (stubs: lint not configured for api/web) |
| `pnpm typecheck` | **Pass** |
| `pnpm test` | **Pass** — 71 api + 13 validation tests |
| `pnpm test:e2e` | **Fail** — Playwright public/mobile suites (20 passed in last summary; many mobile RTL/public failures pre-existing; not Admin-mode regressions) |
| `pnpm build` / web rebuild after `rm -rf apps/web/.next` | **Pass** (first attempt failed on corrupted `.next` chunk `./6463.js`) |
| `docker compose config` (root) | Validates **legacy** postgres/redis compose |
| `docker compose build` (root) | **Fail** — legacy Dockerfile `npm ci` |
| `docker compose -f infrastructure/docker/docker-compose.target.yml config` | **Pass** |
| `docker compose -f infrastructure/docker/docker-compose.target.yml build` | **Pass** — `docker-api` + `docker-web` images |

---

## 15. Test results summary

| Gate | Status |
|------|--------|
| Unit / contract tests | Green |
| Typecheck | Green |
| Production Next build | Green (after clean `.next`) |
| E2E full suite | Red (public mobile) |
| Target Docker build | Green |
| Root legacy Docker | Red / not the active stack |

---

## 16. Remaining issues (blockers for COMPLETE stamp)

1. **Quick ≠ full specification** until staff chat+voice, dental chart, clinical exam depth, specialist patient deep tabs/QR, ortho, and nested settings parity are implemented end-to-end (UI + Nest + Mongo + authz + tests).
2. Full Playwright suite fails on public mobile/RTL suites unrelated to Admin Quick/Full.
3. Specialist dashboard remains an **owner ops overview**, not the legacy exam-board product truth in §9–10.
4. Root `docker-compose.yml` still advertises postgres/redis — operators must use **target** compose for Nest+Mongo.
5. Optional: one-time idempotent script to rewrite stored `light` → `quick` (read path already safe).

---

## 17. Completion checklist (owner formula)

| Criterion | Status |
|-----------|--------|
| Quick contains every feature documented in the specification | **FAIL** — incomplete features hidden |
| Full = Quick + every additional working project feature | **PASS** for currently complete Nest extras (CMS + doctor messages); session-revoke UI still absent |
| All visible features have Next UI + Nest API + Mongo | **PASS** for visible set |
| No Prisma/SQL/Redis/Next business APIs in active path | **PASS** (legacy root compose is not the active app) |
| Critical unit/typecheck/build pass | **PASS** |
| E2E all green | **FAIL** |

**Verdict:** Quick/Full Admin dashboard modes are **shipping and usable** for the working Nest feature set, with honest **NOT COMPLETE** stamp until every documented live-spec surface is fully repaired.
