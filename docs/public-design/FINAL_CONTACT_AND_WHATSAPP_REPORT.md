# Final Contact Information & Global WhatsApp Report

**Date:** 2026-07-15  
**Stack:** Next.js (`apps/web`) + NestJS (`apps/api`) + MongoDB / Mongoose  

## Verdict

```
CONTACT AND WHATSAPP UPDATE NOT COMPLETE
REMAINING FAILURES DOCUMENTED
```

Core contact data, public API sanitization, shared WhatsApp float, and unit/typecheck gates are in place. Remaining blockers before the full acceptance banner:

- Playwright homepage suite against live `:3004` failed (heading not found; Next served a FOUC/fallback shell — restart `apps/web` with `NODE_ENV=production`/`development` consistently, then re-run e2e).
- Docker web image build fails on `pnpm install` in Dockerfile.
- Admin settings still needs full React Hook Form + Zod + unsaved-change warning.

Verified successfully: Mongo single-record update, addresses/phone/email/Facebook/WhatsApp normalization, public DTO without private audit fields, typecheck, jest, production Next build.

---

## Checklist results

1. **Existing settings record found** — `clinic_settings` key `clinic_info` existed (count = 1).
2. **Settings update result** — Idempotent upsert via `pnpm seed:clinic-contact` (`scripts/update-clinic-contact.ts`); API `mergeClinicInfo` also backfills on read.
3. **Duplicate prevention result** — `recordsBefore: 1`, `recordsAfter: 1`; upsert only on `key: "clinic_info"`.
4. **Arabic address** — `حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009`
5. **English address** — Emir Abdelkader District / Zakour Farhat Essaghir Primary School / El Oued 39009 / Algeria
6. **French address** — Cité Emir Abdelkader / école primaire Zakour Farhat Essaghir / El Oued 39009 / Algérie
7. **Phone storage** — Stored as **string** `0663098208` (never numeric).
8. **Phone display** — `0663 09 82 08`
9. **International normalization** — `+213663098208` → `tel:+213663098208`
10. **WhatsApp URL** — `https://wa.me/213663098208` (+ encoded `?text=`)
11. **Email** — `clinic.elwissam@gmail.com` / `mailto:clinic.elwissam@gmail.com`
12. **Facebook** — `https://web.facebook.com/Clinic.ElWissam`
13. **Public API** — `GET /api/public/clinic-settings` returns sanitized DTO (`telephoneUrl`, `whatsappUrl`, no `updatedBy` / audit fields after API restart).
14. **Admin settings** — Owner/Admin page fields expanded (names, addresses, city/wilaya/postal/countries, phone/WhatsApp, Facebook, maps, lat/lng, friday closed, timezone). Permissions guards unchanged.
15. **Homepage** — Location section `الموقع والتواصل` / `ClinicLocation` uses `clinic` from public site.
16. **About** — Uses shared clinic contact via public site + `PublicChrome`.
17. **Contact** — `ContactPageContent` → `ClinicLocation` with centralized settings.
18. **Footer** — `PublicChrome` footer: name, address, phone, email, WhatsApp, Facebook, hours; empty actions hidden.
19. **Global WhatsApp** — Single `GlobalWhatsAppButton` in `PublicChrome` (+ standalone on locale `not-found` / `error` recoverable pages).
20. **Public-page coverage** — All pages using `PublicChrome` / `ContentPage` get the float button automatically.
21. **Internal dashboards excluded** — Dashboards use `DashboardShell`, not `PublicChrome` (no `.wa-float`).
22. **Arabic message** — Encoded via `encodeURIComponent`; default AR message matches clinic full name.
23. **English message** — Encoded; Al Wissam Dental Clinic wording.
24. **French message** — Encoded; Clinique Dentaire El Wissam wording.
25. **Arabic RTL position** — `[dir="rtl"] .wa-float` → `inset-inline-start` (bottom-left).
26. **EN/FR position** — Default `inset-inline-end` (bottom-right).
27. **Accessibility** — Real `<a>`, aria labels, focus ring, visible text on desktop / SR-only label on mobile icon mode.
28. **Mobile** — Compact 52px target; safe-area insets; label visually hidden but accessible.
29. **Desktop** — Pill with icon + localized label; restrained hover/focus; respects `prefers-reduced-motion`.
30. **Obsolete-data search** — Target apps cleared of placeholder phones/emails; defaults corrected from `Al-Wisam` → `Al Wissam` / `El Wissam`. Legacy nested folders untouched.
31. **Broken-link result** — No `href="#"` in contact/footer patterns; directions/map hidden until configured (no invented map URLs).
32. **Browser-console** — Not fully re-audited in browser after this pass (manual verify recommended).
33. **Lint** — Commands run; package scripts are stubs (`lint:api` / `lint:web` echo).
34. **Typecheck** — **PASS** (`pnpm typecheck`).
35. **Tests** — **PASS** (shared-validation + API jest including expanded `clinic-contact.util.spec.ts`).
36. **Playwright** — Specs extended (RTL/LTR float position, dashboard exclusion, contact/Facebook links). Full suite not re-executed against live web in this session.
37. **Build** — **PASS** with `NODE_ENV=production` for Next. Fails if shell inherits non-standard `NODE_ENV` from `.env`.
38. **Docker** — `docker compose -f infrastructure/docker/docker-compose.target.yml config` **PASS**; `docker compose build` **FAIL** (`pnpm install` in web Dockerfile).
39. **Exact files changed** — see below.
40. **Remaining issues** — Admin RHF/Zod + unsaved warning; Docker web image install; Playwright full gate; live browser visual QA across listed breakpoints.

