# Admin Dashboard Modes — Exact Feature Lists

**Stack (mandatory):** Next.js → NestJS → MongoDB/Mongoose (pnpm).  
**Not used:** Prisma, PostgreSQL, Next.js business API routes as backend of record.

**Rule:** One shared Owner/Specialist shell. Modes change **sidebar/header density + overview cards only**. Same APIs, auth, permissions, and management routes.

Legacy `ALWISSAM_COMPLETE_DASHBOARD_SPECIFICATION` (Prisma monolith) is **historical product intent**. Feature lists below map that daily-ops intent onto **routes that exist in this Nest monorepo**. Missing legacy surfaces (reception hub tabs, exam board, staff chat widget) are backlog — not fake sidebar links.

---

## الوضع الخفيف (`light`)

Essential **daily clinic management** for Admin/Owner (`ADMIN*` / specialist board):

| Arabic label | Route | Purpose |
|--------------|-------|---------|
| نظرة عامة | `/doctor/specialist/dashboard` | Daily summary |
| إدارة الأطباء | `/doctor/specialist/doctors` | Doctors CRUD |
| إدارة السكرتارية | `/doctor/specialist/secretaries` | Secretaries CRUD |
| دعوات الطاقم | `/doctor/specialist/invitations` | Staff invitations |
| إدارة المرضى | `/secretary/patients` | Patients |
| إدارة المواعيد | `/secretary/appointments` | Appointments |
| مواعيد اليوم | `/secretary/today` | Today’s schedule |
| قائمة الانتظار | `/secretary/directed` | Today’s queue |
| طلبات الحجز والتعيين | `/secretary/assignment-queue` | Booking / doctor assignment |
| إعدادات العيادة الأساسية | `/doctor/specialist/settings` | Essential clinic settings |
| تسجيل الخروج | shell action | Logout |

**Overview (light):** daily counts only — appointments today, waiting, in treatment, completed today, pending requests, active doctors, active secretaries + light module cards + daily quick actions.

**Not shown in light sidebar/overview:** payments, public CMS, FAQs/reviews/experiences/before-after, audit logs, secretary/general alternate dashboards.

**Not invented (no route yet):** staff chat, notification inbox, nested contact/hours settings pages like legacy `/settings/contact`.

---

## الوضع الشامل (`full`)

Everything in **light**, plus:

| Arabic label | Route |
|--------------|-------|
| لوحة الاستقبال | `/secretary/dashboard` |
| لوحة الطبيب العام | `/doctor/general/dashboard` |
| المدفوعات | `/secretary/payments` |
| تجارب المرضى | `/doctor/specialist/public-content/patient-experiences` |
| قبل وبعد | `/doctor/specialist/public-content/before-after` |
| التخصصات | `/doctor/specialist/public-content/specialties` |
| الخدمات | `/doctor/specialist/public-content/services` |
| الأسئلة الشائعة | `/doctor/specialist/public-content/faqs` |
| المراجعات | `/doctor/specialist/public-content/reviews` |
| سجلات التدقيق | `/doctor/specialist/audit-logs` |

**Overview (full):** light stats + patient totals / week / month, unavailable doctors, cancelled / no-show today, recent audit activity, all module cards.

---

## Source of truth in code

- Nav lists: `apps/web/lib/navigation.ts` → `ADMIN_LIGHT_HREFS` / `ADMIN_FULL_EXTRA_HREFS`
- Summary modules: `apps/api/src/dashboard/dashboard.service.ts` → `lightModules()` / `fullModules()`
- Preference: `User.adminDashboardMode` + `GET|PATCH /api/admin/preferences*`
- Switcher: `DashboardShell` (Admin/Owner / specialist only)

---

## Persistence

- Backend field wins when present.
- `localStorage` key `alwisam_admin_dashboard_mode` is fallback only.
- Mode never weakens Nest guards or JWT sessions.
