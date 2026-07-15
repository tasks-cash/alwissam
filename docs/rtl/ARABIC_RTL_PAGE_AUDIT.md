# Arabic RTL — Page Audit

Direction rule: `ar` → `dir="rtl"` · `en`/`fr` → `dir="ltr"` (from URL locale via middleware `x-alwisam-locale` + root layout).

Total Next.js page routes under `apps/web/app/[locale]`: **41**

| Route | Surface | Arabic RTL expected | Audit status | Notes |
|---|---|---|---|---|
| `/[locale]` | Public home | Yes | FIXED (SSR dir) | Playwright dir assertions |
| `/[locale]/about` | Public | Yes | FIXED | Covered by public RTL suite |
| `/[locale]/services` | Public | Yes | FIXED | |
| `/[locale]/services/[slug]` | Public dynamic | Yes | DISCOVERED | Depends on seeded data |
| `/[locale]/specialties` | Public | Yes | FIXED | |
| `/[locale]/specialties/[slug]` | Public dynamic | Yes | DISCOVERED | Depends on seeded data |
| `/[locale]/doctors` | Public | Yes | FIXED | |
| `/[locale]/doctors/[slug]` | Public dynamic | Yes | DISCOVERED | LTR quals already isolated |
| `/[locale]/contact` | Public | Yes | FIXED | Phone `dir=ltr` |
| `/[locale]/book-appointment` | Public wizard | Yes | FIXED | Wizard actions use `start` |
| `/[locale]/book-appointment/confirmation` | Public | Yes | FIXED | Ref LTR |
| `/[locale]/reviews` | Public | Yes | FIXED | |
| `/[locale]/faq` | Public | Yes | FIXED | |
| `/[locale]/patient-information` | Public | Yes | FIXED | |
| `/[locale]/before-your-visit` | Public | Yes | FIXED | |
| `/[locale]/after-your-visit` | Public | Yes | FIXED | |
| `/[locale]/support` | Public | Yes | FIXED | |
| `/[locale]/privacy` | Public | Yes | FIXED | |
| `/[locale]/terms` | Public | Yes | FIXED | |
| `/[locale]/cookies` | Public | Yes | FIXED | |
| `/[locale]/refund-policy` | Public | Yes | FIXED | |
| `/[locale]/cancellation-policy` | Public | Yes | FIXED | |
| `/[locale]/accessibility` | Public | Yes | FIXED | |
| `/[locale]/medical-disclaimer` | Public | Yes | FIXED | |
| `/[locale]/staff/login` | Auth | Yes | FIXED | Password LTR |
| `/[locale]/patient/login` | Auth | Yes | FIXED | |
| `/[locale]/forgot-password` | Auth | Yes | FIXED | |
| `/[locale]/reset-password` | Auth | Yes | DISCOVERED | Needs token query |
| `/[locale]/secretary/dashboard` | Dashboard | Yes | FIXED | Shell Escape + scroll lock |
| `/[locale]/secretary/today` | Dashboard | Yes | DISCOVERED | Auth required for visual verify |
| `/[locale]/secretary/directed` | Dashboard | Yes | DISCOVERED | Auth required |
| `/[locale]/secretary/patients` | Dashboard | Yes | FIXED | Email LTR |
| `/[locale]/secretary/appointments` | Dashboard | Yes | DISCOVERED | Auth required |
| `/[locale]/secretary/payments` | Dashboard | Yes | FIXED | Amount cells LTR |
| `/[locale]/doctor/specialist/dashboard` | Dashboard | Yes | DISCOVERED | Auth required |
| `/[locale]/doctor/specialist/doctors` | Dashboard | Yes | FIXED | Email LTR |
| `/[locale]/doctor/specialist/secretaries` | Dashboard | Yes | FIXED | Email LTR |
| `/[locale]/doctor/specialist/settings` | Dashboard | Yes | FIXED | Phone/email LTR |
| `/[locale]/doctor/specialist/audit-logs` | Dashboard | Yes | DISCOVERED | Auth required |
| `/[locale]/doctor/general/dashboard` | Dashboard | Yes | DISCOVERED | Auth required |
| `/[locale]/patient/dashboard` | Dashboard | Yes | DISCOVERED | Auth required |

## English / French regression

Every public route above must keep `dir="ltr"` for `/en/*` and `/fr/*`. Automated checks cover home + contact redirect; full path LTR sweep is tracked in `ARABIC_RTL_PROGRESS.md`.