---

## Verification commands (this session)

| Command | Result |
|--------|--------|
| `pnpm seed:clinic-contact` | OK — 1 record, exact contact payload |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS (26 API + 11 validation) |
| `pnpm lint` | Stubs only |
| `NODE_ENV=production pnpm --filter @alwisam/web build` | PASS |
| `GET /api/public/clinic-settings` (post restart) | Sanitized public DTO |
| Docker compose config | PASS |
| Docker compose build | FAIL (install step) |

---

## Exact files changed (primary)

- `apps/api/src/settings/settings.service.ts` — defaults, merge/normalize, `toPublicClinic`, upsert audit metadata
- `apps/api/src/settings/settings.controller.ts` — public clinic-settings endpoint comments
- `apps/api/src/settings/dto/settings.dto.ts` — expanded clinic fields
- `apps/api/src/settings/clinic-contact.util.ts` / `.spec.ts` — phone/WA utils + tests
- `apps/web/lib/clinic-contact.ts` — messages, contextual WA, Facebook aria, URL builders
- `apps/web/lib/public-site.ts` — clinic type + localized names
- `apps/web/lib/i18n/public-copy.ts` — location lead copy
- `apps/web/lib/i18n/dictionaries.ts` — brand names
- `apps/web/components/public/ClinicLocation.tsx` — BidiSafe, no invented directions
- `apps/web/components/public/BidiSafeValue.tsx` — new
- `apps/web/components/public/PublicChrome.tsx` — footer BidiSafe + Facebook aria
- `apps/web/components/public/GlobalWhatsAppButton.tsx` — (existing; still sole float widget)
- `apps/web/app/globals.css` — WA float RTL/LTR + reduced motion + shell padding
- `apps/web/app/[locale]/doctors/[slug]/page.tsx` — contextual WA
- `apps/web/app/[locale]/services/[slug]/page.tsx` — contextual WA
- `apps/web/app/[locale]/specialties/[slug]/page.tsx` — contextual WA
- `apps/web/app/[locale]/book-appointment/page.tsx` — contextual WA
- `apps/web/app/[locale]/book-appointment/confirmation/page.tsx` — contextual WA
- `apps/web/app/[locale]/doctor/specialist/settings/page.tsx` — admin contact fields
- `apps/web/e2e/public-site.spec.ts` — contact/WA assertions
- `scripts/update-clinic-contact.ts` — new idempotent seed
- `scripts/seed-mongo-owner.ts` — aligned contact defaults
- `package.json` — `seed:clinic-contact` script
- `docs/public-design/FINAL_CONTACT_AND_WHATSAPP_REPORT.md` — this file

---

## Status line (after real verification of critical gates)

```
CONTACT AND WHATSAPP UPDATE NOT COMPLETE
REMAINING FAILURES DOCUMENTED
```

Progress against product requirements is largely landed in code and Mongo; reopen acceptance only after Playwright green on a healthy web process and Docker image build is repaired.
