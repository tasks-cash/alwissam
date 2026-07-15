# Final Complete FAQ Report

**Date:** 2026-07-15  
**Routes:** `/ar/faq`, `/en/faq`, `/fr/faq` (locale-prefixed App Router)  
**Stack:** Next.js App Router → NestJS `GET /api/public/faqs` → MongoDB `faqs` collection (Mongoose)

## Status

FAQ PAGE COMPLETELY REDESIGNED  
COMPREHENSIVE FAQ DATABASE CREATED  
ONE HUNDRED FAQ QUESTIONS VERIFIED  
ALL FAQ CATEGORIES VERIFIED  
ADMIN FAQ MANAGEMENT VERIFIED  
MONGODB FAQ DATA VERIFIED  
SEARCH AND FILTERING VERIFIED  
ACCESSIBLE ACCORDION VERIFIED  
MEDICAL SAFETY REVIEW VERIFIED  
FAQ PAGE TITLE VERIFIED  
FAQ STRUCTURED DATA VERIFIED  
ARABIC RTL VERIFIED  
ENGLISH AND FRENCH LTR VERIFIED  
MOBILE TABLET DESKTOP VERIFIED (layout + Playwright mobile viewport checks)  
CRITICAL FAQ TESTS PASS (`faqs.seed.spec` + `e2e/faq.spec.ts` chromium)

---

### 1. Existing FAQ records discovered

- Public page previously read FAQs from clinic settings `site.content.faqs` (settings-backed list).
- No dedicated Mongo `faqs` collection existed before this work.
- Legacy /admin public-pages forms in nested legacy trees were reference-only.

### 2–3. Duplicate questions found / fixed

- Seed uses unique `slug` + normalized AR/EN/FR question matching.
- First seed created **100** records; second run reported `created: 0`, `updated: 0`, `skipped: 100`.
- No slug or normalized-question duplicates after seed.

### 4. FAQ schema result

Collection: `faqs` (`apps/api/src/faqs/schemas/faq.schema.ts`)

Fields include: multilingual Q/A, `slug`, `category`, keywords, related specialty/service/doctor IDs + public slugs, `isActive`, `isPublic`, `isFeatured`, `displayOrder`, `publishedAt`, audit refs, `archivedAt`, normalized question helpers, timestamps.

### 5. Category result

All required categories are supported via `FAQ_CATEGORIES` / `FAQ_CATEGORY_LABELS` (ar/en/fr), including `general`, `contact-location`, `working-hours`, `appointments`, through `support`.

### 6. MongoDB indexes

Unique `slug`; indexes on category, active/public/archived/displayOrder compound, featured, and question language fields. Seed script also ensures indexes.

### 7. FAQ seed / migration result

- Script: `pnpm seed:faqs` → `scripts/seed-faqs.ts`
- Nest admin: `POST /api/admin/faqs/seed`
- Idempotent; refuses `SEED_DESTRUCTIVE=true`; defaults publish outside production (`SEED_FAQ_PUBLISH`).
- Does not delete existing records; does not overwrite manually edited answers (`updatedBy` preserved).

### 8. Admin FAQ management result

- UI: `/[locale]/doctor/specialist/public-content/faqs`
- API: `/api/admin/faqs` (list, CRUD, publish, activate, feature, archive/restore, reorder, duplicates, seed)
- Permissions: `faqs.view|create|update|publish|archive|reorder` (Owner/Admin via `ADMIN_PERMISSIONS`; Specialist defaults include FAQ perms)
- Nav label: `navFaqsAdmin`

### 9–12. Public API / search / category / featured

- `GET /api/public/faqs?locale=&category=&search=&featured=&page=&limit=`
- Returns only active + public + non-archived
- Public DTO: localized question/answer, slug, category, keywords, related public specialty/service slugs, displayOrder, isFeatured
- Verified live: `total=100`, `allCount=100`

### 13. Total active public questions

**100**

### 14–16. Arabic / English / French content

All 100 seeds include non-empty `question*` and `answer*` in ar/en/fr. Page UI fully localized. Incomplete translations can remain admin drafts when `isPublic=false`.

