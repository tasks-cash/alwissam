# Public Website Redesign Status

**Updated:** 2026-07-15  
**Scope:** Visitor-facing pages only (dashboards untouched)

## Delivered this iteration

- Cinematic homepage hero (brand-first, no floating overlay badges)
- Photographic `HeroFlowComposition` plane with soft green wash
- Doctor specialty moved from media overlay into body chip
- Service / doctor card hover polish (white + medical green)
- PageHero premium heading scale
- Typography: Cairo + Source Sans 3 only on public (no decorative serif)
- Design system refreshed: [`WORLD_CLASS_DESIGN_SYSTEM.md`](WORLD_CLASS_DESIGN_SYSTEM.md)

## Already in place (preserved)

- Nest public APIs: site, doctors, services, specialties, FAQ, reviews, booking, contact
- Routes: home, about, services, specialties, doctors, book, reviews, FAQ, contact, policies
- ar / en / fr with RTL for Arabic
- Full-bleed `PublicSection` + `pub-container` (~1520px)

## Quality

| Check | Result |
| --- | --- |
| `@alwisam/web` typecheck | PASS |

## Remaining gaps vs full brief seal

- Playwright visual suite + exhaustive RTL screenshot QA
- Docker public smoke not re-run this session
- CMS population of verified reviews / hours still depends on data
