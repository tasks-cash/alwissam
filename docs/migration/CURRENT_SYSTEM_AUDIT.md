# Current System Audit

**Audit date:** 2026-07-13  
**Workspace root:** `/home/xss/Downloads/projects/alwissam-main`  
**Evidence basis:** Repository source + three completed read-only audits (structure, backend/database, frontend). No production secrets recorded. No destructive DB commands run.

---

## Phase 0 — Repository protection

| Item | Result |
| --- | --- |
| `pwd` | `/home/xss/Downloads/projects/alwissam-main` |
| `git rev-parse --show-toplevel` | `fatal: not a git repository (or any of the parent directories): .git` |
| Branch creation `migration/nest-next-mongodb` | **Skipped** — no `.git` present; will not auto-init a repository |
| Original commit hash | **Unavailable** |
| Uncommitted changes | **N/A** (no Git working tree) |
| Preservation action | Legacy app left in place; docs only for Phase 0–1; no Prisma/PostgreSQL reset |

---

## Architecture summary

| Area | Current implementation | Evidence |
| --- | --- | --- |
| Product | Arabic RTL dental clinic platform (Al-Wisam) | `README.md`, `src/i18n/ar.ts` |
| Frontend + backend | **Single Next.js 16.2.10 monolith** (App Router pages + Route Handlers). **Not** NestJS, Express, or a separate API package | `package.json`, `src/app/**` |
| Language | TypeScript | `tsconfig.json` |
| Package manager (legacy) | npm (`package-lock.json`) | root lockfile |
| UI | React 19.2.4, Tailwind CSS 4, Cairo/Inter, RTL `ar-DZ` | `src/app/layout.tsx`, `globals.css` |
| Data access | Prisma 7 + `@prisma/adapter-pg` + `pg` Pool | `src/lib/db/prisma.ts`, `prisma.config.ts` |
| Database | PostgreSQL 16 (Compose port host `5433`) | `docker-compose.yml` |
| Cache / rate limit | Redis 7 via `ioredis` (optional degradation to in-memory) | `src/lib/db/redis.ts`, `rate-limit.ts` |
| Auth | Cookie `alwisam_session`; SHA-256 hashed session token in DB; CSRF per session; bcrypt 12 rounds; lockout; password-reset + activation tokens; patient QR passwordless login | `src/lib/auth/*`, `src/app/api/auth/*`, `src/app/patient/qr/[token]/route.ts` |
| Authorization (runtime) | Hard-coded `RoleCode` arrays in pages/APIs; `requireUser` / `isClinicOwner` | `current-user.ts`, route handlers |
| Authorization (schema) | `Permission`, `RolePermission`, `UserPermission` seeded for ADMIN; **`requirePermission()` has no call sites** | `permissions.ts`, `prisma/seed/index.ts` |
| Files | Local disk `UPLOAD_DIR`; metadata in `MedicalDocument` / `FileAttachment` | `api/files/upload` |
| Realtime | SSE `/api/realtime/stream` polling DB every ~5s; Redis `publishEvent` channels used by appointment services | `api/realtime/stream`, `lib/services/appointments.ts` |
| Localization | Arabic-only dictionary; no next-intl | `src/i18n/ar.ts` |
| Deployment | Docker multi-stage standalone; Compose `postgres`+`redis`+`app`; Render YAML | `Dockerfile`, `docker-compose.yml`, `render.yaml` |
| CI | No project GitHub Actions workflows found | — |
| Tests | **No `test` / `test:e2e` scripts** in legacy `package.json` | `package.json` |

---

## Inventory counts (verified)

| Inventory | Count | Notes |
| --- | --- | --- |
| Prisma models | **50** | See `DATABASE_INVENTORY.md` |
| Prisma enums | **20** | — |
| `page.tsx` routes | **79** | See `PAGE_INVENTORY.md` |
| Extra non-API route handler | **1** | `GET /patient/qr/[token]` |
| API route files under `src/app/api` | **30** | — |
| API HTTP method handlers | **39** | Including QR; see `API_INVENTORY.md` |
| Functional pages (incl. QR) | **37** | Includes live QR login handler |
| Redirect-only pages | **18** | — |
| Stub / empty-state pages | **25** | Intentionally incomplete UI |

---

## Authentication & session detail

| Concern | Behavior | Enforced? |
| --- | --- | --- |
| Password hash | bcryptjs, cost 12 | Yes |
| Session cookie | `alwisam_session`, httpOnly, sameSite=lax, secure from `COOKIE_SECURE` | Yes |
| CSRF | Header `x-csrf-token` must match `session.csrfToken` on mutating APIs | Yes (API handlers) |
| Middleware | Cookie **presence** only on UI prefixes; does **not** protect `/api/*` | Partial |
| Rate limit | Redis-backed login/public booking limits | Yes (with memory fallback) |
| 2FA fields | `twoFactorEnabled` / `twoFactorSecret` on `User` | **Schema only — no runtime** |
| env `SESSION_SECRET` / `CSRF_SECRET` / `SIGNED_URL_SECRET` | Present in `.env.example` / Compose | **Not referenced in `src/`** |

