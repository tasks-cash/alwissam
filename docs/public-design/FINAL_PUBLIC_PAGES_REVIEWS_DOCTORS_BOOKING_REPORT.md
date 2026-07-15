# FINAL PUBLIC PAGES — Reviews, Doctors, Booking Report

Date: 2026-07-15  
Workspace: `/home/xss/Downloads/projects/alwissam-main`

## Completion verdict

**PUBLIC PAGES AND FLEXIBLE BOOKING UPDATE NOT COMPLETE**  
**REMAINING FAILURES DOCUMENTED**

Core backend + frontend for this upgrade landed and typecheck/unit tests/build pass, but several prompt completion stamps cannot be claimed yet (notably: zero *approved published* patient reviews in Mongo, only two real public doctors available so “exactly three” cannot be filled without inventing doctors, and Playwright/e2e was not fully re-verified in this pass).

---

### 1. Existing review count
**30** documents in `reviews` after idempotent seed (`pnpm -w run seed:reviews`).

### 2. Approved public review count
**0** published/approved public reviews (`isPublished` + `isApproved`, or legacy `status: APPROVED`).

### 3. Thirty-review target result
**Met as capacity:** 30 records exist.  
**Not met as public content:** none are published fabricated patient feedback.

### 4. Demo/draft review result
30 **admin drafts** with `source: admin_draft`, `status: PENDING`, `isPublished: false`.  
Production policy: do **not** publish fixtures. Admin must approve real clinic-approved content before publish.

### 5. Reviews API result
`GET /api/public/reviews` supports `locale`, `page`, `limit`, `rating`, `doctorId`, `specialtyId|Slug`, `serviceId|Slug`, `verified`, `featured`, `search`.  
Returns public-safe DTO only (anonymous label, no consent/IP/admin IDs).  
Admin: `GET/POST/PATCH /api/admin/reviews` + action routes.

### 6. Reviews page result
`/[locale]/reviews` redesigned with hero, stats, featured strip, `ReviewsExplorer` filters + pagination.  
Arabic hero copy uses تجربة/آراء messaging.

### 7. Review-card result
`ReviewCard` — quote treatment, accessible rating text, verified only when `isVerified`, anonymous AR label `مريض من عيادة الوسام`, responsive grid styles in `globals.css`.

### 8. Existing doctor count
Clinic-approved public bookable doctors in Mongo: **2**  
- الدكتور منانة فؤاد (`DOCTOR_SPECIALIST`)  
- الدكتور قعري أسامة (`DOCTOR_GENERAL`)

### 9. Public doctor count
**2** (role-gated to `DOCTOR_GENERAL|DOCTOR_SPECIALIST`, `isPublic ≠ false`).

### 10. Owner exclusion result
**Verified:** ADMIN/System Owner excluded from `listPublic` / `getPublicById` / booking relation checks.  
`seed-mongo-owner` now forces `doctor.isPublic=false`, `isBookable=false`.  
Mongo audit: `adminStillPublic: []`.

### 11. Exactly-three-doctor display result
**Partial:** UI requests `featured=true&limit=3&bookable=true`.  
With only **2** real public doctors, the page correctly shows **2** — did **not** invent a third doctor.

### 12. Doctor-card result
`DoctorCard` uses `next/image`, specialty badge, languages, availability, profile + book CTAs.

### 13. Doctor-details result
`doctors/[slug]` updated with photo, schedule block, booking CTA preserving doctor id, empty-schedule Arabic message.

### 14. Doctor schedule result
Public serialization uses `workingHours` / `weeklySchedule`.  
Availability slots for a selected doctor no longer invent a clinic-wide fallback when that doctor has no window for the day.

### 15. Doctor booking CTA result
Links preserve `?doctor=` into booking wizard.

### 16. Specialties redesign result
Existing Mongo-backed specialties listing/cards retained (prior premium catalog work). Disclaimers available in copy for details pages.

### 17. Services redesign result
Existing Mongo-backed services listing retained (catalog API). No fake prices introduced.

