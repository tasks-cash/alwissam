# Dashboard Page Inventory

**Updated:** 2026-07-14  
Routes use `/{locale}/…` where `locale ∈ {ar,en,fr}` unless noted.

Status values: `EXISTING_WORKING` | `EXISTING_BROKEN` | `EXISTING_PARTIAL` | `REQUIRED_MISSING` | `RECOMMENDED` | `NOT_APPLICABLE` | `UNVERIFIED`

## Target pages (apps/web)

| Page ID | Current Route | Page Name | Role | Permission | Existing Status | APIs | MongoDB Collections | Forms | Actions | Required Fix | Test Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PAGE-T001 | `/{locale}` | Public home | Public | — | EXISTING_WORKING | none | — | none | links | add public booking when patients API exists | not_run |
| PAGE-T002 | `/{locale}/staff/login` | Staff login | Public | — | EXISTING_WORKING | POST /api/auth/login | users, sessions | login | submit | none critical | partial (API HTTP) |
| PAGE-T003 | `/{locale}/patient/login` | Patient login | Public | — | EXISTING_PARTIAL | POST /api/auth/login | users, sessions | login | submit | create patient dashboard destination | not_run |
| PAGE-T004 | `/{locale}/forgot-password` | Forgot password | Public | — | EXISTING_PARTIAL | POST /api/auth/password-reset | password_reset_tokens | identifier | submit | wire notifier or keep documented dev-only | not_run |
| PAGE-T005 | `/{locale}/reset-password` | Reset password | Public | — | EXISTING_WORKING | POST /api/auth/reset-password | password_reset_tokens, users | password | submit | i18n strings | not_run |
| PAGE-T006 | `/{locale}/doctor/specialist/dashboard` | Owner/specialist dashboard | ADMIN, DOCTOR_SPECIALIST | manage_* | EXISTING_PARTIAL | me, admin/doctors, admin/secretaries | users | none | nav links | real KPIs, activity, quick actions, shell | not_run |
| PAGE-T007 | `/{locale}/doctor/specialist/doctors` | Manage doctors | clinic owner | manage_doctors | EXISTING_WORKING | CRUD /api/admin/doctors | users | create/edit | CRUD | shell nav, audit, i18n | partial |
| PAGE-T008 | `/{locale}/doctor/specialist/secretaries` | Manage secretaries | clinic owner | manage_secretaries | EXISTING_WORKING | CRUD /api/admin/secretaries | users | create/edit | CRUD | shell nav, audit, i18n | partial |

## Required missing target pages (must exist for production parity)

