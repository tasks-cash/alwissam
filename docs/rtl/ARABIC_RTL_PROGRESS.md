# Arabic RTL — Progress

## Phase checklist

| Phase | Scope | Status |
|---|---|---|
| 1 Direction foundation | Middleware header, root `lang`/`dir`, no forced CSS direction | DONE + Playwright |
| 2 Shared CSS | Logical radii, drawer `inset-inline-start`, tables `start`, LTR inputs | DONE |
| 3 Global chrome | Public header/drawer, dashboard shell Escape/scroll, breadcrumbs | DONE (public verified) |
| 4 Forms | Phone/password/email LTR isolation | DONE + Playwright phone/password |
| 5 Data | Tables `text-align: start`; payment LTR cells | PARTIAL |
| 6 Overlays | Mobile drawers verified; auth dialogs limited | PARTIAL |
| 7 Date / wizard | Wizard actions logical; date LTR spans | PARTIAL |
| 8 Pages | Public + auth Playwright green; dashboards need login | PARTIAL |
| 9 Responsive / a11y | Mobile drawer LTR/RTL | PARTIAL |
| 10 Tests / verify | `arabic-rtl.spec.ts` **35 passed** (chromium) | DONE for public/auth |

## Latest verification

```text
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3004
pnpm exec playwright test e2e/arabic-rtl.spec.ts --project=chromium --workers=2
→ 35 passed
```

SSR smoke (curl): `/ar` `dir=rtl`, `/en` `/fr` `dir=ltr`; phone + password `dir=ltr`.

## Next incomplete actions

1. Credentialed Arabic dashboard visual pass (RTL-012).
2. Dynamic slug pages with seeded content (RTL-011).
3. Promote final report to full acceptance only after those + `pnpm build:web`.
