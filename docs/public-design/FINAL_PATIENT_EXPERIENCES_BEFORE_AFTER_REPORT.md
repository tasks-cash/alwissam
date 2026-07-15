# Final report — Patient Experiences + Before/After

**Date:** 2026-07-14  
**Status:** `PATIENT EXPERIENCES AND BEFORE/AFTER FEATURE NOT COMPLETE` — `REMAINING FAILURES DOCUMENTED`

Core Nest → Mongo → Admin → Public homepage path is implemented. Full QA matrix (Playwright against a live stack, production build of all web routes, visual mobile/tablet/desktop sign-off, drag/reorder UX polish) is **not** fully green.

---

## Existing related features discovered

| Area | Finding |
|------|---------|
| Homepage reviews | Legacy CMS/`Review` model + `GET /api/public/reviews` only; no admin CRUD, no consent/publish workflow |
| Before/after | Not present before this work |
| Public-content admin | Not present; clinic settings only at `/[locale]/doctor/specialist/settings` |
| Uploads | None; `multer` added |
| Slider libs | None in web package; lightweight custom carousels |
| Permissions | Role defaults; OWNER/ADMIN/specialist bypass for staff ops |

Prompt path `/dashboard/public-content/...` mapped to app routes:

- `/[locale]/doctor/specialist/public-content/patient-experiences`
- `/[locale]/doctor/specialist/public-content/before-after`

---

## PatientExperience schema

- Collection: `patient_experiences`
- File: `apps/api/src/patient-experiences/schemas/patient-experience.schema.ts`
- Includes anonymous labels, multilingual reviews, rating 1–5, doctor/service/specialty links, featured/approved/published, displayOrder, consent + internal consent reference, archive, audit actor IDs

## BeforeAfterCase schema

- Collection: `before_after_cases`
- File: `apps/api/src/before-after/schemas/before-after-case.schema.ts`
- Before/after image URLs + localized alts, treatment metadata, consent/approval/publish/feature/order/archive

## MongoDB indexes

Compound indexes on published/approved/archived/featured/displayOrder; `publishedAt` descending; doctor/service/specialty field indexes as declared on props.

## Permissions added

```
manage_patient_experiences
approve_patient_experiences
publish_patient_experiences
manage_before_after
approve_before_after
publish_before_after
```

Granted to ADMIN (all permissions) and DOCTOR_SPECIALIST defaults. Maps conceptually to prompt’s `patientExperiences.*` / `beforeAfter.*` keys using existing snake_case convention.

## Admin pages

- Patient experiences: list, search/filters, pagination, create/edit, preview (ar/en/fr), approve/reject/publish/unpublish/feature/archive, image upload, consent blockers
- Before/after: same pattern + before/after thumbs and required image gates

## Consent / approval / publication enforcement

Verified by unit tests (`*.publication.spec.ts`):

- Experiences: consent + approval + review text required to publish
- Before/after: both images + consent + approval required to publish
- Rejecting approval unpublishes when previously published

## Audit logging

Events written via `AuditService` for create/update/approve/reject/publish/unpublish/archive/restore/reorder/images_replaced (before/after). Summaries avoid consent document and medical identity.

## Public APIs

- `GET /api/public/patient-experiences?locale=&featured=&limit=&page=` (limit ≤ 10)
- `GET /api/public/before-after?locale=&featured=&limit=&page=` (limit ≤ 10)

### Private-field protection

Public payloads omit consent references, creator IDs, moderation flags (`isApproved`), phones, emails, and hidden real names when anonymous.

## Approved record counts (this environment)

**No production fake seed was added.**  
Until an admin creates + approves + publishes records:

- Approved experiences available for homepage: **0** (empty state)
- Approved featured before/after cases: **0** (empty state)

Homepage renders empty states; it does **not** fabricate testimonials or results.

## Homepage

Section order updated to:

Hero → Quick book → Intro → Services → Specialties → Doctors → Why → Journey → **Before/After** → **Patient Experiences** → FAQ → Location → CTA

- Testimonials slider: autoplay ~6s, pause on hover/focus/tab-hide, prev/next, dots, swipe, RTL/LTR, reduced-motion, 1/2/3 cards by width
- Before/after: case carousel + interactive comparison (pointer + range keyboard), LTR image geometry for stable drag, localized labels/disclaimer

## Accessibility / performance / security (summary)

