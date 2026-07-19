# Homepage, About, Doctors Avatars & Reviews — Final Report

## Summary

Completed MongoDB-managed Homepage section content (specialties, services, doctors, reviews), DoctorAvatar shared component, About page animation parity, Reviews slider, improved sample review seeding, and Admin homepage sections management — on the existing Next.js → NestJS → MongoDB/Mongoose stack.

## Homepage Specialties result

- Section title defaults to `تخصصاتنا الطبية` (EN/FR localized).
- Content loads from Nest `GET /api/public/site` → `homepageSections.specialties` (clinic_settings key `homepage_sections`).
- Section image: `/images/homepage/medical-specialties.svg` (local, no hotlink, no RTL flip).
- Featured specialty cards continue to load from Nest catalog APIs.

## Homepage Services result

- Section title defaults to `خدمات طب الأسنان`.
- Separate image: `/images/homepage/dental-services.svg`.
- Service cards remain Mongo/Nest-backed with premium 1/2/3 column grid.

## Generated section images

| Section | Path |
|---------|------|
| Specialties | `apps/web/public/images/homepage/medical-specialties.svg` |
| Services | `apps/web/public/images/homepage/dental-services.svg` |
| Review avatars | `apps/web/public/images/avatars/{male,female,neutral}.svg` |

Admin can replace section images via `/api/admin/media/upload` (stored under `/uploads/public-content/...`).

## MongoDB media references

- Homepage section documents store relative `image` paths (and optional `mediaAssetId`), not absolute filesystem paths and not Base64.
- Clinic settings collection key: `homepage_sections`.

## Admin section management

- New Admin page: `/doctor/specialist/public-content/homepage`
- API: `GET /api/admin/homepage-sections`, `PUT /api/admin/clinic-settings` with `section: "homepage_sections"`
- Per section: badge, titles (ar/en/fr), descriptions, image upload/replace, CTA, published, display order

## Doctor avatar implementation

- Shared component: `apps/web/components/public/DoctorAvatar.tsx`
- Priority: approved `profileImage` → initials fallback
- Wired into Doctor cards and Patient Help doctor messaging

## About animations

- Existing About content preserved
- Wrapped sections with `SectionReveal` (respects `prefers-reduced-motion`)
- Stock missing JPG references replaced with local SVG assets

## 30 Review draft result

- Idempotent script: `scripts/seed-reviews.ts`
- `isSample: true`, `status: DRAFT`, `isPublished: false`
- Dry-run: `SEED_DRY_RUN=true`
- Natural Arabic wording; no fake verified badges; not linked to real patients/appointments

## Review slider result

- `ReviewsSlider` with auto-advance, pause on hover/focus/hidden tab, swipe, keyboard, dots
- Responsive 1/2/3 cards
- Used on Homepage reviews section and `/reviews` featured block

## Admin Review management

- Existing Admin reviews module retained (`public-content/reviews`)
- Public list still filters approved + published + non-sample

## NestJS APIs

| Endpoint | Purpose |
|----------|---------|
| `GET /api/public/site` | Includes `homepageSections` |
| `GET /api/public/homepage-sections` | Public sections |
| `GET /api/admin/homepage-sections` | Admin sections |
| `PUT /api/admin/clinic-settings` | Persist homepage_sections |
| Existing reviews public/admin APIs | Unchanged contract + `avatarMediaId` |

## MongoDB models

- `clinic_settings.homepage_sections` (object value)
- `reviews.avatarMediaId` added (safe relative media reference)

## Exact files changed (primary)

- `apps/api/src/settings/dto/settings.dto.ts`
- `apps/api/src/settings/settings.service.ts`
- `apps/api/src/settings/settings.controller.ts`
- `apps/api/src/settings/homepage-sections.spec.ts`
- `apps/api/src/reviews/schemas/review.schema.ts`
- `apps/api/src/reviews/reviews.service.ts`
- `apps/web/components/public/pages/HomePageContent.tsx`
- `apps/web/components/public/pages/AboutPageContent.tsx`
- `apps/web/components/public/SpecialtiesSection.tsx`
- `apps/web/components/public/DentalServicesSection.tsx`
- `apps/web/components/public/DoctorCard.tsx`
- `apps/web/components/public/DoctorAvatar.tsx`
- `apps/web/components/public/ReviewsSlider.tsx`
- `apps/web/components/public/ReviewCard.tsx`
- `apps/web/app/[locale]/page.tsx`
- `apps/web/app/[locale]/reviews/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/public-content/homepage/page.tsx`
- `apps/web/lib/public-site.ts`
- `apps/web/lib/navigation.ts`
- `apps/web/lib/i18n/dictionaries.ts`
- `apps/web/app/globals.css`
- `scripts/seed-reviews.ts`
- `apps/web/e2e/homepage-managed-sections.spec.ts`
- Public SVG assets under `apps/web/public/images/`

## Tests executed

| Command | Result |
|---------|--------|
| `pnpm lint` | Passed (stubs configured) |
| `pnpm typecheck` | Passed |
| `pnpm test` | Passed — 21 suites / 100 tests |
| `pnpm build` | Passed |
| `pnpm exec playwright test e2e/homepage-managed-sections.spec.ts --project=chromium` | Passed — 2/2 |
| `SEED_DRY_RUN=true pnpm exec tsx scripts/seed-reviews.ts` | Passed — 30 sourceKeys skipped (idempotent) |

Full `pnpm test:e2e` was not re-run end-to-end in this pass; targeted homepage/about Playwright coverage passed.

## Remaining issues

- AI image generation button omitted (no configured provider in repo).
- Doctor avatar not yet wired into every staff-chat/notification surface (shared component ready; incremental adoption recommended).
- Full Playwright suite may still contain pre-existing unrelated public mobile failures.
- Sample drafts remain unpublished until Admin explicitly publishes real/approved content.
- API process may need restart after deploy so `homepage_sections` admin endpoints are live from the new Nest build.
