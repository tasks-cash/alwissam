# Form Inventory

**Audited:** 2026-07-14  
**Active product UI:** legacy `src/` (Next.js App Router)  
**Target stack:** `apps/web` (Next.js) + `apps/api` (NestJS + MongoDB)  
**Target form coverage:** **0** product forms wired in `apps/web`

Status key:

| Status | Meaning |
| --- | --- |
| `WORKS_IN_LEGACY` | Functional against legacy `/api` (often Prisma; login uses Mongo) |
| `MISSING_IN_TARGET` | Not implemented in `apps/web` / Nest domain modules |
| `BROKEN_CONTRACT` | FE/BE contract mismatch or dual-store risk |
| `STUB` | Empty shell, redirect, or orphaned unused component |
| `SCAFFOLD_ONLY` | Target scaffold placeholder |

---

## Summary

| Metric | Count |
| --- | --- |
| Product forms identified (FORM-001+) | **34** |
| Target scaffold (FORM-000 / shared schema) | **2** |
| NestJS DTOs present | **1** (`LoginDto`) |
| Nest Mongo schemas present | **2** (`User`, `Session`) |
| Forms fully migrated to Nest + Mongo + apps/web | **0** |
| Orphaned / unused form components | **7** |
| Stub empty pages (no form) | **25** |

---

## Target stack

| Form ID | Module | Page | Create/Edit/Login | Fields | API | DTO | MongoDB Schema | Status | Browser Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FORM-000 | scaffold | `apps/web/app/page.tsx` | Other | none | GET `/health` link | — | — | SCAFFOLD_ONLY | Not a product form |
| FORM-SV-001 | auth | `packages/shared-validation` `loginSchema` | Login | identifier*; password* | intended `POST /api/auth/login` | LoginDto exists | User, Session | SCAFFOLD_ONLY / BROKEN_CONTRACT | Shared schema password `min(1)`; Nest `min(6)`; not used by `apps/web` |

---

## Auth

| Form ID | Module | Page | Create/Edit/Login | Fields | API | DTO | MongoDB Schema | Status | Browser Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FORM-001 | auth | `/staff/login` `src/app/staff/login/page.tsx` | Login | email/phone*; password*; rememberMe | `POST /api/auth/login` | Nest LoginDto + legacy zod | Nest User/Session (legacy login uses Mongo models) | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-002 | auth | `/patient/login` | Login | identifier*; password* | `POST /api/auth/login` | Nest LoginDto | User/Session | WORKS_IN_LEGACY / MISSING_IN_TARGET | No show/hide password |
| FORM-003 | auth | `/forgot-password` | Reset request | identifier* | `POST /api/auth/password-reset` | none in Nest | none (Prisma User) | WORKS_IN_LEGACY / BROKEN_CONTRACT / MISSING_IN_TARGET | Dual-store vs Mongo login |
| FORM-004 | auth | `/reset-password` | Reset | token*; password* (≥8) | `PUT /api/auth/password-reset` | none | none (Prisma) | WORKS_IN_LEGACY / BROKEN_CONTRACT / MISSING_IN_TARGET | Always redirects staff login |
| FORM-005 | auth | `/activate-account` | Activate | token*; password* (≥8) | `POST /api/auth/activate` | none | none (Prisma) | WORKS_IN_LEGACY / MISSING_IN_TARGET | No confirm-password |
| FORM-006 | auth | DashboardShell / patient dashboard | Logout | — | `POST /api/auth/logout` | none | Session | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |

---

## Public / appointment intake

| Form ID | Module | Page | Create/Edit/Login | Fields | API | DTO | MongoDB Schema | Status | Browser Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FORM-007 | appointment | `/` `#register` `PublicRegisterForm` | Create | firstName*; lastName*; phone* (≥8); appointmentType*; consent* | `POST /api/public/appointments` | none | none (Prisma) | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-008 | appointment | `/register`, `/book-appointment` | Other | — | redirect | — | — | STUB | Redirect only |

---

## Doctor / secretary staff management

| Form ID | Module | Page | Create/Edit/Login | Fields | API | DTO | MongoDB Schema | Status | Browser Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FORM-009 | doctor | `/doctor/specialist/doctors` `CreateDoctorForm` | Create | fullName*; email*; phone*; type*; specialtyAr; password* (≥8) | `POST /api/admin/doctors` | none | none (Prisma) | WORKS_IN_LEGACY / MISSING_IN_TARGET | Password required on create |
| FORM-010 | doctor | same → `EditDoctorLoginForm` | Edit | email; phone; newPassword (optional ≥8) | `PATCH /api/admin/doctors` | none | none (Prisma) | WORKS_IN_LEGACY / MISSING_IN_TARGET | Expand panel, not modal |
| FORM-011 | doctor | `DoctorStaffBar` / settings hours `WorkingHoursEditor` | Edit | day active + start/end | `PUT /api/admin/clinic-settings` working_hours | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-012 | doctor | `DeleteDoctorButton` | Delete | confirm | `DELETE /api/admin/doctors` | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | `window.confirm` only |
| FORM-013 | secretary | `/doctor/specialist/secretaries` `CreateSecretaryForm` | Create | fullName*; email*; phone*; shiftCode*; password* (≥8) | `POST /api/admin/secretaries` | none | none (Prisma) | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-014 | secretary | `SecretaryHoursBar` edit login | Edit | email; phone; newPassword optional | `PATCH /api/admin/secretaries` section=login | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Password input lacks HTML minLength |
| FORM-015 | secretary | `SecretaryHoursBar` hours | Edit | shift / custom start-end | `PATCH` section=hours | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Instant preset save |
| FORM-016 | secretary | `DeleteSecretaryButton` | Delete | confirm | `DELETE /api/admin/secretaries` | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | `window.confirm` |