| Page ID | Intended Route | Page Name | Role | Source / legacy ref | Existing Status | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| PAGE-T009 | `/{locale}/secretary/dashboard` | Secretary dashboard | SECRETARY, ADMIN | PAGE-016 | REQUIRED_MISSING | P0 |
| PAGE-T010 | `/{locale}/secretary/today` | Secretary today | SECRETARY, ADMIN | PAGE-017 | REQUIRED_MISSING | P0 |
| PAGE-T011 | `/{locale}/secretary/directed` | Waiting queue | SECRETARY, ADMIN | PAGE-018 | REQUIRED_MISSING | P0 |
| PAGE-T012 | `/{locale}/secretary/appointments` | Appointment requests | SECRETARY, ADMIN | PAGE-022 | REQUIRED_MISSING | P0 |
| PAGE-T013 | `/{locale}/secretary/appointments/[id]` | Request detail | SECRETARY, ADMIN | PAGE-023 | REQUIRED_MISSING | P0 |
| PAGE-T014 | `/{locale}/secretary/patients` | Patients list | SECRETARY, ADMIN | PAGE-024 | REQUIRED_MISSING | P0 |
| PAGE-T015 | `/{locale}/secretary/payments` | Payments | SECRETARY, ADMIN | PAGE-019 | REQUIRED_MISSING | P1 |
| PAGE-T016 | `/{locale}/secretary/calendar` | Calendar | SECRETARY, ADMIN | PAGE-020 | REQUIRED_MISSING | P1 |
| PAGE-T017 | `/{locale}/doctor/general/dashboard` | General doctor dashboard | DOCTOR_GENERAL | PAGE-025 | REQUIRED_MISSING | P0 |
| PAGE-T018 | `/{locale}/doctor/specialist/today` | Specialist today | DOCTOR_SPECIALIST, ADMIN | PAGE-028 | REQUIRED_MISSING | P0 |
| PAGE-T019 | `/{locale}/doctor/specialist/patients` | Specialist patients | DOCTOR_SPECIALIST, ADMIN | PAGE-029 | REQUIRED_MISSING | P0 |
| PAGE-T020 | `/{locale}/patients/[id]` | Shared patient record | staff | PAGE-015 | REQUIRED_MISSING | P0 |
| PAGE-T021 | `/{locale}/patient/dashboard` | Patient dashboard | PATIENT | PAGE-014 | REQUIRED_MISSING | P0 |
| PAGE-T022 | `/{locale}/doctor/specialist/settings/contact` | Clinic contact settings | owner | PAGE-032 | REQUIRED_MISSING | P1 |
| PAGE-T023 | `/{locale}/doctor/specialist/settings/hours` | Hours settings | owner | PAGE-033 | REQUIRED_MISSING | P1 |
| PAGE-T024 | `/{locale}/doctor/specialist/settings/pages` | Public CMS | owner | PAGE-034 | REQUIRED_MISSING | P1 |
| PAGE-T025 | `/{locale}/doctor/specialist/settings/doctors` | Public doctor bios | owner | PAGE-035 | REQUIRED_MISSING | P1 |
| PAGE-T026 | `/{locale}/doctor/specialist/staff/[userId]/activity` | Staff activity | owner | PAGE-036 | REQUIRED_MISSING | P1 |
| PAGE-T027 | `/{locale}/admin/audit-logs` | Audit logs | ADMIN | PAGE-060 (was stub) | REQUIRED_MISSING | P1 |
| PAGE-T028 | `/{locale}/admin/roles` | Roles | ADMIN | PAGE-056 | REQUIRED_MISSING | P1 |
| PAGE-T029 | `/{locale}/admin/permissions` | Permissions | ADMIN | PAGE-057 | REQUIRED_MISSING | P1 |
| PAGE-T030 | `/{locale}/admin/users` | Users | ADMIN | PAGE-055 | REQUIRED_MISSING | P1 |
| PAGE-T031 | `/{locale}/security/sessions` | Active sessions | owner/self | new | REQUIRED_MISSING | P1 |
| PAGE-T032 | `/{locale}/search` | Global search | staff | new | RECOMMENDED | P2 |
| PAGE-T033 | `/{locale}/reports/*` | Reports | owner | stubs + schemas | RECOMMENDED | P2 |
| PAGE-T034 | `/{locale}/activate-account` | Activate account | public | PAGE-003 | REQUIRED_MISSING | P1 |
| PAGE-T035 | `/{locale}/about` etc. public CMS pages | Public site | public | PAGE-002–010 | REQUIRED_MISSING | P1 |

## Legacy pages retained as reference (not deleted)

All PAGE-001…PAGE-080 in `docs/migration/PAGE_INVENTORY.md` remain the behavior reference. Redirect-only and EmptyState stubs must not be deleted from legacy until target parity exists; they inform REQUIRED_MISSING vs NOT_APPLICABLE.

## Classification counts (dashboard effort)

| Status | Target count (approx.) |
| --- | ---: |
| EXISTING_WORKING | 5 |
| EXISTING_PARTIAL | 3 |
| REQUIRED_MISSING (P0/P1) | ~25+ |
| RECOMMENDED | several |
| Legacy functional not yet ported | 37 |
