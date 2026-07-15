# Arabic RTL — Component Audit

| Component | Path | RTL risk | Mitigation | Status |
|---|---|---|---|---|
| Root layout | `app/layout.tsx` | Wrong cookie-based dir | Path locale via `x-alwisam-locale` | FIXED |
| Middleware | `middleware.ts` | Missing SSR locale | Injects `LOCALE_HEADER` | FIXED |
| HtmlLangDir | `components/i18n/HtmlLangDir.tsx` | Client-only flash | Kept as client-nav backup only | FIXED |
| Locale meta | `lib/i18n/config.ts` | Source of truth | `ar` rtl / `en`,`fr` ltr | VERIFIED |
| PublicChrome | `components/public/PublicChrome.tsx` | Mobile drawer side | Grid + Escape + body lock | FIXED |
| DashboardShell | `components/layout/DashboardShell.tsx` | Drawer Escape/scroll | Escape + overflow lock | FIXED |
| LanguageSwitcher | `components/i18n/LanguageSwitcher.tsx` | Path rewrite | Preserves path; cookie sync | VERIFIED |
| PhoneField | `components/ui/PhoneField.tsx` | Digit order | `dir="ltr"` + digits only | VERIFIED |
| PasswordField | `components/ui/PasswordField.tsx` | Overlap / bidi | `dir="ltr"` + logical toggle | FIXED |
| EmailField | `components/ui/EmailField.tsx` | Bidi | Reusable LTR email | FIXED |
| LtrValue | `components/ui/LtrValue.tsx` | Mixed text | `dir="ltr"` isolate wrapper | FIXED |
| AppointmentWizard | `components/public/AppointmentWizard.tsx` | Steps/actions | Logical start; value LTR spans | FIXED |
| Breadcrumbs | CSS `.breadcrumbs` | Chevron direction | `›` / RTL `‹` | FIXED |
| Data tables | CSS `.data-table` | Alignment | `text-align: start` | FIXED |
| Forms / inputs | CSS `.input` | Physical padding | Logical padding + LTR isolate types | FIXED |
| Why-list cards | CSS `.why-list` | Physical radii | Logical border-*-radius | FIXED |
| Mobile drawer | CSS `.public-mobile-drawer` | Double-flip | Removed RTL column override | FIXED |
| Dash sidebar | CSS `.dash-sidebar` | Off-canvas | `inset-inline-start` + translateX | FIXED |
| Active nav | CSS `.dash-nav-link.active` | Indicator side | `border-inline-start` | FIXED |

## Intentional physical exceptions

| Pattern | Reason |
|---|---|
| Decorative radial `top left` on dash shell | Non-semantic atmosphere |
| Social / clinic mark SVGs | Must not mirror |
| Chronological appointment lists | Order is temporal, not mirrored |
