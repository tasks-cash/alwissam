# Arabic RTL — Final Report

**Date:** 2026-07-15  
**App:** `apps/web` (Next App Router, locales `ar` | `en` | `fr`)

## Verdict

```text
ARABIC RTL FIX NOT COMPLETE
REMAINING RTL FAILURES DOCUMENTED
```

Public + auth Arabic direction is SSR-correct and covered by Playwright (`35/35` chromium). Authenticated dashboard **visual** RTL verification (tables, dialogs, calendars under login) remains incomplete because those routes require credentials not exercised end-to-end in this pass.

---

### 1. Total routes discovered
**41** `page.tsx` routes under `apps/web/app/[locale]`.

### 2. Arabic pages tested
- **20** public policy/content routes + home (Playwright)
- **3** auth routes (`staff/login`, `patient/login`, `forgot-password`)
- Contact phone + staff password bidi
- Mobile drawer RTL side
- Dashboard **redirect** locale/dir (unauthenticated)

### 3–4. English / French regression
Homepage + contact SSR `dir="ltr"`; English mobile drawer left-aligned; English secretary → `/en/staff/login` LTR. **Pass.**

### 5–7. Issues
| Metric | Count |
|---|---|
| Discovered (register) | 14 |
| Fixed | 10 |
| Verified (browser/Playwright) | 10 foundation/public/auth |
| Remaining / needs auth visual | RTL-011, RTL-012 |
| N/A | RTL-013, RTL-014 |

### 8. Global document direction
SSR: `ar` → `lang=ar dir=rtl`; `en`/`fr` → matching `lang` + `dir=ltr`. Middleware injects `x-alwisam-locale` from path; root layout reads it first. **Pass.**

### 9. Nested layouts
`[locale]/layout` does not override `dir`; `HtmlLangDir` is client-nav backup only. **Pass.**

### 10. Hydration
No forced CSS `direction` on `html`; path-based SSR matches client. Curl + Playwright agree. **Pass (public/auth).**

### 11–15. Header / sidebar / top-bar / breadcrumbs / forms
Public header + Escape/scroll mobile menu verified. Dashboard shell Escape/scroll lock + logical active indicator shipped; **logged-in sidebar geometry not Playwright-verified.** Breadcrumbs use logical chevrons. Forms: logical padding, start alignment.

### 16–18. Phone / email / password / selects
PhoneField `dir=ltr` verified. PasswordField `dir=ltr` verified. Email inputs + CSS isolate for email/url/tel/password. Selects use shared `.select` (start alignment).

### 19–27. Calendar / tables / pagination / dialogs / tabs / timelines / charts
Logical helpers in place where components exist. Full authenticated calendar/table/dialog matrix: **remaining** (RTL-012). Charts: **N/A** for current target surfaces.

### 28–31. Homepage / contact / booking / doctors / footer
Public RTL shell Playwright pass; phone LTR on contact; booking wizard routes RTL; doctors list RTL; footer present on audited pages.

### 32–35. Auth + role dashboards
Auth pages RTL verified. Owner/doctor/secretary/patient **logged-in** pages: structural shell fixes only — **not fully visually verified.**

### 36–38. Responsive
Mobile drawer LTR/RTL Playwright. Full 360–1600 matrix on every page: **not claimed.**

### 39–40. Accessibility / console
`lang`/`dir` correct on audited pages. No exhaustive axe/console campaign claimed.

### 41–46. Quality gates
| Gate | Result |
|---|---|
| `pnpm --filter @alwisam/web typecheck` | **PASS** |
| Web lint | Stub (`lint:web not configured yet`) |
| Unit tests (shared/api) | Not re-run for RTL-only change |
| Playwright `e2e/arabic-rtl.spec.ts` chromium | **35 passed** |
| Full `pnpm build` / docker | Not re-run this pass |

### 47. Exact files changed (this RTL pass)
- `apps/web/middleware.ts`
- `apps/web/lib/i18n/locale-header.ts`
- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`
- `apps/web/components/ui/PasswordField.tsx`
- `apps/web/components/ui/EmailField.tsx`
- `apps/web/components/ui/LtrValue.tsx`
- `apps/web/components/layout/DashboardShell.tsx`
- `apps/web/app/[locale]/doctor/specialist/doctors/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/secretaries/page.tsx`
- `apps/web/app/[locale]/doctor/specialist/settings/page.tsx`
- `apps/web/app/[locale]/secretary/patients/page.tsx`
- `apps/web/e2e/arabic-rtl.spec.ts`
- `docs/rtl/ARABIC_RTL_*.md` (all five)

### 48. Remaining risks
1. Authenticated dashboard tables/dialogs/calendars need credentialed RTL walkthrough.
2. Dynamic `[slug]` pages need live Mongo content for visual check.
3. Root monorepo Next vs `apps/web` dual stacks — always test against `apps/web` on `:3004`.
4. Select/combobox portals and toast stacks not exhaustively audited.

### 49. Exact next action
1. Log in as secretary + specialist on `/ar/...` and visually verify sidebar offset, tables, dialogs, date filters at 390 / 768 / 1280.
2. Promote RTL-011 / RTL-012 to VERIFIED (or fix and re-test).
3. Run `pnpm build:web` and docker compose config/build when promoting to complete acceptance.

When those are done, replace the verdict with the full acceptance block from the task brief.
