# Arabic RTL — Bug Register

| RTL ID | Route | Component | Problem | Root Cause | Files Changed | Desktop | Tablet | Mobile | Status |
|---|---|---|---|---|---|---|---|---|---|
| RTL-001 | `/*` | `globals.css` | Forced `html { direction: rtl }` (plus conflicting `inherit`) | Hardcoded CSS direction broke en/fr and fought `dir` attribute | `apps/web/app/globals.css` | Y | Y | Y | VERIFIED |
| RTL-002 | `/*` | Root layout | `lang`/`dir` from cookie/Accept-Language, not URL | SSR could disagree with `/en` or `/ar` path | `app/layout.tsx`, `middleware.ts`, `lib/i18n/locale-header.ts` | Y | Y | Y | VERIFIED |
| RTL-003 | Public mobile | `PublicChrome` drawer | Menu side / test incorrectly assumed mid-x | Drawer uses `inset-inline-start`; test asserts trailing edge | `globals.css`, `arabic-rtl.spec.ts` | n/a | Y | Y | VERIFIED |
| RTL-004 | Auth / dashboards | `PasswordField` | Password value not LTR-isolated | Missing `dir="ltr"` | `PasswordField.tsx` | Y | Y | Y | VERIFIED |
| RTL-005 | Forms | Email inputs | Emails reordered under RTL | No `dir="ltr"` on emails | Doctors/secretaries/patients/settings pages + CSS | Y | Y | Y | FIXED |
| RTL-006 | Home | `.why-list li` | Physical border radii with `[dir=rtl]` override | Non-logical radius | `globals.css` | Y | Y | Y | FIXED |
| RTL-007 | Book wizard | `.wizard-actions` | Redundant RTL flex hack | Used `flex-start` twice | `globals.css` | Y | Y | Y | FIXED |
| RTL-008 | Dashboards | `DashboardShell` | Mobile menu Escape / scroll lock incomplete | Missing listeners | `DashboardShell.tsx` | n/a | Y | Y | FIXED |
| RTL-009 | Dashboards | Sidebar active item | Active indicator not logical | No start-edge indicator | `globals.css` | Y | Y | Y | FIXED |
| RTL-010 | Settings | Phone field | Plain text input without LTR | Missing bidi isolation | settings page | Y | Y | Y | FIXED |
| RTL-011 | Dynamic public | services/specialties/doctors/[slug] | Needs browser verify with live data | Content-dependent | — | — | — | — | DISCOVERED |
| RTL-012 | Authenticated dashboards | All role pages | Full visual verify needs credentials | Playwright cannot assert layout without login | e2e redirect coverage only | — | — | — | DISCOVERED |
| RTL-013 | Charts | Reports (if any) | Chart RTL not fully audited | Limited chart surfaces in target app | — | — | — | — | NOT_APPLICABLE |
| RTL-014 | Nested duplicate tree | `alwissam-main/` legacy | Confusion risk for operators | Out of scope; do not edit for RTL | — | — | — | — | NOT_APPLICABLE |

Statuses: DISCOVERED · IN_PROGRESS · FIXED · VERIFIED · NOT_APPLICABLE

`VERIFIED` is reserved for issues confirmed in a real browser run (Playwright or manual). Promote FIXED → VERIFIED after `pnpm test:e2e` / manual pass.