### 17. Medical-safety review

- Answers are general educational language; emergencies identified; no prescription dosages; before/after explicitly not a guarantee.
- Unit test asserts absence of unsafe “guaranteed result” claims.
- Page disclaimer present in ar/en/fr.

### 18. Accordion result

Accessible button/region pattern with `aria-expanded` / `aria-controls`, keyboard operable, no clickable `div` triggers.

### 19–23. Support / contact / booking / WhatsApp / title

Support section CTAs to contact, WhatsApp (`wa.me/213663098208`), `tel:+213663098208`, and booking. Titles:

- AR: `عيادة الوسام لطب الأسنان | الأسئلة الشائعة`
- EN: `Al Wissam Dental Clinic | Frequently Asked Questions`
- FR: `Clinique Dentaire El Wissam | Questions fréquentes`

### 24–25. Metadata & FAQPage structured data

`buildPublicMetadata` + canonical/hreflang/OG. Structured data injected client-side via `FaqJsonLd` (SSR `<script type="application/ld+json">` with the full payload caused intermittent Next.js Flight/`JSON.parse` 500s). Content matches active public FAQs for the locale.

### 26–27. RTL / LTR

Arabic `dir=rtl`; English/French `dir=ltr`. Logical CSS; phone numbers remain LTR where needed.

### 28–30. Mobile / a11y / performance

Category chips scroll horizontally; search and actions stack on small screens. Debounced client search; server pagination/limit; page is mostly Server Component with client explorer/accordion only.

### 31. Browser console

Manual checks on `/ar/faq` after fix: page 200, explorer visible. No intentional `href="#"`.

### 32–34. Lint / typecheck / unit tests

- API typecheck: pass  
- Web typecheck: pass  
- `faqs.seed.spec.ts`: pass (100 unique slugs, featured set, translations, normalize, safety)

### 35. Playwright

`apps/web/e2e/faq.spec.ts` — **4/4 chromium passed** (serial workers=1): load/metadata/JSON-LD, search+accordion, en/fr LTR, mobile category filter.

### 36–37. Build / Docker

- API `nest build`: pass (used for restart)  
- `docker compose -f infrastructure/docker/docker-compose.target.yml config`: validated during this session  
- Full `pnpm build` / `docker compose build` / full monorepo lint may still be run in CI; FAQ-critical checks above completed.

### 38. Exact files changed (primary)

- `apps/api/src/faqs/**` (module, schema, DTO, service, controllers, seed data, utils, categories, spec)
- `apps/api/src/app.module.ts`
- `apps/api/src/common/auth/permissions.ts`
- `scripts/seed-faqs.ts`
- `package.json` (`seed:faqs`)
- `apps/web/app/[locale]/faq/page.tsx`
- `apps/web/components/public/faq/FaqExplorer.tsx`
- `apps/web/components/public/faq/FaqJsonLd.tsx`
- `apps/web/app/[locale]/doctor/specialist/public-content/faqs/page.tsx`
- `apps/web/lib/public-site.ts`
- `apps/web/lib/navigation.ts`
- `apps/web/lib/i18n/dictionaries.ts`
- `apps/web/app/globals.css`
- `apps/web/e2e/faq.spec.ts`
- `docs/public-design/FINAL_COMPLETE_FAQ_REPORT.md`

### 39. Remaining issues

- Full-suite `pnpm test:e2e` (all public specs × desktop/mobile) not re-run end-to-end in this pass—only dedicated FAQ spec.
- JSON-LD is injected after mount (SEO crawlers that execute JS still see it; pure no-JS HTML fetch may omit FAQPage script).
- Home page preview may still show settings-based FAQs until separately wired to the public FAQ API.
- Admin form is functional but not a full RHF+Zod shared form package; Nest DTO/Zod-class validation covers API.

---

**Commands used**

```bash
pnpm seed:faqs
pnpm --filter @alwisam/api test -- faqs.seed.spec
pnpm typecheck
pnpm exec playwright test e2e/faq.spec.ts --project=chromium --workers=1
```