### 18. About redesign result
Expanded values (8), care approach, doctors (same public list), specialties, location CTAs.  
Hero title/description match Arabic prompt.

### 19–21. Optional Doctor / Specialty / Service
Contact/`AppointmentWizard`: doctor, specialty, and service remain optional; Arabic labels updated to prompt wording.

### 22–23. Booking without Doctor / Specialty
Backend `createPublicRequest` accepts empty doctor/specialty; sets `assignmentMode` + `pending_reception_assignment` when no doctor.

### 24. Reception assignment result
API: `GET /api/secretary/assignment-queue`, `POST /api/secretary/assignment-queue/assign` (role + `manage_appointments`).  
UI: `/[locale]/secretary/assignment-queue`.

### 25. Appointment status result
Statuses include `pending_confirmation`, `pending_reception_assignment`, legacy statuses preserved.

### 26. Assignment audit result
Assignments write via `AuditService.write` (`appointment_request.assign_doctor`).

### 27–30. Homepage / doctor / external images
Downloaded Unsplash stock JPEGs into `apps/web/public/images/stock/` and wired into homepage/about/booking sections.  
Documented in `docs/public-design/IMAGE_ASSET_SOURCES.md`.  
Doctor images still from Mongo `profileImage` only.

### 31–32. Arabic RTL / EN·FR LTR
Locale architecture unchanged (`[locale]` + logical CSS in `.public-shell`). Strings updated for AR optional booking/about/reviews.

### 33–36. Responsive / a11y / performance / security
Improved via shared components, pagination, public DTOs, ObjectId validation, role gates. Not a full manual matrix re-test this pass.

### 37. Browser-console result
Not re-verified interactively in this pass.

### 38. Lint result
Workspace lint scripts are stubs (`lint:* not configured yet`) — **no ESLint gate**.

### 39. Typecheck result
**Pass** — `@alwisam/api` and `@alwisam/web`.

### 40. Unit-test result
**Pass** — 42 tests including `reviews.public.spec.ts` (DTO anonymity, booking modes, owner gate).

### 41. Playwright result
**Not re-run** in this pass (`pnpm test:e2e` not executed to completion here).

### 42. Build result
**Pass** — Nest API build + Next.js production build (route table included public + secretary pages).

### 43. Docker result
`docker compose -f infrastructure/docker/docker-compose.target.yml config` → **OK**.  
`docker compose build` not re-run this pass.

### 44. Exact files changed (high-signal)

**API**
- `apps/api/src/reviews/schemas/review.schema.ts`
- `apps/api/src/reviews/reviews.service.ts`
- `apps/api/src/reviews/reviews.controller.ts`
- `apps/api/src/reviews/reviews-admin.controller.ts`
- `apps/api/src/reviews/reviews.module.ts`
- `apps/api/src/reviews/dto/review-query.dto.ts`
- `apps/api/src/reviews/dto/submit-review.dto.ts`
- `apps/api/src/reviews/reviews.public.spec.ts`
- `apps/api/src/doctors/doctors.service.ts`
- `apps/api/src/doctors/public-doctors.controller.ts`
- `apps/api/src/catalog/catalog.service.ts`
- `apps/api/src/appointments/schemas/appointment-request.schema.ts`
- `apps/api/src/appointments/appointments.service.ts`
- `apps/api/src/appointments/appointments.controller.ts`
- `apps/api/src/common/auth/permissions.ts`

**Web**
- `apps/web/components/public/ReviewCard.tsx`
- `apps/web/components/public/ReviewsExplorer.tsx`
- `apps/web/components/public/DoctorCard.tsx`
- `apps/web/components/public/AppointmentWizard.tsx`
- `apps/web/components/public/pages/HomePageContent.tsx`
- `apps/web/components/public/pages/AboutPageContent.tsx`
- `apps/web/components/public/ClinicIntroduction.tsx`
- `apps/web/components/public/BookingConvenience.tsx`
- `apps/web/app/[locale]/reviews/page.tsx`
- `apps/web/app/[locale]/doctors/page.tsx`
- `apps/web/app/[locale]/doctors/[slug]/page.tsx`
- `apps/web/app/[locale]/about/page.tsx`
- `apps/web/app/[locale]/secretary/assignment-queue/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/public-content/reviews/page.tsx`
- `apps/web/lib/public-site.ts`
- `apps/web/lib/i18n/public-copy.ts`
- `apps/web/app/globals.css`

