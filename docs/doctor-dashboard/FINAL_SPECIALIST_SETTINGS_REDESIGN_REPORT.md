# Final Specialist Doctor Settings Redesign Report

## Scope and result

The route `/[locale]/doctor/specialist/settings` was changed from a long
Admin clinic/public-content form into a Doctor-owned account settings
experience. Existing clinic settings, public-content records, contact
inquiries, and their NestJS/MongoDB APIs were not deleted or changed by this
redesign.

The page now uses this data flow only:

`Next.js → NestJS REST APIs → MongoDB through Mongoose`

No Prisma, SQL database, Redis, Next.js business API route, direct frontend
MongoDB access, mock API, or LocalStorage settings database was introduced.

## Previous page problems

- The route exposed global clinic/contact/public-page controls instead of the
  authenticated Doctor's account settings.
- It was a single 1,300+ line form without stable section navigation.
- Doctor personal data, professional profile, avatar, notifications, password,
  sessions, and account preferences were not managed from this page.
- The schedule editor wrote clinic-wide settings rather than an owned Doctor
  schedule.
- There was no dirty-state indicator or navigation warning.

## New page structure

The redesigned page contains eight responsive sections:

1. Personal information
2. Professional profile
3. Avatar
4. Working hours
5. Notifications
6. Security and password
7. Sessions and devices
8. Account preferences

Desktop uses a sticky side navigator and balanced content card. Tablet and
mobile use a horizontally scrollable section navigator, one-column forms, and
a sticky save action. The design includes Arabic RTL support, constrained
motion, visible focus behavior, loading/error/empty states, and no horizontal
page overflow by design.

## Personal settings result

- Full name, normalized email, normalized Algerian phone, preferred locale, and
  optional address persist on the authenticated `User`.
- Email uniqueness and phone uniqueness are checked server-side.
- Changing email clears the verified state.
- Role, permissions, account status, and internal IDs are not accepted by the
  endpoint or shown as editable fields.

Endpoint: `PATCH /api/doctor/settings/personal`

## Professional-profile result

- Doctor-editable fields: multilingual professional title, short Arabic public
  description, multilingual biography, and languages.
- Admin-controlled fields are read-only: Doctor type, specialties, services,
  license number, public visibility, and bookable state.
- The update DTO is a strict whitelist; no frontend Doctor ID is accepted.

Endpoint: `PATCH /api/doctor/settings/professional`

## Avatar result

- JPEG and PNG are accepted up to 3 MB.
- MIME allowlisting and binary file-signature checks are applied.
- Dimensions must be between 128 and 4096 pixels.
- Upload uses memory storage for validation, then writes a random filename.
- MongoDB stores only `/uploads/doctor-avatars/<random-name>` on the existing
  embedded Doctor profile.
- Replaced and removed owned avatar files are cleaned up.
- A failed MongoDB save removes the newly written file.
- The UI provides preview, upload progress, replace, remove, and initials
  fallback.

Endpoints:

- `PATCH /api/doctor/settings/avatar`
- `DELETE /api/doctor/settings/avatar`

## Working-hours result

- Morning/evening windows are stored as multiple `doctor.workingHours` entries.
- End-before-start and overlapping same-day windows are rejected server-side.
- Appointment duration is constrained to 15–180 minutes.
- Doctor leave dates use `YYYY-MM-DD`.
- Public appointment availability now honors Doctor duration, multiple daily
  windows, leave dates, and unavailable dates.
- Timezone is explicitly displayed as `Africa/Algiers`.

Endpoint: `PATCH /api/doctor/settings/schedule`

## Notification result

Doctor-owned MongoDB preferences cover appointments, patient waiting, Staff
messages, follow-up, schedule changes, security, in-app notifications, and
sound. Email delivery remains disabled unless
`EMAIL_PROVIDER_CONFIGURED=true`; the UI does not claim that an unconfigured
delivery provider works.

Endpoint: `PATCH /api/doctor/settings/notifications`

## Security result

- Existing `POST /api/auth/change-password` is reused.
- Current-password verification and bcrypt hashing remain in NestJS.
- Successful changes revoke active sessions and create an audit record.
- A dedicated per-user password-change rate limiter was added.
- Password values and hashes are never returned or audited.

## Session result

