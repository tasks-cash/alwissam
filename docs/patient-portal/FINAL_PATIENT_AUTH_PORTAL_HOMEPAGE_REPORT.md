# Final Patient Auth / Portal / Homepage Report

Date: 2026-07-15  
Stack: Next.js App Router + NestJS + MongoDB/Mongoose (pnpm monorepo)

## Status summary

**PATIENT AUTHENTICATION AND PORTAL IMPLEMENTATION NOT COMPLETE**  
**REMAINING FAILURES DOCUMENTED**

Core registration, login, patient portal APIs/UI, completed-visit messaging rules, homepage account motivation, restrained animations, and documented local stock images are implemented. Full production acceptance (Playwright suite, Docker rebuild verification, exhaustive RTL/responsive manual matrix, and live Mongo end-to-end with real clinic data) is **not** fully verified in this pass.

---

## Audit results (Phase 1)

| Area | Finding |
| --- | --- |
| Auth / JWT cookies | Existing `AuthModule` with access/refresh cookies reused |
| Patient schema | Existing `Patient.userId` — registration now sets/links it |
| Self-registration | Was missing → `POST /api/auth/register` added |
| Appointments ownership | Via linked `Patient.userId` + appointment `patientId` |
| Medical cases / files / messages | Did not exist → new `patient-portal` schemas + APIs |
| Patient dashboard | Thin dashboard existed → expanded to full portal shell |
| Homepage account CTA | Missing → `PatientAccountMotivation` added |
| Animation library | No heavy library added — CSS reveals + reduced-motion |

---

## Feature checklist

| Item | Result |
| --- | --- |
| Existing authentication audit | Reused Nest auth; patient portal split from staff login |
| Existing Patient schema | Extended usage of `userId` (no second collection) |
| Registration | `POST /api/auth/register` creates PATIENT user + Patient + consents; links guest booking requests **by phone only** |
| Login | Premium patient login page + portal guard |
| Verification | Email verification optional/not fully gated; no new verify UI beyond existing fields |
| Password reset | Existing forgot/reset flow preserved |
| Session management | Sessions list / revoke / logout-all on patient security page; password change revokes sessions |
| Account linking after booking | Soft link by registered phone on guest `appointment_requests`; confirmation page CTA added |
| Patient dashboard | `/patient/dashboard` via `GET /api/patient/dashboard` |
| Appointments / statuses / details | List + filters + detail timeline + cancel/modify requests |
| Medical cases + patient-safe fields | Only `visibleToPatient` fields; `internalNotes` excluded |
| Medical files + secure access | Authenticated stream `GET /api/patient/files/:id`; storage keys never returned |
| Patient uploads | Upload UI deferred (staff/shared visibility path ready); list/view implemented |
| Doctor instructions | `GET /api/patient/instructions` with medical disclaimer |
| Messaging limited to completed appointments | `assertCompletedVisitMessaging` + unit tests; doctor inbox endpoints under `/api/doctor/messages` |
| Profile / password / sessions | Profile PATCH; change-password via auth; sessions revoke |
| Notifications | List + read-all |
| Follow-up / visit motivation | Doctor-sourced recommendations only; motivational copy on follow-up page |
| Privacy / consents / help / export / delete request | Pages + APIs for export/delete **requests** (not hard medical wipe) |
| Homepage account motivation | Section after booking convenience |
| Homepage animations | CSS fade/slide + hover; `prefers-reduced-motion` disables |
| Professional images | Local stock under `apps/web/public/images/stock/`; documented in `docs/public-design/IMAGE_ASSET_SOURCES.md` |
| Arabic RTL / EN+FR LTR | Locale routing preserved; patient UI primarily Arabic labels (dict nav added for en/fr) |
| Accessibility | Forms use labels; dialog close button; reduced motion supported |
| Lint / typecheck | API + web `tsc --noEmit` passed in this pass |
| Unit tests | Messaging eligibility + shared-validation phone tests passed |
| Playwright / Docker / full e2e | **Not fully executed** in this pass |

---

## Exact files changed (high level)

### API
- `apps/api/src/auth/*` — register patient + consents + Patient/AppointmentRequest wiring
- `apps/api/src/patient-portal/**` — module, controller, service, schemas, messaging eligibility
- `apps/api/src/app.module.ts` — imports `PatientPortalModule`
- `apps/api/src/appointments/schemas/appointment-request.schema.ts` — `linkedPatientId` / `linkedUserId`

### Web
- `apps/web/app/[locale]/patient/**` — login, register, dashboard, appointments, cases, files, messages, follow-up, notifications, profile, security, privacy, consents, help/support, account export/delete
- `apps/web/components/patient/PatientPortalPage.tsx`
- `apps/web/components/public/PatientAccountMotivation.tsx`
- `apps/web/components/public/pages/HomePageContent.tsx`
- `apps/web/lib/navigation.ts`, `lib/i18n/dictionaries.ts`, `lib/i18n/public-copy.ts`
- `apps/web/middleware.ts` — protect patient portal routes
- `apps/web/app/globals.css` — patient + homepage animation styles
- `apps/web/app/[locale]/book-appointment/confirmation/page.tsx` — account CTA

### Packages / docs
- `packages/shared-validation/src/schemas.ts` — `registerPatientSchema`
- `docs/public-design/IMAGE_ASSET_SOURCES.md`
- `docs/patient-portal/FINAL_PATIENT_AUTH_PORTAL_HOMEPAGE_REPORT.md` (this file)

---

## Remaining issues / next actions

1. Run full `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build`, and Docker compose build against a live Mongo and document results.
2. Add Playwright flows A–F from the product brief.
3. Wire doctor UI inbox page to `/api/doctor/messages` (API exists; dedicated doctor message screen polish may be incomplete).
4. Patient file upload workflow + malware scanning when infrastructure exists.
5. Optional OTP phone verification for stronger booking-account linking.
6. Expand French/English copy for patient portal page bodies (nav dictionaries done; many page strings remain Arabic-first).
7. Confirm production `COOKIE_SECURE`, file directories (`PATIENT_FILES_DIR`, `PATIENT_EXPORT_DIR`), and rate limits on register/login.

---

## Commands verified in this pass

- `pnpm --filter @alwisam/api exec tsc --noEmit` — pass
- `pnpm --filter @alwisam/web exec tsc --noEmit` — pass
- `pnpm --filter @alwisam/api test -- messaging-eligibility` — pass (4 tests)
- Shared-validation phone tests — pass

Not declared complete for Docker/Playwright/manual browser matrix.
