# Al Wissam Complete Dashboard Specification

> **Document ID:** ALWISSAM_COMPLETE_DASHBOARD_SPECIFICATION  
> **Project:** عيادة الوسام لطب الأسنان (`al-wisam-dental`)  
> **Audit mode:** READ-ONLY — application source, DB data, env secrets, and deployments were not modified  
> **Evidence labels used throughout:** `VERIFIED IN SOURCE` · `STATIC ANALYSIS ONLY` · `UI ONLY` · `API ONLY` · `INCOMPLETE` · `MOCKED` · `NOT FOUND` · `VERIFIED AT RUNTIME` (none — local runtime not started during this audit)  
> **Secrets policy:** No passwords, tokens, private DB URLs, or real patient PHI are included. Seed credentials are referenced by env var names only.

---

## 1. Document Purpose

This file is the **single master specification** for rebuilding the Al Wissam clinic **Dashboard** (staff + patient portals) with **exact feature parity** to the audited codebase.

A developer or AI agent receiving **only this file** must be able to recreate:

- The same pages, menus, roles, and permission boundaries (as actually enforced)
- The same forms, buttons, workflows, and status transitions
- The same APIs, database relationships, validations, and audit events
- The same loading/empty/error and responsive behavior that exist in source
- The same gaps: stubs, redirects, orphaned APIs, and intentionally blocked features

**Critical honesty rule:** Features requested in generic clinic briefs (reviews, before/after galleries, patient–doctor messaging, WebSockets, MongoDB, Prisma-free stacks) that **do not exist** in this project are marked `NOT FOUND` and must **not** be invented for “parity with screenshots.”

**Database reality (verified):** This project uses **PostgreSQL + Prisma**, not MongoDB/mongoose. Parity rebuilds may keep PostgreSQL+Prisma or re-implement the same relational model on another store — but the **schema shape, enums, and relationships below must be preserved**.

---

## 2. Project Architecture

| Item | Verified value | Evidence |
|------|----------------|----------|
| Project root | Workspace containing `package.json`, `src/`, `prisma/` | `VERIFIED IN SOURCE` |
| App style | Next.js App Router monolith (UI + API routes in one app) | `src/app/**` |
| Frontend | React 19 Client/Server Components | `package.json` |
| Backend | Next.js Route Handlers under `src/app/api/**/route.ts` | 32 route files |
| Server Actions | **None** (`"use server"` not used) | `STATIC ANALYSIS ONLY` |
| Database | PostgreSQL 16 | `docker-compose.yml`, `prisma/schema.prisma` |
| ODM/ORM | **Prisma 7** (`@prisma/client`, `@prisma/adapter-pg`) | `package.json` |
| Cache / rate-limit store | Redis 7 (optional; in-memory fallback) | `ioredis`, `src/lib/auth/rate-limit.ts` |
| Auth sessions | Opaque cookie session hashed in DB (`Session`) | `src/lib/auth/session.ts` |
| Realtime | SSE endpoint exists; chat uses **HTTP polling** | `api/realtime/stream`, `StaffChatWidget` |
| File storage | Local `UPLOAD_DIR` or Vercel Blob | `src/lib/files/storage.ts` |
| i18n | Public site `ar`/`fr`/`en`; dashboards **Arabic-only** | `src/i18n/*` |
| Deploy | Docker Compose local; Render blueprint; platform build `npm run build` | `Dockerfile`, `render.yaml`, `README.md` |
| Layout strategy | No nested `layout.tsx` per role — pages wrap `DashboardShell` | `VERIFIED IN SOURCE` |
| Locale routes | **No** `/ar/...` prefix — flat paths | `VERIFIED IN SOURCE` |

### High-level request flow

```
Browser (RTL Arabic UI)
  → Next.js page (requireUser / requirePatientUser)
  → Client fetch/form → /api/* (session cookie + x-csrf-token on staff mutations)
  → Prisma → PostgreSQL
  → Optional Redis (rate limits, clinic:waiting-room / clinic:appointments pub keys)
  → AuditLog row on many writes
```

### Role product reality (important)

| Concept | Reality in code |
|---------|-----------------|
| Separate Admin app | Mostly **legacy stubs/redirects**. Clinic owner runs as **ADMIN role** (and/or specialist doctor profile) on **`/doctor/specialist/*`** |
| Separate Owner role | **NOT FOUND** as `RoleCode` — ownership = `isClinicOwner()` |
| Receptionist role | **NOT FOUND** — reception = `SECRETARY` |
| Specialist Doctor | `DOCTOR_SPECIALIST` + `Doctor.type = SPECIALIST` |
| Patient portal | Intentionally **one live page** (`/patient/dashboard`); other patient routes are stubs/redirects |

---

## 3. Technology Stack

### Runtime & tooling

| Layer | Version / choice | Source |
|-------|------------------|--------|
| Node | `>=20` (README prefers 22) | `package.json` `engines` |
| Package manager | npm (`package-lock.json`) | lockfile present |
| Framework | Next.js **16.2.10** | `package.json` |
| React | **19.2.4** | `package.json` |
| TypeScript | 5.x | `tsconfig.json`, `typescript` |
| CSS | Tailwind CSS **v4** via `@import "tailwindcss"` (no classic `tailwind.config`) | `globals.css`, `postcss.config.mjs` |
| Forms | `react-hook-form` + `@hookform/resolvers` + Zod 4 | deps |
| Validation | Zod (`src/lib/validations/index.ts` — **4 schemas only**) | |
| State | Minimal Zustand dep present; dashboards mostly server-render + client fetch | |
| Charts | `recharts` present — **live doctor dashboards do not use StatCard report view** | orphan `DoctorDashboardView` |
| Icons | `lucide-react` | `DashboardShell` |
| Dates | `date-fns`, `date-fns-jalali` | |
| Password | `bcryptjs` cost **12** | `src/lib/auth/password.ts` |
| JWT library | `jose` in deps — **session auth does not use JWT** | `NOT FOUND` as session mechanism |
| QR | `qrcode` for patient QR access | create-patient-account flow |
| Themes | `next-themes` present | public/system usage |

### Docker services

| Service | Image | Host port | Container |
|---------|-------|-----------|-----------|
| postgres | `postgres:16-alpine` | 5433→5432 | `alwisam-postgres` |
| redis | `redis:7-alpine` | 6380→6379 | `alwisam-redis` |
| app | build from `Dockerfile` | 3000 | `alwisam-app` |

Env template: `.env.example` (document keys only; never commit real secrets).

### Test frameworks

| Item | Status |
|------|--------|
| Jest / Vitest / Playwright / Cypress | **NOT FOUND** in `package.json` scripts/deps |
| Automated acceptance tests | **NOT FOUND** |

---

## 4. Authentication

### 4.1 Mechanism summary — `VERIFIED IN SOURCE`

- **Not JWT access/refresh.** Opaque cookie `alwisam_session` = 32-byte hex; DB stores SHA-256 `tokenHash`.
- CSRF: per-session `csrfToken` (24-byte hex); mutating staff APIs require header `x-csrf-token`.
- Cookie flags: `httpOnly`, `sameSite=lax`, `path=/`, `secure` via `cookieSecure()` (`COOKIE_SECURE` env or production/platform signals).
- TTL: `SESSION_MAX_AGE_HOURS` default **12**; `SESSION_REMEMBER_DAYS` default **30** when `rememberMe`.
- Password: bcrypt hash verify; min length login **6**, activate/reset **8**.

### 4.2 Login endpoints

#### `POST /api/auth/login`

| Field | Rule |
|-------|------|
| Body | `{ identifier, password, rememberMe?, portal? }` |
| Zod | `loginSchema` — identifier ≥3, password ≥6 |
| portal | `"patient"` if `body.portal === "patient"`, else `"staff"` (not in Zod) |
| Lookup | User by email **or** phone, `deletedAt: null` |
| Portal gate | Patient portal rejects non-`PATIENT`; staff rejects `PATIENT` |
| Lockout | After `MAX_LOGIN_ATTEMPTS` (default 5) failures → `lockedUntil` + status `LOCKED`; HTTP **423** while locked |
| Rate limit | `login:{ip}:{identifier}` — max attempts / 15 minutes |
| Secretary | After password OK → `SecretaryProfile` + `isWithinSecretaryShift` (Africa/Algiers) or **403** |
| Success | `createSession` + cookie; audit `LOGIN_SUCCESS`; reset failed count; `{ ok, redirectTo, user }` |
| Fail | audit `LOGIN_FAILED`; `LoginHistory` |

#### UI pages

| Portal | Path | Body extras |
|--------|------|-------------|
| Staff | `/staff/login` | `portal: "staff"`, rememberMe UI |
| Patient | `/patient/login` | `portal: "patient"` (no rememberMe UI) |

#### Passwordless patient QR — `GET /patient/qr/[token]`

- Find `PatientAccount` by `qrAccessToken` + `ACTIVE`
- Create session `rememberMe: true`
- Redirect `/patient/dashboard`
- Audit `PATIENT_QR_LOGIN`

### 4.3 Registration — clarifies naming

| User-facing “Register” | Actual behavior |
|------------------------|-----------------|
| `/register` | Redirects to `/#register` |
| Homepage `#register` / public form | Creates **AppointmentRequest** via `POST /api/public/appointments` — **not** a User account |
| Patient User accounts | Created by clinic staff (specialist/secretary checkout paths), not public self-signup |

### 4.4 Account activation

| Path | API | Rules |
|------|-----|-------|
| `/activate-account` | `POST /api/auth/activate` | `token` + `password` ≥8; mark `ActivationToken.usedAt`; User+PatientAccount → `ACTIVE`; **no auto-login** |

### 4.5 Password reset

| Step | Method | Path | Notes |
|------|--------|------|-------|
| Request | POST | `/api/auth/password-reset` | Rate 5/hr/IP; always generic success; **no email/SMS send** in production (`INCOMPLETE` delivery); `devToken` only in development |
| Confirm | PUT | `/api/auth/password-reset` | token + password ≥8; clears lock; UI redirects to `/staff/login` |

### 4.6 Logout

- `POST /api/auth/logout` — revoke session, clear cookie, audit `LOGOUT`
- UI: sidebar form (staff) or patient header button

### 4.7 Middleware — `src/middleware.ts`

- Matcher: `/admin`, `/secretary`, `/doctor`, `/patient/*`, `/patients/*`
- Check: **cookie presence only** — does **not** validate role/CSRF/session integrity
- Missing cookie → `/patient/login?next=` or `/staff/login?next=`
- Role enforcement: page `requireUser` / API checks

### 4.8 NOT FOUND in auth

- Refresh tokens / rotation  
- Runtime 2FA (fields exist on `User` unused)  
- OAuth  
- WebSocket auth  
- Post-login secretary kick-out when shift ends  
- `revokeAllUserSessions` call sites  
- `requirePermission` call sites (matrix unused at runtime)

### 4.9 Public Navbar authenticated behavior — `PublicChrome.tsx`

- **Not session-aware**
- Always shows patient login + register CTA
- Staff login link in **footer** only
- No “go to dashboard” / logout in public header when logged in

### 4.10 Post-login redirects — `roleDashboardPath`

| RoleCode | Destination |
|----------|-------------|
| ADMIN | `/doctor/specialist/dashboard` |
| DOCTOR_SPECIALIST | `/doctor/specialist/dashboard` |
| DOCTOR_GENERAL | `/doctor/general/dashboard` |
| SECRETARY | `/secretary/dashboard` |
| PATIENT | `/patient/dashboard` |

---

## 5. Roles

### 5.1 Role inventory (`enum RoleCode`) — `VERIFIED IN SOURCE`

| Internal ID | Arabic (`roleAr` / seed) | English meaning | French | Notes |
|-------------|--------------------------|-----------------|--------|-------|
| `ADMIN` | مدير النظام | System admin / clinic owner power | Administrateur | Default landing is specialist board, not `/admin` |
| `SECRETARY` | سكرتير | Secretary / reception | Secrétaire | Shift-gated login |
| `DOCTOR_GENERAL` | طبيب عام | General dentist | Médecin généraliste | |
| `DOCTOR_SPECIALIST` | طبيب أخصائي | Specialist dentist | Spécialiste | Clinic management UI when + SPECIALIST doctor profile |
| `PATIENT` | مريض | Patient | Patient | |

**Absent as RoleCode:** `OWNER`, `RECEPTIONIST`, `ADMIN_OWNER` combo role, nurse, etc. — `NOT FOUND`.

### 5.2 Clinic owner pseudo-role — `isClinicOwner(user)`

Returns true if:

1. `role.code === "ADMIN"`, **or**
2. `role.code === "DOCTOR_SPECIALIST"` **and** `user.doctor.type === "SPECIALIST"`

Used by `/api/admin/doctors`, `/api/admin/secretaries`, `/api/admin/clinic-settings`.

Seed pattern: clinic owner user may be stored as **ADMIN** with a specialist `Doctor` profile (see seed comments — no separate admin login branded account).

### 5.3 Per-role dashboard profile

#### ADMIN

| Topic | Spec |
|-------|------|
| Login | Staff portal |
| Register | Seed / clinic owner bootstrap only |
| Dashboard route | Effectively `/doctor/specialist/dashboard` |
| Sidebar in practice | `navDoctorSpecialistAr` |
| Forbidden | Patient portal login |
| Working hours | No login window restriction |

#### DOCTOR_SPECIALIST

| Topic | Spec |
|-------|------|
| Login | Staff |
| Invitation | Created by clinic owner via `/api/admin/doctors` |
| Landing | `/doctor/specialist/dashboard` |
| Sidebar | Exam, patients, doctors, secretaries, settings group |
| Ownership | Patient clinical actions for own doctorId; clinic owner extras via `isClinicOwner` |
| Public profile | `Doctor` + specialtyAr + working hours feed public site |

#### DOCTOR_GENERAL

| Topic | Spec |
|-------|------|
| Landing | `/doctor/general/dashboard` |
| Sidebar | Exam + patients only |
| Cannot open | Specialist staff CRUD / clinic settings (role allow-lists) |
| Account create for patients | `canCreateAccount={false}` on general dashboard |

#### SECRETARY

| Topic | Spec |
|-------|------|
| Login | Staff + **shift gate** (`workDays`, `workStartTime`–`workEndTime`, Africa/Algiers) |
| Landing | `/secretary/dashboard` (reception hub) |
| Sidebar | Single item «الاستقبال» |
| Clinical hide | Does not run doctor exam; sees reception/intake/waiting/pay fields |
| Chat peers | Doctors/admins only (no secretary↔secretary) |

#### PATIENT

| Topic | Spec |
|-------|------|
| Login | Patient portal or QR |
| Landing | `/patient/dashboard` (custom layout, not shell) |
| Sees | Session count, next appointment countdown, clinic contact |
| Hidden | Clinical notes depth, staff chat, finance write |
| Account creation | By clinic; activation page for pending path |

### 5.4 Display names (EN/FR for rebuild)

Dashboards hardcode Arabic. For multi-locale rebuild parity with **current** product:

| Role | EN | FR |
|------|----|----|
| ADMIN | Clinic owner / Admin | Propriétaire / Admin |
| SECRETARY | Reception secretary | Secrétaire d’accueil |
| DOCTOR_GENERAL | General dentist | Dentiste généraliste |
| DOCTOR_SPECIALIST | Specialist dentist | Dentiste spécialiste |
| PATIENT | Patient | Patient |

(Official `messages.ts` does not define role labels for dashboards — `STATIC ANALYSIS ONLY`.)

---

## 6. Permissions Matrix

### 6.1 Permission keys — `src/lib/auth/permissions.ts`

| Key | Meaning |
|-----|---------|
| `manage_users` | Manage user accounts |
| `manage_doctors` | Manage doctor staff |
| `manage_secretaries` | Manage secretaries |
| `manage_roles` | Manage roles |
| `manage_services` | Manage services catalog |
| `manage_schedules` | Manage schedules |
| `manage_settings` | Clinic settings |
| `view_audit_logs` | View audit logs |
| `view_all_reports` | View all reports |
| `manage_appointments` | Appointments / requests |
| `manage_waiting_room` | Waiting room |
| `manage_patients` | Patient records |
| `record_payments` | Record payments |
| `view_payments` | View payments |
| `edit_diagnosis` | Diagnoses |
| `edit_prescription` | Prescriptions |
| `edit_surgery` | Surgery cases |
| `edit_orthodontics` | Orthodontics |
| `edit_dental_chart` | Dental chart |
| `approve_patient_account` | Approve patient portal |
| `view_own_medical` | Patient own medical view |
| `request_appointment_change` | Patient appointment change request |

### 6.2 Static ROLE × PERMISSION matrix

Legend: **A** Allowed in static matrix · **D** Denied in matrix · **Runtime** notes whether APIs use it.

| Permission | ADMIN | SECRETARY | DOCTOR_GENERAL | DOCTOR_SPECIALIST | PATIENT |
|------------|-------|-----------|----------------|-------------------|---------|
| manage_users | A | D | D | D | D |
| manage_doctors | A | D | D | D | D |
| manage_secretaries | A | D | D | D | D |
| manage_roles | A | D | D | D | D |
| manage_services | A | D | D | D | D |
| manage_schedules | A | D | D | D | D |
| manage_settings | A | D | D | D | D |
| view_audit_logs | A | D | D | D | D |
| view_all_reports | A | D | D | D | D |
| manage_appointments | A | A | D | D | D |
| manage_waiting_room | A | A | D | D | D |
| manage_patients | A | A | A | A | D |
| record_payments | A | A | D | D | D |
| view_payments | A | A | A | A | D |
| edit_diagnosis | A | D | A | A | D |
| edit_prescription | A | D | A | A | D |
| edit_surgery | A | D | D | A | D |
| edit_orthodontics | A | D | D | A | D |
| edit_dental_chart | A | D | A | A | D |
| approve_patient_account | A | D | A | A | D |
| view_own_medical | A | D | D | D | A |
| request_appointment_change | A | D | D | D | A |

### 6.3 Enforcement reality — critical for parity

| Mechanism | Status |
|-----------|--------|
| Static `ROLE_PERMISSIONS` | Defined |
| `requirePermission()` | Defined but **unused** by routes — `Permission not implemented` at API layer |
| DB `Permission` / `RolePermission` / `UserPermission` | Seeded for ADMIN; **not consulted** for authz |
| Actual guards | **Role codes** + `isClinicOwner` + ownership (`doctorId`, patient link) |

**Parity rule:** Rebuild must either (a) keep role-based guards matching current APIs, or (b) wire permissions truly — but do not claim FE+BE permission keys are enforced today.

### 6.4 Admin UI for roles/permissions

- `/admin/roles`, `/admin/permissions` → **UI stubs** (EmptyState) — `INCOMPLETE`

---

## 7. Global Dashboard Layout

### Component: `DashboardShell` / `AppSidebar` / `TopHeader`

| Element | Behavior |
|---------|----------|
| Sidebar | Fixed **right** (`inset-y-0 right-0`), width `w-64`, `bg-navy`, white text |
| Visibility | `hidden lg:flex` — **no mobile drawer** |
| Logo | `ClinicLogo` light, links to first nav href |
| Active link | Exact path or prefix `href/` → `bg-white/15` |
| Nested groups | Expand/collapse; auto-open if child active |
| Footer | Truncated `userName` + logout form «تسجيل الخروج» |
| Main | `lg:pr-64`, `max-w-7xl`, `bg-background` |
| Chat | Always mounts `StaffChatWidget` (self-hides if unauthorized) |
| Patient exception | `/patient/dashboard` uses **custom** header layout without shell |

### Responsive summary

| Breakpoint (Tailwind) | Sidebar | Content |
|-----------------------|---------|---------|
| `< lg` (~1024px) | Hidden — **no hamburger** | Full width; staff must use page chrome only |
| `≥ lg` | Visible RTL right rail | Padded from right |

---

## 8. Navigation by Role

Nav source: `src/i18n/ar.ts` arrays. English/French sidebar arrays: **NOT FOUND**.

### 8.1 SECRETARY — `navSecretaryAr`

1. الاستقبال → `/secretary/dashboard` · `LayoutDashboard`

In-page tabs (`SecretaryReceptionHub`): مواعيد اليوم · المدخل · الانتظار · الدفع (`?tab=`).

### 8.2 DOCTOR_GENERAL — `navDoctorGeneralAr`

1. المعاينة → `/doctor/general/dashboard` · `Activity`  
2. مرضاي → `/doctor/general/patients` · `UserRound`

### 8.3 DOCTOR_SPECIALIST (+ ADMIN in practice) — `navDoctorSpecialistAr`

1. المعاينة → `/doctor/specialist/dashboard`  
2. مرضاي → `/doctor/specialist/patients`  
3. الأطباء → `/doctor/specialist/doctors`  
4. السكرتارية → `/doctor/specialist/secretaries`  
5. الإعدادات → group  
   - تواصل معنا → `.../settings/contact`  
   - مواعيد العمل → `.../settings/hours`  
   - صفحات الموقع → `.../settings/pages`  
   - عرض الأطباء → `.../settings/doctors`

### 8.4 ADMIN legacy — `navAdminAr` (stub pages)

لوحة التحكم، المستخدمون، الأطباء، السكرتارية، الخدمات، الجداول، الإعدادات، التقارير، سجل النشاط — many entries **redirect** into specialist routes; remaining are EmptyState stubs.

### 8.5 PATIENT — `navPatientAr`

1. حسابي → `/patient/dashboard` · (primary page does not render this sidebar)

### 8.6 Shared patient record

`/patients/[id]` — staff roles; page currently passes `navSecretaryAr` even for doctors (`VERIFIED IN SOURCE` quirk).

---


## 9. Admin/Owner Dashboard

**Product truth:** “Admin dashboard” features live primarily under **`/doctor/specialist/*`** for the clinic owner. Classic `/admin/*` is mostly redirects/stubs.

### 9.1 Feature map

| Feature | Live UI route | Status |
|---------|---------------|--------|
| Dashboard overview / exam board | `/doctor/specialist/dashboard` | Fully functional |
| Doctors CRUD | `/doctor/specialist/doctors` | Fully functional → `/api/admin/doctors` |
| Secretaries CRUD + hours | `/doctor/specialist/secretaries` | Fully functional → `/api/admin/secretaries` |
| Staff activity | `/doctor/specialist/staff/[userId]/activity` | Functional (audit viewer for staff) |
| Contact settings | `/doctor/specialist/settings/contact` | Functional |
| Working hours | `/doctor/specialist/settings/hours` | Functional |
| Public pages / FAQ content | `/doctor/specialist/settings/pages` | Functional |
| Doctor display (public) | `/doctor/specialist/settings/doctors` | Functional |
| Clinic info | Via clinic-settings sections | Functional API |
| Users admin page | `/admin/users` | Stub EmptyState |
| Services admin page | `/admin/services` | Stub (services seeded; no full CRUD UI) |
| Schedules admin | `/admin/schedules` | Redirect → specialist settings |
| Reports | `/admin/reports` | Stub |
| Audit logs page | `/admin/audit-logs` | Stub (activity via staff activity exists) |
| Backups | `/admin/backups` | Stub |
| Roles / Permissions pages | `/admin/roles`, `/admin/permissions` | Stub |
| Reviews moderation | — | **NOT FOUND** |
| Before/After CMS | — | **NOT FOUND** |
| Specialties entity CRUD | — | **NOT FOUND** (string `specialtyAr` on Doctor) |
| Notifications inbox | — | **NOT FOUND** |
| Revenue analytics dashboard | — | **NOT FOUND** as live StatCards (orphan component exists) |

### 9.2 Doctors management (owner)

| Action | UI | API | DB |
|--------|----|-----|-----|
| Create | `CreateDoctorForm` | `POST /api/admin/doctors` | User + Doctor |
| Edit login | `EditDoctorLoginForm` | `PATCH /api/admin/doctors` | User credentials |
| Soft delete | `DeleteDoctorButton` | `DELETE /api/admin/doctors` | doctor `isActive=false`, user `INACTIVE` |
| Auth | `isClinicOwner` + CSRF | | |

Fields (typical): fullName, email, phone, password, type GENERAL/SPECIALIST, specialtyAr, licenseNumber?, bioAr?, colorCode.

### 9.3 Secretaries management

| Action | API | Notes |
|--------|-----|-------|
| Create | `POST /api/admin/secretaries` | User + SecretaryProfile |
| Patch login | `PATCH` section `login` | |
| Patch hours | `PATCH` section `hours` | Uses `SHIFT_PRESETS` MORNING/EVENING/CUSTOM |
| Delete | `DELETE` | Soft-style inactivation |

Defaults on profile: `workStartTime` 07:00, `workEndTime` 14:00, `workDays` `SUN,MON,TUE,WED,THU,SAT`, `shiftCode` MORNING.

### 9.4 Clinic settings sections — `PUT /api/admin/clinic-settings`

| section | Writes | Audit |
|---------|--------|-------|
| `clinic_info` | `ClinicSetting` JSON | `CLINIC_INFO_UPDATED` |
| `contact` | contact fields + maps helpers | `CONTACT_UPDATED` |
| `doctor_profile` | Doctor public fields | `DOCTOR_PROFILE_UPDATED` |
| `working_hours` | `WorkingHour` upserts (MORNING/EVENING/DAY) | `WORKING_HOURS_UPDATED` |
| `public_pages` | homepage/about/FAQ/etc content | `PUBLIC_PAGES_UPDATED` |

---

## 10. Doctor Dashboard

### 10.1 General dentist — live features

| Feature | Route | Status |
|---------|-------|--------|
| Today exam board | `/doctor/general/dashboard` | Fully functional — `DoctorExamPanel` list |
| My patients | `/doctor/general/patients` | Fully functional — `DoctorPatientsList` + `DoctorPatientCard` |
| Patient detail redirect | `/doctor/general/patients/[id]` | Redirect → `/patients/[id]` |
| Appointments list page | `/doctor/general/appointments` | Redirect → dashboard |
| Account | `/doctor/general/account` | Redirect → dashboard |
| Referrals / Reports | stubs | Incomplete |

### 10.2 Specialist — live features

| Feature | Route | Status |
|---------|-------|--------|
| Exam board | `/doctor/specialist/dashboard` | Fully functional |
| Patients + account/QR/schedule tabs | `/doctor/specialist/patients` | Fully functional |
| Doctors / Secretaries / Settings | as nav | Fully functional |
| Orthodontics page | `/doctor/specialist/orthodontics` | Redirect → dashboard |
| Today / appointments | redirects | Redirect only |
| Operations / follow-ups / referrals / reports / surgeries | stubs | Incomplete |
| Ortho approval actions | on patient list UI | Fully functional API |
| Create patient account + QR | `DoctorPatientCard` / `SpecialistPatientRow` | Fully functional |
| Schedule appointment (day+shift) | card schedule tab | Fully functional |
| Refer to general | API exists | **API ONLY** — no exam-panel UI |
| Dental chart edit | `/patients/[id]` | Fully functional for doctors |
| Staff chat + voice | shell widget | Fully functional |

### 10.3 Exam actions (both doctor types)

| UI | API | WR status | Apt status | Audit |
|----|-----|-----------|------------|-------|
| معاينة (start) | `POST /api/doctor/exam` `action=start` | `WITH_DOCTOR` | `IN_TREATMENT` | `EXAM_STARTED` |
| إرسال للسكرتير (complete + amount) | `action=complete` | `SESSION_DONE` | `FOLLOW_UP_REQUIRED` + Invoice | `EXAM_COMPLETED_CHARGE` |
| complete + مغطى | complete covered | `LEFT` | `COMPLETED` | same family |

Ownership: entry must belong to doctor unless ADMIN.

### 10.4 Doctor patient card tabs

| Tab | Actions |
|-----|---------|
| overview | Demographics, next apt, finance summary, QR print, delete from list |
| schedule | Date+shift picker; types ORTHO_FOLLOWUP / GENERAL_EXAM / POST_OP_FOLLOWUP / OTHER → `/api/doctor/schedule-appointment` |
| account | Create/reactivate portal account; edit login; deactivate (specialist/owner) |
| edit | Patch patient info |

---

## 11. Secretary Dashboard

### 11.1 Primary product — Reception Hub

Route: `/secretary/dashboard`  
Components: `SecretaryReceptionHub`, tab loaders, `SecretaryAutoRefresh` (8s).

| Tab (`?tab=`) | Arabic | Purpose | Key controls |
|---------------|--------|---------|--------------|
| `today` | مواعيد اليوم | Pending check-ins today | Morning/evening lists; توجيه للطبيب; doctor select |
| `intake` | المدخل | Walk-in + website requests | `SecretaryWalkInForm`; `SecretaryRequestBar` edit/direct/delete/pay link |
| `waiting` | الانتظار | Directed patients | Doctor picker cards; دفع / إغلاق الزيارة / حذف |
| `pay` | الدفع | Open invoices + ledger | `CollectDoctorChargeForm` |

Default tab heuristic: pay if open invoices else waiting else today else intake.

### 11.2 Working hours enforcement

| Layer | Enforced? |
|-------|-----------|
| Login | **Yes** — `isWithinSecretaryShift` |
| After login (API calls overnight) | **No** continuous enforcement — `NOT FOUND` |
| Shift presets | MORNING 07:00–14:00; EVENING 16:00–22:00; CUSTOM |

### 11.3 Redirect compatibility routes

Many old URLs redirect into hub tabs (`/secretary/today`, `waiting-room`, `payments`, etc.).

### 11.4 Real non-hub pages

| Route | Status |
|-------|--------|
| `/secretary/messages` | Staff inbox UI (not in sidebar) |
| `/secretary/appointments/[id]` | Request detail |
| `/secretary/account` | Redirect → dashboard |

### 11.5 Clinical fields visibility

