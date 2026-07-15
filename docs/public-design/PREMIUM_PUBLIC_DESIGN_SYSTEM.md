# Premium Public Design System

White + medical green visual identity for Al-Wisam public website (`apps/web` under `/[locale]/*`).

## Tokens (CSS variables on `.public-shell`)

| Token | Role | Suggested value |
|-------|------|-----------------|
| `--pub-bg` | Main page background | `#FFFFFF` |
| `--pub-soft` | Soft green / alternate section | `#EEF7F4` |
| `--pub-mist` | Neutral alternate | `#F5F7F6` |
| `--pub-primary` | Primary medical green | `#0B7A68` |
| `--pub-primary-deep` | Primary actions / hover | `#086557` |
| `--pub-ink` | Main text | `#14241F` |
| `--pub-muted` | Secondary text | `#4A5C55` |
| `--pub-border` | Borders | `#D5E5DF` |
| `--pub-success` | Success | `#0F7A45` |
| `--pub-warning` | Warning | `#B54708` |
| `--pub-danger` | Error | `#B42318` |
| `--pub-info` | Information | `#175CD3` |
| `--pub-shadow` | Restrained elevation | `0 1px 3px rgb(20 36 31 / 8%)` |
| `--pub-radius` | Default radius | `12px`–`14px` |
| `--pub-container` | Inner max width | `min(1520px, 100% - padding)` |
| `--pub-focus` | Focus ring | `0 0 0 3px rgb(11 122 104 / 35%)` |

Defined and consumed in `apps/web/app/globals.css` under `.public-shell`.

## Typography

- Arabic: project font stack (Arabic-first).
- Latin (en/fr): matching professional sans in the same size scale.
- Prefer logical properties (`margin-inline-*`, `text-align: start`).
- No uppercase transforms on Arabic.

## Layout

- Full-bleed section backgrounds (`.pub-band`, `.pub-hero`, `.public-footer-xl`).
- Inner content in `.pub-container` (~1440–1600px max).
- Alternate white / soft-green / mist sections.
- Sticky header; mobile drawer with escape + scroll lock.

## Shared page templates

- `HomePageContent` — homepage sections (hero → booking search → intro → why → journey → services → specialties → 3 doctors → reviews → FAQ → location → CTA)
- `AboutPageContent` — about hero, story, mission/vision, values, care approach, team, specialties, why, hours/location, CTA
- `ContactPageContent` — contact hero, location strip, inquiry + booking workspace

## Direction

- `ar` → `dir="rtl"` via `HtmlLangDir`
- `en` / `fr` → `dir="ltr"`
- Phone, dates, times: `dir="ltr"` isolation
- Do not mirror clinic/doctor photos or logos

## Working hours (single source)

Clinic settings defaults (`apps/api` `DEFAULT_CLINIC_INFO`):

- Saturday–Thursday 08:00–17:00
- Friday closed

Consumed via `GET /api/public/site` → `localizedWorkingHours`.