---

## File, print, PDF, export (evidence-based)

| Capability | Status | Evidence |
| --- | --- | --- |
| Upload API | Implemented; JPEG/PNG/WebP/PDF; any authenticated user; no ownership check | `src/app/api/files/upload/route.ts` |
| Download/serve UI | **Not found** | No authenticated file GET UI |
| Patient files page | Stub empty state | `src/app/patient/files/page.tsx` |
| `window.print` | Present for credentials / patient card | `PrintCredentials.tsx`, `DoctorPatientCard.tsx` |
| PDF generation library | **None** | No jspdf/puppeteer/react-pdf usage |
| CSV/Excel export UI | **None** found | — |
| Report pages | Stub EmptyState shells | `/admin/reports`, `/doctor/*/reports` |
| Charts (`recharts`) | Dependency present; **unused in `src/`** | `package.json` |

---

## Notifications & messaging

| Channel | Status |
| --- | --- |
| In-app `Notification` records | Created in some flows |
| EMAIL / SMS / WhatsApp | Env template only; **no sender implementation in `src/`** |
| Message entity / secretary messages page | Schema + stub page |

---

## Dependency disposition

| Class | Packages / components |
| --- | --- |
| Must retain during cutover period | Legacy Next monolith, Prisma, PostgreSQL, Redis (rate limit / pubsub), bcrypt hashes, Arabic UI assets |
| Must replace (target) | Route-handler backend → NestJS; Prisma/Postgres primary → MongoDB + Mongoose |
| Must migrate | Sessions, users, clinical/billing entities, uploads metadata, audits |
| Obsolete / unused in code | `jose` (listed, unused); signed-URL secret; 2FA fields |
| Dev-only | eslint, tsx, types, prisma CLI |
| Security-sensitive | bcrypt, session cookies, CSRF, Redis, uploads, DB URLs |

---

## Environment variable inventory (names only)

**DB/cache:** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`, `REDIS_URL`  
**App:** `NODE_ENV`, `NEXT_PUBLIC_APP_URL`, `APP_NAME`  
**Auth (declared):** `SESSION_SECRET`, `CSRF_SECRET`, `COOKIE_SECURE`, `SESSION_MAX_AGE_HOURS`, `SESSION_REMEMBER_DAYS`, `MAX_LOGIN_ATTEMPTS`, `LOCKOUT_MINUTES`  
**Files:** `UPLOAD_DIR`, `MAX_UPLOAD_SIZE_MB`, `SIGNED_URL_SECRET`  
**Notifications (declared, unwired):** `SMTP_*`, `SMS_*`, `WHATSAPP_*`  
**Clinic public:** `CLINIC_PHONE`, `CLINIC_EMAIL`, `CLINIC_ADDRESS`, `CLINIC_MAP_EMBED_URL`  
**Seed:** `SEED_ADMIN_*`, `SEED_SECRETARY1_*`, `SEED_DOCTOR_SPECIALIST_*`, `SEED_DOCTOR_GENERAL_*`

Values intentionally omitted.

---

## Completeness classification for migration planning

1. **Complete features (must preserve behavior):** public site + walk-in register, staff/patient login, password reset/activate, secretary reception workflows, waiting room/directed flow, payments collection, doctor exam queues, patient record view, specialist staff CRUD/settings/CMS, patient QR login, audit writes on mutations.
2. **Incomplete features (UI stub/redirect but may have schema and/or partial API):** patient portal subpages, admin RBAC UI, reports, backups, messaging, referrals pages, specialist surgery/ortho list pages, secretary invoices/messages pages.
3. **Intended but unimplemented:** dynamic DB permission enforcement, email/SMS/WhatsApp delivery, signed download URLs, 2FA, PDF export, charted reports.
4. **Migration work required:** NestJS API parity, Next frontend parity for functional routes, Mongo schemas + data migration, Redis integration where used, file migration, tests, Docker target stack.

---

## Risks documented for later phases

- No Git → cannot create protected migration branch or recover via history in this folder.
- `README.md` contains unresolved merge conflict markers.
- Deploy-on-boot `prisma migrate deploy` in Dockerfile.
- Authorization gap (RBAC tables decorative).
- Upload authorization gap.
- Soft-delete filters inconsistently applied.
- Financial Decimals must use Decimal128 (never float).
- Target must preserve Redis if rate limit / pubsub parity required.
