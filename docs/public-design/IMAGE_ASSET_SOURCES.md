# Public image asset sources

Download date: 2026-07-15  
Updated: 2026-07-15 (homepage six-section redesign)

Stock photos under `apps/web/public/images/stock/` are used for public marketing surfaces. They are royalty-free style clinic imagery stored locally (not hotlinked). Private patient medical images are never used for decorative homepage marketing.

Before/After and Patient Experience images must come from MongoDB-backed public APIs after approval + consent — never from this stock folder as fake clinical results.

| Homepage section | Local path | Source page / origin | Photographer | License / usage note | Arabic alt | English alt | French alt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hero — main flowing image | `apps/web/public/images/stock/dental-care-hero.jpg` | Project local stock (clinic marketing set) | Uncredited stock set in repo | Local marketing asset; non-identified care atmosphere; do not mirror in RTL | رعاية فموية هادئة ودقيقة | Calm, precise oral care | Des soins bucco-dentaires calmes et précis |
| Hero — supporting layered image | `apps/web/public/images/stock/dental-clinic-interior.jpg` | Project local stock | Uncredited stock set in repo | Decorative layered frame only; empty `alt` when decorative companion | (decorative companion; empty alt) | (decorative companion; empty alt) | (decorative companion; empty alt) |
| Clinic introduction | `apps/web/public/images/stock/dental-clinic-interior.jpg` | Project local stock | Uncredited stock set in repo | Clinic interior atmosphere | نفس تعليق البطل المحلي | Same localized `heroVisualCaption` / intro alt | Idem |
| Patient account motivation | `apps/web/public/images/stock/dental-team-care.jpg` | Project local stock | Uncredited stock set in repo | Care team environment; no patient identity | فريق رعاية | Care team | Équipe soignante |
| Auth login visual | `apps/web/public/images/stock/dental-care-hero.jpg` | Project local stock | — | Auth visual plane | — | — | — |
| Auth registration visual | `apps/web/public/images/stock/dental-clinic-interior.jpg` | Project local stock | — | Auth visual plane | — | — | — |
| Services / treatment surfaces | `apps/web/public/images/stock/dental-treatment.jpg` | Project local stock | — | Treatment setting (non-identified) | — | — | — |
| Before/After cases | MongoDB → `GET /api/public/before-after` | Admin-uploaded approved media | Clinician/admin upload | Publish only when `isApproved`, `isPublished`, `consentConfirmed`; alt from case locale fields | Case `beforeAlt`/`afterAlt` (ar) | Case alts (en) | Case alts (fr) |
| Patient experiences avatars | MongoDB → `GET /api/public/patient-experiences` | Admin-uploaded when consented | — | Anonymous monogram fallback when no approved photo | Display name + review (not private identity) | Same | Same |
| Contact / location | Clinic settings + maps | Clinic-owned / maps | — | Prefer clinic-provided photography when available | — | — | — |

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
- Priority only above the fold (hero main); lazy-load below the fold.
- Doctor profile images and clinical case images use API delivery URLs (`unoptimized` where remote hosts are not in `images.remotePatterns`).
