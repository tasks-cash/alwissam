# Responsive Report

Verified via CSS breakpoints (manual Playwright pending):

| Width | Expectations |
| --- | --- |
| ≤560px | Single-column footer, stacked CTAs |
| ≤900px | Hero stacks, mobile nav drawer, book strip stacks |
| ≤1024px | Footer 2-col, content readable |
| ≥1120px | Centered `public-main` max width |

Hero uses `min(68vh, 580px)` on desktop; mobile uses auto height.
