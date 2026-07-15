# World-Class Public Design System

**Clinic:** Al-Wisam Dental  
**Scope:** Public visitor website only (`apps/web` public routes)  
**Updated:** 2026-07-15

## Principles

- White canvas with medical green accents
- Arabic-first (RTL), English/French LTR
- Full-bleed section backgrounds; constrained content ~1520px
- Brand is a hero-level signal (`pub-brand-display`)
- Calm, premium healthcare — no dashboard aesthetics on public pages
- Real MongoDB content via Nest public APIs; never invent reviews or stats
- First viewport: brand + one headline + one lead + CTA group + one photographic plane
- No floating badges / promo chips overlaid on hero media

## Color tokens (`.public-shell`)

| Token | Value | Use |
| --- | --- | --- |
| `--pub-green` | `#0B7A68` | Primary medical green |
| `--pub-green-deep` | `#065F52` | Hover / emphasis |
| `--pub-green-soft` | `#E8F6F2` | Soft surfaces |
| `--pub-green-mist` | `#F3FAF7` | Alternate bands |
| `--pub-white` | `#FFFFFF` | Main background |
| `--pub-ink` | `#14241F` | Primary text |
| `--pub-muted` | `#5C726A` | Secondary text |
| `--pub-line` | `#D5E5DF` | Borders |
| `--pub-success` | `#0B7A68` | Success |
| `--pub-warning` | `#C47E14` | Warning |
| `--pub-danger` | `#B42318` | Error |
| `--pub-info` | `#1A7A86` | Info |

## Typography

- Arabic: Cairo (400/600/700/800), body line-height ~1.7, display ~1.12
- Latin: Source Sans 3 (400/600/700) — no decorative serif on public pages
- No `text-transform: uppercase` on Arabic kickers
- Scale: brand display clamp(2.65–4.1rem) · hero headline ~1.2–1.65rem · page h1 ~2rem · section ~1.55rem · body ~1.05–1.1rem

## Spacing & layout

- Container max: `1520px` (`--pub-container`)
- Inline padding: `clamp(1.25rem, 4vw, 3rem)`
- Section vertical: `clamp(3.25rem, 7vw, 5.5rem)`
- Hero min height: `min(92vh, 860px)`
- Radius: controls ~10px, tiles ~14–18px, photographic frames ~1–1.35rem
- Shadows: soft green-tinted only

## Components

- **Header:** sticky white, green active underline, solid green book CTA
- **Hero:** full-bleed wash + brand-first copy + photographic `HeroFlowComposition` (no overlays)
- **Buttons:** solid green / outline; `.btn-lg` for primary CTAs
- **Doctor cards:** portrait + specialty chip in body (not media overlay)
- **Service cards:** soft white→mist gradient, green hover border
- **Footer:** green-mist band, not dark admin chrome
- **Focus:** 2px green ring for keyboard users

## Motion

- Subtle float on hero imagery (180–220ms interactions elsewhere)
- Disabled under `prefers-reduced-motion`

## Content rules

- Services, specialties, FAQ, policies, doctors: Nest → Mongo
- Reviews render only when Mongo returns verified/approved reviews
- Working hours from clinic settings when present
- No fake counters or “Coming soon”
