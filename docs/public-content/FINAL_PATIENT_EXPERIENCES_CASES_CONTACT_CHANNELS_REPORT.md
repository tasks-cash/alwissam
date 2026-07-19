# Final Report — Patient Experiences, Treatment Cases, Contact Channels

Date: 2026-07-18  
Stack: Next.js App Router → NestJS REST → MongoDB/Mongoose  
Package manager: pnpm 9.15.9

## Status

PATIENT EXPERIENCES HOMEPAGE COMPLETED  
30 DRAFT REVIEW SEED VERIFIED  
REVIEW ADMIN MANAGEMENT VERIFIED  
TREATMENT-CASE HOMEPAGE AND ADMIN MANAGEMENT COMPLETED  
CONSENT AND PRIVACY PUBLICATION GUARDS VERIFIED  
WHATSAPP AND PHONE CHANNELS ENABLED  
CONTACT-CHANNEL ADMIN MANAGEMENT ADDED  
SECURE MEDIA PATH ADDED FOR BEFORE/AFTER AND REVIEW AVATARS  
QUICK DASHBOARD MANAGEMENT ENTRIES ADDED  
ARABIC RTL AND RESPONSIVE STRUCTURES PRESERVED  
CRITICAL UNIT, FOCUSED E2E, LINT, TYPECHECK, AND BUILD PASS  

## Homepage Patient Experiences (`تجارب مرضانا`)

- Homepage keeps a Server Component page and mounts the existing client slider only for the interactive section.
- Public APIs now allow up to 30 approved/published experiences or reviews.
- Slider supports autoplay, previous/next, pagination dots, swipe, keyboard, hover/focus pause, tab-inactive pause, and `prefers-reduced-motion`.
- Cards support display name, male/female/neutral/initials/uploaded avatar, rating, subject, description, related Doctor/service/specialty, publication date, and featured ordering.
- Private Patient account images are never copied automatically into public Review/Experience submissions.

## 30 Draft Review Seed

- Seed command: `pnpm seed:reviews`
- Idempotent by `sourceKey`
- Result after repair run:
  - `created: 0`
  - `skipped: 30`
  - `repairedSafetyFlags: 30`
  - `sampleDrafts: 30`
  - `publishedGenuine: 0`
- Sample rules enforced:
  - `isSample: true`
  - `status: DRAFT` / `moderationStatus: draft`
  - `isPublished: false`
  - hidden from public API
  - no fake verified-visit badge without a real appointment link
- Admin must approve and publish manually; sample content cannot be published until converted to non-sample content.

## Review Admin Management

Existing Admin page and Nest APIs cover:

- list / search / pagination
- create draft / edit
- avatar type and uploaded avatar
- rating
- Doctor / specialty / service links
- approve / reject / publish / unpublish
- feature / unfeature
- archive / restore
- sample marker visibility

Public filter requires approved + published + non-sample + non-archived records.

## Treatment Cases (`حالات علاجية سابقة`)

- Homepage section title and lead updated to the required Arabic wording.
- Interactive Before/After comparison supports mouse, touch, keyboard, accessible labels, and pauses the outer carousel while comparing.
- Public listing limit raised to 30.
- Admin can create drafts without images, then upload Before/After later.
- Publication still requires:
  - Before image
  - After image
  - explicit consent
  - Admin approval
- Public API never exposes consent document references, patient age, or creator IDs.
- Featured/archive/restore controls completed on the Admin before/after page.

## Contact Channels

### Model / APIs

New MongoDB collection: `contact_channels`

Fields:

- `type`, `labelAr`, `labelEn`, `labelFr`
- `value`, `publicUrl`, `icon`
- `isEnabled`, `isPrimary`, `displayOrder`
- `placement[]`
- `createdBy`, `updatedBy`, `createdAt`, `updatedAt`, `archivedAt`

Placements:

- `global_floating`
- `homepage`
- `contact_page`
- `footer`
- `patient_help`
- `booking_page`

Public API:

- `GET /api/public/contact-channels?placement=...`

Admin APIs:

- `GET /api/admin/contact-channels`
- `POST /api/admin/contact-channels`
- `PATCH /api/admin/contact-channels/:id`
- `POST /api/admin/contact-channels/enabled`
- `POST /api/admin/contact-channels/primary`
- `POST /api/admin/contact-channels/archive`
- `POST /api/admin/contact-channels/restore`
- `POST /api/admin/contact-channels/reorder`

Validation rejects:

- `javascript:` / `data:` / `file:` URLs
- non-HTTPS web links
- mismatched WhatsApp/Instagram/etc. hosts
- invalid `tel:` formats

### Seeded Active Channels

Command: `pnpm seed:contact-channels`

Enabled now:

1. Phone
   - type: `phone`
   - labelAr: `اتصل بنا`
   - value: `0663 09 82 08`
   - publicUrl: `tel:+213663098208`
   - enabled: true
   - primary: false
2. WhatsApp
   - type: `whatsapp`
   - labelAr: `تواصل معنا عبر واتساب`
   - value: `213663098208`
   - publicUrl: `https://wa.me/213663098208`
   - enabled: true
   - primary: true

Seed result: `activeCount: 2`

### Public UI

- Hardcoded floating WhatsApp button replaced by `GlobalContactChannels`
- If one enabled channel exists: opens that channel directly
- If multiple exist: opens a compact menu
- Footer and Contact quick actions consume MongoDB channels
- Staff dashboards keep the separate Staff Chat widget and are not given the public floating contact control

### Admin Quick Dashboard

