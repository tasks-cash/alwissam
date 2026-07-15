# Migration Status

**Updated:** 2026-07-13  
**Canonical workspace:** `/home/xss/Downloads/projects/alwissam-main`

## Current phase

**Phase 2 — target architecture foundation: scaffold verified.**  
Next: Phase 3 — core NestJS modules (auth/users/roles) with behavior parity against legacy.

## Git state

| Check | Result |
| --- | --- |
| `pwd` | `/home/xss/Downloads/projects/alwissam-main` |
| `git rev-parse --show-toplevel` | `fatal: not a git repository (or any of the parent directories): .git` |
| Branch `migration/nest-next-mongodb` | **Not created** (no `.git`; will not auto-init) |
| Original commit hash | **Unavailable** |

Safety: no reset/clean/force; Prisma/PostgreSQL not reset; legacy `src/` and `prisma/` retained.

## Completed work

### Phase 0–1 audit documentation

- `CURRENT_SYSTEM_AUDIT.md`
- `PAGE_INVENTORY.md` (79 `page.tsx` + QR handler)
- `API_INVENTORY.md` (39 HTTP method handlers)
- `DATABASE_INVENTORY.md` (**50** Prisma models, 20 enums)
- `FEATURE_MATRIX.md`
- `PERMISSION_MATRIX.md`
- `INTEGRATION_INVENTORY.md`
- `DATA_MIGRATION_PLAN.md`

### Phase 2 foundation (beside legacy)

- `pnpm-workspace.yaml` + `packageManager: pnpm@9.15.9`
- `apps/api` NestJS + Mongoose + `/health` + `/api/health` + Swagger `/docs`
- `apps/web` Next.js App Router scaffold (port **3003** locally)
- `packages/shared-{config,types,validation,utils}`
- `scripts/migration/*` placeholders
- `infrastructure/docker/docker-compose.target.yml` (Mongo/API/web; legacy Compose unchanged)
- Root `tsconfig.json` excludes `apps/` / `packages/` so legacy Next build is isolated
- `.env.target.example` (names only)

## Inventory counts

| Metric | Count |
| --- | --- |
| Prisma models | **50** |
| Prisma enums | **20** |
| `page.tsx` routes | **79** |
| QR route handler | **1** |
| Functional pages (incl. QR) | **37** |
| Redirect-only pages | **18** |
| Stub / incomplete pages | **25** |
| API route files | **30** |
| API + QR HTTP handlers | **39** |
| Pages migrated (parity) | **0** |
| Nest domain APIs migrated | **0** (health only) |
| MongoDB domain collections | **0** (connection only) |
| Data migration | **not started** |

## Validation results

### Legacy application

| Command | Result |
| --- | --- |
| `npm install` | OK (deps were incomplete; restored) |
| `./node_modules/.bin/prisma generate` | OK |
| `npm run lint` | **FAIL** — 2 errors (`react-hooks/set-state-in-effect` in `DashboardShell.tsx`, `SecretaryScheduleForm.tsx`); 3 warnings (`no-img-element`, unused vars). Not silently fixed. |
| `npm run typecheck` | **OK** (after Prisma generate + excluding `apps/`/`packages/`) |
| `npm test` | **Missing script** (`npm error Missing script: "test"`) |
| `npm run build` | **OK** (Next.js 16.2.10 production build) |

### Target workspace

| Command / check | Result |
| --- | --- |
| `pnpm --version` | `9.15.9` |
| `pnpm -r run typecheck` | **OK** (all 6 workspace packages) |
| `pnpm --filter @alwisam/web build` | **OK** |
| `pnpm --filter @alwisam/api build` / `start:prod` | **OK** |
| `GET http://localhost:4001/health` | `{"status":"ok","mongodb":"up",...}` |
| `GET http://localhost:4001/api/health` | same |
| `apps/web` on `:3003` | HTTP **200** |
| `docker compose -f infrastructure/docker/docker-compose.target.yml config` | **OK** |
| Target MongoDB | Running on host **27018** (27018 occupied by unrelated `tasks-cash-mongodb`) |
| `pnpm --filter @alwisam/api test` | OK — no tests yet (`passWithNoTests`) |

## Risks

- No Git in this folder → no migration branch / history protection.
- Host ports **27018 / 4000 / 3000 / 3001** occupied by unrelated Docker stack; target uses **27018 / 4001 / 3003**.
- Legacy lint already failing on React hooks rules.
- DB permission tables unused at runtime (role checks only).
- File upload lacks ownership checks; SSE open to any session.
- Many stub routes must not be treated as complete product features.
- `README.md` still has merge conflict markers.

## Blockers

- Git absent for branch protection (documented; work continued).
- No missing secret blocking foundation (notification SMTP/SMS/WhatsApp remain unwired in legacy too).

## Recent local ops (2026-07-14)

- Added idempotent owner seed: `npm run seed:owner` (`prisma/seed/owner.ts`).
- Role used: existing `ADMIN` (no OWNER enum). Clinic-owner parity via specialist doctor profile.
- Local owner user verified (login + dashboard + admin APIs). Credentials from `OWNER_EMAIL` / `OWNER_PASSWORD` only.
- Additive Prisma migrations applied for schema drift (`SecretaryProfile` shift fields, `PatientAccount.qrAccessToken`). No reset.
- **Do not delete Prisma/PostgreSQL** until Mongo parity + data migration verify complete (Phase 6+).

## Exact next action

**Patient portal link bug fixed (2026-07-15):** Nest `Types.ObjectId`→`SchemaMixed` caused `/api/patient/dashboard` 404 despite linked Mongo docs. Replaced with `SchemaTypes.ObjectId` across schemas; added `User.patientProfileId`, repair script `pnpm repair:patient-profiles`, and hardened `requirePatient`. Verified login→dashboard via API `:4001` and web `:3004`.

Continue Phase 3–5 remaining staff/domain parity. Do **not** cut over production or run destructive data migration.
