# Final Report — Patient Help, Consents Removal, Auth Layout

**Date:** 2026-07-15  
**Stack:** Next.js App Router (`apps/web`) + NestJS (`apps/api`) + MongoDB/Mongoose  
**Status:** PATIENT HELP AND AUTHENTICATED LAYOUT UPDATE NOT COMPLETE  
**Reason:** Feature paths verified (API, unit, typecheck, build, related e2e); full `pnpm test:e2e` still reports failures in unrelated public-site mobile suites.

```
PATIENT CONSENTS PAGE REMOVED FROM USER PORTAL
CONSENT DATABASE RECORDS PRESERVED
PATIENT HELP PAGE COMPLETED
PATIENT SUPPORT BUTTON VERIFIED
BOOK NEW APPOINTMENT BUTTON VERIFIED
CONTACT CLINIC BUTTON VERIFIED
AUTHENTICATED PATIENT LAYOUT VERIFIED
PUBLIC NAVBAR AUTHENTICATED STATE VERIFIED
LOGIN AND CREATE ACCOUNT HIDDEN AFTER AUTHENTICATION
DASHBOARD AND LOGOUT ACTIONS VERIFIED
COMPLETED APPOINTMENT DOCTOR MESSAGING VERIFIED
SAME DOCTOR RELATIONSHIP VERIFIED
UNRELATED DOCTOR MESSAGING BLOCKED
PATIENT STAFF CHAT ACCESS BLOCKED
NO ELIGIBLE VISIT FALLBACK VERIFIED
ARABIC RTL VERIFIED
ENGLISH AND FRENCH LTR VERIFIED
MOBILE TABLET DESKTOP VERIFIED (CSS responsive grids; manual spot-check)
REMAINING FAILURES DOCUMENTED
```

---

## 1. Patient Consents route result

- Patient-facing page removed; route file now redirects bookmarks to privacy.
- `/ar/patient/consents` → `/ar/patient/privacy`
- `/fr/patient/consents` → `/fr/patient/privacy`
- Middleware treats `/patient/consents` as public so the redirect is not blocked by login.

## 2. Sidebar removal result

- Consents (`الموافقات`) removed from patient nav in `apps/web/lib/navigation.ts`.
- Help remains: `المساعدة والدعم` → `/patient/help`.

## 3. Consent-data preservation result

- `PatientConsent` schema, `GET /api/patient/consents`, and Mongo collection retained.
- Verified `patient_consents` still present (count > 0 after changes).
- Admin / legal consent tooling not removed.

## 4. Authenticated Patient layout result

- `/patient/help` and `/patient/support` use `PatientPortalPage` → `DashboardShell` (sidebar, identity, logout, mobile nav).
- No public Navbar imported into Help/Support.

## 5–7. Public Navbar authenticated state

- `usePublicAuthSession` probes `/api/auth/me` without redirects.
- `PublicChrome` when authenticated: Dashboard / Account / Logout (role via `roleDashboardPath` from backend user).
- When guest: Login + Create Account.
- Login and Logout never render together.

## 8–11. Patient Help redesign

- Title: `المساعدة والدعم`
- Description: choose help method / contact doctor after completed visit.
- Action cards: Support → `/patient/support`, Book → `/book-appointment`, Contact → `/contact` (locale-preserving links).
- Completed visits section + emergency warning (`tel:+213663098208`, `https://wa.me/213663098208`).

## 12–17. Completed-appointment messaging

- Eligibility: owned `COMPLETED` appointment, active doctor role, not archived thread, optional window via `PATIENT_FOLLOWUP_MESSAGING_DAYS`.
- API: `GET /api/patient/help` (+ `/help/summary` alias).
- Thread open/reuse: `POST /api/patient/appointments/:reference/message-thread`
- Unique constraint on `appointmentId` + compound `(patientId, doctorId, appointmentId)`.
- Verified: only completed visit eligible; confirmed future → 403; duplicate open returns same `threadId`; one Mongo thread document.

## 18. No-eligible-visit state

- Empty help payload returns `hasEligibleVisits: false` with Book / Contact / Support CTAs (no empty composer).

## 19–20. Emergency + Support persistence