---

## Settings

| Form ID | Module | Page | Create/Edit/Login | Fields | API | DTO | MongoDB Schema | Status | Browser Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FORM-017 | settings | `/doctor/specialist/settings/contact` | Edit | nameAr, phone, email, address, mapsLink, mapsEmbedUrl | `PUT /api/admin/clinic-settings` contact | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-018 | settings | settings/doctors `DoctorDisplayForm` | Edit | specialtyAr, bioAr | section=doctor_profile | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-019 | settings | settings/pages `PublicPagesContentForm` | Edit | aboutAr; services[]; faqs[] | section=public_pages | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-020 | settings | `ClinicInfoForm.tsx` | Edit | clinic info fields | section=clinic_info | none | none | STUB / MISSING_IN_TARGET | **Orphaned** — not imported |
| FORM-021 | settings | `StaffLoginForm.tsx` | Edit | email, phone, currentPassword, newPassword | `PATCH /api/staff/profile` | none | none | STUB / MISSING_IN_TARGET | Account pages redirect away |

---

## Secretary clinical / payments

| Form ID | Module | Page | Create/Edit/Login | Fields | API | DTO | MongoDB Schema | Status | Browser Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FORM-022 | secretary | dashboard `SecretaryWalkInForm` | Create | fullName*; phone*; age; city | `POST /api/secretary/walk-in` | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | age uses `type=number` |
| FORM-023 | patient | `/secretary/patients` `CreatePatientForm` | Create | fullName*; phone*; email; age; gender; city; notes | `POST /api/secretary/patients` | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | age `type=number` |
| FORM-024 | appointment | `/secretary/schedule` `SecretaryScheduleForm` | Create/Edit | q; patientId*; doctorId*; date*; time* | `POST`/`PATCH /api/secretary/schedule-appointment` | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-025 | appointment | appointments/[id] `AppointmentActions` | Review | doctorId*; note | `POST /api/secretary/appointments/:id` | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-026 | appointment | dashboard `SecretaryRequestBar` | Direct/Remove | doctorId when directing | same appointments API | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Inline expand + confirm remove |
| FORM-027 | payment | `/secretary/payments` `CollectDoctorChargeForm` | Collect | method* | `POST /api/secretary/collect-charge` | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Pending target |
| FORM-028 | payment | `RecordPaymentForm.tsx` | Create | invoiceId*; amount*; method*; notes | `POST /api/secretary/payments` | none | none | STUB / MISSING_IN_TARGET | Orphaned |
| FORM-029 | payment | `PostVisitCheckout.tsx` | Checkout | coverage, amount?, method, note | `POST /api/secretary/checkout` | none | none | STUB / MISSING_IN_TARGET | Only used via orphaned waiting-room UI |
| FORM-030 | appointment | `WaitingRoomActions.tsx` | Status | action buttons | `POST /api/secretary/waiting-room/:id` | none | none | STUB / MISSING_IN_TARGET | Unused after redirect |

---

## Doctor clinical

| Form ID | Module | Page | Create/Edit/Login | Fields | API | DTO | MongoDB Schema | Status | Browser Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FORM-031 | doctor | dashboards `DoctorExamPanel` **dialog** | Exam | covered; amount if unpaid; note | `POST /api/doctor/exam` | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Overlay dialog; amount `type=number` |
| FORM-032 | doctor | patients `DoctorPatientCard` panels | Edit / account / schedule | patient fields; login; newPassword; schedule | doctor patient / schedule / account APIs | none | none | WORKS_IN_LEGACY / MISSING_IN_TARGET | Multi-panel; confirm dialogs |
| FORM-033 | doctor | `SpecialistPatientRow.tsx` | Create account | patientId prop | `POST /api/doctor/create-patient-account` | none | none | STUB / MISSING_IN_TARGET | Orphaned |
| FORM-034 | doctor | `OrthoApprovalActions.tsx` | Approve/Reject | buttons | `POST /api/doctor/ortho-approval` | none | none | STUB / MISSING_IN_TARGET | Orphaned |

---

## Password / phone notes (inventory findings)

| Rule expected by product brief | Current state |
| --- | --- |
| Password required on account create | Present on FORM-009 / FORM-013 create; Nest create DTOs missing |
| Password optional on edit; empty ignored | Mostly true on FORM-010 / FORM-014 / FORM-032 |
| Show/hide password | Staff login only; missing on patient login & many create/edit password fields |
| Confirm password on create/reset | Missing on FORM-005 / FORM-009 / FORM-013 / reset |
| Phone digits-only (`type=tel`, not `type=number`) | Phone fields typically text/tel; **age/amount** use `type=number` in several forms |
| Dual create/update DTOs | Nest only has `LoginDto` — Create/Update Doctor/Secretary DTOs absent |

---

## Next actions for forms

1. Fix shared validation parity (STEP 3) before wiring `apps/web`.
2. Migrate auth forms first (STEP 4) onto Nest `AuthModule` + Mongo only.
3. Implement Create/Update DTOs and pages for doctors/secretaries (STEPS 5–7).
4. Do not mark any FORM-* as migrated until browser test against Nest + Mongo passes.
