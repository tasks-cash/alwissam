# Feature Matrix

**Source of truth:** Application source under `src/` and `prisma/`. Status reflects runtime UI/API behavior, not schema alone.

Status legend:
- `complete` — user-visible workflow works with real DB
- `partial` — schema and/or API exist; UI incomplete or limited
- `stub` — empty-state / placeholder page only
- `schema_only` — Prisma model exists without working product surface
- `unimplemented` — declared (env/constants) without working sender/enforcer

| Feature ID | Module | Feature | Current Implementation | User Roles | Required Permission (declared) | Pages | APIs | Database Models | Side Effects | Target Implementation | Status | Tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FEATURE-001 | Auth | Staff login | `POST /api/auth/login` portal=staff; session cookie; lockout; secretary shift gate | SECRETARY, DOCTOR_*, ADMIN | n/a (role) | `/staff/login` | API-auth-login | User, Session, LoginHistory, SecretaryProfile | Audit/history | NestJS AuthModule cookie session parity | complete | none |
| FEATURE-002 | Auth | Patient login | portal=patient | PATIENT | n/a | `/patient/login` | login | User, Session | — | Same | complete | none |
| FEATURE-003 | Auth | Logout | POST logout revokes session | All auth | n/a | dashboards | logout | Session | revoke | NestJS | complete | none |
| FEATURE-004 | Auth | Password reset | POST request + PUT confirm; anti-enumeration | Public | n/a | `/forgot-password`, `/reset-password` | password-reset | PasswordResetToken, User | token hash | NestJS | complete | none |
| FEATURE-005 | Auth | Account activation | Token activate | Public / PATIENT | n/a | `/activate-account` | activate | ActivationToken, User, PatientAccount | activate | NestJS | complete | none |
| FEATURE-006 | Auth | Patient QR login | GET sets session via `qrAccessToken` | PATIENT | n/a | `/patient/qr/[token]` | QR route | PatientAccount, Session | session create | NestJS | complete | none |
| FEATURE-007 | Auth | 2FA | Schema fields only | — | — | — | — | User.twoFactor* | — | Optional later; not current product | schema_only | none |
| FEATURE-008 | Auth | CSRF | Header vs session token on mutating APIs | Auth writers | n/a | forms | most mutating APIs | Session.csrfToken | 403 on mismatch | NestJS guards | complete | none |
| FEATURE-009 | Auth | Rate limiting | Redis + memory fallback | Public | n/a | login, public book | login, public appointments | Redis keys | throttle | Preserve Redis | complete | none |
| FEATURE-010 | RBAC | Role assignment | User.roleId; seed 5 roles | ADMIN owner | manage_roles (declared unused) | staff CRUD pages | admin doctors/secretaries | Role, User | — | Preserve role checks; optionally enforce DB perms | complete (role) / unimplemented (granular) | none |
| FEATURE-011 | RBAC | Permission tables | Seed ADMIN RolePermission | ADMIN | list in permissions.ts | stub admin pages | none using requirePermission | Permission, RolePermission, UserPermission | seed only | Decide: enforce or document role-only | unimplemented runtime | none |
| FEATURE-012 | Public | Marketing pages | Server render + ClinicSetting CMS | Public | n/a | `/`, about, services, faq, contact, doctors, orthodontics, surgery | — | ClinicSetting, Doctor, Service | — | Next apps/web | complete | none |
| FEATURE-013 | Public | Walk-in / register | PublicRegisterForm → API | Public | n/a | `/` `#register` (redirects from book/register) | public appointments | AppointmentRequest, Patient? | Redis publish | Nest + web | complete | none |
| FEATURE-014 | Secretary | Reception dashboard | Live queues, walk-in, request bars | SECRETARY, ADMIN | manage_appointments (declared) | `/secretary/dashboard` | walk-in, appointments, etc. | AppointmentRequest, WaitingRoomEntry, Appointment | audit, publish | Nest domain module | complete | none |
| FEATURE-015 | Secretary | Today / directed / waiting | Real lists + actions | SECRETARY, ADMIN | manage_waiting_room | today, directed; waiting→directed | waiting-room, arrive, check-in | WaitingRoomEntry, Appointment | status transitions | Nest | complete | none |
| FEATURE-016 | Secretary | Payments / invoices create | Payments page live; invoices page stub; invoice API exists | SECRETARY, ADMIN | record_payments | `/secretary/payments` (live), `/secretary/invoices` (stub) | payments, invoices, collect-charge, checkout | Invoice, Payment | audit; never hard-delete payments (void) | Nest billing | partial | none |
| FEATURE-017 | Secretary | Patients list/create | List + CreatePatientForm | SECRETARY, ADMIN | manage_patients | `/secretary/patients` | secretary/patients | Patient | — | Nest | complete | none |
| FEATURE-018 | Secretary | Calendar / schedule / appointments | Live list/detail; schedule API disabled 403 | SECRETARY, ADMIN | manage_appointments | calendar, schedule, appointments | appointments/[id]; schedule-appointment **403** | Appointment* | — | Nest; preserve 403 or restore with product decision | partial | none |
| FEATURE-019 | Secretary | Messages / referrals UI | EmptyState only | SECRETARY, ADMIN | — | messages, referrals | — | Message, Referral | — | Implement only if product requires parity with stubs→empty UX | stub | none |
| FEATURE-020 | Doctor general | Exam queue / patients | Dashboard + patients list + exam panel | DOCTOR_GENERAL | edit_diagnosis etc. (declared) | general dashboard/patients | exam, dental-chart, availability | WaitingRoomEntry, Appointment, Patient | audit | Nest | complete | none |
| FEATURE-021 | Doctor specialist | Exam queue / today / patients | Live | DOCTOR_SPECIALIST, ADMIN | edit_* | specialist dashboard/today/patients | exam, schedule-appointment, patient, refer, ortho-approval, create-patient-account | clinical models | audit | Nest | complete | none |
| FEATURE-022 | Doctor specialist | Staff CRUD | Doctors + secretaries management | clinic owner | manage_doctors/secretaries | specialist doctors/secretaries | admin/* | User, Doctor, SecretaryProfile | soft-delete | Nest | complete | none |
| FEATURE-023 | Doctor specialist | Settings / CMS | Contact, hours, public pages, doctor bios | clinic owner | manage_settings | settings/* | clinic-settings | ClinicSetting, WorkingHour, Doctor | — | Nest | complete | none |
| FEATURE-024 | Doctor specialist | Work log | Staff activity timeline | clinic owner | — | staff/[userId]/activity | — (server Prisma) | AuditLog / appointments | — | Nest | complete | none |
| FEATURE-025 | Doctor | Referrals / surgery / ortho lists / reports | Stub EmptyStates; some APIs (refer, ortho-approval) exist | Doctors | edit_surgery/orthodontics | stub pages | refer-to-general, ortho-approval | Referral, SurgeryCase, OrthodonticCase | — | Port APIs; stub pages remain empty until product asks | partial | none |
| FEATURE-026 | Clinical | Patient record | `/patients/[id]` chart, plans, apts, invoices | Staff roles | manage_patients | `/patients/[id]` | dental-chart, etc. | Patient + related | — | Nest + web | complete | none |
| FEATURE-027 | Clinical | Dental chart | UI + POST API | Doctors | edit_dental_chart | patient record / exam | dental-chart | DentalChart, DentalToothState | audit | Nest | complete | none |
| FEATURE-028 | Clinical | Treatment plans / sessions / prescriptions / prosthetics | Schema + shown on patient record where queried; dedicated portal pages stub | Doctors / PATIENT | — | patient stubs; patients/[id] partial | limited APIs | TreatmentPlan*, Prescription*, ProstheticCase | — | Port data; complete UI where legacy already shows | partial | none |
| FEATURE-029 | Billing | Invoices & payments | Record payment, collect charge, checkout, void semantics | SECRETARY, ADMIN | record_payments | secretary/payments | payments, invoices, checkout, collect-charge | Invoice, Payment, Installment | audit; Decimal money | Nest Decimal128 | complete (ops) / stub (dedicated invoices page) | none |
| FEATURE-030 | Patient portal | Dashboard | Live custom mobile layout | PATIENT | view_own_medical | `/patient/dashboard` | logout | Patient, Appointment | — | Nest + web | complete | none |
| FEATURE-031 | Patient portal | Subpages | Empty “لا توجد بيانات بعد” | PATIENT | — | treatment-plan, sessions, orthodontics, operations, prescriptions, payments, files, profile | — | various | — | Preserve stub parity or implement later | stub | none |
| FEATURE-032 | Admin legacy | Users/roles/permissions/services/reports/audit/backups | Stub pages; redirects for doctors/secretaries/settings | ADMIN | various declared | `/admin/*` | — | Permission* (unused UI) | — | Keep redirects/stubs for route parity | stub/redirect | none |
| FEATURE-033 | Files | Upload | API only; no page UI consumer found | Any authenticated | — | none functional | files/upload | MedicalDocument | disk write, audit | Nest files; **add ownership checks** | partial + insecure | none |
| FEATURE-034 | Files | Download / signed URLs | Env secret unused; no route | — | — | — | — | — | — | Implement securely if product needs | unimplemented | none |
| FEATURE-035 | Realtime | SSE stream | Any authenticated user gets clinic counts | Any auth | — | **no frontend consumer found** | realtime/stream | AppointmentRequest, WaitingRoomEntry | — | Nest SSE; restrict by role | partial | none |
| FEATURE-036 | Notifications | In-app + templates | Models + seed templates; limited create | varies | — | — | — | Notification, NotificationTemplate | — | Nest notifications | partial | none |
| FEATURE-037 | Notifications | Email/SMS/WhatsApp | Env only | — | — | — | — | — | — | Only if wiring product requires | unimplemented | none |
| FEATURE-038 | Print | window.print credentials/card | Client print | Staff | — | embedded in components | — | — | print dialog | Preserve; not PDF | complete (print only) | none |
| FEATURE-039 | Reports/PDF/Export | — | Stub pages; no PDF/CSV libs used | — | view_all_reports | report stubs | — | — | — | Do not invent; stub parity | stub / unimplemented | none |
| FEATURE-040 | Audit | Mutation audit log | writeAudit on many APIs | system | view_audit_logs (UI stub) | admin audit stub | many APIs | AuditLog | append-only | Nest audit | complete (write) / stub (UI) | none |

## Migration note

Target NestJS/Next must reproduce **complete** features first. **Stub** routes must remain inventoried and either stay as empty-state parity or gain real data only if product behavior required—do not mark stubs “migrated complete” without functionality.
