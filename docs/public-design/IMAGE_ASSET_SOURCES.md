# Public site image assets

Primary visuals for the Al-Wisam public website. Local files under `apps/web/public/images/`.

## Brand SVG illustrations (retained as fallbacks)

| Local path | Page / section | Notes |
|------------|----------------|-------|
| `apps/web/public/images/hero-clinic.svg` | Legacy fallback | Brand SVG dental scene |
| `apps/web/public/images/about-team.svg` | Legacy fallback | Brand SVG team visual |
| `apps/web/public/images/contact-clinic.svg` | Contact / location cards | Brand SVG contact visual |

## Royalty-free stock photographs (Unsplash)

License: [Unsplash License](https://unsplash.com/license) — free to use commercially; attribution appreciated but not required.

| Local path | Source page | Original image URL | Author | Usage |
|------------|-------------|--------------------|--------|-------|
| `apps/web/public/images/stock/dental-care-hero.jpg` | [Unsplash photo](https://unsplash.com/photos/dentist-tools-and-mirror-on-tray-photo-1606811841689-23dfddce3e95) | `https://images.unsplash.com/photo-1606811841689-23dfddce3e95` | Unsplash contributor | Homepage hero |
| `apps/web/public/images/stock/dental-clinic-interior.jpg` | [Unsplash photo](https://unsplash.com/photos/modern-dental-office-1629909613654-28e377c37b09) | `https://images.unsplash.com/photo-1629909613654-28e377c37b09` | Unsplash contributor | Homepage clinic intro; About intro |
| `apps/web/public/images/stock/dental-team-care.jpg` | [Unsplash photo](https://unsplash.com/photos/dental-care-closeup-1588776814546-1ffcf47267a5) | `https://images.unsplash.com/photo-1588776814546-1ffcf47267a5` | Unsplash contributor | About page hero |
| `apps/web/public/images/stock/dental-treatment.jpg` | [Unsplash photo](https://unsplash.com/photos/dental-treatment-1598256989800-fe5f95da9787) | `https://images.unsplash.com/photo-1598256989800-fe5f95da9787` | Unsplash contributor | Homepage booking convenience |

## Doctor portraits

- Use only approved `doctor.profileImage` values from MongoDB.
- Never replace a real doctor portrait with an unrelated stock person.
- Never invent doctor identities for photography.

## Next.js Image

- Prefer local assets (no remotePatterns required for `/images/**`).
- Provide `width`, `height`, `sizes`, meaningful `alt` (or decorative `alt=""`).
- `priority` only above the fold.
- Do not mirror clinic or doctor photos in RTL.
