# Public image asset sources

Download date: 2026-07-15

Stock photos already present under `apps/web/public/images/stock/` are used for public marketing surfaces and decorative patient-account motivation. They are royalty-free style clinic imagery stored locally (not hotlinked). Private patient medical images are never used here.

| Section | Local path | Source type | Notes / alt intent |
| --- | --- | --- | --- |
| Homepage hero | `apps/web/public/images/stock/dental-care-hero.jpg` | Local stock (clinic marketing set) | Professional dental care atmosphere; not a real clinic patient identifier |
| Clinic introduction | `apps/web/public/images/stock/dental-clinic-interior.jpg` | Local stock | Clinic interior atmosphere |
| Patient account / dashboard motivation | `apps/web/public/images/stock/dental-team-care.jpg` | Local stock | Care team environment; decorative dashboard mock uses anonymized UI chrome only |
| Auth login visual | `apps/web/public/images/stock/dental-care-hero.jpg` | Local stock | Auth page visual plane |
| Auth registration visual | `apps/web/public/images/stock/dental-clinic-interior.jpg` | Local stock | Auth page visual plane |
| Services / treatment surfaces | `apps/web/public/images/stock/dental-treatment.jpg` | Local stock | Treatment setting (non-identified) |
| Contact / location where applicable | Existing clinic settings + maps embeds | Clinic-owned / maps | Prefer clinic-provided photography when available |

## Licensing policy

- Prefer clinic-owned approved photography.
- When using stock, use reputable royalty-free libraries (e.g. Unsplash, Pexels, Pixabay) with clear commercial usage rights, then download into the repo.
- Do not copy competing clinic websites.
- Do not use images with other clinic logos.
- Do not use private patient X-rays, before/after without consent, or fictional doctor identities.
- Images must not be mirrored in RTL layouts.

## Optimization

- Prefer WebP/AVIF when regenerating assets.
- Use Next.js `Image` with explicit width/height or `fill` + sizes.
- Priority only above the fold; lazy-load below the fold.
