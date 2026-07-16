# Admin Dashboard Modes — Clarification (Nest + Mongo)

**Stack (mandatory for this workspace):** Next.js → NestJS → MongoDB/Mongoose · pnpm 9.15.9  

**Auth (this project):** JWT access + rotating refresh cookies (`alwisam_access` / `alwisam_refresh`), not legacy Prisma opaque sessions.

Do **not** treat the pasted Postgres/Prisma “ALWISSAM_COMPLETE_DASHBOARD_SPECIFICATION” as the live database or route map. Use it only as historical product intent. Live Admin UI is under `/[locale]/doctor/specialist/*` plus shared secretary ops routes.

---

## Rule

| Mode | Arabic | Behavior |
|------|--------|----------|
| Light | `الوضع الخفيف` | Sidebar + overview show **only** essential daily management modules |
| Full | `الوضع الشامل` | Everything in light **plus** every other authorized management module that exists |

- One `DashboardShell` — **no second Admin app**
- Same Nest APIs, Mongo data, JWT/RBAC, and page routes
- Difference = navigation density + overview cards/modules only

---

## Light (daily essentials) — live Nest routes

| Module | Route |
|--------|-------|
| Overview / معاينة | `/doctor/specialist/dashboard` |
| Doctors | `/doctor/specialist/doctors` |
| Secretaries | `/doctor/specialist/secretaries` |
| Invitations (add staff) | `/doctor/specialist/invitations` |
| Essential settings | `/doctor/specialist/settings` |
| Patients | `/secretary/patients` |
| Appointments | `/secretary/appointments` |
| Today / day board | `/secretary/today` |
| Waiting queue | `/secretary/directed` |
| Booking assignment | `/secretary/assignment-queue` |

Source of truth: `ADMIN_LIGHT_HREFS` in `apps/web/lib/navigation.ts` (mirrored by `lightModules()` in Nest dashboard service).

**Not in light (no live Admin route / do not invent):** dedicated notifications inbox, staff-chat page, patient–doctor messaging CMS, Prisma-only pages.

---

## Full extras (authorized + implemented)

| Module | Route |
|--------|-------|
| Reception hub | `/secretary/dashboard` |
| General doctor board | `/doctor/general/dashboard` |
| Payments | `/secretary/payments` |
| Patient experiences CMS | `/doctor/specialist/public-content/patient-experiences` |
| Before/After CMS | `/doctor/specialist/public-content/before-after` |
| Specialties CMS | `/doctor/specialist/public-content/specialties` |
| Services CMS | `/doctor/specialist/public-content/services` |
| FAQs CMS | `/doctor/specialist/public-content/faqs` |
| Reviews CMS | `/doctor/specialist/public-content/reviews` |
| Audit logs | `/doctor/specialist/audit-logs` |

Source: `ADMIN_FULL_EXTRA_HREFS` + light set.

---

## Preferences

- `User.adminDashboardMode`: `light` | `full` (default `light`)
- `GET /api/admin/preferences`
- `PATCH /api/admin/preferences/dashboard-mode`
- Also exposed on `GET /api/auth/me`
- Header/sidebar switch visible only to Admin/Owner / specialist clinic owner roles