Secretary sees: name, phone, age, city, visit reason, chronic illnesses (reception), first visit, amounts/invoices, waiting statuses.  
Does **not** drive dental chart edits / exam complete charge creation (doctor does). Can collect pay and close visit.

### 11.6 Intentionally blocked

`POST|PATCH /api/secretary/schedule-appointment` → **always 403** with Arabic message that scheduling is only from owner doctor account. UI form may still call it → fails. Status: **Incomplete / blocked by design**.

---

## 12. Patient Dashboard

### 12.1 Live page `/patient/dashboard`

| Element | Behavior |
|---------|----------|
| Auth | `requirePatientUser` |
| Layout | Custom (logo + خروج) — not `DashboardShell` |
| Greeting | Welcome + patient name |
| Stat | Count of appointments with status `COMPLETED` («عدد الجلسات») |
| Next visit | Next appointment day or ortho `nextAppointment` |
| Countdown | `AppointmentCountdown` (day-only) |
| Contact | `PatientContactBanner` |

### 12.2 Other patient routes

| Route | Status |
|-------|--------|
| `/patient/appointments` | Redirect → dashboard (comment: single-page UX) |
| `/patient/profile`, `files`, `sessions`, `orthodontics`, `operations`, `prescriptions`, `payments`, `treatment-plan` | Shell + EmptyState stub «لا توجد بيانات بعد» |
| `/patient/login` | Public login |
| `/patient/qr/[token]` | QR login handler |

### 12.3 NOT FOUND on patient portal

- Medical case deep UI  
- Messaging with doctor  
- File upload UI  
- Appointment cancel/reschedule UI  
- Notification center  
- Account export/delete request flows  
- Privacy settings pages  

---

## 13. Daily Work

Timezone: **Africa/Algiers** for day bounds and shifts.

### Clinic shift periods (scheduling)

| Period | Hours (typical) |
|--------|-----------------|
| MORNING | 07:00–14:00 |
| EVENING | 16:00–22:00 |

### Daily work lifecycle (happy path)

1. Requests arrive (public/walk-in) → Intake  
2. Or doctor-scheduled `CONFIRMED` → Today check-in  
3. Direct / check-in → Waiting room `WAITING` + apt `WAITING_ROOM`  
4. Doctor starts exam → `WITH_DOCTOR` / `IN_TREATMENT`  
5. Doctor completes with charge → `SESSION_DONE` / `FOLLOW_UP_REQUIRED` + Invoice  
   or covered → `LEFT` / `COMPLETED`  
6. Secretary collects → `COMPLETED` / `LEFT`  
7. Day tracking sets (`clinic-day-tracking.ts`) prevent re-entry while busy

### Busy-day rule

Cannot re-direct/check-in patient if today's WR status ∈ `ARRIVED|WAITING|WITH_DOCTOR`.

---

## 14. Patient Queue

### Waiting room model `WaitingRoomEntry`

Statuses: `ARRIVED`, `WAITING`, `WITH_DOCTOR`, `SESSION_DONE`, `NEEDS_FOLLOWUP`, `LEFT`.

| Status AR | Writer in live path |
|-----------|---------------------|
| وصل | Arrive API (orphaned UI) / manual WR PATCH |
| ينتظر | Direct + scheduled check-in |
| دخل عند الطبيب | Exam start |
| أنهى الحصة | Exam complete unpaid |
| يحتاج موعد متابعة | Enum only — **writer NOT FOUND** |
| غادر | Covered complete / collect / close / remove |

### Queue number

Daily request number pattern `YYYYMMDD-N` via `daily-queue.ts` / appointment request numbering.

### Urgency

`WaitingRoomEntry.urgency` boolean exists; public emergency → request status `EMERGENCY`.

---

## 15. Appointments

### 15.1 Public booking

- Routes: `/book-appointment`, homepage register section  
- API: `POST /api/public/appointments` (rate 10/hr/IP)  
- Zod: `bookAppointmentSchema`  
- Creates `AppointmentRequest` only (not calendar Appointment until directed/confirmed)  
- Consent required  

### 15.2 Authenticated patient booking

**NOT FOUND** as separate authenticated booking API (patient uses public request or clinic-created appointments).

### 15.3 Doctor scheduling

- `POST|PATCH /api/doctor/schedule-appointment`  
- Day + optional shift; respects `WorkingHour`; one active apt/patient/day; past-day guards  
- Creates/updates `Appointment` status `CONFIRMED`

### 15.4 AppointmentStatus enum (all values)

`NEW_REQUEST`, `UNDER_SECRETARY_REVIEW`, `DOCTOR_ASSIGNED`, `WAITING_DOCTOR_APPROVAL`, `CONFIRMED`, `REMINDER_SENT`, `PATIENT_ARRIVED`, `WAITING_ROOM`, `IN_TREATMENT`, `COMPLETED`, `FOLLOW_UP_REQUIRED`, `RESCHEDULED`, `CANCELLED_BY_PATIENT`, `CANCELLED_BY_CLINIC`, `NO_SHOW`, `EMERGENCY`, `REFERRED_TO_OTHER_DOCTOR`

### 15.5 Live transitions (wired)

See sections 13–14. Weak/unused statuses: `DOCTOR_ASSIGNED`, `REMINDER_SENT` (filters), `WAITING_DOCTOR_APPROVAL` (stats), `RESCHEDULED`, `CANCELLED_BY_PATIENT`, `NO_SHOW`, `REFERRED_TO_OTHER_DOCTOR` — **no dedicated setter UI**.

### 15.6 Types (`AppointmentType`)

Includes clinical + `LASER_WHITENING`. Laser has **no extra reception fields** beyond type.

---

## 16. Patients

### Identity

- `Patient` clinical record (patientNumber unique, phone indexed)  
- Optional `PatientAccount` ↔ `User` for portal  

### Create paths

| Actor | How |
|-------|-----|
| Secretary | `POST /api/secretary/patients` + walk-in/direct auto patient upsert by phone |
| Specialist | Create/reactivate portal account APIs |
| Public | Only appointment request (may link patient later on direct) |

### Soft delete

`Patient.deletedAt`; specialist `DELETE /api/doctor/patient` scopes `account`|`patient`.

### Record page `/patients/[id]`

Demographics, dental chart, treatment plans list, appointments list, history snippets.

---

## 17. Medical Records

### Present in schema + partial UI

| Area | Model(s) | UI status |
|------|----------|-----------|
| Medical history | `MedicalHistory` | Created/updated from reception chronic illnesses on direct |
| Medical records notes | `MedicalRecord` | Loaded aspects; no full CMS UI |
| Dental chart | `DentalChart` + `DentalToothState` | Interactive for doctors via `/api/medical/dental-chart` |
| Diagnosis | `Diagnosis` | Schema; limited UI |
| Treatment plans | `TreatmentPlan` + stages/sessions | Listed on patient page |
| Prescriptions | `Prescription` + items | Schema; patient page stub |
| Orthodontics | `OrthodonticCase` + sessions | Account/approval flows live; dedicated page redirects |
| Surgery | `SurgeryCase` / `Operation` / follow-ups | Schema; specialist surgeries page stub |
| Prosthetics | `ProstheticCase` | Schema |
| Documents | `MedicalDocument` | Upload API; **no UI caller** |
| Consents | `PatientConsent` | Schema |

### Visibility matrix (practical)

| Field class | Doctor | Secretary | Patient | Admin/owner |
|-------------|--------|-----------|---------|-------------|
| Demographics | Yes | Yes | Limited on dashboard | Yes |
| Chronic / allergies reception | Yes | Yes | Not on slim dashboard | Yes |
| Dental chart edit | Yes | No (view page via shared route) | No | Yes if specialist access |
| Exam charges / invoices | View | Collect | No | Yes |
| Staff chat | Yes | Yes | No | Yes |

---

## 18. Doctors

See §9.2 and public `Doctor` fields: `type`, `specialtyAr`, `bioAr`, `licenseNumber`, `colorCode`, `isActive`, working hours, exceptions, services via `DoctorService`.

Public pages: `/doctors`, doctor cards from active doctors + settings forms.

Booking link behavior: public appointment request with optional preferred doctor in schema (public form may omit many optional fields).

---

## 19. Secretaries

See §9.3 + §11. No doctor–secretary assignment join table: peers are role-wide. Chat pairs secretaries with all active doctors/admins.

---

## 20. Staff Chat

### Scope

Staff-only DMs. **Not** patient–doctor messaging (`patientId` forced `null` in API).

### Peers

| Viewer | Sees |
|--------|------|
| Doctor/Admin | Active secretaries + other doctors/admins |
| Secretary | Active doctors/admins only |