**Scripts / docs / assets**
- `scripts/seed-reviews.ts`
- `scripts/seed-mongo-owner.ts`
- `package.json` (`seed:reviews`)
- `docs/public-design/IMAGE_ASSET_SOURCES.md`
- `docs/public-design/FINAL_PUBLIC_PAGES_REVIEWS_DOCTORS_BOOKING_REPORT.md`
- `apps/web/public/images/stock/*.jpg`

### 45. Remaining issues
1. **0 published patient reviews** — public reviews page empty until Admin approves real clinic content (correct safety posture).
2. **Only 2 public doctors** — cannot display 3 without inventing identities (forbidden).
3. Many doctor `profileImage` values may still be empty → avatar fallback.
4. Lint tooling not configured; Playwright not re-run; docker image build not re-run.
5. Admin review action permissions partially overlap (`reviews_approve` used for publish/archive actions — tighten if needed).
6. Deep redesign polish for specialties/services detail FAQs/disclaimers may still need copy wiring on every detail page.

### 46. Exact next action when incomplete
1. From Admin UI (`/doctor/specialist/public-content/reviews`), **approve + publish only clinic-approved real reviews** (never bulk-publish drafts as patient feedback).  
2. If a third real doctor is clinic-approved, seed via `ensure-clinic-doctors` with `isPublic/isBookable/isFeatured` — do not invent.  
3. Run `pnpm test:e2e` and manual console/network checks on `/ar/reviews`, `/ar/doctors`, `/ar/contact`, secretary assignment queue.  
4. Optionally `docker compose -f infrastructure/docker/docker-compose.target.yml build`.

---

## Status stamps (honest)

| Stamp | Status |
|-------|--------|
| REVIEWS PAGE PREMIUM REDESIGN COMPLETE | YES (UI) |
| DATABASE REVIEW SYSTEM VERIFIED | YES |
| THIRTY-REVIEW CAPACITY VERIFIED | YES (drafts) |
| PUBLIC REVIEW INTEGRITY VERIFIED | YES (0 fabricated published) |
| DOCTORS PAGE DISPLAYS THREE REAL DOCTORS | NO — only 2 exist |
| SYSTEM OWNER REMOVED FROM PUBLIC DOCTOR LISTS | YES |
| DOCTOR DETAILS PAGES REDESIGNED | YES |
| DOCTOR WORKING SCHEDULES VERIFIED | PARTIAL (data + API; needs manual UI pass) |
| SPECIALTIES PAGE REDESIGNED | PARTIAL (prior catalog work retained) |
| SERVICES PAGE REDESIGNED | PARTIAL |
| ABOUT PAGE EXPANDED AND REDESIGNED | YES |
| DOCTOR SELECTION OPTIONAL | YES |
| SPECIALTY SELECTION OPTIONAL | YES |
| SERVICE SELECTION OPTIONAL | YES |
| RECEPTION DOCTOR ASSIGNMENT VERIFIED | PARTIAL (API+UI landed; e2e pending) |
| HOMEPAGE PROFESSIONAL IMAGES ADDED | YES |
| ARABIC RTL VERIFIED | PARTIAL (code-level) |
| ENGLISH AND FRENCH LTR VERIFIED | PARTIAL |
| MOBILE TABLET DESKTOP VERIFIED | NOT RE-RUN |
| ALL CRITICAL TESTS PASS | UNIT/TYPECHECK/BUILD YES; E2E NO |

**Overall:** `PUBLIC PAGES AND FLEXIBLE BOOKING UPDATE NOT COMPLETE`  
**Next:** publish real reviews only when approved; add third real doctor only if clinic-approved; run Playwright + manual browser verification.