- Existing owned session endpoints are reused:
  - `GET /api/auth/sessions`
  - `DELETE /api/auth/sessions/:sessionId`
  - `POST /api/auth/sessions/logout-others`
- Session revocation filters by both session ID and authenticated User ID.
- Invalid ObjectIds are safely rejected.
- User self-revocation now writes an audit event.
- New access tokens carry a non-sensitive session identifier so the backend can
  mark the current device without exposing refresh tokens.
- The UI shows device/browser, creation time, last activity, current-device
  badge, individual revoke action, and logout from all other devices.
- Exact location is not exposed.

## Preferences result

Locale, date format, time format, reduced motion, compact display, and
notification sound persist in MongoDB on the existing `User` document.
LocalStorage is not the source of truth.

Endpoint: `PATCH /api/doctor/settings/preferences`

## Authorization result

All `/api/doctor/settings` endpoints require:

- JWT authentication
- Active account validation
- Specialist Doctor or Owner role
- An existing Doctor object linked to the authenticated User
- DTO validation and global whitelist behavior
- No frontend-supplied Doctor/User ID
- Audit logging for every mutation

This repository currently stores one Doctor profile as the `doctor` object
inside one `User` document. No duplicate DoctorProfile collection was created.

## UX and responsive result

- Section navigation is sticky on desktop and horizontally scrollable on
  mobile.
- Unsaved sections display an indicator and `beforeunload` protection.
- Save actions have disabled/loading states and only report success after the
  NestJS/MongoDB write succeeds.
- Avatar, schedule, password, sessions, and toggles collapse safely on narrow
  screens.
- Animations are restrained and disabled by `prefers-reduced-motion`.

## Exact files changed for this settings task

### Added

- `apps/api/src/doctors/doctor-settings.controller.ts`
- `apps/api/src/doctors/doctor-settings.service.ts`
- `apps/api/src/doctors/dto/doctor-settings.dto.ts`
- `apps/api/src/doctors/doctor-settings.service.spec.ts`
- `apps/api/src/doctors/doctor-settings.dto.spec.ts`
- `apps/api/src/auth/session-ownership.spec.ts`
- `apps/web/e2e/specialist-settings.spec.ts`
- `docs/doctor-dashboard/FINAL_SPECIALIST_SETTINGS_REDESIGN_REPORT.md`

### Modified

- `apps/api/src/doctors/doctors.module.ts`
- `apps/api/src/auth/schemas/auth.schemas.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/common/auth/auth-rate-limit.ts`
- `apps/api/src/common/auth/jwt-token.service.ts`
- `apps/api/src/common/auth/session.guard.ts`
- `apps/api/src/appointments/appointments.service.ts`
- `apps/web/app/[locale]/doctor/specialist/settings/page.tsx`
- `apps/web/components/layout/DashboardShell.tsx`
- `apps/web/app/globals.css`

Other pre-existing uncommitted project changes were preserved.

## Tests executed

- `pnpm lint` — exit 0. The repository's API and web lint scripts currently
  print “lint not configured yet”; this is not a real ESLint pass.
- `pnpm typecheck` — passed for all workspace packages.
- `pnpm test` — passed: 24 suites and 109 tests.
- Focused new tests — passed:
  - Doctor settings service: 4 tests
  - Doctor settings DTOs: 3 tests
  - Session ownership/current-session preservation: 2 tests
- `pnpm build` — passed, including NestJS and the production Next.js build.
- `pnpm test:e2e` — not fully passing on the latest run: 165 passed,
  12 skipped, 4 did not run, and 35 failed.
  Failures are in existing public navbar/homepage/contact scenarios. The new
  authenticated settings scenarios were skipped because Playwright Owner
  credentials were not supplied to the command. The running project processes
  were not restarted, as requested.

## Remaining issues

1. Existing access tokens issued before this update do not contain the new
   session identifier. One normal re-login or refresh rotation is required
   before the current-device badge and logout-others action become available.
2. Email notification delivery remains unavailable until a real provider is
   configured.
3. The global Playwright suite has 35 unrelated public-page failures and must
   be stabilized before an all-green completion claim.
4. API/web lint scripts need real linter commands before lint quality can be
   claimed.

Status: **SPECIALIST SETTINGS REDESIGN IMPLEMENTED; FULL E2E QUALITY GATE
REMAINS OPEN.**