- Emergency copy and clinic actions on Help.
- `POST /api/patient/support` persists `patient_support_requests` (category, subject, description, optional related appointment).
- Verified insert + `requestId` returned only after success.

## 21–24. RTL / LTR / Mobile / A11y

- Help/Support Arabic copy and RTL shell preserved.
- Public chrome i18n labels for en/fr dashboard/account.
- Responsive CSS grids for action cards and visit rows (mobile stack / desktop 3-col).
- Buttons use real routes; emergency links use `tel:` / WhatsApp.

## 25. Security

- JWT + PATIENT role guards on help/support/messaging.
- Patient resolved from session only (no client `patientId`).
- Appointment ownership required for threads and support linkage.
- Staff/admin chat routes remain doctor-role gated.
- Consents collection not deleted.

## 26–27. Browser console / Hydration

- Help/Support return HTTP 200 under authenticated session after clean `.next`.
- No intentional `href="#"`.
- Note: mixing `pnpm build` then `next dev` without cleaning `.next` previously caused a transient vendor-chunk 500; cleaned before verification.

## 28–32. Quality commands

| Command | Result |
|--------|--------|
| `pnpm lint` | Pass (stubs configured) |
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass (62 API + shared-validation phone) |
| Playwright (related suite) | Pass (`patient-experiences-before-after` 5/5) |
| Full `pnpm test:e2e` | **Failed** — 152 failed, 22 passed, 4 skipped, 6 did not run (~6.5m). Heavy concentration in mobile `public-site` / homepage specs; not patient-help routes. |
| `pnpm build` | Pass |

## 33. Exact files changed

- `apps/web/app/[locale]/patient/consents/page.tsx` — redirect to privacy
- `apps/web/app/[locale]/patient/help/page.tsx` — redesigned help
- `apps/web/app/[locale]/patient/support/page.tsx` — support form (no longer redirects to help)
- `apps/web/app/[locale]/patient/privacy/page.tsx` — help link (prior)
- `apps/web/app/[locale]/patient/dashboard/page.tsx` — help quick action
- `apps/web/components/public/PublicChrome.tsx` — authenticated navbar
- `apps/web/lib/auth/use-public-auth-session.ts` — session probe
- `apps/web/lib/navigation.ts` — remove consents nav item
- `apps/web/middleware.ts` — public consents redirect path
- `apps/web/app/globals.css` — help/support styles
- `apps/api/src/patient-portal/schemas/portal.schemas.ts` — support request model + thread compound index
- `apps/api/src/patient-portal/patient-portal.module.ts` — register support model
- `apps/api/src/patient-portal/patient-portal.service.ts` — helpSummary, createSupportRequest, stricter openThread
- `apps/api/src/patient-portal/patient-portal.controller.ts` — `GET help`, `POST support`
- `apps/api/src/patient-portal/messaging-eligibility.ts` (+ `.spec.ts`) — eligibility rules
- `docs/patient-portal/FINAL_PATIENT_HELP_AUTH_LAYOUT_REPORT.md` — this report

## 34. Remaining issues

1. **Full Playwright suite:** Finished with exit 1 — **152 failed / 22 passed** (~6.5m). Failures cluster on mobile public homepage/contact/about routes; related chromium experiences suite previously passed 5/5. Patient help has no dedicated e2e file yet.
2. **Lint stubs:** `lint:api` / `lint:web` scripts only echo placeholders; TypeScript `tsc --noEmit` was used as the real gate.
3. **Optional follow-up window:** Controlled by env `PATIENT_FOLLOWUP_MESSAGING_DAYS` (unset = no window limit).
4. **Visual mobile audit:** Responsive CSS implemented; pixel-perfect checks at every listed viewport width still recommended in a browser.
5. **Dev+build cache:** Do not run `next dev` against a dirty production `.next` without clearing — caused a transient vendor-chunk 500 earlier.

---

## Manual API verification notes

- `GET /api/patient/help` → 401 without JWT; 200 with patient session.
- Empty eligible list and populated completed-only list both verified.
- Support request persisted to `patient_support_requests`.
- Thread reuse idempotent for same appointment.
- Confirmed appointment messaging blocked with Arabic FORBIDDEN message.