| Concern | Result |
|---------|--------|
| Section headings / carousel labels / rating text | Implemented |
| SSR data fetch | Yes (homepage Server Component) |
| Client islands | Sliders only |
| Upload caps | JPEG/PNG/WebP, 5MB, UUID filenames |
| Mass assignment | ValidationPipe whitelist |
| Public DTO leakage | Guarded in serializers |

## Quality command results

| Command | Result |
|---------|--------|
| `pnpm --filter @alwisam/api typecheck` | **PASS** |
| `pnpm --filter @alwisam/web typecheck` | **PASS** |
| `pnpm --filter @alwisam/api test` | **PASS** (12 tests, includes publication rules) |
| `pnpm --filter @alwisam/api build` | **PASS** |
| `docker compose -f infrastructure/docker/docker-compose.target.yml config` | **PASS** |
| `pnpm --filter @alwisam/web build` | **FAIL** — pre-existing prerender errors on unrelated dashboard routes (`/secretary/directed`, `/doctor/specialist/secretaries`: `Cannot read properties of undefined (reading 'length')`). Not introduced by homepage sliders |
| `pnpm test:e2e` / full Playwright matrix | **NOT RUN** against a live API+web stack in this session (specs added) |
| `docker compose build` | **NOT RUN** (config validated only) |
| Browser console / multi-viewport manual | **NOT FULLY VERIFIED** |

## Exact files changed (primary)

**API**

- `apps/api/src/patient-experiences/**`
- `apps/api/src/before-after/**`
- `apps/api/src/media/**`
- `apps/api/src/app.module.ts`
- `apps/api/src/main.ts` (static `/uploads`)
- `apps/api/src/common/auth/permissions.ts`

**Web**

- `apps/web/app/[locale]/page.tsx`
- `apps/web/components/public/pages/HomePageContent.tsx`
- `apps/web/components/public/PatientExperiencesSlider.tsx`
- `apps/web/components/public/BeforeAfterSlider.tsx`
- `apps/web/app/[locale]/doctor/specialist/public-content/patient-experiences/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/public-content/before-after/page.tsx`
- `apps/web/lib/public-site.ts`
- `apps/web/lib/navigation.ts`
- `apps/web/lib/i18n/public-copy.ts`
- `apps/web/lib/i18n/dictionaries.ts`
- `apps/web/app/globals.css`
- `apps/web/next.config.ts` (`/uploads` rewrite)
- `apps/web/e2e/patient-experiences-before-after.spec.ts`
- `apps/web/package.json` (+ `react-hook-form`, `@hookform/resolvers` — admin forms currently use Zod + controlled state matching existing dashboard pattern; RHF available for follow-up)

## Remaining issues / next actions

1. Fix pre-existing web `next build` prerender failures on secretary/secretaries dashboard pages so CI build is green.
2. Run API + web locally; as Owner create real consented cases, approve, publish, feature; confirm sliders show ≤10 items.
3. Execute Playwright (`pnpm --filter @alwisam/web test:e2e`) with `PLAYWRIGHT_BASE_URL` and API rewrite targets up.
4. Optional: migrate admin forms to React Hook Form wiring; add numeric reorder DnD; full listing pages only when needed (not stubbed).
5. Harden upload processing (EXIF strip / sharp) if deeper image pipeline is required beyond safe store + type/size checks.

---

## Completion checklist (verified vs required)

| Claim | Status |
|-------|--------|
| PATIENT EXPERIENCES ADMIN MANAGEMENT COMPLETE | **Mostly** (functional; polish/RHF pending) |
| BEFORE AND AFTER ADMIN MANAGEMENT COMPLETE | **Mostly** |
| CONSENT AND APPROVAL CONTROLS VERIFIED | **Unit-tested** |
| PUBLIC DATABASE APIS VERIFIED | **Implemented** (live e2e pending) |
| UP TO TEN APPROVED EXPERIENCES DISPLAYED | **Capability yes; count = 0 until CMS publish** |
| UP TO TEN APPROVED BEFORE AND AFTER CASES DISPLAYED | **Same** |
| PREMIUM SLIDERS / RTL / LTR / BREAKPOINTS | **Implemented; browser matrix incomplete** |
| ALL CRITICAL TESTS PASS | **No** (web build + full e2e outstanding) |

**Final status line:**

`PATIENT EXPERIENCES AND BEFORE/AFTER FEATURE NOT COMPLETE`  
`REMAINING FAILURES DOCUMENTED`
