# Legacy Project Overview

**Audited path:** `/home/xss/Downloads/projects/alwissam-main/old project/alwissam-main`  
**Audit date:** 2026-07-15  
**Mode:** READ-ONLY (documentation under `docs/legacy-audit/` only)  
**Runtime verification:** BLOCKED — no `node_modules` in legacy tree; no `.env` / `.env.example` present

## Path verification

| Check | Result |
| --- | --- |
| Directory exists | **Found** |
| Own `.git` | **Not found** — folder is inside parent repo `/home/xss/Downloads/projects/alwissam-main` |
| Parent git HEAD (when inspected from repo) | `ce0a541 update 8` on `main` |
| Remote | `origin` → `https://github.com/tasks-cash/alwissam.git` |
| Classification | **Copied full-stack source folder** inside parent monorepo (not an independent git worktree) |
| Accompanying archive | `old project/alwissam-main(1).zip` |

## Stack (verified from manifests)

| Layer | Technology | Evidence |
| --- | --- | --- |
| Framework | Next.js **16.2.10** App Router | `package.json`, `src/app/**` |
| Frontend | React **19.2.4**, TypeScript | `package.json`, `tsconfig.json` |
| Backend | Same Next.js process — Route Handlers | `src/app/api/**/route.ts` (32 files) |
| Package manager | **npm** (`package-lock.json`) | Lockfile present; no `pnpm-lock.yaml` in legacy |
| Node | `>=20` (README prefers 22) | `package.json` `engines`, README |
| Database | **PostgreSQL 16** | `docker-compose.yml`, Prisma |
| ORM | **Prisma 7.8** + `@prisma/adapter-pg` + `pg` | `package.json`, `prisma/`, `src/lib/db/prisma.ts` |
| Cache / pub-sub | **Redis 7** (optional) | `ioredis`, `REDIS_URL` |
| Auth | Cookie session `alwisam_session` + bcrypt (12) + CSRF header | `src/lib/auth/session.ts`, `password.ts` |
| Validation | Zod 4 | `src/lib/validations` |
| UI | Custom Tailwind v4 components | `globals.css`, `components/ui` |
| State | Server Components + light client state; Zustand dep unused in critical flows | Static analysis |
| Files | Local `UPLOAD_DIR` or Vercel Blob | `src/app/api/files/upload`, `@vercel/blob` |
| Real-time | Redis publish + SSE `/api/realtime/stream` (not wired to specialist dashboard) | Found |
| Deploy | Docker Compose + `render.yaml` | Found |
| Tests | No Jest/Playwright config in legacy tree | Not found |

## Entry points

| Mode | Command (`package.json`) |
| --- | --- |
| Dev | `npm run dev` → `next dev` |
| Build | `npm run build` → `prisma generate && next build` |
| Start | `npm start` → `prisma migrate deploy && next start` |
| Infra | `npm run docker:up` → postgres + redis |

## Environment variable names (values not disclosed)

Reconstructed from `docker-compose.yml`, `README.md`, and `process.env` usage. **`.env.example` is missing** from this snapshot (README still references it).

**Database / cache:** `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `REDIS_URL`, `DATABASE_SSL`, `DATABASE_SSL_REJECT_UNAUTHORIZED`, `DB_POOL_MAX`

**App / cookies:** `NODE_ENV`, `NEXT_PUBLIC_APP_URL`, `COOKIE_SECURE`, `SESSION_MAX_AGE_HOURS`, `SESSION_REMEMBER_DAYS`, `MAX_LOGIN_ATTEMPTS`, `LOCKOUT_MINUTES`

**Documented in compose/README but not referenced under `src/`:** `SESSION_SECRET`, `CSRF_SECRET`, `SIGNED_URL_SECRET`

**Files:** `UPLOAD_DIR`, `MAX_UPLOAD_SIZE_MB`, `BLOB_READ_WRITE_TOKEN`

**Clinic / seed:** `CLINIC_PHONE`, `CLINIC_EMAIL`, `CLINIC_ADDRESS`, `CLINIC_MAP_EMBED_URL`, `SEED_*_EMAIL`, `SEED_*_PHONE`, `SEED_*_PASSWORD`, `SEED_ADMIN_EMAIL`, `SEED_SOFT_FAIL`

**Platform detection:** `VERCEL`, `VERCEL_URL`, `RAILWAY_*`, `RENDER*`, `FLY_APP_NAME`, `AWS_LAMBDA_FUNCTION_NAME`, `NEXT_RUNTIME`, `DOCKER_BUILD`, `OUTPUT_STANDALONE`

## Application shape

Arabic RTL dental clinic monolith:

- Public marketing + booking (`/`, `/register`, …)
- Staff login `/staff/login`
- Role portals: secretary, doctor general, doctor specialist (owner), patient, stub admin
- Business logic concentrated in Prisma queries inside Route Handlers + `src/lib/services/appointments.ts`

## Confirmation

No application source under the legacy path was modified during this audit. Documentation written only under `docs/legacy-audit/`.
