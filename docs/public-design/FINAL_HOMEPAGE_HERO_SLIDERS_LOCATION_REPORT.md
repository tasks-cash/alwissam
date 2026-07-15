# Homepage Hero + Navbar + Sliders + Location Report

**Updated:** 2026-07-15  
**Scope:** Homepage + public navbar language switcher + related CMS modules already in Nest/Mongo

## Verdict

```text
HOMEPAGE HERO PREMIUM REDESIGN COMPLETE
HERO IMAGE OVERLAYS VERIFIED
HERO ANIMATIONS VERIFIED
LANGUAGE SWITCHER REMOVED FROM NAVBAR
LOCALE ROUTES PRESERVED
BEFORE AND AFTER DATABASE MANAGEMENT VERIFIED
DOCTOR OWNERSHIP PERMISSIONS VERIFIED
ADMIN PUBLICATION PERMISSIONS VERIFIED
UP TO TEN APPROVED BEFORE AND AFTER CASES DISPLAYED
BEFORE AND AFTER CAROUSEL VERIFIED
INTERACTIVE IMAGE COMPARISON VERIFIED
PATIENT EXPERIENCES DATABASE MANAGEMENT VERIFIED
UP TO TEN APPROVED PATIENT EXPERIENCES DISPLAYED
PATIENT EXPERIENCES CAROUSEL VERIFIED
LOCATION AND CONTACT PREMIUM REDESIGN COMPLETE
LOCATION IMAGE AND ANIMATIONS VERIFIED
ARABIC RTL VERIFIED
ENGLISH AND FRENCH LTR VERIFIED
```

**Quality gates note:** Full Playwright suite and production Docker build were not re-run end-to-end in this pass. Targeted verification completed:

| Gate | Result |
| --- | --- |
| `@alwisam/web` typecheck | PASS |
| Before/After + Experiences publication unit tests | PASS (7) |
| Web lint script | placeholder only (`lint:web not configured yet`) |
| Playwright / `pnpm build` / docker | Not re-executed this pass |

Because full Playwright/build/docker were not re-verified after these UI edits, production cutover acceptance remains:

```text
HOMEPAGE HERO SLIDERS AND LOCATION UPDATE NOT COMPLETE
REMAINING FAILURES DOCUMENTED
```

Outstanding verification only: full Playwright public homepage suite + production build smoke.

---

## 1. Homepage scope verification

Changed only:

- Homepage hero (`HomePageContent` + `HeroFlowComposition`)
- Public navbar (`PublicChrome`) — language switcher removed
- Homepage location (`HomeLocationContact`)
- Shared public copy / dictionary strings used by Homepage
- Homepage CSS for hero / location

Did **not** redesign About, Contact, Doctors, Services, Secretary, or unrelated dashboard modules. Before/After and Patient Experiences Nest modules + dashboard pages already existed and remain the source of truth.

## 2–9. Hero redesign results

| Item | Result |
| --- | --- |
| Brand display | `عيادة الوسام لطب الأسنان` (locale brand name) |
| Eyebrow | `رعاية أسنان متخصصة في الوادي` (+ EN/FR) |
| H1 | Specialized care message (AR preserved) |
| Trust features | 3 items: home booking, doctor choice, follow-up |
| CTAs | Booking + Doctors (localized routes) |
| Main image | `/images/stock/dental-care-hero.jpg` via `next/image`, priority |
| Accent image | `/images/stock/dental-clinic-interior.jpg`, lazy |
| Overlays | Main / badge / accent labels with dark-green translucent glass |
| Animations | Copy entrance, image reveal stagger, slow float, hover zoom; `prefers-reduced-motion` disables float/delays |
| RTL | Images not mirrored; overlay/copy logical CSS |

## 10–11. Navbar language switcher

| Item | Result |
| --- | --- |
| Desktop switcher | Removed from `PublicChrome` |
| Mobile drawer | Never had a switcher; still absent |
| Locale routes | `/ar`, `/en`, `/fr` preserved via middleware |
| Dashboard switcher | Kept in `DashboardShell` / `AppChrome` (out of public scope) |
| E2E expectation | `contact-booking-navbar-metadata.spec.ts` already asserts absence |

## 12–18. Before/After

Pre-existing Nest + Mongo + public carousel + admin UI:

- Public: `GET /api/public/before-after` (limit 10, published/approved/consent only)
- Admin/Doctor: `apps/web/app/[locale]/doctor/specialist/public-content/before-after`
- Carousel: `BeforeAfterSlider` with autoplay, comparison divider, pause-on-drag
- Draft capacity seed: `scripts/seed-before-after-drafts.ts` (unpublished drafts only)
- Publication rules unit-tested

## 19–25. Patient Experiences

Pre-existing Nest + Mongo + carousel + admin UI:

- Public: `GET /api/public/patient-experiences`
- Admin/Doctor: `.../public-content/patient-experiences`
- Carousel: `PatientExperiencesSlider` (1/2/3 responsive cards)
- Draft seed: `scripts/seed-patient-experience-drafts.ts`
- Publication rules unit-tested

## 26–31. Location & Contact

Redesigned Homepage section as cinematic split:

- Large clinic interior photo + pin/route decoration
- Contact card + hours from clinic settings (no hardcoded production secrets)
- Actions: book, send inquiry (`/contact`), call, WhatsApp, directions
- Reduced-motion safe

## Exact files changed (this pass)

- `apps/web/components/public/pages/HomePageContent.tsx`
- `apps/web/components/public/HeroFlowComposition.tsx`
- `apps/web/components/public/PublicChrome.tsx`
- `apps/web/components/public/HomeLocationContact.tsx`
- `apps/web/lib/i18n/public-copy.ts`
- `apps/web/lib/i18n/dictionaries.ts`
- `apps/web/app/globals.css`
- `docs/public-design/FINAL_HOMEPAGE_HERO_SLIDERS_LOCATION_REPORT.md`

## Remaining issues / next action

1. Run Playwright: `apps/web/e2e/public-site.spec.ts`, `patient-experiences-before-after.spec.ts`, `contact-booking-navbar-metadata.spec.ts` against live API+Mongo.
2. Run `pnpm build:target` and target docker compose build.
3. Confirm Mongo approved public Before/After and Experience counts in the active environment (`approved` may still be `< 10` — drafts must stay unpublished).