### APIs

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/staff/chat` | Threads, unread; `?markRead=1` |
| POST | `/api/staff/chat` | Text message |
| DELETE | `/api/staff/chat` | Delete rules by kind |
| POST | `/api/staff/chat/voice` | multipart ≤2MB base64 `audioUrl` |

### UI `StaffChatWidget`

- Teal FAB bottom-left, unread badge (cap 9+)  
- Filters: الكل / أطباء / سكرتارية  
- Poll every **8 seconds**  
- Voice via MediaRecorder  
- `readAt` stored but **not shown** as ticks  
- Mounted from `DashboardShell`  

### Secretary messages page

`/secretary/messages` with `DeleteVoiceButton` for voice rows.

### NOT FOUND

Typing indicators, presence, WebSocket rooms, delivered status beyond unread count, patient context attachment, shift-end disconnect.


## 21. Voice Messages

| Rule | Value |
|------|-------|
| Max size | 2MB |
| MIME | webm/ogg/mpeg/mp4/wav (+ audio/* fallback) |
| Storage | Base64 data URL in `Message.audioUrl` (not Blob/disk pipeline) |
| Audit | `STAFF_CHAT_VOICE` |
| Delete | VOICE deletable by sender **or** receiver/secretary (API); widget always shows delete on voice |

---

## 22. Patient–Doctor Messaging

**NOT FOUND** as a product feature.

- No eligibility on completed appointments  
- No threads / emergency disclaimer / reopen rules  
- `Message.patientId` column exists but staff chat clears it  
- Do **not** implement for parity unless extending beyond current product  

---

## 23. Specialties

**NOT FOUND** as first-class Specialty model/table.

- Doctor field `specialtyAr` (string)  
- Public filtering by specialty string only where coded  
- No specialty CRUD, icons, featured flags entity  

Distinguish terms in this codebase:

| Term | Meaning here |
|------|--------------|
| Specialty | Free-text on Doctor |
| Service | `Service` catalog model |
| Treatment | `TreatmentPlan` / sessions |
| Procedure | Stage `procedure` string / appointment types |

---

## 24. Services

| Aspect | Status |
|--------|--------|
| Model | `Service` (code, nameAr, descriptionAr, duration, price, category, isActive) |
| Seed | Populated for AppointmentTypes |
| Admin UI `/admin/services` | Stub |
| Laser whitening | Auto-create service row when request type LASER_WHITENING |
| DoctorService | Join for custom duration/price |

---

## 25. Reviews

**NOT FOUND** — no Review model, submission, moderation, or homepage slider feature.

(Do not confuse `UNDER_SECRETARY_REVIEW` appointment status with patient reviews.)

---

## 26. Before/After

**NOT FOUND** — no before/after cases, comparison UI, or APIs.

---

## 27. Public Content Management

Managed via clinic-owner settings (not a separate CMS role):

| Content | Dashboard route | Persistence |
|---------|-----------------|-------------|
| Contact / maps / phone / WhatsApp / social | `/doctor/specialist/settings/contact` | `ClinicSetting` + env fallbacks |
| Working hours (doctor) | `/doctor/specialist/settings/hours` | `WorkingHour` |
| Public pages copy / FAQ items | `/doctor/specialist/settings/pages` | `ClinicSetting` via `public-pages.ts` |
| Doctor display / specialty text / bio | `/doctor/specialist/settings/doctors` | Doctor + settings |
| Clinic info | clinic_info section | `ClinicSetting` |

Public routes (not dashboard, but managed): `/`, `/about`, `/contact`, `/doctors`, `/services`, `/faq`, `/orthodontics`, `/surgery`, `/book-appointment`.

Publish/unpublish: typically `isActive` flags / JSON content — no separate Review-style moderation.

---

## 28. Notifications

### Model

`Notification` — channels `IN_APP|EMAIL|SMS|WHATSAPP`; statuses `PENDING|SENT|FAILED|READ`.

### Created in code (examples)

- Appointment request created → in-app for staff (service)  
- Checkout ortho notification path  

### UI inbox / bell

**NOT FOUND** — rows may exist in DB without dashboard consumer.

### Templates

`NotificationTemplate` seeded; outbound email/SMS/WhatsApp providers env-ready but **not fully implemented**.

---

## 29. Settings

| Setting area | Route / API | Runtime effect |
|--------------|-------------|----------------|
| Contact | settings/contact → clinic-settings `contact` | Public chrome / patient banner |
| Working hours | settings/hours | Doctor availability & booking |
| Public pages | settings/pages | FAQ/about content |
| Doctor display | settings/doctors | Public doctor cards |
| Secretary hours | secretaries PATCH hours | Login gate |
| Session/security | env vars | Cookie TTL, lockout, CSRF |
| Upload limits | `MAX_UPLOAD_SIZE_MB` | File API |
| Voice limit | hardcoded 2MB | Chat voice |
| Timezone | Africa/Algiers in libs | Day bounds |

Configurable vs fixed: clinic name/phone/address/images/hours/doctor names are **configurable**; role codes/status machines are **fixed**.

---

## 30. Reports and Statistics

### Live counters

| Surface | Metrics |
|---------|---------|
| Secretary hub tabs | Badge counts today/intake/waiting/pay |
| Patient dashboard | Completed sessions count |
| Staff chat | Unread counts |
| Doctor exam page | List of waiting/in-exam patients (no StatCard grid) |

### Present but unused

- `getDashboardStats()` in appointments service  
- `DoctorDashboardView` StatCards  
- `/admin/reports` EmptyState  
- SSE `requests`/`waiting` stats (no client)

Revenue dashboards: **NOT FOUND** as owned analytics UI (payments ledger exists in hub).

---

## 31. Database Models

**Engine:** PostgreSQL · **ORM:** Prisma · **Models:** 50 · **Enums:** 19 · **@@map:** none  

### Complete model list

1. User  
2. Role  
3. Permission  
4. RolePermission  
5. UserPermission  
6. Session  
7. LoginHistory  
8. PasswordResetToken  
9. ActivationToken  
10. Doctor  
11. SecretaryProfile  
12. Patient  
13. PatientAccount  
14. AppointmentRequest  
15. Appointment  
16. AppointmentStatusHistory  
17. WaitingRoomEntry  
18. MedicalHistory  
19. MedicalRecord  
20. DentalChart  
21. DentalToothState  
22. Diagnosis  
23. TreatmentPlan  
24. TreatmentPlanStage  
25. TreatmentSession  
26. OrthodonticCase  
27. OrthodonticSession  
28. SurgeryCase  
29. Operation  
30. PostOperationFollowUp  
31. ProstheticCase  
32. Prescription  
33. PrescriptionItem  
34. MedicalDocument  
35. PatientConsent  
36. Invoice  
37. Payment  
38. Installment  
39. Notification  
40. Message  
41. Service  
42. DoctorService  
43. WorkingHour  
44. DoctorScheduleException  
45. Holiday  
46. Referral  
47. AuditLog  
48. ClinicSetting  
49. FileAttachment  
50. NotificationTemplate  

### Soft-delete (`deletedAt`)

User, Patient, Appointment, MedicalDocument, FileAttachment.

### Absent models requested by generic briefs

`Review`, `BeforeAfter`, `Workday`, `QueueItem` (use WaitingRoomEntry), `StaffConversation` (use Message threads), `PatientDoctorThread`, `Specialty`, `PublicPage` (JSON in ClinicSetting), `SupportRequest`, `Visit`/`Consultation` as separate models (use WaitingRoom + Appointment).

### Field-level truth

Full field inventory lives in `prisma/schema.prisma` (1153 lines). Rebuild must copy enums and relations exactly. Key relations:

- User 1:1 Doctor | SecretaryProfile | PatientAccount  
- Patient 1:1 PatientAccount, DentalChart, MedicalHistory  
- Appointment 1:1 WaitingRoomEntry (optional), links Patient+Doctor  
- AppointmentRequest optionally links Appointment  
- Invoice → Payment[] / Installment[]  

---


### 31.1 Full enum value lists — `VERIFIED IN SOURCE` (`prisma/schema.prisma`)

**RoleCode:** `ADMIN` · `SECRETARY` · `DOCTOR_GENERAL` · `DOCTOR_SPECIALIST` · `PATIENT`

**Gender:** `MALE` · `FEMALE`

**AppointmentStatus:** `NEW_REQUEST` · `UNDER_SECRETARY_REVIEW` · `DOCTOR_ASSIGNED` · `WAITING_DOCTOR_APPROVAL` · `CONFIRMED` · `REMINDER_SENT` · `PATIENT_ARRIVED` · `WAITING_ROOM` · `IN_TREATMENT` · `COMPLETED` · `FOLLOW_UP_REQUIRED` · `RESCHEDULED` · `CANCELLED_BY_PATIENT` · `CANCELLED_BY_CLINIC` · `NO_SHOW` · `EMERGENCY` · `REFERRED_TO_OTHER_DOCTOR`

**AppointmentType:** `GENERAL_EXAM` · `EMERGENCY` · `TOOTHACHE` · `CLEANING` · `FILLING` · `EXTRACTION` · `ROOT_CANAL` · `ORTHO_CONSULT` · `ORTHO_FOLLOWUP` · `PROSTHETICS` · `SURGERY_CONSULT` · `SURGERY` · `POST_OP_FOLLOWUP` · `LASER_WHITENING` · `OTHER`

**WaitingRoomStatus:** `ARRIVED` · `WAITING` · `WITH_DOCTOR` · `SESSION_DONE` · `NEEDS_FOLLOWUP` · `LEFT`

**ToothState:** `HEALTHY` · `DECAY` · `FILLED` · `NEEDS_FILLING` · `ROOT_CANAL` · `CROWN` · `MISSING` · `IMPLANT` · `EXTRACTED` · `FRACTURED` · `INFLAMED` · `UNDER_OBSERVATION`

**TreatmentPlanStatus:** `NOT_STARTED` · `IN_PROGRESS` · `PAUSED` · `COMPLETED` · `CANCELLED`

**PaymentMethod:** `CASH` · `CARD` · `BANK_TRANSFER` · `OTHER`

**PaymentStatus:** `COMPLETED` · `VOIDED`

**InvoiceStatus:** `DRAFT` · `ISSUED` · `PARTIALLY_PAID` · `PAID` · `VOIDED`

**NotificationChannel:** `IN_APP` · `EMAIL` · `SMS` · `WHATSAPP`

**NotificationStatus:** `PENDING` · `SENT` · `FAILED` · `READ`

**DoctorType:** `GENERAL` · `SPECIALIST`

**PatientType:** `REGULAR` · `LONG_TERM`

**AccountStatus:** `PENDING` · `ACTIVE` · `INACTIVE` · `LOCKED`

**DayOfWeek:** `SUNDAY` · `MONDAY` · `TUESDAY` · `WEDNESDAY` · `THURSDAY` · `FRIDAY` · `SATURDAY`

**ScheduleExceptionType:** `SPECIAL_WORKING_DAY` · `SPECIAL_CLOSING_DAY` · `VACATION` · `BLOCKED_TIME` · `SURGERY_BLOCK` · `EMERGENCY_OVERRIDE` · `MORNING_CLOSED` · `EVENING_CLOSED`

**OrthodonticType:** `METAL_BRACES` · `CERAMIC_BRACES` · `LINGUAL` · `CLEAR_ALIGNERS` · `RETAINER` · `OTHER`

**SurgeryStatus:** `PLANNED` · `CONSENT_PENDING` · `SCHEDULED` · `IN_PROGRESS` · `COMPLETED` · `CANCELLED` · `COMPLICATED`

**RecurrenceFrequency:** `WEEKLY` · `BIWEEKLY` · `MONTHLY` · `CUSTOM`


### 31.2 Field inventory by model — `VERIFIED IN SOURCE`

Each line is the Prisma field declaration (type + attributes). Relations named as Prisma relation fields.


#### Model `User`

| Declaration |
|-------------|
| `id                String        @id @default(cuid())` |
| `email             String?       @unique` |
| `phone             String?       @unique` |
| `passwordHash      String` |
| `fullName          String` |
| `roleId            String` |
| `role              Role          @relation(fields: [roleId], references: [id])` |
| `status            AccountStatus @default(ACTIVE)` |
| `avatarUrl         String?` |
| `locale            String        @default("ar")` |
| `failedLoginCount  Int           @default(0)` |
| `lockedUntil       DateTime?` |
| `twoFactorEnabled  Boolean       @default(false)` |
| `twoFactorSecret   String?` |
| `lastLoginAt       DateTime?` |
| `createdAt         DateTime      @default(now())` |
| `updatedAt         DateTime      @updatedAt` |
| `deletedAt         DateTime?` |
| `doctor            Doctor?` |
| `secretary         SecretaryProfile?` |
| `patientAccount    PatientAccount?` |
| `sessions          Session[]` |
| `loginHistory      LoginHistory[]` |
| `auditLogs         AuditLog[]` |
| `notifications     Notification[]` |
| `messagesSent      Message[]              @relation("MessageSender")` |
| `messagesReceived  Message[]              @relation("MessageReceiver")` |
| `statusChanges     AppointmentStatusHistory[]` |
| `paymentsCreated   Payment[]              @relation("PaymentCreator")` |
| `paymentsVoided    Payment[]              @relation("PaymentVoider")` |
| `documentsUploaded MedicalDocument[]` |
| `fileAttachments   FileAttachment[]` |
| `userPermissions   UserPermission[]` |
| `passwordResets    PasswordResetToken[]` |
| `activationTokens  ActivationToken[]` |

Indexes/constraints:
- `@@index([roleId])`
- `@@index([status])`
- `@@index([deletedAt])`

#### Model `Role`

| Declaration |
|-------------|
| `id          String           @id @default(cuid())` |
| `code        RoleCode         @unique` |
| `nameAr      String` |
| `description String?` |
| `createdAt   DateTime         @default(now())` |
| `updatedAt   DateTime         @updatedAt` |
| `users       User[]` |
| `permissions RolePermission[]` |

#### Model `Permission`

| Declaration |
|-------------|
| `id          String           @id @default(cuid())` |
| `code        String           @unique` |
| `nameAr      String` |
| `module      String` |
| `description String?` |
| `roles       RolePermission[]` |
| `users       UserPermission[]` |

#### Model `RolePermission`

| Declaration |
|-------------|
| `id           String     @id @default(cuid())` |
| `roleId       String` |
| `permissionId String` |
| `role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)` |
| `permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)` |

Indexes/constraints:
- `@@unique([roleId, permissionId])`

#### Model `UserPermission`

| Declaration |
|-------------|
| `id           String     @id @default(cuid())` |
| `userId       String` |
| `permissionId String` |
| `granted      Boolean    @default(true)` |
| `user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)` |
| `permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)` |

Indexes/constraints:
- `@@unique([userId, permissionId])`

#### Model `Session`

| Declaration |
|-------------|
| `id               String   @id @default(cuid())` |
| `userId           String` |
| `user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)` |
| `tokenHash        String   @unique` |
| `csrfToken        String` |
| `ipAddress        String?` |
| `userAgent        String?` |
| `deviceInfo       String?` |
| `rememberMe       Boolean  @default(false)` |
| `expiresAt        DateTime` |
| `revokedAt        DateTime?` |
| `createdAt        DateTime @default(now())` |
| `lastActivityAt   DateTime @default(now())` |

Indexes/constraints:
- `@@index([userId])`
- `@@index([expiresAt])`

#### Model `LoginHistory`

| Declaration |
|-------------|
| `id         String   @id @default(cuid())` |
| `userId     String?` |
| `user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)` |
| `identifier String` |
| `success    Boolean` |
| `ipAddress  String?` |
| `userAgent  String?` |
| `reason     String?` |
| `createdAt  DateTime @default(now())` |

Indexes/constraints:
- `@@index([userId])`
- `@@index([createdAt])`

#### Model `PasswordResetToken`

| Declaration |
|-------------|
| `id        String    @id @default(cuid())` |
| `userId    String` |
| `user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)` |
| `tokenHash String    @unique` |
| `expiresAt DateTime` |
| `usedAt    DateTime?` |
| `createdAt DateTime  @default(now())` |

Indexes/constraints:
- `@@index([userId])`

#### Model `ActivationToken`

| Declaration |
|-------------|
| `id        String    @id @default(cuid())` |
| `userId    String` |
| `user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)` |
| `tokenHash String    @unique` |
| `expiresAt DateTime` |
| `usedAt    DateTime?` |
| `createdAt DateTime  @default(now())` |

Indexes/constraints:
- `@@index([userId])`

#### Model `Doctor`

| Declaration |
|-------------|
| `id              String     @id @default(cuid())` |
| `userId          String     @unique` |
| `user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)` |
| `type            DoctorType` |
| `specialtyAr     String` |
| `bioAr           String?` |
| `licenseNumber   String?` |
| `colorCode       String     @default("#0F9A9A")` |
| `isActive        Boolean    @default(true)` |
| `createdAt       DateTime   @default(now())` |
| `updatedAt       DateTime   @updatedAt` |
| `workingHours    WorkingHour[]` |
| `scheduleExceptions DoctorScheduleException[]` |
| `services        DoctorService[]` |
| `appointments    Appointment[]` |
| `appointmentRequests AppointmentRequest[] @relation("PreferredDoctor")` |
| `assignedRequests AppointmentRequest[] @relation("AssignedDoctor")` |
| `diagnoses       Diagnosis[]` |
| `treatmentPlans  TreatmentPlan[]` |
| `treatmentSessions TreatmentSession[]` |
| `orthodonticCases OrthodonticCase[]` |
| `surgeryCases    SurgeryCase[]` |
| `operations      Operation[]` |
| `prescriptions   Prescription[]` |
| `dentalToothStates DentalToothState[]` |
| `referralsFrom   Referral[] @relation("ReferralFrom")` |
| `referralsTo     Referral[] @relation("ReferralTo")` |
| `waitingRoomEntries WaitingRoomEntry[]` |
| `prostheticCases ProstheticCase[]` |

#### Model `SecretaryProfile`

| Declaration |
|-------------|
| `id             String   @id @default(cuid())` |
| `userId         String   @unique` |
| `user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)` |
| `employeeCode   String?` |
| `shiftCode      String   @default("MORNING")` |
| `workStartTime  String   @default("07:00")` |
| `workEndTime    String   @default("14:00")` |
| `workDays       String   @default("SUN,MON,TUE,WED,THU,SAT")` |
| `createdAt      DateTime @default(now())` |
| `updatedAt      DateTime @updatedAt` |

#### Model `Patient`

| Declaration |
|-------------|
| `id                 String      @id @default(cuid())` |
| `patientNumber      String      @unique` |
| `fullName           String` |
| `phone              String` |
| `email              String?` |
| `dateOfBirth        DateTime?` |
| `age                Int?` |
| `gender             Gender?` |
| `city               String?` |
| `address            String?` |
| `emergencyContact   String?` |
| `emergencyPhone     String?` |
| `chronicIllnesses   String?` |
| `allergies          String?` |
| `currentMedication  String?` |
| `hasDiabetes        Boolean     @default(false)` |
| `hasBloodPressure   Boolean     @default(false)` |
| `isPregnant         Boolean     @default(false)` |
| `isSmoker           Boolean     @default(false)` |
| `previousDentalSurgeries Boolean @default(false)` |
| `patientType        PatientType @default(REGULAR)` |
| `primaryDoctorId    String?` |
| `notes              String?` |
| `createdAt          DateTime    @default(now())` |
| `updatedAt          DateTime    @updatedAt` |
| `deletedAt          DateTime?` |
| `account            PatientAccount?` |
| `appointmentRequests AppointmentRequest[]` |
| `appointments       Appointment[]` |
| `medicalHistory     MedicalHistory?` |
| `medicalRecords     MedicalRecord[]` |
| `dentalChart        DentalChart?` |
| `diagnoses          Diagnosis[]` |
| `treatmentPlans     TreatmentPlan[]` |
| `orthodonticCases   OrthodonticCase[]` |
| `surgeryCases       SurgeryCase[]` |
| `prostheticCases    ProstheticCase[]` |
| `prescriptions      Prescription[]` |
| `documents          MedicalDocument[]` |
| `consents           PatientConsent[]` |
| `invoices           Invoice[]` |
| `waitingRoomEntries WaitingRoomEntry[]` |
| `referrals          Referral[]` |
| `messages           Message[] @relation("PatientMessages")` |

Indexes/constraints:
- `@@index([phone])`
- `@@index([fullName])`
- `@@index([patientNumber])`
- `@@index([deletedAt])`

#### Model `PatientAccount`

| Declaration |
|-------------|
| `id             String        @id @default(cuid())` |
| `patientId      String        @unique` |
| `patient        Patient       @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `userId         String        @unique` |
| `user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)` |
| `status         AccountStatus @default(PENDING)` |
| `/** رمز دخول مباشر عبر QR — بدون كلمة سر */` |
| `qrAccessToken  String?       @unique` |
| `activatedAt    DateTime?` |
| `activatedById  String?` |
| `requestedById  String?` |
| `createdAt      DateTime      @default(now())` |
| `updatedAt      DateTime      @updatedAt` |

#### Model `AppointmentRequest`

