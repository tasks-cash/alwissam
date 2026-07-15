# Missing Required Features

**Updated:** 2026-07-14

## P0 — Core operations

| # | Feature | Status |
| --- | --- | --- |
| 1 | Patients Mongo + Nest CRUD + secretary UI | DONE |
| 2 | Appointments + status + Nest APIs | DONE |
| 3 | Waiting room check-in / call / start / complete | DONE |
| 4 | Secretary dashboard / today / directed / appointments / patients | DONE |
| 5 | Doctor general/specialist dashboards (schedule + waiting) | DONE (exam panel partial — not full clinical chart yet) |
| 6 | Shared patients/[id] clinical summary | MISSING |
| 7 | Patient dashboard after login | DONE |
| 8 | Role-aware DashboardShell | DONE |
| 9 | PermissionGuard on Nest mutating routes | DONE |
| 10 | Audit writes on mutations | DONE |
| 11 | Owner dashboard real stats | DONE |

## P1 — Admin / settings / security / finance / CMS

1. Clinic settings + contact/hours/public pages — MISSING  
2. Roles & permissions management UI — MISSING  
3. Audit logs list UI — MISSING  
4. Active sessions list + revoke UI — MISSING  
5. Payments + invoices — MISSING  
6. File upload with ownership checks — MISSING  
7. Activate-account + patient account creation — MISSING  
8. Staff activity timeline — MISSING  
9. Full i18n for CRUD forms — PARTIAL  
10. Full JWT validation in middleware (cookie presence only today) — PARTIAL  

## P2 — Enhancements

Global search, reports, notifications, SSE waiting, public CMS, QR login, dashboard personalization — MISSING  

## Deferred

Live Email/SMS/WhatsApp, PDF/CSV export buttons, fake charts, refund workflow until payment model complete.
