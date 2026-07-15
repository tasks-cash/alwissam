# World-Class Public Design System

**Clinic:** Al-Wisam Dental  
**Scope:** Public visitor website only (`apps/web` public routes)  
**Updated:** 2026-07-14

## Principles

- White canvas with medical green accents
- Arabic-first (RTL), English/French LTR
- Full-bleed section backgrounds; constrained content ~1520px
- Brand is a hero-level signal
- Calm, premium healthcare — no dashboard aesthetics on public pages
- Real MongoDB content via Nest public APIs; never invent reviews or stats

## Color tokens

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

- Arabic: Cairo (400/600/700), line-height 1.7 body, 1.25 display
- Latin: Source Sans 3 (400/600/700)
- No `text-transform: uppercase` on Arabic kickers
- Scale: display 3.2–3.8rem · hero 2.4–3rem · page 2rem · section 1.6rem · card 1.1rem · body 1.05rem · small 0.875rem

## Spacing & layout

- Container max: `1520px`
- Inline padding: `clamp(1.25rem, 4vw, 3rem)`
- Section vertical: `clamp(3.5rem, 7vw, 6rem)`
- Radius: `10px` controls, `14px` tiles, `0` hero (full bleed)
- Shadows: soft green-tinted only (`0 10px 30px rgba(11, 122, 104, 0.08)`)

## Components

- **Header:** sticky white, green active link, solid green primary CTA
- **Hero:** full viewport width, brand + one headline + one sentence + CTA + dominant visual plane
- **Buttons:** solid green / outline green-ink / ghost
- **Forms:** white fields, green focus ring, Arabic-friendly labels
- **Footer:** green-mist / white, not dark navy admin chrome
- **Focus:** 2px green ring, visible on keyboard

## Motion

- Prefer opacity/transform 180–220ms
- Respect `prefers-reduced-motion`
- No continuous decorative looping animation

## Content rules

- Services, specialties, FAQ, policies, doctors: Nest → Mongo
- Reviews render only when Mongo returns verified reviews
- Working hours from `clinic_info` when present
- No fake counters or “Coming soon”
