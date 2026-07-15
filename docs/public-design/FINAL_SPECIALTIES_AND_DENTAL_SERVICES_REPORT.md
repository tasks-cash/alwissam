# Final Report — Specialties & Dental Services Expansion

Date: 2026-07-14  
Scope: Hierarchy **Specialty → Services/Treatments → Doctors → Availability → Booking** with MongoDB-managed content (NestJS + Next.js).

## Existing specialties discovered

Before this work, specialties lived only inside `ClinicSetting` JSON (`public_pages`) — typically a short hardcoded list (≈3 items such as general dentistry / orthodontics / surgery), **not** a dedicated Mongo collection.

## Existing services discovered

Likewise embedded in `public_pages` (≈4 services). Treatments such as whitening were mixed into marketing “services” content without specialty linkage.

## Duplicate records found / fixed

| Check | Result |
| --- | --- |
| Duplicate dentistry specialty | **None** after seed (`dentistryRelatedCount: 1` → `general-dentistry` only) |
| Duplicate whitening service | **None** (single `teeth-whitening`) |
| Duplicate gum-cleaning service | **None** (single `dental-scaling-gum-cleaning`) |
| Treatments mistaken as specialties | Seed never creates whitening/cleaning as specialties |

## Specialties added

Idempotent seed upserted **11** specialties (all dental clinic specialties from the brief):

- general-dentistry, cosmetic-dentistry, orthodontics, periodontics, endodontics  
- oral-surgery, dental-implantology, prosthodontics, pediatric-dentistry  
- restorative-dentistry, dental-emergency  

## Services added

Idempotent seed upserted **22** dental services linked via `specialtyIds` (whitening under cosmetic + general, scaling under periodontics + general, etc.).

## Area results

| Area | Result |
| --- | --- |
| Dentistry | Canonical `general-dentistry`; aliases absorb older “dentistry/general” keys |
| Teeth whitening | Service `teeth-whitening` (featured), not a specialty |
| Gum cleaning | Service `dental-scaling-gum-cleaning` (featured) |
| Orthodontics | Specialty + services (consultation / fixed braces / clear aligners) |
| Implantology | Specialty `dental-implantology` + service `dental-implants` |
| Endodontics | Specialty + `root-canal-treatment` |
| Oral surgery | Specialty (aliases cover prior `surgery`) + extractions/wisdom services |
| Pediatric dentistry | Specialty + pediatric checkup/fillings/fluoride |
| Admin specialties | `/[locale]/doctor/specialist/public-content/specialties` + `GET/POST/PATCH /api/admin/catalog/specialties*` |
| Admin services | `/[locale]/doctor/specialist/public-content/services` + `GET/POST/PATCH /api/admin/catalog/services*` |
| Public specialties API | `GET /api/public/specialties` (+ `/:slug`) — active, public, non-archived only |
| Public services API | `GET /api/public/services` (+ `/:slug`) — filters by specialty/search/featured |
| Homepage specialties | Mongo featured limit 6; title “تخصصاتنا الطبية” + lead copy |
| Homepage dental services | New section after specialties; featured limit 8; soft green band |
| Details pages | Specialty + service pages load related services/doctors from Mongo |
| Doctor relationships | `doctorIds` on both collections; public counts use active doctors only |
| Booking integration | Wizard: specialty → service → doctor → schedule → patient → review; backend validates via `CatalogService.assertBookingRelation` |
| Arabic RTL | Public shell unchanged; Arabic copy used for specialties/services |
| English/French LTR | Localized names/descriptions served by locale query |
| Mobile | Responsive service card grid (4→3→2→1) |
| Accessibility | Semantic headings, links (not clickable divs), search labels, reduced-motion for cards |
| SEO | Metadata + hreflang/canonical on specialties/services listing & details |
| Browser console | Not fully re-audited in Playwright this pass (manual browser check recommended after web HMR) |
| Lint | Workspace lint scripts are stubs (`lint:api/web not configured yet`) |
| Typecheck | **Pass** — `@alwisam/api` and `@alwisam/web` |
| Unit tests | **Pass** — `catalog.seed.spec.ts` (6 tests) |
| Playwright | Not re-run end-to-end in this pass |
| Build | **API `nest build` Pass**; web build not re-run this pass |

## Live API verification (post-restart)

```text
GET /api/public/specialties?locale=ar&featured=true&limit=3
→ total 6 featured; slugs include general-dentistry, cosmetic-dentistry, orthodontics

GET /api/public/services?locale=ar&featured=true&limit=5
→ includes teeth-whitening, dental-scaling-gum-cleaning, dental-polishing, dental-checkup, dental-fillings
```

## Seed

```bash
pnpm seed:catalog
```

Env-safe: refuses `SEED_DESTRUCTIVE=true`. Publish controlled by `SEED_CATALOG_PUBLISH` (defaults publish outside production). Never drops collections; fills missing translations; preserves images when already set.

## Permissions added

`specialties.view|create|update|publish|archive|reorder`  
`services.view|create|update|publish|archive|reorder`  

Granted to Owner/Admin via `ADMIN_PERMISSIONS` and specialist owners via `DOCTOR_SPECIALIST_PERMISSIONS`.

## Architecture note

Source of truth moved from `public_pages` JSON embeds to Mongo collections:

- `specialties`
- `dental_services`

Homepage / listing / details / booking prefer catalog APIs. Settings JSON remains for about/FAQ/policies and may still contain legacy short lists unused by the new sections.

## Side fix

Resolved Nest DI startup failures by importing `AuthModule` (for `JwtAuthGuard` / `JwtTokenService`) in Catalog, Media, PatientExperiences, and BeforeAfter modules instead of re-providing an incomplete `JwtAuthGuard`.

## Remaining follow-ups

1. Link real doctor Mongo IDs to specialties/services in Admin so booking doctor filters are clinically accurate (currently doctor counts can be 0 → UI shows neutral “service information” CTA).  
2. Run Playwright + full `pnpm build` / `pnpm test:e2e` in CI.  
3. Optional: auto-publish workflow gated by clinic confirmation for production seeds.