| Declaration |
|-------------|
| `id                 String            @id @default(cuid())` |
| `requestNumber      String            @unique` |
| `patientId          String?` |
| `patient            Patient?          @relation(fields: [patientId], references: [id])` |
| `fullName           String` |
| `phone              String` |
| `age                Int?` |
| `dateOfBirth        DateTime?` |
| `gender             Gender?` |
| `city               String?` |
| `chronicIllnesses   String?` |
| `reason             String` |
| `serviceId          String?` |
| `service            Service?          @relation(fields: [serviceId], references: [id])` |
| `appointmentType    AppointmentType` |
| `isEmergency        Boolean           @default(false)` |
| `preferredDoctorId  String?` |
| `preferredDoctor    Doctor?           @relation("PreferredDoctor", fields: [preferredDoctorId], references: [id])` |
| `assignedDoctorId   String?` |
| `assignedDoctor     Doctor?           @relation("AssignedDoctor", fields: [assignedDoctorId], references: [id])` |
| `preferredDate      DateTime?` |
| `preferredTime      String?` |
| `isPreviousPatient  Boolean           @default(false)` |
| `hasOrthodontics    Boolean           @default(false)` |
| `previousSurgery    Boolean           @default(false)` |
| `additionalNotes    String?` |
| `consentAccepted    Boolean           @default(false)` |
| `status             AppointmentStatus @default(NEW_REQUEST)` |
| `secretaryNotes     String?` |
| `appointmentId      String?           @unique` |
| `appointment        Appointment?      @relation(fields: [appointmentId], references: [id])` |
| `createdAt          DateTime          @default(now())` |
| `updatedAt          DateTime          @updatedAt` |
| `statusHistory      AppointmentStatusHistory[]` |

Indexes/constraints:
- `@@index([status])`
- `@@index([createdAt])`
- `@@index([phone])`

#### Model `Appointment`

| Declaration |
|-------------|
| `id              String            @id @default(cuid())` |
| `appointmentNumber String          @unique` |
| `patientId       String` |
| `patient         Patient           @relation(fields: [patientId], references: [id])` |
| `doctorId        String` |
| `doctor          Doctor            @relation(fields: [doctorId], references: [id])` |
| `serviceId       String?` |
| `service         Service?          @relation(fields: [serviceId], references: [id])` |
| `appointmentType AppointmentType` |
| `status          AppointmentStatus @default(CONFIRMED)` |
| `startAt         DateTime` |
| `endAt           DateTime` |
| `durationMinutes Int               @default(30)` |
| `isEmergency     Boolean           @default(false)` |
| `room            String?` |
| `notes           String?` |
| `recurrenceGroupId String?` |
| `recurrenceFrequency RecurrenceFrequency?` |
| `recurrenceParentId String?` |
| `createdById     String?` |
| `createdAt       DateTime          @default(now())` |
| `updatedAt       DateTime          @updatedAt` |
| `deletedAt       DateTime?` |
| `request         AppointmentRequest?` |
| `statusHistory   AppointmentStatusHistory[]` |
| `waitingRoomEntry WaitingRoomEntry?` |
| `treatmentSession TreatmentSession?` |
| `orthodonticSession OrthodonticSession?` |
| `invoices        Invoice[]` |

Indexes/constraints:
- `@@index([doctorId, startAt])`
- `@@index([patientId])`
- `@@index([status])`
- `@@index([startAt])`

#### Model `AppointmentStatusHistory`

| Declaration |
|-------------|
| `id                   String             @id @default(cuid())` |
| `appointmentId        String?` |
| `appointment          Appointment?       @relation(fields: [appointmentId], references: [id], onDelete: Cascade)` |
| `appointmentRequestId String?` |
| `appointmentRequest   AppointmentRequest? @relation(fields: [appointmentRequestId], references: [id], onDelete: Cascade)` |
| `previousStatus       AppointmentStatus?` |
| `newStatus            AppointmentStatus` |
| `changedById          String?` |
| `changedBy            User?              @relation(fields: [changedById], references: [id])` |
| `reason               String?` |
| `note                 String?` |
| `createdAt            DateTime           @default(now())` |

Indexes/constraints:
- `@@index([appointmentId])`
- `@@index([appointmentRequestId])`

#### Model `WaitingRoomEntry`

| Declaration |
|-------------|
| `id              String            @id @default(cuid())` |
| `appointmentId   String            @unique` |
| `appointment     Appointment       @relation(fields: [appointmentId], references: [id], onDelete: Cascade)` |
| `patientId       String` |
| `patient         Patient           @relation(fields: [patientId], references: [id])` |
| `doctorId        String` |
| `doctor          Doctor            @relation(fields: [doctorId], references: [id])` |
| `status          WaitingRoomStatus @default(ARRIVED)` |
| `arrivedAt       DateTime          @default(now())` |
| `calledAt        DateTime?` |
| `startedAt       DateTime?` |
| `completedAt     DateTime?` |
| `urgency         Boolean           @default(false)` |
| `note            String?` |
| `createdAt       DateTime          @default(now())` |
| `updatedAt       DateTime          @updatedAt` |

Indexes/constraints:
- `@@index([status])`
- `@@index([doctorId])`

#### Model `MedicalHistory`

| Declaration |
|-------------|
| `id                    String   @id @default(cuid())` |
| `patientId             String   @unique` |
| `patient               Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `generalNotes          String?` |
| `systemicDiseases      String?` |
| `allergies             String?` |
| `medications           String?` |
| `previousSurgeries     String?` |
| `dentalHistory         String?` |
| `familyHistory         String?` |
| `updatedAt             DateTime @updatedAt` |
| `createdAt             DateTime @default(now())` |

#### Model `MedicalRecord`

| Declaration |
|-------------|
| `id          String   @id @default(cuid())` |
| `patientId   String` |
| `patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `title       String` |
| `content     String` |
| `isConfidential Boolean @default(false)` |
| `createdById String?` |
| `createdAt   DateTime @default(now())` |
| `updatedAt   DateTime @updatedAt` |

Indexes/constraints:
- `@@index([patientId])`

#### Model `DentalChart`

| Declaration |
|-------------|
| `id        String            @id @default(cuid())` |
| `patientId String            @unique` |
| `patient   Patient           @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `notes     String?` |
| `createdAt DateTime          @default(now())` |
| `updatedAt DateTime          @updatedAt` |
| `teeth     DentalToothState[]` |

#### Model `DentalToothState`

| Declaration |
|-------------|
| `id           String     @id @default(cuid())` |
| `dentalChartId String` |
| `dentalChart  DentalChart @relation(fields: [dentalChartId], references: [id], onDelete: Cascade)` |
| `toothNumber  Int` |
| `surface      String?` |
| `state        ToothState @default(HEALTHY)` |
| `previousState ToothState?` |
| `notes        String?` |
| `doctorId     String?` |
| `doctor       Doctor?    @relation(fields: [doctorId], references: [id])` |
| `createdAt    DateTime   @default(now())` |
| `updatedAt    DateTime   @updatedAt` |

Indexes/constraints:
- `@@index([dentalChartId, toothNumber])`

#### Model `Diagnosis`

| Declaration |
|-------------|
| `id          String   @id @default(cuid())` |
| `patientId   String` |
| `patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `doctorId    String` |
| `doctor      Doctor   @relation(fields: [doctorId], references: [id])` |
| `title       String` |
| `description String` |
| `toothNumbers String?` |
| `createdAt   DateTime @default(now())` |
| `updatedAt   DateTime @updatedAt` |

Indexes/constraints:
- `@@index([patientId])`

#### Model `TreatmentPlan`

| Declaration |
|-------------|
| `id               String              @id @default(cuid())` |
| `patientId        String` |
| `patient          Patient             @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `doctorId         String` |
| `doctor           Doctor              @relation(fields: [doctorId], references: [id])` |
| `title            String` |
| `diagnosis        String?` |
| `startDate        DateTime?` |
| `estimatedEndDate DateTime?` |
| `totalSessions    Int                 @default(1)` |
| `totalCost        Decimal             @default(0) @db.Decimal(12, 2)` |
| `paidAmount       Decimal             @default(0) @db.Decimal(12, 2)` |
| `status           TreatmentPlanStatus @default(NOT_STARTED)` |
| `notes            String?` |
| `createdAt        DateTime            @default(now())` |
| `updatedAt        DateTime            @updatedAt` |
| `stages           TreatmentPlanStage[]` |
| `sessions         TreatmentSession[]` |
| `invoices         Invoice[]` |

Indexes/constraints:
- `@@index([patientId])`
- `@@index([status])`

#### Model `TreatmentPlanStage`

| Declaration |
|-------------|
| `id              String   @id @default(cuid())` |
| `treatmentPlanId String` |
| `treatmentPlan   TreatmentPlan @relation(fields: [treatmentPlanId], references: [id], onDelete: Cascade)` |
| `orderIndex      Int` |
| `procedure       String` |
| `assignedDoctorId String?` |
| `durationMinutes Int?` |
| `cost            Decimal  @default(0) @db.Decimal(12, 2)` |
| `sessionsCount   Int      @default(1)` |
| `progressPercent Int      @default(0)` |
| `medicalNotes    String?` |
| `nextAppointment DateTime?` |
| `status          TreatmentPlanStatus @default(NOT_STARTED)` |
| `createdAt       DateTime @default(now())` |
| `updatedAt       DateTime @updatedAt` |

Indexes/constraints:
- `@@index([treatmentPlanId])`

#### Model `TreatmentSession`

| Declaration |
|-------------|
| `id              String    @id @default(cuid())` |
| `treatmentPlanId String?` |
| `treatmentPlan   TreatmentPlan? @relation(fields: [treatmentPlanId], references: [id])` |
| `appointmentId   String?   @unique` |
| `appointment     Appointment? @relation(fields: [appointmentId], references: [id])` |
| `doctorId        String` |
| `doctor          Doctor    @relation(fields: [doctorId], references: [id])` |
| `sessionDate     DateTime` |
| `durationMinutes Int?` |
| `procedure       String?` |
| `notes           String?` |
| `progressNotes   String?` |
| `createdAt       DateTime  @default(now())` |
| `updatedAt       DateTime  @updatedAt` |

Indexes/constraints:
- `@@index([treatmentPlanId])`

#### Model `OrthodonticCase`

| Declaration |
|-------------|
| `id                   String          @id @default(cuid())` |
| `patientId            String` |
| `patient              Patient         @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `doctorId             String` |
| `doctor               Doctor          @relation(fields: [doctorId], references: [id])` |
| `diagnosis            String` |
| `startDate            DateTime?` |
| `orthodonticType      OrthodonticType @default(METAL_BRACES)` |
| `upperJaw             Boolean         @default(true)` |
| `lowerJaw             Boolean         @default(true)` |
| `expectedDurationMonths Int?` |
| `treatmentObjectives  String?` |
| `sessionFrequency     RecurrenceFrequency?` |
| `totalExpectedSessions Int            @default(0)` |
| `completedSessions    Int             @default(0)` |
| `nextAppointment      DateTime?` |
| `totalCost            Decimal         @default(0) @db.Decimal(12, 2)` |
| `remainingAmount      Decimal         @default(0) @db.Decimal(12, 2)` |
| `retainerStage        Boolean         @default(false)` |
| `completionDate       DateTime?` |
| `status               TreatmentPlanStatus @default(NOT_STARTED)` |
| `notes                String?` |
| `createdAt            DateTime        @default(now())` |
| `updatedAt            DateTime        @updatedAt` |
| `sessions             OrthodonticSession[]` |

Indexes/constraints:
- `@@index([patientId])`
- `@@index([doctorId])`

#### Model `OrthodonticSession`

| Declaration |
|-------------|
| `id                String   @id @default(cuid())` |
| `orthodonticCaseId String` |
| `orthodonticCase   OrthodonticCase @relation(fields: [orthodonticCaseId], references: [id], onDelete: Cascade)` |
| `appointmentId     String?  @unique` |
| `appointment       Appointment? @relation(fields: [appointmentId], references: [id])` |
| `sessionDate       DateTime` |
| `durationMinutes   Int?` |
| `adjustmentMade    String?` |
| `applianceDetails  String?` |
| `patientCondition  String?` |
| `painOrComplaint   String?` |
| `progressPhotoUrl  String?` |
| `doctorNote        String?` |
| `nextSessionDate   DateTime?` |
| `createdAt         DateTime @default(now())` |
| `updatedAt         DateTime @updatedAt` |

Indexes/constraints:
- `@@index([orthodonticCaseId])`

#### Model `SurgeryCase`

| Declaration |
|-------------|
| `id                    String        @id @default(cuid())` |
| `patientId             String` |
| `patient               Patient       @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `doctorId              String` |
| `doctor                Doctor        @relation(fields: [doctorId], references: [id])` |
| `surgeryType           String` |
| `diagnosis             String` |
| `toothOrArea           String?` |
| `reason                String?` |
| `surgeryDate           DateTime?` |
| `expectedDurationMin   Int?` |
| `anesthesiaType        String?` |
| `preOpInstructions     String?` |
| `requiredAnalysis      String?` |
| `requiredXrays         String?` |
| `consentStatus         Boolean       @default(false)` |
| `medicationsBefore     String?` |
| `operationNotes        String?` |
| `result                String?` |
| `complications         String?` |
| `medicationsAfter      String?` |
| `postOpInstructions    String?` |
| `status                SurgeryStatus @default(PLANNED)` |
| `totalCost             Decimal       @default(0) @db.Decimal(12, 2)` |
| `parentCaseId          String?` |
| `parentCase            SurgeryCase?  @relation("MultiOp", fields: [parentCaseId], references: [id])` |
| `childCases            SurgeryCase[] @relation("MultiOp")` |
| `createdAt             DateTime      @default(now())` |
| `updatedAt             DateTime      @updatedAt` |
| `operations            Operation[]` |
| `followUps             PostOperationFollowUp[]` |

Indexes/constraints:
- `@@index([patientId])`
- `@@index([doctorId])`
- `@@index([status])`

#### Model `Operation`

| Declaration |
|-------------|
| `id            String        @id @default(cuid())` |
| `surgeryCaseId String` |
| `surgeryCase   SurgeryCase   @relation(fields: [surgeryCaseId], references: [id], onDelete: Cascade)` |
| `doctorId      String` |
| `doctor        Doctor        @relation(fields: [doctorId], references: [id])` |
| `title         String` |
| `orderIndex    Int           @default(1)` |
| `status        SurgeryStatus @default(PLANNED)` |
| `notes         String?` |
| `cost          Decimal       @default(0) @db.Decimal(12, 2)` |
| `operatedAt    DateTime?` |
| `createdAt     DateTime      @default(now())` |
| `updatedAt     DateTime      @updatedAt` |

Indexes/constraints:
- `@@index([surgeryCaseId])`

#### Model `PostOperationFollowUp`

| Declaration |
|-------------|
| `id            String   @id @default(cuid())` |
| `surgeryCaseId String` |
| `surgeryCase   SurgeryCase @relation(fields: [surgeryCaseId], references: [id], onDelete: Cascade)` |
| `followUpDate  DateTime` |
| `notes         String?` |
| `patientCondition String?` |
| `completed     Boolean  @default(false)` |
| `createdAt     DateTime @default(now())` |
| `updatedAt     DateTime @updatedAt` |

Indexes/constraints:
- `@@index([surgeryCaseId])`

#### Model `ProstheticCase`

| Declaration |
|-------------|
| `id          String   @id @default(cuid())` |
| `patientId   String` |
| `patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `doctorId    String` |
| `doctor      Doctor   @relation(fields: [doctorId], references: [id])` |
| `type        String` |
| `description String?` |
| `toothNumbers String?` |
| `status      TreatmentPlanStatus @default(NOT_STARTED)` |
| `totalCost   Decimal  @default(0) @db.Decimal(12, 2)` |
| `labNotes    String?` |
| `createdAt   DateTime @default(now())` |
| `updatedAt   DateTime @updatedAt` |