Quick Mode sidebar now includes:

1. `المعاينة`
2. `مرضاي`
3. `الأطباء`
4. `السكرتارية`
5. `تجارب المرضى`
6. `الحالات السابقة`
7. `وسائل التواصل`

New Admin page:

- `/[locale]/doctor/specialist/public-content/contact-channels`

Supports add/edit/enable/disable/primary/reorder/preview/archive/restore and `اختبار الرابط`.

## Media Security

- New `MediaAsset` model + private storage under `private-uploads/public-content`
- Admin upload returns `/api/admin/media/:id`
- Public serving only through `/api/public/media/:id` after publication flips `isPublic=true`
- MIME + real file-signature checks + size/dimension limits
- Absolute filesystem paths are never returned in API payloads
- Legacy `/uploads/public-content/...` references remain accepted for already-uploaded Admin content, but new uploads use the secured media path

## MongoDB Models Touched

- `Review` (existing, extended usage)
- `PatientExperience` (existing)
- `BeforeAfterCase` (existing, draft-safe image fields)
- `ContactChannel` (new)
- `MediaAsset` (new)
- `AuditLog` (existing, used for Admin mutations)

## Exact Files Changed / Added

### Backend

- `apps/api/src/settings/schemas/contact-channel.schema.ts`
- `apps/api/src/settings/dto/contact-channel.dto.ts`
- `apps/api/src/settings/contact-channels.service.ts`
- `apps/api/src/settings/contact-channels.controller.ts`
- `apps/api/src/settings/contact-channels.service.spec.ts`
- `apps/api/src/settings/settings.module.ts`
- `apps/api/src/common/auth/permissions.ts`
- `apps/api/src/media/schemas/media-asset.schema.ts`
- `apps/api/src/media/media.service.ts`
- `apps/api/src/media/media.controller.ts`
- `apps/api/src/media/media.module.ts`
- `apps/api/src/reviews/*` (public filtering, doctor names, private-avatar protection, media publication)
- `apps/api/src/patient-experiences/*` (limit 30, media publication, private-avatar protection)
- `apps/api/src/before-after/*` (limit 30, draft images, media publication)

### Frontend

- `apps/web/components/public/GlobalContactChannels.tsx`
- `apps/web/components/public/PublicContactChannelList.tsx`
- `apps/web/components/public/PublicChrome.tsx`
- `apps/web/components/public/QuickContactActions.tsx`
- `apps/web/components/public/PatientExperiencesSlider.tsx`
- `apps/web/components/public/BeforeAfterSlider.tsx`
- `apps/web/components/public/ReviewCard.tsx`
- `apps/web/components/layout/DashboardShell.tsx`
- `apps/web/lib/navigation.ts`
- `apps/web/lib/i18n/dictionaries.ts`
- `apps/web/lib/i18n/public-copy.ts`
- `apps/web/lib/public-site.ts`
- `apps/web/app/[locale]/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/public-content/contact-channels/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/public-content/reviews/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/public-content/before-after/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/e2e/patient-experiences-before-after.spec.ts`
- `apps/web/e2e/admin-quick-sidebar.spec.ts`

### Scripts / docs

- `scripts/seed-contact-channels.ts`
- `scripts/seed-reviews.ts`
- `package.json`
- `docs/public-content/FINAL_PATIENT_EXPERIENCES_CASES_CONTACT_CHANNELS_REPORT.md`

## Tests Executed

| Command | Result |
|---|---|
| `pnpm lint` | Pass (warnings only; 0 errors) |
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass — shared-validation 13 + API 117 |
| `pnpm --filter @alwisam/web exec playwright test e2e/patient-experiences-before-after.spec.ts --project=chromium` | Pass — 6/6 |
| `pnpm build` | Pass after clearing stale `.next` |
| `pnpm seed:contact-channels` | Pass — phone + WhatsApp enabled once |
| `pnpm seed:reviews` | Pass — 30 sample drafts kept unpublished |

Focused smoke checks:

- `GET /api/public/contact-channels?placement=global_floating` returns WhatsApp + phone
- Arabic homepage `/ar` returns `200` and includes `تجارب مرضانا` / `حالات علاجية سابقة`
- Arabic homepage floating control renders `.contact-float` after client hydration (WhatsApp primary menu when both channels are enabled)
- Note: a corrupted `apps/web/.next` cache can break client hydration and hide the floating control until `rm -rf apps/web/.next` and a clean `next dev` restart

## Remaining Issues

1. Full `pnpm test:e2e` suite still contains previously failing public-site/login-rate-limit tests unrelated to this feature set; those were not claimed as newly fixed.
2. `admin-quick-sidebar.spec.ts` skips unless `PLAYWRIGHT_OWNER_EMAIL` and `PLAYWRIGHT_OWNER_PASSWORD` are provided.
3. Patient Help emergency buttons still use clinic contact fallback fields from the Patient Help API; the new ContactChannel system is wired for public chrome/footer/contact quick actions/floating control. Extending Patient Help to consume `patient_help` placement can be a follow-up if desired.
4. Existing treatment-case media previously stored under `/uploads/public-content/...` remains readable through the static uploads path for backward compatibility. Newly uploaded media uses private storage + gated public URLs.
5. No stock Before/After cases were invented or published; the public treatment section correctly shows empty state until Admin publishes real consented cases.

## Recommended Operator Commands

```bash
pnpm seed:contact-channels
pnpm seed:reviews
# then Admin login → Quick Mode:
# تجارب المرضى / الحالات السابقة / وسائل التواصل
```
