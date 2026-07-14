# Redesign System

**Audited:** 2026-07-14  
**Intent:** Professional Arabic RTL clinical UI — preserve brand identity from legacy, apply it cleanly in `apps/web`.  
**Not:** Generic purple dashboard template; not a visual rewrite of clinical workflows.

## Brand tokens (from legacy `src/app/globals.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--primary-navy` | `#0f2747` | Headers, primary text accents |
| `--primary-blue` | `#176b87` | Secondary actions |
| `--medical-teal` | `#0f9a9a` | Primary CTAs, active states |
| `--soft-teal` | `#ddf5f4` | Soft surfaces |
| `--success` | `#16a36a` | Success alerts |
| `--warning` | `#f59e0b` | Warnings |
| `--danger` | `#d9485f` | Errors / destructive |
| `--background` | `#f5f8fc` | App background |
| `--surface` | `#ffffff` | Cards / panels |
| `--border` | `#dce4ee` | Borders |
| `--radius` | `16px` | Default radius |
| Fonts | Cairo + Inter | RTL Arabic + Latin digits |

## Layout principles

1. RTL by default (`dir="rtl"`, `lang="ar-DZ"` with Latin numerals).
2. One shell: public chrome vs staff `DashboardShell`.
3. Forms: clear required marker `*`, hint under label, error under field.
4. Tables/lists: keep existing clinical density; improve spacing and empty states.
5. Mobile: secretary + patient flows must remain thumb-reachable.
6. Motion: subtle only (panel open, button loading) — 2–3 purposeful motions max per major surface.

## Required UI primitives (build in STEP 11, reuse earlier)

| Primitive | Notes |
| --- | --- |
| Button | primary / outline / danger / loading |
| Input / Textarea / Select | unified height, focus ring teal |
| PasswordField | eye toggle, caps lock, autocomplete |
| PhoneField | digits-only; `type="tel"`; `inputMode="numeric"`; **never** `type="number"` |
| FormField | label + required + hint + error |
| Card / Panel | surface + border; avoid nesting heavy shadows |
| ConfirmDialog | replace `window.confirm` |
| EmptyState | actionable, not “coming soon” |
| Badge | status colors matching appointment enums |
| Alert | form-level success/error |

## What not to redesign away

- Clinic logo / medical teal–navy palette
- Arabic copy and Latin digit policy
- Existing staff workflow layout (reception bars, exam queue)
- Existing route URLs where possible

## Target CSS location

- `apps/web/app/globals.css` — import tokens
- Shared UI only if components are reused across many pages (`packages/ui` optional later)

## Redesign completion criteria

- [ ] Tokens applied in `apps/web`
- [ ] Login / staff shells match brand
- [ ] All password/phone fields use primitives
- [ ] Confirm dialogs replace native confirms on migrated pages
- [ ] Desktop + mobile screenshots compared for migrated pages
