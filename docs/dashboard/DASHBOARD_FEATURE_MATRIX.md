# Dashboard Feature Matrix

**Updated:** 2026-07-14

Classification: EXISTING_WORKING | EXISTING_BROKEN | EXISTING_PARTIAL | REQUIRED_MISSING | RECOMMENDED | NOT_APPLICABLE | UNVERIFIED

| Feature ID | Module | Feature | Existing/Proposed | Current Status | Roles | Pages | APIs | Collections | Priority | Implementation Status | Test Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FEATURE-001 | Auth | Staff JWT login | Existing | EXISTING_WORKING | staff | PAGE-T002 | POST /api/auth/login | users, sessions | P0 | done | partial |
| FEATURE-002 | Auth | Patient JWT login | Existing | EXISTING_PARTIAL | PATIENT | PAGE-T003 | POST /api/auth/login | users, sessions | P0 | login done; portal missing | not_run |
| FEATURE-003 | Auth | Refresh rotation | Existing | EXISTING_WORKING | all | — | POST /api/auth/refresh | sessions | P0 | done | not_run |
| FEATURE-004 | Auth | Logout revoke | Existing | EXISTING_WORKING | all | LogoutButton | POST /api/auth/logout | sessions | P0 | done | not_run |
| FEATURE-005 | Auth | Forgot/reset password | Existing | EXISTING_PARTIAL | all | T004–T005 | password-reset/* | password_reset_tokens | P1 | DB tokens only; no email | not_run |
| FEATURE-006 | Auth | Change password | Existing | EXISTING_WORKING | auth user | — | POST /api/auth/change-password | users | P1 | API done; no UI page | not_run |
| FEATURE-007 | Auth | Locale preference | Existing | EXISTING_WORKING | auth user | LanguageSwitcher | PATCH /api/auth/locale | users | P0 | done | not_run |
| FEATURE-008 | Staff | Doctor CRUD | Existing | EXISTING_WORKING | owner | PAGE-T007 | /api/admin/doctors | users | P0 | done | partial |
| FEATURE-009 | Staff | Secretary CRUD | Existing | EXISTING_WORKING | owner | PAGE-T008 | /api/admin/secretaries | users | P0 | done | partial |
| FEATURE-010 | Staff | Working hours editor | Legacy+partial | EXISTING_PARTIAL | owner | T007 / legacy | secretaries fields | users.secretary | P1 | fields on secretary create; full hours editor missing | not_run |
| FEATURE-011 | Dashboard | Owner KPI overview | Proposed | REQUIRED_MISSING | owner | PAGE-T006 | dashboard stats API needed | users + future | P0 | not started | not_run |
| FEATURE-012 | Dashboard | Secretary reception | Legacy | REQUIRED_MISSING | SECRETARY | T009+ | walk-in, requests | patients, appointments | P0 | not started | not_run |
| FEATURE-013 | Dashboard | Doctor exam queue | Legacy | REQUIRED_MISSING | doctors | T017–T019 | exam API | waiting_room, appointments | P0 | not started | not_run |
| FEATURE-014 | Dashboard | Patient home | Legacy | REQUIRED_MISSING | PATIENT | T021 | patient APIs | appointments | P0 | not started | not_run |
| FEATURE-015 | Patients | Register/list/edit patient | Legacy | REQUIRED_MISSING | SECRETARY+, doctors | T014, T020 | patients CRUD | patients | P0 | not started | not_run |
| FEATURE-016 | Appointments | Create/list/status transitions | Legacy | REQUIRED_MISSING | staff | multiple | appointments/* | appointments | P0 | not started | not_run |
| FEATURE-017 | Appointments | Public booking request | Legacy | REQUIRED_MISSING | public | home | public/appointments | appointment_requests | P0 | not started | not_run |
| FEATURE-018 | Waiting | Waiting queue ops | Legacy | REQUIRED_MISSING | SECRETARY, doctors | T011 | waiting-room | waiting_room_entries | P0 | not started | not_run |
| FEATURE-019 | Clinical | Dental chart | Legacy | REQUIRED_MISSING | doctors | T020 | medical/dental-chart | dental_charts | P1 | not started | not_run |
| FEATURE-020 | Clinical | Exam start/complete | Legacy | REQUIRED_MISSING | doctors | dashboards | doctor/exam | appointments, invoices | P0 | not started | not_run |
| FEATURE-021 | Finance | Payments/invoices | Legacy | REQUIRED_MISSING | SECRETARY, owner | T015 | payments/invoices | invoices, payments | P1 | not started | not_run |
| FEATURE-022 | Finance | Refunds | Proposed | RECOMMENDED | owner | — | — | — | P2 | N/A until rules defined | — |
| FEATURE-023 | RBAC | Dynamic roles UI | Legacy stub | REQUIRED_MISSING | ADMIN | T028 | roles APIs | roles, permissions | P1 | schema TBD; keys hardcoded | not_run |
| FEATURE-024 | RBAC | Permission enforcement | Existing gap | EXISTING_BROKEN | all APIs | — | guards | users.permissions | P0 | keys returned only | not_run |
| FEATURE-025 | Audit | Immutable audit feed | Partial | EXISTING_PARTIAL | owner | T027 | audit + LOGIN only | audit_logs | P0 | login only | not_run |
| FEATURE-026 | Security | Active sessions UI | Proposed | REQUIRED_MISSING | owner/self | T031 | sessions list/revoke | sessions | P1 | not started | not_run |
| FEATURE-027 | CMS | Public pages content | Legacy | REQUIRED_MISSING | owner | T022–T025 / public | clinic-settings | clinic_settings | P1 | not started | not_run |
| FEATURE-028 | i18n | ar/en/fr dictionaries | Existing | EXISTING_PARTIAL | all | all | — | users.locale | P0 | partial coverage | not_run |
| FEATURE-029 | UX | Dashboard shell + sidebar | Proposed | REQUIRED_MISSING | staff | all dashboards | — | — | P0 | AppChrome only | not_run |
| FEATURE-030 | Search | Global search | Proposed | RECOMMENDED | staff | T032 | search API | indexed fields | P2 | not started | not_run |
| FEATURE-031 | Reports | Mongo aggregations | Legacy stubs | RECOMMENDED | owner | T033 | reports | aggregates | P2 | not started | not_run |
| FEATURE-032 | Notify | In-app notifications | Legacy model | RECOMMENDED | staff | — | notifications | notifications | P2 | not started | not_run |
| FEATURE-033 | Notify | Email/SMS/WhatsApp | Env only | NOT_APPLICABLE | — | — | — | — | — | no providers wired | — |
| FEATURE-034 | Files | Upload medical documents | Legacy | REQUIRED_MISSING | staff | patient files | files/upload | file_attachments | P1 | not started | not_run |
| FEATURE-035 | Print | Print credentials | Legacy | REQUIRED_MISSING | doctors | cards | — | — | P1 | not started | not_run |
| FEATURE-036 | PDF/Export | PDF/CSV export | — | NOT_APPLICABLE | — | — | — | — | — | none in legacy UI | — |
| FEATURE-037 | QR | Patient QR login | Legacy | REQUIRED_MISSING | PATIENT | qr route | qr handler | patient accounts | P1 | not started | not_run |
| FEATURE-038 | Realtime | Waiting queue stream | Legacy SSE | RECOMMENDED | staff | — | realtime/stream | — | P2 | not started | not_run |
| FEATURE-039 | Customization | Widget layout prefs | Proposed | RECOMMENDED | owner | dashboard | preferences | user_prefs | P3 | not started | not_run |

## Counts

| Class | Count |
| --- | ---: |
| EXISTING_WORKING | 7 |
| EXISTING_PARTIAL | 5 |
| EXISTING_BROKEN | 1 |
| REQUIRED_MISSING | 18 |
| RECOMMENDED | 6 |
| NOT_APPLICABLE | 2 |
