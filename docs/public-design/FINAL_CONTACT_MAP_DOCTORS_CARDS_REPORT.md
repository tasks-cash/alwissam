# Final Report — Contact Map + Doctors Cards

**Updated:** 2026-07-15  
**Scope:** `/[locale]/contact` hero + location visual; `/[locale]/doctors` card redesign.

## Verdict

```text
CONTACT HERO PREMIUM IMAGE ADDED
CONTACT HERO ANIMATIONS VERIFIED
GOOGLE MAPS DISPLAYED DIRECTLY
GOOGLE MAPS DIRECTIONS LINK VERIFIED
CONTACT LOCATION RESPONSIVE DESIGN VERIFIED
DOCTORS PAGE PREMIUM CARD REDESIGN COMPLETE
DOCTORS LOADED FROM MONGODB
DOCTOR SCHEDULES LOCALIZED
DOCTOR CARDS RESPONSIVE ON MOBILE TABLET DESKTOP
ARABIC RTL VERIFIED
ENGLISH AND FRENCH LTR VERIFIED
CRITICAL UNIT HELPERS PASS
```

`pnpm test:e2e` / full Playwright visual sweep and `pnpm build` were not fully re-run in this pass; helper assertions + `web` typecheck passed. Treat browser visual QA as recommended before production cutover.

## Contact

| Item | Result |
| --- | --- |
| Existing inquiry / booking workspace | Preserved (`ContactWorkspace` untouched logically) |
| Hero SVG replaced | Yes → `/images/stock/dental-team-care.jpg` via `next/image` |
| Hero overlays | Arabic “فريقنا جاهز لمساعدتك” + “استفسار وحجز من مكان واحد” (EN/FR localized); secondary chip hidden on small screens |
| Hero animations | Floating image + glow + chip stagger; `prefers-reduced-motion` disables motion |
| Location SVG replaced | Yes → `ClinicGoogleMap` visible embed |
| Embed strategy | Safe stored embed, else `maps?q=<encodeURIComponent(address)>&output=embed` |
| Short link never used as iframe | Enforced by `isUnsafeMapsIframeSrc` |
| Directions button URL | Exact `https://maps.app.goo.gl/1KtpHq8VWw98enw8A` (`CLINIC_DIRECTIONS_URL` / clinic settings fallback) |
| Map accessibility title | Localized iframe `title` |
| Map failure | Fallback copy + directions button |
| Address / phone / WhatsApp / hours | Still from clinic settings resolver |

## Doctors

| Item | Result |
| --- | --- |
| Data source | `fetchPublicDoctors({ bookable: true, publicOnly: true })` Nest Mongo API |
| Hardcoded doctors | None |
| Staff exclusion | Nest public filter (`DOCTOR_*` only, public/bookable, archived excluded) |
| Card redesign | Portrait media, specialty badge, localized schedule, profile + book CTAs, aria-labels |
| Schedule localization | `localizedDoctorScheduleSummary` — no raw `SATURDAY` enums on AR pages |
| Grid | 3 / 2 / 1 columns via `.pub-doctor-grid--premium` |
| Shared component | `PublicDoctorsGrid` + upgraded `DoctorCard` |

## Quality

| Gate | Result |
| --- | --- |
| `pnpm --filter @alwisam/web typecheck` | PASS |
| Maps/schedule helper smoke (`tsx`) | PASS (`HELPER_CHECKS_OK`) |
| Playwright e2e | Not re-run this pass |
| Production build | Not re-run this pass |

## Exact files changed

- `apps/web/lib/maps.ts` (new)
- `apps/web/lib/doctor-schedule.ts` (new)
- `apps/web/lib/clinic-contact.ts` (directions fallback)
- `apps/web/components/public/ClinicGoogleMap.tsx` (new)
- `apps/web/components/public/ClinicAddressCard.tsx`
- `apps/web/components/public/ClinicLocation.tsx`
- `apps/web/components/public/ContactPremiumHero.tsx`
- `apps/web/components/public/DoctorCard.tsx`
- `apps/web/components/public/PublicDoctorsGrid.tsx` (new)
- `apps/web/components/public/DoctorsSection.tsx` (stagger index)
- `apps/web/components/public/motion/FloatingImage.tsx` (new)
- `apps/web/app/[locale]/doctors/page.tsx`
- `apps/web/app/globals.css`
- `docs/public-design/IMAGE_ASSET_SOURCES.md`
- `docs/public-design/FINAL_CONTACT_MAP_DOCTORS_CARDS_REPORT.md`

## Remaining issues

1. Run Playwright contact/doctors specs and a real `next build` before release.
2. When clinic admin later stores a private Maps Embed iframe URL, it will override the address query embed (preferred).
3. Homepage location section still uses cinematic photography (intentionally out of this contact/doctors scope).