Indexes/constraints:
- `@@index([patientId])`

#### Model `Prescription`

| Declaration |
|-------------|
| `id          String   @id @default(cuid())` |
| `patientId   String` |
| `patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `doctorId    String` |
| `doctor      Doctor   @relation(fields: [doctorId], references: [id])` |
| `instructions String?` |
| `createdAt   DateTime @default(now())` |
| `updatedAt   DateTime @updatedAt` |
| `items       PrescriptionItem[]` |

Indexes/constraints:
- `@@index([patientId])`

#### Model `PrescriptionItem`

| Declaration |
|-------------|
| `id             String       @id @default(cuid())` |
| `prescriptionId String` |
| `prescription   Prescription @relation(fields: [prescriptionId], references: [id], onDelete: Cascade)` |
| `medicationName String` |
| `dosage         String?` |
| `frequency      String?` |
| `duration       String?` |
| `notes          String?` |

#### Model `MedicalDocument`

| Declaration |
|-------------|
| `id           String   @id @default(cuid())` |
| `patientId    String` |
| `patient      Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `uploadedById String?` |
| `uploadedBy   User?    @relation(fields: [uploadedById], references: [id])` |
| `title        String` |
| `category     String` |
| `fileName     String` |
| `mimeType     String` |
| `sizeBytes    Int` |
| `storagePath  String` |
| `createdAt    DateTime @default(now())` |
| `deletedAt    DateTime?` |

Indexes/constraints:
- `@@index([patientId])`

#### Model `PatientConsent`

| Declaration |
|-------------|
| `id          String   @id @default(cuid())` |
| `patientId   String` |
| `patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `consentType String` |
| `content     String?` |
| `signedAt    DateTime @default(now())` |
| `signatureUrl String?` |
| `createdAt   DateTime @default(now())` |

Indexes/constraints:
- `@@index([patientId])`

#### Model `Invoice`

| Declaration |
|-------------|
| `id              String        @id @default(cuid())` |
| `invoiceNumber   String        @unique` |
| `patientId       String` |
| `patient         Patient       @relation(fields: [patientId], references: [id])` |
| `appointmentId   String?` |
| `appointment     Appointment?  @relation(fields: [appointmentId], references: [id])` |
| `treatmentPlanId String?` |
| `treatmentPlan   TreatmentPlan? @relation(fields: [treatmentPlanId], references: [id])` |
| `doctorId        String?` |
| `totalAmount     Decimal       @default(0) @db.Decimal(12, 2)` |
| `paidAmount      Decimal       @default(0) @db.Decimal(12, 2)` |
| `remainingAmount Decimal       @default(0) @db.Decimal(12, 2)` |
| `discount        Decimal       @default(0) @db.Decimal(12, 2)` |
| `discountReason  String?` |
| `status          InvoiceStatus @default(ISSUED)` |
| `notes           String?` |
| `createdById     String?` |
| `createdAt       DateTime      @default(now())` |
| `updatedAt       DateTime      @updatedAt` |
| `payments        Payment[]` |
| `installments    Installment[]` |

Indexes/constraints:
- `@@index([patientId])`
- `@@index([status])`

#### Model `Payment`

| Declaration |
|-------------|
| `id            String        @id @default(cuid())` |
| `invoiceId     String` |
| `invoice       Invoice       @relation(fields: [invoiceId], references: [id])` |
| `amount        Decimal       @db.Decimal(12, 2)` |
| `method        PaymentMethod` |
| `status        PaymentStatus @default(COMPLETED)` |
| `receiptNumber String        @unique` |
| `paymentDate   DateTime      @default(now())` |
| `createdById   String?` |
| `createdBy     User?         @relation("PaymentCreator", fields: [createdById], references: [id])` |
| `voidedById    String?` |
| `voidedBy      User?         @relation("PaymentVoider", fields: [voidedById], references: [id])` |
| `voidReason    String?` |
| `voidedAt      DateTime?` |
| `notes         String?` |
| `createdAt     DateTime      @default(now())` |
| `updatedAt     DateTime      @updatedAt` |

Indexes/constraints:
- `@@index([invoiceId])`
- `@@index([paymentDate])`

#### Model `Installment`

| Declaration |
|-------------|
| `id            String    @id @default(cuid())` |
| `invoiceId     String` |
| `invoice       Invoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)` |
| `dueDate       DateTime` |
| `amount        Decimal   @db.Decimal(12, 2)` |
| `paidAmount    Decimal   @default(0) @db.Decimal(12, 2)` |
| `isPaid        Boolean   @default(false)` |
| `paidAt        DateTime?` |
| `createdAt     DateTime  @default(now())` |
| `updatedAt     DateTime  @updatedAt` |

Indexes/constraints:
- `@@index([invoiceId])`
- `@@index([dueDate])`

#### Model `Notification`

| Declaration |
|-------------|
| `id        String              @id @default(cuid())` |
| `userId    String?` |
| `user      User?               @relation(fields: [userId], references: [id], onDelete: Cascade)` |
| `title     String` |
| `body      String` |
| `channel   NotificationChannel @default(IN_APP)` |
| `status    NotificationStatus  @default(PENDING)` |
| `type      String` |
| `entityType String?` |
| `entityId  String?` |
| `readAt    DateTime?` |
| `sentAt    DateTime?` |
| `createdAt DateTime            @default(now())` |

Indexes/constraints:
- `@@index([userId, status])`
- `@@index([createdAt])`

#### Model `Message`

| Declaration |
|-------------|
| `id         String   @id @default(cuid())` |
| `senderId   String?` |
| `sender     User?    @relation("MessageSender", fields: [senderId], references: [id])` |
| `receiverId String?` |
| `receiver   User?    @relation("MessageReceiver", fields: [receiverId], references: [id])` |
| `patientId  String?` |
| `patient    Patient? @relation("PatientMessages", fields: [patientId], references: [id])` |
| `subject    String?` |
| `kind       String   @default("TEXT")` |
| `body       String` |
| `audioUrl   String?` |
| `readAt     DateTime?` |
| `createdAt  DateTime @default(now())` |

Indexes/constraints:
- `@@index([receiverId])`
- `@@index([senderId, createdAt])`
- `@@index([patientId])`

#### Model `Service`

| Declaration |
|-------------|
| `id              String   @id @default(cuid())` |
| `code            String   @unique` |
| `nameAr          String` |
| `descriptionAr   String?` |
| `defaultDuration Int      @default(30)` |
| `defaultPrice    Decimal  @default(0) @db.Decimal(12, 2)` |
| `category        String?` |
| `isActive        Boolean  @default(true)` |
| `createdAt       DateTime @default(now())` |
| `updatedAt       DateTime @updatedAt` |
| `doctors         DoctorService[]` |
| `appointments    Appointment[]` |
| `appointmentRequests AppointmentRequest[]` |

#### Model `DoctorService`

| Declaration |
|-------------|
| `id        String  @id @default(cuid())` |
| `doctorId  String` |
| `doctor    Doctor  @relation(fields: [doctorId], references: [id], onDelete: Cascade)` |
| `serviceId String` |
| `service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)` |
| `customDuration Int?` |
| `customPrice Decimal? @db.Decimal(12, 2)` |

Indexes/constraints:
- `@@unique([doctorId, serviceId])`

#### Model `WorkingHour`

| Declaration |
|-------------|
| `id        String    @id @default(cuid())` |
| `doctorId  String` |
| `doctor    Doctor    @relation(fields: [doctorId], references: [id], onDelete: Cascade)` |
| `dayOfWeek DayOfWeek` |
| `shift     String    // MORNING \| EVENING` |
| `startTime String    // HH:mm` |
| `endTime   String    // HH:mm` |
| `isActive  Boolean   @default(true)` |
| `createdAt DateTime  @default(now())` |
| `updatedAt DateTime  @updatedAt` |

Indexes/constraints:
- `@@unique([doctorId, dayOfWeek, shift])`
- `@@index([doctorId])`

#### Model `DoctorScheduleException`

| Declaration |
|-------------|
| `id          String                @id @default(cuid())` |
| `doctorId    String` |
| `doctor      Doctor                @relation(fields: [doctorId], references: [id], onDelete: Cascade)` |
| `type        ScheduleExceptionType` |
| `startAt     DateTime` |
| `endAt       DateTime` |
| `reason      String?` |
| `createdById String?` |
| `createdAt   DateTime              @default(now())` |

Indexes/constraints:
- `@@index([doctorId, startAt])`

#### Model `Holiday`

| Declaration |
|-------------|
| `id        String   @id @default(cuid())` |
| `nameAr    String` |
| `date      DateTime @db.Date` |
| `isRecurring Boolean @default(false)` |
| `createdAt DateTime @default(now())` |

Indexes/constraints:
- `@@unique([date])`

#### Model `Referral`

| Declaration |
|-------------|
| `id              String   @id @default(cuid())` |
| `patientId       String` |
| `patient         Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)` |
| `fromDoctorId    String` |
| `fromDoctor      Doctor   @relation("ReferralFrom", fields: [fromDoctorId], references: [id])` |
| `toDoctorId      String` |
| `toDoctor        Doctor   @relation("ReferralTo", fields: [toDoctorId], references: [id])` |
| `reason          String` |
| `notes           String?` |
| `status          String   @default("PENDING")` |
| `createdAt       DateTime @default(now())` |
| `updatedAt       DateTime @updatedAt` |

Indexes/constraints:
- `@@index([patientId])`
- `@@index([toDoctorId])`

#### Model `AuditLog`

| Declaration |
|-------------|
| `id         String   @id @default(cuid())` |
| `userId     String?` |
| `user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)` |
| `roleCode   String?` |
| `action     String` |
| `entityType String` |
| `entityId   String?` |
| `oldValue   Json?` |
| `newValue   Json?` |
| `reason     String?` |
| `ipAddress  String?` |
| `deviceInfo String?` |
| `createdAt  DateTime @default(now())` |

Indexes/constraints:
- `@@index([userId])`
- `@@index([entityType, entityId])`
- `@@index([createdAt])`
- `@@index([action])`

#### Model `ClinicSetting`

| Declaration |
|-------------|
| `id        String   @id @default(cuid())` |
| `key       String   @unique` |
| `value     Json` |
| `updatedAt DateTime @updatedAt` |
| `createdAt DateTime @default(now())` |

#### Model `FileAttachment`

| Declaration |
|-------------|
| `id           String   @id @default(cuid())` |
| `uploadedById String?` |
| `uploadedBy   User?    @relation(fields: [uploadedById], references: [id])` |
| `entityType   String` |
| `entityId     String` |
| `fileName     String` |
| `mimeType     String` |
| `sizeBytes    Int` |
| `storagePath  String` |
| `createdAt    DateTime @default(now())` |
| `deletedAt    DateTime?` |

Indexes/constraints:
- `@@index([entityType, entityId])`

#### Model `NotificationTemplate`

| Declaration |
|-------------|
| `id        String   @id @default(cuid())` |
| `code      String   @unique` |
| `titleAr   String` |
| `bodyAr    String` |
| `channel   NotificationChannel @default(IN_APP)` |
| `isActive  Boolean  @default(true)` |
| `createdAt DateTime @default(now())` |
| `updatedAt DateTime @updatedAt` |

## 32. Complete API Inventory

**Total route handlers:** 32 files under `src/app/api/**/route.ts`.

### Auth

| Method | URL | Auth | Notes |
|--------|-----|------|-------|
| POST | `/api/auth/login` | Public + RL | See §4 |
| POST | `/api/auth/logout` | Optional session | |
| POST | `/api/auth/activate` | Token | |
| POST | `/api/auth/password-reset` | Public + RL | No email send |
| PUT | `/api/auth/password-reset` | Token | |

### Public

| POST | `/api/public/appointments` | Public + RL | bookAppointmentSchema |

### Admin (clinic owner)

| POST/PATCH/DELETE | `/api/admin/doctors` | isClinicOwner + CSRF |
| POST/PATCH/DELETE | `/api/admin/secretaries` | isClinicOwner + CSRF |
| PUT | `/api/admin/clinic-settings` | isClinicOwner + CSRF |

### Secretary

| POST | `/api/secretary/patients` | SECRETARY|ADMIN + CSRF |
| POST | `/api/secretary/payments` | SECRETARY|ADMIN + CSRF |
| POST | `/api/secretary/invoices` | SECRETARY|ADMIN + CSRF — **no UI** |
| POST | `/api/secretary/walk-in` | SECRETARY|ADMIN + CSRF |
| POST | `/api/secretary/checkout` | SECRETARY|ADMIN + CSRF — **orphaned UI** |
| POST | `/api/secretary/collect-charge` | SECRETARY|ADMIN + CSRF |
| POST | `/api/secretary/scheduled-check-in` | SECRETARY|ADMIN + CSRF |
| POST | `/api/secretary/appointments/[id]` | actions update\|remove\|direct |
| POST | `/api/secretary/appointments/[id]/arrive` | **no UI** |
| POST | `/api/secretary/waiting-room/[id]` | status\|remove\|close_visit |
| POST/PATCH | `/api/secretary/schedule-appointment` | **Always 403** |

### Doctor

| POST | `/api/doctor/exam` | DOCTOR_*|ADMIN + CSRF |
| PATCH/DELETE | `/api/doctor/patient` | SPECIALIST|ADMIN + CSRF |
| GET | `/api/doctor/availability` | Staff |
| POST | `/api/doctor/refer-to-general` | SPECIALIST|ADMIN — **no UI** |
| POST | `/api/doctor/create-patient-account` | SPECIALIST|ADMIN + specialist profile |
| POST | `/api/doctor/ortho-approval` | SPECIALIST|ADMIN |
| POST/PATCH | `/api/doctor/schedule-appointment` | DOCTOR_*|ADMIN |

### Medical / files / staff / realtime

| POST | `/api/medical/dental-chart` | DOCTOR_*|ADMIN |
| POST | `/api/files/upload` | Any logged-in + CSRF; 501 without storage; **no UI** |
| GET/POST/DELETE | `/api/staff/chat` | Staff chat roles |
| POST | `/api/staff/chat/voice` | Staff chat roles |
| PATCH | `/api/staff/profile` | SECRETARY|ADMIN (+ password check) |
| GET | `/api/realtime/stream` | Logged-in SSE; **no UI** |

