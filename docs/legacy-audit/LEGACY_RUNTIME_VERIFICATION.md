# Legacy Runtime Verification

## Attempt status: BLOCKED

| Prerequisite | Result |
| --- | --- |
| Path exists | Found |
| `node_modules` | **Absent** |
| `.env` / `.env.example` | **Absent** in legacy folder |
| Local Postgres/Redis for this folder | Not started for this audit (would risk colliding with parent stack) |
| Destructive seeds / migrate reset | **Not run** (forbidden) |

## Package manager (verified)

- Lockfile: `package-lock.json` → **npm**
- Correct install command would be: `npm ci` or `npm install` **inside legacy folder only**
- Not executed (avoid lockfile regen; avoid installing into silent shared cache without approval; keep audit non-mutating beyond docs)

## Commands considered (not executed successfully)

| Command | Intended | Result |
| --- | --- | --- |
| `npm run lint` | ESLint | **Not run** — no dependencies |
| `npm run typecheck` | `tsc --noEmit` | **Not run** — no `typescript` install in folder |
| `npm test` | — | **No test script / runner config found** |
| `npm run build` | production build | **Not run** |
| `npm run dev` | start app | **Not run** |
| `docker compose config` | validate compose | **Not run** this phase (file present) |
| Browser Network on `/doctor/specialist/dashboard` | capture polling | **Blocked** |

## What static analysis substitutes for runtime

- Exam button → API → Prisma mutation chain traced in source  
- Waiting list query traced  
- Sidebar labels matched to files  
- API method inventory complete from filesystem  

## If runtime becomes available later

Minimum safe plan:

1. Copy `.env.example` from a trusted companion if restored — **names only**  
2. `npm ci`  
3. `docker compose up -d postgres redis`  
4. `npx prisma migrate deploy` (non-destructive deploy)  
5. `npm run db:seed` only on empty local DB  
6. Login with seed env accounts  
7. Capture Network for `/doctor/specialist/dashboard` and `POST /api/doctor/exam`  

## Exit codes

No audit quality command produced an exit code because none were executable without installs.

**Wording required by brief:** Runtime verification blocked by missing environment configuration / dependencies. Features were **not assumed**.
