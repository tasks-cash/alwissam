# Public Website Redesign Status

**Updated:** 2026-07-14  
**Scope:** Visitor-facing pages only (dashboards untouched)

## Delivered

- Design system: [`docs/public-design/WORLD_CLASS_DESIGN_SYSTEM.md`](WORLD_CLASS_DESIGN_SYSTEM.md)
- White + medical green token system under `.public-shell`
- Full-bleed sections via `PublicSection` + `pub-container` (max ~1520px)
- Premium hero: brand-first display, one headline, one lead, CTA group, full-width visual plane
- Restyled header/footer (no dark admin chrome on public)
- Home, about, services, specialties, doctors, doctor profile, book, FAQ, contact, policy content pages
- Nest public data: clinic hours, reviews array (render only when verified Mongo content exists), doctor availability fields
- ar / en / fr with RTL for Arabic

## Data rules honored

- No fake reviews (empty `reviews` until CMS/Mongo has verified ones)
- Doctors/services/FAQ/policies from `GET /api/public/site` + `GET /api/public/doctors`
- Booking via `POST /api/public/appointments`

## Quality

| Check | Result |
| --- | --- |
| `@alwisam/api` typecheck | PASS |
| `@alwisam/web` typecheck | PASS |

## Next (optional polish)

- Populate doctor `workingHours` / `availabilityNote*` from owner settings UI
- Add verified reviews through CMS when marketing supplies them
- Visual QA screenshots (desktop + mobile) for ar/en/fr