### Non-/api

| GET | `/patient/qr/[token]` | QR login |

**Server actions:** none.

---

## 33. Forms Inventory

| Form / control | Page context | Submit |
|----------------|--------------|--------|
| StaffLoginForm | `/staff/login` | `/api/auth/login` |
| Patient login form | `/patient/login` | `/api/auth/login` |
| Forgot/reset/activate | public auth pages | password-reset / activate |
| PublicRegisterForm | home / book | `/api/public/appointments` |
| CreateDoctorForm | specialist doctors | `/api/admin/doctors` |
| EditDoctorLoginForm | doctors | PATCH doctors |
| DeleteDoctorButton | doctors | DELETE doctors |
| CreateSecretaryForm | secretaries | `/api/admin/secretaries` |
| SecretaryHoursBar | secretaries | PATCH secretaries hours |
| DeleteSecretaryButton | secretaries | DELETE |
| ClinicInfoForm / ContactSettingsForm / WorkingHoursEditor / PublicPagesContentForm / DoctorDisplayForm | settings/* | `PUT clinic-settings` |
| CreatePatientForm | (available) | `/api/secretary/patients` |
| SecretaryWalkInForm | hub intake | `/api/secretary/walk-in` |
| SecretaryRequestBar | hub intake | appointments/[id] |
| SecretaryScheduledBar | hub today | scheduled-check-in |
| SecretaryDirectedBar | hub waiting | waiting-room / pay links |
| CollectDoctorChargeForm | hub pay | collect-charge |
| RecordPaymentForm | payments-related | `/api/secretary/payments` |
| DoctorExamPanel | doctor dashboard | `/api/doctor/exam` |
| DoctorPatientCard | patients | schedule / patient / create-account |
| OrthoApprovalActions | specialist patients | ortho-approval |
| DentalChartView | `/patients/[id]` | dental-chart |
| StaffChatWidget | shell | staff/chat (+voice) |
| StaffLoginForm (profile) | account tooling | `/api/staff/profile` |
| SecretaryScheduleForm | may appear | **always 403** |
| PostVisitCheckout / WaitingRoomActions | components exist | **not mounted on hub pages** |
| AppointmentActions | request actions | appointments/[id] |

Mobile: forms stack via Tailwind flex-col; no separate mobile form variants.

---

## 34. Status and Enum Inventory

### AccountStatus
`PENDING`, `ACTIVE`, `INACTIVE`, `LOCKED` — AR meaning via clinic UX (pending activation / active / inactive / locked).

### RoleCode
See §5.

### AppointmentStatus / WaitingRoomStatus / AppointmentType / ToothState / TreatmentPlanStatus / SurgeryStatus / PaymentMethod / PaymentStatus / InvoiceStatus / NotificationChannel / NotificationStatus / DoctorType / PatientType / DayOfWeek / ScheduleExceptionType / OrthodonticType / Gender / RecurrenceFrequency

Full Arabic maps: `src/i18n/ar.ts`.

### String pseudo-enums

- SecretaryProfile.shiftCode: MORNING|EVENING|CUSTOM  
- WorkingHour.shift: MORNING|EVENING|DAY  
- Message.kind: TEXT|VOICE  
- Referral.status: string default PENDING  

### UI badge colors

Use semantic CSS vars: success/warning/danger/teal/navy — exact class names vary by component (`text-danger`, `bg-soft-teal`, etc.).

---


## 35. UI → API → Database Traces

Minimum required traces:

| Role | Page | UI | API | Service/Model | Authz | Success | Audit |
|------|------|----|-----|---------------|-------|---------|-------|
| Staff | `/staff/login` | Submit | POST `/api/auth/login` | User, Session | Public+portal | Redirect roleDashboardPath | LOGIN_SUCCESS |
| Any | Shell footer | Logout | POST `/api/auth/logout` | Session revoke | Cookie | Cleared | LOGOUT |
| Secretary | Intake walk-in | Submit | POST `/api/secretary/walk-in` | AppointmentRequest | SECRETARY+CSRF | Appears in intake | WALK_IN_REGISTERED / service |
| Secretary | Request توجيه | Direct | POST `/api/secretary/appointments/[id]` action=direct | Appointment+WR | SECRETARY | Waiting tab | PATIENT_DIRECTED |
| Secretary | Today bar | Check-in | POST `/api/secretary/scheduled-check-in` | WR WAITING | SECRETARY | Waiting | SCHEDULED_APPOINTMENT_CHECKED_IN |
| Doctor | Exam معاينة | Start | POST `/api/doctor/exam` start | WR+Appointment | Doctor owns entry | Panel updates | EXAM_STARTED |
| Doctor | Exam complete | Amount | POST `/api/doctor/exam` complete | Invoice ISSUED | Doctor | SESSION_DONE | EXAM_COMPLETED_CHARGE |
| Secretary | Pay tab | Confirm | POST `/api/secretary/collect-charge` | Payment+Invoice PAID | SECRETARY | COMPLETED/LEFT | DOCTOR_CHARGE_COLLECTED |
| Owner | Doctors | Create | POST `/api/admin/doctors` | User+Doctor | isClinicOwner | List refresh | DOCTOR_CREATED |
| Owner | Secretaries | Create | POST `/api/admin/secretaries` | User+SecretaryProfile | isClinicOwner | List | SECRETARY_CREATED |
| Specialist | Patient card | Create account | POST `/api/doctor/create-patient-account` | User+PatientAccount | Specialist | Shows password+QR | PATIENT_ACCOUNT_CREATED_ACTIVE |
| Doctor | Chart | Tooth click | POST `/api/medical/dental-chart` | DentalToothState | Doctor | Cell updates | DENTAL_CHART_UPDATE |
| Staff | Chat | Send text | POST `/api/staff/chat` | Message | Staff peers | Bubble | STAFF_CHAT_TEXT |
| Staff | Chat | Voice | POST `/api/staff/chat/voice` | Message audioUrl | Staff | Bubble | STAFF_CHAT_VOICE |
| Owner | Settings | Save hours | PUT `/api/admin/clinic-settings` working_hours | WorkingHour | Owner | Saved | WORKING_HOURS_UPDATED |
| Public | Register | Submit | POST `/api/public/appointments` | AppointmentRequest | Rate limit | Queue number | service audit |

Error behavior pattern: JSON `{ error: string }` + Arabic UI toast/text; CSRF failure → 403; unauthorized → 401/403.

---

## 36. Design System

Source: `src/app/globals.css`, `Button.tsx`, `Form.tsx`, `Card.tsx`, DashboardShell.

### CSS variables

| Token | Value |
|-------|-------|
| --primary-navy | #0F2747 |
| --primary-blue | #176B87 |
| --medical-teal | #0F9A9A |
| --soft-teal | #DDF5F4 |
| --success | #16A36A |
| --warning | #F59E0B |
| --danger | #D9485F |
| --background | #F5F8FC |
| --surface | #FFFFFF |
| --border | #DCE4EE |
| --text-primary | #162033 |
| --text-secondary | #667085 |
| --text-muted | #98A2B3 |
| --radius | 16px |
| --shadow | 0 4px 20px rgba(15,39,71,0.06) |

### Typography

- Primary: Cairo (`--font-cairo`)  
- Latin/numeric inputs: Inter (`--font-inter`)  
- `html { direction: rtl }` globally  

### Buttons (`Button.tsx`)

Variants: `primary`, `secondary`, `teal`, `danger`, `ghost`, `outline` · sizes `sm|md|lg` · loading disables click.

### Surfaces

`.card-surface`, `.dashboard-gradient`, `.login-hero`, `.focus-ring`.

### Sidebar

Navy background, white/75 muted links, active white/15, rounded-2xl items.

### Chat

Teal FAB, floating panel — hardcoded Arabic strings in component.

---

## 37. Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| Mobile (<lg) | **No sidebar**; patient dashboard is mobile-centric; secretary hub tabs + cards stack; chat FAB still fixed |
| Tablet | Same as mobile until `lg` |
| Desktop lg+ | Fixed right sidebar `w-64`; main `pr-64` |
| Wide | `max-w-7xl` container |

RTL is default. LTR: only if locale switched on **public** site — dashboards remain RTL Arabic.

Breakpoints: Tailwind default (`sm` 640, `md` 768, `lg` 1024, `xl` 1280`).

---

## 38. Internationalization

| Area | Languages | Mechanism |
|------|-----------|-----------|
| Public site | ar, fr, en | `messages.ts` + cookie `alwisam_locale` |
| Dashboard nav labels | Arabic only | `ar.ts` arrays |
| Status labels | Arabic maps | `ar.ts` |
| Staff/patient UI copy | Hardcoded Arabic in components | |

Date/time: Africa/Algiers day helpers; display uses Arabic weekday maps `dayOfWeekAr` / `days-ar`.

Hardcoded Arabic is pervasive in dashboard — expect many strings **not** in translation files.

---

## 39. Loading, Empty, and Error States

| Pattern | Where |
|---------|-------|
| «جاري التحميل...» | `commonAr.loading` / button loading |
| EmptyState component | Stub admin/patient pages — «لا توجد بيانات بعد» / similar |
| Secretary empty lists | Per-tab empty Arabic copy in hub components |
| API errors | `alert`/inline Arabic from `error` JSON |
| Unauthorized page access | redirect login via middleware or thrown requireUser |
| Chat unauthorized | Widget returns null |
| File upload failure | 501 when storage unavailable |
| Network | Client fetch catch messages (component-specific) |
| WebSocket failure | N/A — polling only |
| Skeletons | Limited; many pages server-render lists without skeleton libraries |

---

## 40. File and Media System

| Channel | Types | Limit | Storage | Auth |
|---------|-------|-------|---------|------|
| Medical upload API | jpeg/png/webp/pdf | MAX_UPLOAD_SIZE_MB (20) | Blob or local UPLOAD_DIR | Logged-in + CSRF; any role — **broad** |
| Voice chat | audio MIME | 2MB | DB base64 | Staff peers |
| Doctor avatars / public images | Via settings URLs / public assets | — | Often URL strings / `public/` | Owner settings |
| Review avatars / before-after | N/A | | | NOT FOUND |

Virus scanning: **NOT FOUND**. Signed URL secret env exists for potential private access patterns.

---

## 41. Real-Time System

| Feature | Implementation |
|---------|----------------|
| Library | Native SSE `ReadableStream` — not Socket.IO |
| Endpoint | `GET /api/realtime/stream` |
| Auth | Cookie session via `getCurrentUser` |
| Events | `connected`, `stats` `{requests,waiting}`, `heartbeat` ~5s |
| Consumers | **NOT FOUND** |
| Chat | HTTP poll 8s |
| Secretary hub | HTTP poll/refresh 8s (`SecretaryAutoRefresh`) |
| WebSocket | **NOT FOUND** |
| Typing/presence | **NOT FOUND** |

---

## 42. Security and Authorization

| Control | Status |
|---------|--------|
| Session cookie HttpOnly | Yes |
| CSRF on staff mutations | Yes (`x-csrf-token`) |
| Password bcrypt 12 | Yes |
| Token hashing SHA-256 | Session/reset/activation |
| Rate limits login/forgot/book | Yes (Redis or memory) |
| Lockout | Yes |
| Role guards on pages/APIs | Yes |
| Permission matrix runtime | **No** (unused) |
| Middleware role matrix | **No** (cookie only) |
| Ownership on exam entries | Yes |
| Secretary shift login | Yes |
| ObjectId | N/A (cuid strings) |
| Zod on all routes | **No** — only 4 schemas |
| XSS | React default escaping; avoid innerHTML pattern |
| NoSQL injection | N/A (SQL via Prisma) |
| CSRF on login | Not required |
| File MIME allowlist | Yes on upload |
| Audit logging | Extensive createAuditLog |
| 2FA | Schema only |
| Upload role restriction | Weak (any logged-in) |

### Known defects (classified)

| ID | Severity | Issue |
|----|----------|-------|
| D1 | High | Permission codes unused — authz is role-only; DB permissions misleading |
| D2 | High | Middleware does not validate session/role |
| D3 | Medium | Password reset/activation delivery not implemented (dev token only) |
| D4 | Medium | Secretary APIs usable after shift ends (login-only gate) |
| D5 | Medium | File upload allows any authenticated role |
| D6 | Medium | Voice audio stored as base64 in DB (size/performance) |
| D7 | Low | Admin pages stubs / orphan APIs / outdated docs/API.md |
| D8 | Low | `/patients/[id]` uses secretary nav for doctors |
| D9 | Low | SSE unused; stream cleanup incomplete |
| D10 | Informational | jose dependency unused for sessions |
| D11 | Medium | Secretary schedule API permanently 403 while UI may still call |
| D12 | Low | No automated tests |

---

## 43. Audit Logs

### Writer

`createAuditLog` → `AuditLog` (`userId`, `roleCode`, `action`, `entityType`, `entityId`, `oldValue`/`newValue` Json, `ipAddress`, `deviceInfo`).

### Labeled actions (`labels-ar.ts`)

LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, PASSWORD_RESET_*, SECRETARY_CREATED/DELETED, DOCTOR_CREATED/DELETED, PATIENT_CREATED, PATIENT_ARRIVED, PATIENT_DIRECTED, WAITING_ROOM_STATUS_CHANGE, APPOINTMENT_REQUEST_STATUS_CHANGE, APPOINTMENT_CONFIRMED, INVOICE_CREATED, PAYMENT_CREATED, POST_VISIT_CHECKOUT, ORTHO_*, PATIENT_ACCOUNT_*, DENTAL_CHART_UPDATE, FILE_UPLOAD, EXAM_*, DOCTOR_CHARGE_COLLECTED, STAFF_CHAT_*.

### Additional actions used in code without Arabic label map entries

Include e.g. DOCTOR_LOGIN_UPDATED, SECRETARY_HOURS_UPDATED, CLINIC_INFO_UPDATED, CONTACT_UPDATED, WORKING_HOURS_UPDATED, PUBLIC_PAGES_UPDATED, WALK_IN_REGISTERED, VISIT_CLOSED_BY_SECRETARY, PATIENT_INFO_UPDATED, APPOINTMENT_SCHEDULED_BY_DOCTOR, REFERRED_TO_GENERAL_WITH_APPOINTMENT, PATIENT_QR_LOGIN, RECEPTION_REQUEST_*, etc.

### Admin viewer

Dedicated `/admin/audit-logs` is stub; `/doctor/specialist/staff/[userId]/activity` shows per-user activity.

Sensitive fields: do not store plaintext passwords in audit JSON.

---


## 44. Known Defects

See §42 table D1–D12. Additionally:

- Patient portal stubs advertise nav destinations that do not deliver data  
- `confirmAppointmentFromRequest` service lacks route caller  
- PostVisitCheckout orphaned  
- PublicChrome ignores authenticated state  
- No mobile sidebar (UX defect for staff on phones)

---

## 45. Exact Implementation Parity Rules

Any future Dashboard implementation **must** preserve:

1. **Role codes** `ADMIN|SECRETARY|DOCTOR_GENERAL|DOCTOR_SPECIALIST|PATIENT` with Arabic meanings above  
2. **Clinic owner** = ADMIN **or** specialist doctor via `isClinicOwner` semantics  
3. **Default landings** per `roleDashboardPath`  
4. **Secretary login shift** enforcement (Africa/Algiers)  
5. **Opaque session cookie + CSRF header** pattern (or equivalent security equal-or-stronger)  
6. **AppointmentStatus & WaitingRoomStatus** sets and the **live** transition graph in §13–15  
7. **Reception hub four tabs** and doctor **exam start/complete** loop  
8. **Staff chat peer rules** and 2MB voice behavior  
9. **No invented** Review / BeforeAfter / PatientDoctor messaging / Specialty entity unless marked extension  
10. **Permission matrix** either remains documentation-only (matching current) **or** is fully wired consistently FE+BE — no half state  
11. Sidebar orders/labels for live roles  
12. RTL Arabic dashboard UX  
13. Audit events for auth, exam, pay, staff creation, chat  
14. Medical document privacy if upload enabled  
15. Double-booking / day-busy rules already encoded in services  

### Configurable (not fixed parity)

Clinic name, phones, emails, addresses, maps embeds, doctor names, seed users, images, working hour clock values, SMTP/SMS provider keys, brand copy in `ClinicSetting`.

### Unsafe to copy blindly

- Returning plaintext patient passwords to clinic UI without secure handoff process  
- Base64 voice-in-DB at scale  
- Broad file upload authz  
- Cookie-only middleware  

---

## 46. Future Dashboard Build Checklist

### 1. Architecture
- [ ] Next App Router (or equivalent) with SSR pages + JSON API  
- [ ] PostgreSQL schema parity (50 models / 19 enums) **or** documented migration map  
- [ ] Redis optional rate-limit  
- [ ] Docker Compose: app + postgres + redis  
- [ ] `.env.example` without secrets  

### 2. Authentication
- [ ] Staff + patient portals  
- [ ] Session cookie + CSRF  
- [ ] Lockout + rate limits  
- [ ] Activate + password reset flows  
- [ ] QR login  
- [ ] Secretary shift gate  

### 3. Roles
- [ ] Five RoleCodes  
- [ ] isClinicOwner semantics  
- [ ] Correct landings  

### 4. Permissions
- [ ] Document matrix  
- [ ] Choose: wire requirePermission everywhere **or** mirror role checks exactly  

### 5. Layouts
- [ ] DashboardShell RTL navy sidebar lg+  
- [ ] StaffChatWidget mount  
- [ ] Patient custom dashboard layout  

### 6. Admin Dashboard
- [ ] Owner specialist board + staff CRUD + settings  
- [ ] Decide fate of `/admin` stubs (redirect vs implement)  

### 7. Doctor Dashboard
- [ ] General: exam + patients  
- [ ] Specialist: exam + patients + staff + settings  
- [ ] Exam start/complete charge  
- [ ] Schedule day+shift  
- [ ] Create patient account + QR  
- [ ] Ortho approval  
- [ ] Dental chart  

### 8. Secretary Dashboard
- [ ] Hub tabs today/intake/waiting/pay  
- [ ] Walk-in, direct, check-in, collect-charge  
- [ ] Auto refresh  
- [ ] Block or reassign schedule-appointment policy intentionally  

### 9. Patient Dashboard
- [ ] Slim overview parity  
- [ ] Explicitly omit or stub secondary routes as original  

### 10. Appointments
- [ ] Public request booking  
- [ ] Doctor CONFIRMED scheduling  
- [ ] Status history rows  

### 11. Queue
- [ ] WaitingRoomEntry sync map  
- [ ] Busy-day prevention  

### 12. Medical Records
- [ ] Chart + history hooks used in flows  
- [ ] Do not claim full surgery/ortho CMS if remaining stubs  

### 13. Chat
- [ ] Peer rules  
- [ ] Polling  
- [ ] Unread badges  

### 14. Voice Messages
- [ ] ≤2MB recorder upload  
- [ ] Playback + delete rules  

### 15. Notifications
- [ ] Create in-app rows where original does  
- [ ] No fake inbox unless built new  

### 16. Public Content
- [ ] Contact/hours/pages/doctor display forms  

### 17. Reviews
- [ ] Confirm **out of scope** for parity  

### 18. Before/After
- [ ] Confirm **out of scope** for parity  

### 19. Specialties
- [ ] specialtyAr string only  

### 20. Services
- [ ] Seed + laser auto-create  

### 21. Settings
- [ ] clinic-settings sections  

### 22. Security
- [ ] CSRF, hashing, lockout, ownership  
- [ ] Fix or knowingly accept D1–D6  

### 23. Responsive Design
- [ ] Match lg sidebar behavior or document intentional upgrade  

### 24. Accessibility
- [ ] focus-ring, button disabled states, labels  

### 25. Tests
- [ ] Add acceptance matrix from §47 (original had none)  

### 26. Deployment
- [ ] migrate deploy + platform env + Blob for uploads  

---

## 47. Acceptance Test Matrix

| Test ID | Role | Preconditions | Steps | Expected UI | Expected API | DB change | Audit | Forbidden |
|---------|------|---------------|-------|-------------|--------------|-----------|-------|-----------|
| AT-01 | PATIENT | Active patient user | Login patient portal | Dashboard slim view | POST login portal=patient | Session | LOGIN_SUCCESS | Staff routes |
| AT-02 | DOCTOR_GENERAL | Seed general | Staff login | `/doctor/general/dashboard` | login | Session | LOGIN_SUCCESS | Specialist settings |
| AT-03 | SECRETARY | Within shift | Staff login | Reception hub | login | Session | LOGIN_SUCCESS | |
| AT-04 | SECRETARY | Outside shift | Staff login | Error 403 | login fail shift | No session | LOGIN path fail | Enter hub |
| AT-05 | ADMIN/owner | Seed owner | Staff login | Specialist dashboard | login | Session | LOGIN_SUCCESS | |
| AT-06 | SECRETARY | Logged in | Walk-in submit | Appears in intake | walk-in | AppointmentRequest | walk-in audit | |
| AT-07 | SECRETARY | Request exists | Direct to doctor | Waiting list | appointments/[id] direct | Apt+WR | PATIENT_DIRECTED | Direct busy patient |
| AT-08 | DOCTOR | WR WAITING | Start exam | WITH_DOCTOR UI | exam start | Status sync | EXAM_STARTED | Other doctor entry |
| AT-09 | DOCTOR | WITH_DOCTOR | Complete amount | Left exam list | exam complete | Invoice+SESSION_DONE | EXAM_COMPLETED_CHARGE | |
| AT-10 | SECRETARY | Open invoice | Collect charge | Paid ledger | collect-charge | PAID+COMPLETED | DOCTOR_CHARGE_COLLECTED | |
| AT-11 | Owner | — | Create doctor | Listed | admin/doctors POST | User+Doctor | DOCTOR_CREATED | Non-owner |
| AT-12 | Owner | — | Create secretary + hours | Listed | admin/secretaries | Profile | SECRETARY_CREATED | |
| AT-13 | Specialist | Patient | Create portal account | Password+QR shown | create-patient-account | User ACTIVE | PATIENT_ACCOUNT_CREATED_ACTIVE | General doctor |
| AT-14 | Doctor | Patient | Save day schedule | Next appointment shown | schedule-appointment | Appointment CONFIRMED | APPOINTMENT_SCHEDULED_* | Outside working day |
| AT-15 | Doctor | Chart | Change tooth | Cell updates | dental-chart | DentalToothState | DENTAL_CHART_UPDATE | Secretary edit |
| AT-16 | Staff | Peers | Send text | Bubble | staff/chat | Message | STAFF_CHAT_TEXT | Patient role |
| AT-17 | Staff | Mic | Send voice ≤2MB | Audio bubble | chat/voice | Message audioUrl | STAFF_CHAT_VOICE | >2MB |
| AT-18 | Patient | QR token | Open QR URL | Dashboard | GET qr | Session | PATIENT_QR_LOGIN | Invalid token |
| AT-19 | Public | — | Book appointment | Success+queue# | public/appointments | Request NEW_REQUEST | service | Without consent |
| AT-20 | Secretary | UI schedule form | Submit | Error message | schedule-appointment 403 | None | — | Success |
| AT-21 | Any | Protected URL no cookie | Open `/secretary/dashboard` | Redirect staff login | middleware | — | — | Content |
| AT-22 | Patient | Staff cookie | Open staff login as patient identifier | 403 portal | login | — | FAIL | Staff dashboard |
| AT-23 | Owner | Settings | Change contact | Saved | clinic-settings | ClinicSetting | CONTACT_UPDATED | Secretary |
| AT-24 | Specialist | Ortho pending | Approve | Account active | ortho-approval | PatientAccount ACTIVE | ORTHO_START_APPROVED | |
| AT-25 | Staff | Open chat | Logout | Session cleared | logout | revokedAt | LOGOUT | Stay authenticated |

Patient–doctor messaging / reviews / before-after: **N/A — NOT FOUND** (assert absence if parity required).

---

## 48. Source Traceability

| Area | Primary paths |
|------|----------------|
| Schema | `prisma/schema.prisma` |
| Permissions | `src/lib/auth/permissions.ts` |
| Clinic owner | `src/lib/auth/clinic-owner.ts` |
| Session | `src/lib/auth/session.ts` |
| Current user | `src/lib/auth/current-user.ts` |
| Middleware | `src/middleware.ts` |
| Nav | `src/i18n/ar.ts` |
| Shell | `src/components/layout/DashboardShell.tsx` |
| Appointments service | `src/lib/services/appointments.ts` |
| Secretary hub | `src/components/secretary/SecretaryReceptionHub.tsx` |
| Doctor exam | `src/components/doctor/DoctorExamPanel.tsx` |
| Staff chat | `src/components/staff/StaffChatWidget.tsx`, `src/lib/staff-chat.ts` |
| Validations | `src/lib/validations/index.ts` |
| Audit labels | `src/lib/audit/labels-ar.ts` |
| Design tokens | `src/app/globals.css` |
| Public pages lib | `src/lib/public-pages.ts` |
| Seed | `prisma/seed/index.ts`, `scripts/ensure-staff.mjs` |
| APIs | `src/app/api/**/route.ts` (32) |
| Docs stale | `docs/API.md` outdated vs routes |

Evidence convention: claims above tagged `VERIFIED IN SOURCE` unless labeled otherwise.

---

## 49. Runtime Verification

| Check | Status |
|-------|--------|
| Local Docker/app started for this audit | **Not run** |
| Browser console / Network / WS frames | **Not verified at runtime** |
| Method used | Static source analysis across schema, APIs, pages, components, i18n, Docker, env example |

Safe runtime verification remains recommended before production cutover: secretary shift login, CSRF mutations, exam→pay loop, chat voice, clinic settings persistence.

---

## 50. Final Completeness Assessment

| Metric | Count / status |
|--------|----------------|
| Total dashboard page routes (`page.tsx` under admin/doctor/secretary/patient + `/patients`) | ~60 role-area pages (79 app pages overall including public) |
| Live primary dashboards | 4: secretary hub, doctor general, doctor specialist, patient slim |
| Redirect-only / stub dashboard routes | Many (admin stubs; specialist orphans; patient stubs) — see §8–12 |
| Public routes managed by dashboard settings | `/`, about, contact, doctors, services, faq, orthodontics, surgery, book-appointment |
| Roles (`RoleCode`) | **5** |
| Permissions keys | **22** (runtime enforcement incomplete) |
| API route files | **32** |
| Database models | **50** |
| Prisma enums | **19** |
| Zod schemas | **4** |
| Forms/components under `components/forms` | **20** (+ secretary/doctor widgets) |
| WebSocket events | **0** (`NOT FOUND`) |
| SSE event types | 3 (`connected`,`stats`,`heartbeat`) — unused by UI |
| Reviews / BeforeAfter / PatientDoctor messaging | **0** (`NOT FOUND`) |
| Verified features (core day clinic loop + staff CRUD + settings + chat + dental chart + patient slim) | Documented as Fully functional |
| Incomplete / stub / blocked | Admin stubs; secretary schedule 403; orphan APIs; notification inbox; email/SMS |
| Mocked | Mostly EmptyState stubs rather than fake JSON mocks |
| Dead/redirect routes | Documented in §8–12 |
| Known defects | **12** (D1–D12) |
| Runtime verification | **STATIC ANALYSIS ONLY** |

### Reproduction guidance

| Category | Items |
|----------|-------|
| Can reproduce exactly from this spec | Role landings, reception hub, doctor exam/pay loop, owner staff CRUD, settings sections, staff chat/voice, dental chart API, slim patient dashboard, auth/session/CSRF |
| Requires configuration | ClinicSetting values, seed users, working hours clocks, maps URLs, Blob token |
| Requires real clinic data | Patients, appointments, medical histories |
| Incomplete in original — do not pretend complete | `/admin/*` reports/users/services/roles/permissions/backups; patient secondary pages; reviews; before/after; patient messaging; notification UI; secretary schedule API |
| Should not copy unsafely | Plaintext password display without process controls; weak upload authz; cookie-only middleware |

---

## FINAL STATUS

```
COMPLETE DASHBOARD FEATURE INVENTORY CREATED
ALL DASHBOARD ROUTES DOCUMENTED
ALL USER ROLES DOCUMENTED
ALL PERMISSIONS DOCUMENTED
ALL SIDEBAR ITEMS DOCUMENTED
ALL FORMS DOCUMENTED
ALL APIS DOCUMENTED
ALL DATABASE MODELS DOCUMENTED
ALL STATUS TRANSITIONS DOCUMENTED
ALL UI API DATABASE FLOWS DOCUMENTED
ALL CHAT AND VOICE FEATURES DOCUMENTED
ALL PATIENT DOCTOR MESSAGING RULES DOCUMENTED (ABSENT — NOT FOUND)
ALL WORKING HOURS RULES DOCUMENTED
ALL RESPONSIVE BEHAVIOR DOCUMENTED
ALL SECURITY RULES DOCUMENTED
ALL KNOWN DEFECTS DOCUMENTED
EXACT IMPLEMENTATION PARITY RULES CREATED
COMPLETE ACCEPTANCE TEST MATRIX CREATED
ONE MASTER SPECIFICATION FILE CREATED
NO APPLICATION SOURCE FILES MODIFIED
```

**Audit method:** static source analysis of the Al Wissam Next.js + Prisma + PostgreSQL codebase. Runtime browser verification was not performed in this pass (`STATIC ANALYSIS ONLY` / not `VERIFIED AT RUNTIME`).

**Stack note for rebuild teams:** Prefer preserving PostgreSQL + relational schema for parity. A Mongo rebuild is a redesign, not bit-parity, unless all relations/enums are carefully remapped.

---

*End of ALWISSAM_COMPLETE_DASHBOARD_SPECIFICATION*
