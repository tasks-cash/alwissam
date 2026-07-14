# Database Inventory

**Source of truth:** `prisma/schema.prisma` (PostgreSQL via Prisma)  
**Verified model count:** `rg '^model '` → **50 models** (not 48; any prior claim of 48 is incorrect)  
**Verified enum count:** `rg '^enum '` → **20 enums**  
**Record Count (all models):** not queried (read-only audit; DB access not executed in this phase)  
**ID strategy:** Prisma `@id @default(cuid())` on every model → migrate as MongoDB `ObjectId` primary `_id` **plus** unique `legacyId` (string CUID). Never derive ObjectIds from CUIDs.  
**Money strategy:** All `@db.Decimal(12, 2)` fields → MongoDB **Decimal128** (preserve scale; do not cast to IEEE float/double).

---

## Known schema / runtime caveats

| Caveat | Detail |
| --- | --- |
| `Patient.primaryDoctorId` | Optional `String?` with **no Prisma `@relation` / FK**. Runtime may set it (e.g. checkout / create-patient-account) but there is no referential integrity to `Doctor`. |
| `Referral.status` | Free **`String`** (`@default("PENDING")`), **not** an enum. Do not invent a status enum without an application audit of written values. |
| 2FA fields | `User.twoFactorEnabled`, `User.twoFactorSecret` exist in schema defaults/`String?` but **are unused at runtime** (`src/` has no references to `twoFactor` / 2FA / TOTP). Migrate fields for parity; do not enable auth flows on them without product work. |
| Implicit `onDelete` | Where Prisma omits `onDelete`, PostgreSQL migrations use **Restrict** (delete of parent blocked if children exist). Documented below as `Restrict (implicit)`. |
| Soft-delete | `deletedAt DateTime?` on: `User`, `Patient`, `Appointment`, `MedicalDocument`, `FileAttachment`. |

---

## Domain groupings

| Domain | Models (count) | MongoDB direction |
| --- | --- | --- |
| Identity & auth | User, Role, Permission, RolePermission, UserPermission, Session, LoginHistory, PasswordResetToken, ActivationToken (9) | Reference collections; embed only non-queryable join rows where beneficial |
| Personas | Doctor, SecretaryProfile, Patient, PatientAccount (4) | Reference; 1:1 profile embeds optional |
| Appointments | AppointmentRequest, Appointment, AppointmentStatusHistory, WaitingRoomEntry (4) | Reference workflow; history append-only |
| Clinical | MedicalHistory, MedicalRecord, DentalChart, DentalToothState, Diagnosis (5) | Patient-centric; chart+teeth candidates for embed |
| Treatment / ortho | TreatmentPlan, TreatmentPlanStage, TreatmentSession, OrthodonticCase, OrthodonticSession (5) | Case documents; stages/sessions embed vs ref by growth |
| Surgery / prosthetic / Rx | SurgeryCase, Operation, PostOperationFollowUp, ProstheticCase, Prescription, PrescriptionItem (6) | Case documents; bounded children embed |
| Files / consent | MedicalDocument, PatientConsent, FileAttachment (3) | Metadata + storage path refs |
| Finance | Invoice, Payment, Installment (3) | Reference; Decimal128 money |
| Comms | Notification, Message, NotificationTemplate (3) | Reference |
| Clinic config | Service, DoctorService, WorkingHour, DoctorScheduleException, Holiday, Referral (6) | Reference |
| Platform | AuditLog, ClinicSetting (2) | Append-only audit; key/value settings |

**Total: 50**

---

## Enums (20)

| Enum | Values |
| --- | --- |
| `RoleCode` | `ADMIN`, `SECRETARY`, `DOCTOR_GENERAL`, `DOCTOR_SPECIALIST`, `PATIENT` |
| `Gender` | `MALE`, `FEMALE` |
| `AppointmentStatus` | `NEW_REQUEST`, `UNDER_SECRETARY_REVIEW`, `DOCTOR_ASSIGNED`, `WAITING_DOCTOR_APPROVAL`, `CONFIRMED`, `REMINDER_SENT`, `PATIENT_ARRIVED`, `WAITING_ROOM`, `IN_TREATMENT`, `COMPLETED`, `FOLLOW_UP_REQUIRED`, `RESCHEDULED`, `CANCELLED_BY_PATIENT`, `CANCELLED_BY_CLINIC`, `NO_SHOW`, `EMERGENCY`, `REFERRED_TO_OTHER_DOCTOR` |
| `AppointmentType` | `GENERAL_EXAM`, `EMERGENCY`, `TOOTHACHE`, `CLEANING`, `FILLING`, `EXTRACTION`, `ROOT_CANAL`, `ORTHO_CONSULT`, `ORTHO_FOLLOWUP`, `PROSTHETICS`, `SURGERY_CONSULT`, `SURGERY`, `POST_OP_FOLLOWUP`, `OTHER` |
| `WaitingRoomStatus` | `ARRIVED`, `WAITING`, `WITH_DOCTOR`, `SESSION_DONE`, `NEEDS_FOLLOWUP`, `LEFT` |
| `ToothState` | `HEALTHY`, `DECAY`, `FILLED`, `NEEDS_FILLING`, `ROOT_CANAL`, `CROWN`, `MISSING`, `IMPLANT`, `EXTRACTED`, `FRACTURED`, `INFLAMED`, `UNDER_OBSERVATION` |
| `TreatmentPlanStatus` | `NOT_STARTED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `CANCELLED` |
| `PaymentMethod` | `CASH`, `CARD`, `BANK_TRANSFER`, `OTHER` |
| `PaymentStatus` | `COMPLETED`, `VOIDED` |
| `InvoiceStatus` | `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `VOIDED` |
| `NotificationChannel` | `IN_APP`, `EMAIL`, `SMS`, `WHATSAPP` |
| `NotificationStatus` | `PENDING`, `SENT`, `FAILED`, `READ` |
| `DoctorType` | `GENERAL`, `SPECIALIST` |
| `PatientType` | `REGULAR`, `LONG_TERM` |
| `AccountStatus` | `PENDING`, `ACTIVE`, `INACTIVE`, `LOCKED` |
| `DayOfWeek` | `SUNDAY` … `SATURDAY` |
| `ScheduleExceptionType` | `SPECIAL_WORKING_DAY`, `SPECIAL_CLOSING_DAY`, `VACATION`, `BLOCKED_TIME`, `SURGERY_BLOCK`, `EMERGENCY_OVERRIDE`, `MORNING_CLOSED`, `EVENING_CLOSED` |
| `OrthodonticType` | `METAL_BRACES`, `CERAMIC_BRACES`, `LINGUAL`, `CLEAR_ALIGNERS`, `RETAINER`, `OTHER` |
| `SurgeryStatus` | `PLANNED`, `CONSENT_PENDING`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `COMPLICATED` |
| `RecurrenceFrequency` | `WEEKLY`, `BIWEEKLY`, `MONTHLY`, `CUSTOM` |

**MongoDB note:** Store as strings matching Prisma enum names; validate in NestJS DTOs / Mongoose enums.

---

## Financial Decimal fields → Decimal128

| Model | Fields (`Decimal(12,2)`) |
| --- | --- |
| `TreatmentPlan` | `totalCost`, `paidAmount` |
| `TreatmentPlanStage` | `cost` |
| `OrthodonticCase` | `totalCost`, `remainingAmount` |
| `SurgeryCase` | `totalCost` |
| `Operation` | `cost` |
| `ProstheticCase` | `totalCost` |
| `Invoice` | `totalAmount`, `paidAmount`, `remainingAmount`, `discount` |
| `Payment` | `amount` |
| `Installment` | `amount`, `paidAmount` |
| `Service` | `defaultPrice` |
| `DoctorService` | `customPrice` (optional) |

---

## Soft-delete models

| Model | Field | Notes |
| --- | --- | --- |
| `User` | `deletedAt` | Indexed |
| `Patient` | `deletedAt` | Indexed |
| `Appointment` | `deletedAt` | Not indexed in schema |
| `MedicalDocument` | `deletedAt` | |
| `FileAttachment` | `deletedAt` | |

---

# Model inventory (50)

Convention for each model below:

- **PK:** always `id` (`String` / cuid), mapped to `_id` + `legacyId`
- **Record Count:** not queried (read-only audit; DB access not executed in this phase)
- **Required** = non-optional Prisma field (no `?`); **Optional** = `Type?`
- Relations list FK direction and `onDelete`

---

## 1. User

| | |
| --- | --- |
| **Purpose** | Login identity; role binding; lockout; sessions; audit actor |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `email`, `phone` (both optional but unique when set) |
| **Indexes** | `roleId`, `status`, `deletedAt` |
| **Soft-delete** | `deletedAt` |
| **Financial** | none |
| **MongoDB** | Reference collection `users`. Do not embed sessions/history. |
| **Migration** | Map `legacyId` ← cuid. Preserve `passwordHash`. Carry unused 2FA fields for parity. |

| Field | Type | Req/Opt | Notes |
| --- | --- | --- | --- |
| id | String | required | cuid PK |
| email | String? | optional | `@unique` |
| phone | String? | optional | `@unique` |
| passwordHash | String | required | |
| fullName | String | required | |
| roleId | String | required | FK → Role |
| status | AccountStatus | required | default `ACTIVE` |
| avatarUrl | String? | optional | |
| locale | String | required | default `"ar"` |
| failedLoginCount | Int | required | default `0` |
| lockedUntil | DateTime? | optional | |
| twoFactorEnabled | Boolean | required | default `false`; **unused at runtime** |
| twoFactorSecret | String? | optional | **unused at runtime** |
| lastLoginAt | DateTime? | optional | |
| createdAt | DateTime | required | default `now()` |
| updatedAt | DateTime | required | `@updatedAt` |
| deletedAt | DateTime? | optional | soft-delete |

**Relations**

| Relation | Target | Cardinality | onDelete |
| --- | --- | --- | --- |
| role | Role | N:1 | Restrict (implicit) |
| doctor | Doctor | 1:0..1 | (owned side Cascade on Doctor) |
| secretary | SecretaryProfile | 1:0..1 | (owned side Cascade) |
| patientAccount | PatientAccount | 1:0..1 | (owned side Cascade) |
| sessions | Session[] | 1:N | Cascade from Session |
| loginHistory | LoginHistory[] | 1:N | SetNull from LoginHistory |
| auditLogs | AuditLog[] | 1:N | SetNull from AuditLog |
| notifications | Notification[] | 1:N | Cascade from Notification |
| messagesSent / messagesReceived | Message[] | 1:N | Restrict (implicit) on Message |
| statusChanges | AppointmentStatusHistory[] | 1:N | Restrict (implicit) |
| paymentsCreated / paymentsVoided | Payment[] | 1:N | Restrict (implicit) |
| documentsUploaded | MedicalDocument[] | 1:N | Restrict (implicit) |
| fileAttachments | FileAttachment[] | 1:N | Restrict (implicit) |
| userPermissions | UserPermission[] | 1:N | Cascade |
| passwordResets / activationTokens | tokens | 1:N | Cascade |

**Business rules:** Account lock via `failedLoginCount` / `lockedUntil` / `status=LOCKED`. Soft-delete filters on `deletedAt`. 2FA columns present but unused.

---

## 2. Role

| | |
| --- | --- |
| **Purpose** | Named role keyed by `RoleCode` |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `code` (`RoleCode`) |
| **Indexes** | none beyond unique |
| **MongoDB** | Reference `roles` (small seed collection) |
| **Migration** | `legacyId`; seed by `code` for idempotent upserts |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| id | String | required | cuid |
| code | RoleCode | required | unique |
| nameAr | String | required | |
| description | String? | optional | |
| createdAt / updatedAt | DateTime | required | now / `@updatedAt` |

**Relations:** `users` → User[]; `permissions` → RolePermission[] (Cascade from join).

---

## 3. Permission

| | |
| --- | --- |
| **Purpose** | Fine-grained permission codes by module |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `code` |
| **MongoDB** | Reference `permissions` |
| **Migration** | `legacyId`; upsert by `code` |

| Field | Type | Req/Opt |
| --- | --- | --- |
| id | String | required |
| code | String | required unique |
| nameAr | String | required |
| module | String | required |
| description | String? | optional |

**Relations:** RolePermission[], UserPermission[] (Cascade from joins).

---

## 4. RolePermission

| | |
| --- | --- |
| **Purpose** | M:N Role ↔ Permission |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `@@unique([roleId, permissionId])` |
| **MongoDB** | Prefer **embed permissionIds on Role** or separate `role_permissions` if override analytics needed |
| **Migration** | `legacyId` + remap role/permission via `legacyId` maps |

| Field | Type | Req/Opt |
| --- | --- | --- |
| id | String | required |
| roleId | String | required |
| permissionId | String | required |

**Relations:** role → Role **Cascade**; permission → Permission **Cascade**.

---

## 5. UserPermission

| | |
| --- | --- |
| **Purpose** | Per-user permission grant/deny override |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `@@unique([userId, permissionId])` |
| **MongoDB** | Embed `permissionOverrides[{permissionId, granted}]` on User **or** reference collection |
| **Migration** | `legacyId`; remap FKs |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| id | String | required | |
| userId | String | required | |
| permissionId | String | required | |
| granted | Boolean | required | `true` |

**Relations:** user → User **Cascade**; permission → Permission **Cascade**.

---

## 6. Session

| | |
| --- | --- |
| **Purpose** | Auth session / CSRF / device tracking |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `tokenHash` |
| **Indexes** | `userId`, `expiresAt` |
| **Date fields** | `expiresAt`, `revokedAt?`, `createdAt`, `lastActivityAt` |
| **MongoDB** | Reference `sessions` (TTL index on `expiresAt` recommended) |
| **Migration** | `legacyId`; deciding whether live sessions migrate or re-login |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| id | String | required | |
| userId | String | required | |
| tokenHash | String | required unique | |
| csrfToken | String | required | |
| ipAddress / userAgent / deviceInfo | String? | optional | |
| rememberMe | Boolean | required | `false` |
| expiresAt | DateTime | required | |
| revokedAt | DateTime? | optional | |
| createdAt | DateTime | required | now |
| lastActivityAt | DateTime | required | now |

**Relations:** user → User **Cascade**.

---

## 7. LoginHistory

| | |
| --- | --- |
| **Purpose** | Login success/failure audit trail |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `userId`, `createdAt` |
| **MongoDB** | Append-only `login_history` reference |
| **Migration** | `legacyId`; `userId` SetNull-compatible |

| Field | Type | Req/Opt |
| --- | --- | --- |
| id | String | required |
| userId | String? | optional |
| identifier | String | required |
| success | Boolean | required |
| ipAddress / userAgent / reason | String? | optional |
| createdAt | DateTime | required |

**Relations:** user → User? **SetNull**.

---

## 8. PasswordResetToken

| | |
| --- | --- |
| **Purpose** | One-time password reset tokens |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `tokenHash` |
| **Indexes** | `userId` |
| **Date fields** | `expiresAt`, `usedAt?`, `createdAt` |
| **MongoDB** | Reference or skip expired/used rows |
| **Migration** | `legacyId`; prefer migrate only unused non-expired if needed |

**Relations:** user → User **Cascade**.

---

## 9. ActivationToken

| | |
| --- | --- |
| **Purpose** | Account activation tokens |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `tokenHash` |
| **Indexes** | `userId` |
| **MongoDB** | Same pattern as PasswordResetToken |
| **Migration** | `legacyId` |

Fields mirror PasswordResetToken (`userId`, `tokenHash`, `expiresAt`, `usedAt?`, `createdAt`).  
**Relations:** user → User **Cascade**.

---

## 10. Doctor

| | |
| --- | --- |
| **Purpose** | Clinical doctor profile (1:1 User) |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `userId` |
| **MongoDB** | Reference `doctors`; optionally embed working-hours summary |
| **Migration** | `legacyId`; remap `userId` after users |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| id | String | required | |
| userId | String | required unique | |
| type | DoctorType | required | |
| specialtyAr | String | required | |
| bioAr / licenseNumber | String? | optional | |
| colorCode | String | required | `"#0F9A9A"` |
| isActive | Boolean | required | `true` |
| createdAt / updatedAt | DateTime | required | |

**Relations (outgoing owned):** user → User **Cascade**.  
**Incoming (mostly Restrict):** appointments, diagnoses, plans, cases, prescriptions, referrals, waiting room, schedules, services, etc.

---

## 11. SecretaryProfile

| | |
| --- | --- |
| **Purpose** | Secretary shift / work schedule profile (1:1 User) |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `userId` |
| **MongoDB** | Embed on User **or** reference `secretary_profiles` |
| **Migration** | `legacyId` |

| Field | Type | Req/Opt | Default / notes |
| --- | --- | --- | --- |
| employeeCode | String? | optional | |
| shiftCode | String | required | default `"MORNING"` (comment: MORNING\|EVENING\|CUSTOM) |
| workStartTime / workEndTime | String | required | `"07:00"` / `"14:30"` |
| workDays | String | required | default `"SUN,MON,TUE,WED,THU,SAT"` (CSV) |
| createdAt / updatedAt | DateTime | required | |

**Relations:** user → User **Cascade**.

---

## 12. Patient

| | |
| --- | --- |
| **Purpose** | Clinical patient master record (may exist without portal User) |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `patientNumber` |
| **Indexes** | `phone`, `fullName`, `patientNumber`, `deletedAt` |
| **Soft-delete** | `deletedAt` |
| **MongoDB** | Reference `patients` (hub document); clinical 1:1s may embed |
| **Migration** | `legacyId`; **preserve `primaryDoctorId` as plain string** (no FK to validate) |

| Field | Type | Req/Opt | Notes |
| --- | --- | --- | --- |
| patientNumber | String | required unique | |
| fullName / phone | String | required | |
| email | String? | optional | |
| dateOfBirth | DateTime? | optional | |
| age | Int? | optional | |
| gender | Gender? | optional | |
| city / address / emergency* / clinical text flags | String? / Boolean | see schema | chronicIllnesses, allergies, etc. |
| hasDiabetes, hasBloodPressure, isPregnant, isSmoker, previousDentalSurgeries | Boolean | required | defaults false |
| patientType | PatientType | required | default `REGULAR` |
| **primaryDoctorId** | **String?** | **optional** | **No FK / no `@relation`** |
| notes | String? | optional | |
| createdAt / updatedAt / deletedAt | DateTime | | soft-delete |

**Business rules:** Portal access via `PatientAccount`, not implied by Patient row. `primaryDoctorId` is application-level only.

---

## 13. PatientAccount

| | |
| --- | --- |
| **Purpose** | Links Patient ↔ User for patient portal; QR access |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `patientId`, `userId`, `qrAccessToken` |
| **Date fields** | `activatedAt?`, `createdAt`, `updatedAt` |
| **MongoDB** | Reference or embed under User/Patient with care for uniqueness |
| **Migration** | `legacyId`; remap both FKs; `activatedById` / `requestedById` are **plain strings without FK** |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| patientId / userId | String | required unique | |
| status | AccountStatus | required | `PENDING` |
| qrAccessToken | String? | optional unique | QR login without password |
| activatedAt | DateTime? | optional | |
| activatedById / requestedById | String? | optional | **no relation** |

**Relations:** patient → Patient **Cascade**; user → User **Cascade**.

---

## 14. AppointmentRequest

| | |
| --- | --- |
| **Purpose** | Intake / booking request before or without confirmed Appointment |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `requestNumber`, `appointmentId` |
| **Indexes** | `status`, `createdAt`, `phone` |
| **MongoDB** | Reference `appointment_requests` |
| **Migration** | `legacyId`; status uses `AppointmentStatus` enum |

| Field | Type | Req/Opt | Notes |
| --- | --- | --- | --- |
| requestNumber | String | required unique | |
| patientId | String? | optional | FK Patient Restrict |
| fullName / phone / reason | String | required | denormalized contact |
| age / dateOfBirth / gender / city | mixed? | optional | |
| serviceId | String? | optional | FK Service Restrict |
| appointmentType | AppointmentType | required | |
| isEmergency | Boolean | required | default false |
| preferredDoctorId / assignedDoctorId | String? | optional | FK Doctor Restrict |
| preferredDate | DateTime? | optional | |
| preferredTime | String? | optional | |
| isPreviousPatient / hasOrthodontics / previousSurgery / consentAccepted | Boolean | required | defaults false |
| additionalNotes / secretaryNotes | String? | optional | |
| status | AppointmentStatus | required | default `NEW_REQUEST` |
| appointmentId | String? | optional unique | FK Appointment Restrict |
| createdAt / updatedAt | DateTime | required | |

**Relations:** patient?, service?, preferredDoctor?, assignedDoctor?, appointment? — all **Restrict (implicit)**; `statusHistory` Cascade from history side.

---

## 15. Appointment

| | |
| --- | --- |
| **Purpose** | Scheduled clinical appointment |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `appointmentNumber` |
| **Indexes** | `[doctorId, startAt]`, `patientId`, `status`, `startAt` |
| **Soft-delete** | `deletedAt` |
| **Date fields** | `startAt`, `endAt`, `createdAt`, `updatedAt`, `deletedAt?` |
| **MongoDB** | Reference `appointments` |
| **Migration** | `legacyId`; remap patient/doctor/service; keep recurrence fields |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| appointmentNumber | String | required unique | |
| patientId / doctorId | String | required | FK Restrict |
| serviceId | String? | optional | FK Restrict |
| appointmentType | AppointmentType | required | |
| status | AppointmentStatus | required | `CONFIRMED` |
| startAt / endAt | DateTime | required | |
| durationMinutes | Int | required | `30` |
| isEmergency | Boolean | required | `false` |
| room / notes | String? | optional | |
| recurrenceGroupId | String? | optional | no FK |
| recurrenceFrequency | RecurrenceFrequency? | optional | |
| recurrenceParentId | String? | optional | no FK |
| createdById | String? | optional | no FK |
| deletedAt | DateTime? | optional | |

**Relations:** patient, doctor, service? **Restrict**; 1:0..1 request, waitingRoomEntry, treatmentSession, orthodonticSession; invoices[]; statusHistory Cascade on history.

---

## 16. AppointmentStatusHistory

| | |
| --- | --- |
| **Purpose** | Append-only status transitions for request and/or appointment |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `appointmentId`, `appointmentRequestId` |
| **MongoDB** | **Reference** append-only (or capped embed if always loaded with parent — prefer separate for audit) |
| **Migration** | `legacyId`; either parent id may be null |

| Field | Type | Req/Opt |
| --- | --- | --- |
| appointmentId / appointmentRequestId | String? | optional |
| previousStatus | AppointmentStatus? | optional |
| newStatus | AppointmentStatus | required |
| changedById | String? | optional |
| reason / note | String? | optional |
| createdAt | DateTime | required |

**Relations:** appointment? **Cascade**; appointmentRequest? **Cascade**; changedBy → User? **Restrict**.

---

## 17. WaitingRoomEntry

| | |
| --- | --- |
| **Purpose** | Day-of waiting room state for an appointment |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `appointmentId` |
| **Indexes** | `status`, `doctorId` |
| **Date fields** | `arrivedAt`, `calledAt?`, `startedAt?`, `completedAt?`, `createdAt`, `updatedAt` |
| **MongoDB** | Reference `waiting_room_entries` or embed on Appointment (1:1) |
| **Migration** | `legacyId` |

**Relations:** appointment **Cascade**; patient **Restrict**; doctor **Restrict**.

---

## 18. MedicalHistory

| | |
| --- | --- |
| **Purpose** | Single medical history document per patient |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `patientId` |
| **MongoDB** | **Embed** on Patient **or** 1:1 subdoc collection |
| **Migration** | `legacyId` |

Text fields: `generalNotes`, `systemicDiseases`, `allergies`, `medications`, `previousSurgeries`, `dentalHistory`, `familyHistory` (all optional).  
**Relations:** patient → Patient **Cascade**.

---

## 19. MedicalRecord

| | |
| --- | --- |
| **Purpose** | Free-form chart notes; may be confidential |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId` |
| **MongoDB** | Reference `medical_records` (access-control by `isConfidential`) |
| **Migration** | `legacyId`; `createdById` is **string without FK** |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| patientId | String | required | |
| title / content | String | required | |
| isConfidential | Boolean | required | `false` |
| createdById | String? | optional | no FK |

**Relations:** patient → Patient **Cascade**.

---

## 20. DentalChart

| | |
| --- | --- |
| **Purpose** | One dental chart per patient |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `patientId` |
| **MongoDB** | **Embed chart + teeth array** under Patient (bounded ~32–64 teeth) **or** chart doc with embedded teeth |
| **Migration** | `legacyId` |

**Relations:** patient **Cascade**; `teeth` DentalToothState[] Cascade from tooth side.

---

## 21. DentalToothState

| | |
| --- | --- |
| **Purpose** | Per-tooth (and optional surface) state on a chart |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `@@index([dentalChartId, toothNumber])` |
| **MongoDB** | **Embed** in DentalChart |
| **Migration** | `legacyId` if kept as separate rows historically; remap doctorId |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| dentalChartId | String | required | |
| toothNumber | Int | required | |
| surface | String? | optional | |
| state | ToothState | required | `HEALTHY` |
| previousState | ToothState? | optional | |
| notes | String? | optional | |
| doctorId | String? | optional | FK Doctor Restrict |

**Relations:** dentalChart **Cascade**; doctor? **Restrict**.

---

## 22. Diagnosis

| | |
| --- | --- |
| **Purpose** | Patient diagnosis entries by doctor |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId` |
| **MongoDB** | Reference `diagnoses` |
| **Migration** | `legacyId` |

| Field | Type | Req/Opt |
| --- | --- | --- |
| patientId / doctorId | String | required |
| title / description | String | required |
| toothNumbers | String? | optional |

**Relations:** patient **Cascade**; doctor **Restrict**.

---

## 23. TreatmentPlan

| | |
| --- | --- |
| **Purpose** | Multi-session treatment plan with cost tracking |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId`, `status` |
| **Financial** | `totalCost`, `paidAmount` → **Decimal128** |
| **Date fields** | `startDate?`, `estimatedEndDate?`, `createdAt`, `updatedAt` |
| **MongoDB** | Reference `treatment_plans`; stages may embed |
| **Migration** | `legacyId` |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| patientId / doctorId | String | required | |
| title | String | required | |
| diagnosis | String? | optional | |
| totalSessions | Int | required | `1` |
| totalCost / paidAmount | Decimal(12,2) | required | `0` |
| status | TreatmentPlanStatus | required | `NOT_STARTED` |
| notes | String? | optional | |

**Relations:** patient **Cascade**; doctor **Restrict**; stages / sessions / invoices children.

---

## 24. TreatmentPlanStage

| | |
| --- | --- |
| **Purpose** | Ordered stage within a treatment plan |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `treatmentPlanId` |
| **Financial** | `cost` → Decimal128 |
| **Date fields** | `nextAppointment?`, `createdAt`, `updatedAt` |
| **MongoDB** | **Embed** stages array on TreatmentPlan (bounded) |
| **Migration** | `legacyId` if materialized; `assignedDoctorId` **no FK** |

| Field | Type | Req/Opt | Default |
| --- | --- | --- | --- |
| treatmentPlanId | String | required | |
| orderIndex | Int | required | |
| procedure | String | required | |
| assignedDoctorId | String? | optional | **no relation** |
| durationMinutes | Int? | optional | |
| cost | Decimal(12,2) | required | `0` |
| sessionsCount | Int | required | `1` |
| progressPercent | Int | required | `0` |
| medicalNotes | String? | optional | |
| nextAppointment | DateTime? | optional | |
| status | TreatmentPlanStatus | required | `NOT_STARTED` |

**Relations:** treatmentPlan **Cascade**.

---

## 25. TreatmentSession

| | |
| --- | --- |
| **Purpose** | Executed treatment session; optional link to plan/appointment |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `appointmentId` |
| **Indexes** | `treatmentPlanId` |
| **Date fields** | `sessionDate`, `createdAt`, `updatedAt` |
| **MongoDB** | Reference or embed under plan; appointment link by id |
| **Migration** | `legacyId` |

**Relations:** treatmentPlan? **Restrict**; appointment? **Restrict**; doctor **Restrict**.

---

## 26. OrthodonticCase

| | |
| --- | --- |
| **Purpose** | Long-running ortho case with cost & session counters |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId`, `doctorId` |
| **Financial** | `totalCost`, `remainingAmount` → Decimal128 |
| **Date fields** | `startDate?`, `nextAppointment?`, `completionDate?`, timestamps |
| **MongoDB** | Reference `orthodontic_cases`; sessions embed vs ref by volume |
| **Migration** | `legacyId` |

Key fields: `diagnosis`, `orthodonticType` (default `METAL_BRACES`), jaw flags, `expectedDurationMonths?`, `sessionFrequency?`, session counters, `retainerStage`, `status` (`TreatmentPlanStatus`), `notes?`.  
**Relations:** patient **Cascade**; doctor **Restrict**; sessions[].

---

## 27. OrthodonticSession

| | |
| --- | --- |
| **Purpose** | Ortho visit / adjustment record |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `appointmentId` |
| **Indexes** | `orthodonticCaseId` |
| **Date fields** | `sessionDate`, `nextSessionDate?`, timestamps |
| **MongoDB** | Embed under OrthodonticCase if session count stays moderate; else reference |
| **Migration** | `legacyId` |

**Relations:** orthodonticCase **Cascade**; appointment? **Restrict**.

---

## 28. SurgeryCase

| | |
| --- | --- |
| **Purpose** | Surgical case; supports parent/child multi-op tree |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId`, `doctorId`, `status` |
| **Financial** | `totalCost` → Decimal128 |
| **Date fields** | `surgeryDate?`, timestamps |
| **MongoDB** | Reference `surgery_cases`; operations + followUps embed |
| **Migration** | `legacyId`; remap `parentCaseId` after parents loaded |

Self-relation `MultiOp`: `parentCaseId` → SurgeryCase? **Restrict**.  
**Relations:** patient **Cascade**; doctor **Restrict**.

---

## 29. Operation

| | |
| --- | --- |
| **Purpose** | Named operation step on a surgery case |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `surgeryCaseId` |
| **Financial** | `cost` → Decimal128 |
| **Date fields** | `operatedAt?`, timestamps |
| **MongoDB** | **Embed** in SurgeryCase |
| **Migration** | `legacyId` |

**Relations:** surgeryCase **Cascade**; doctor **Restrict**.

---

## 30. PostOperationFollowUp

| | |
| --- | --- |
| **Purpose** | Post-op follow-up notes |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `surgeryCaseId` |
| **Date fields** | `followUpDate`, timestamps |
| **MongoDB** | **Embed** in SurgeryCase |
| **Migration** | `legacyId` |

**Relations:** surgeryCase **Cascade**.

---

## 31. ProstheticCase

| | |
| --- | --- |
| **Purpose** | Prosthetic / lab case |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId` |
| **Financial** | `totalCost` → Decimal128 |
| **MongoDB** | Reference `prosthetic_cases` |
| **Migration** | `legacyId` |

| Field | Type | Notes |
| --- | --- | --- |
| type | String | required free string |
| description / toothNumbers / labNotes | String? | |
| status | TreatmentPlanStatus | default `NOT_STARTED` |

**Relations:** patient **Cascade**; doctor **Restrict**.

---

## 32. Prescription

| | |
| --- | --- |
| **Purpose** | Prescription header |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId` |
| **MongoDB** | Reference or embed items |
| **Migration** | `legacyId` |

**Relations:** patient **Cascade**; doctor **Restrict**; items[].

---

## 33. PrescriptionItem

| | |
| --- | --- |
| **Purpose** | Line item under prescription |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **MongoDB** | **Embed** in Prescription |
| **Migration** | `legacyId` optional if always embedded |

| Field | Type | Req/Opt |
| --- | --- | --- |
| prescriptionId | String | required |
| medicationName | String | required |
| dosage / frequency / duration / notes | String? | optional |

**Relations:** prescription **Cascade**.

---

## 34. MedicalDocument

| | |
| --- | --- |
| **Purpose** | Uploaded clinical file metadata |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId` |
| **Soft-delete** | `deletedAt` |
| **MongoDB** | Reference `medical_documents`; storage paths stay external |
| **Migration** | `legacyId`; migrate blob store separately |

| Field | Type | Req/Opt |
| --- | --- | --- |
| patientId | String | required |
| uploadedById | String? | optional |
| title / category / fileName / mimeType / storagePath | String | required |
| sizeBytes | Int | required |
| createdAt | DateTime | required |
| deletedAt | DateTime? | optional |

**Relations:** patient **Cascade**; uploadedBy → User? **Restrict**.

---

## 35. PatientConsent

| | |
| --- | --- |
| **Purpose** | Signed consent records |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId` |
| **Date fields** | `signedAt` (default now), `createdAt` |
| **MongoDB** | Reference or embed under Patient |
| **Migration** | `legacyId` |

**Relations:** patient **Cascade**.

---

## 36. Invoice

| | |
| --- | --- |
| **Purpose** | Patient invoice / balance document |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `invoiceNumber` |
| **Indexes** | `patientId`, `status` |
| **Financial** | `totalAmount`, `paidAmount`, `remainingAmount`, `discount` → **Decimal128** |
| **MongoDB** | Reference `invoices`; payments/installments embed or ref |
| **Migration** | `legacyId`; `doctorId` / `createdById` are **strings without FK** |

**Relations:** patient **Restrict**; appointment? **Restrict**; treatmentPlan? **Restrict**; payments[]; installments Cascade.

---

## 37. Payment

| | |
| --- | --- |
| **Purpose** | Payment against invoice (with void workflow) |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `receiptNumber` |
| **Indexes** | `invoiceId`, `paymentDate` |
| **Financial** | `amount` → Decimal128 |
| **Date fields** | `paymentDate`, `voidedAt?`, timestamps |
| **MongoDB** | Reference `payments` or embed under Invoice |
| **Migration** | `legacyId` |

| Field | Type | Notes |
| --- | --- | --- |
| method | PaymentMethod | required |
| status | PaymentStatus | default `COMPLETED` |
| voidReason | String? | with voidedBy / voidedAt |

**Relations:** invoice **Restrict**; createdBy / voidedBy → User? **Restrict**.

**Business rules:** Void does not delete; sets `status=VOIDED` + metadata.

---

## 38. Installment

| | |
| --- | --- |
| **Purpose** | Scheduled installment against invoice |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `invoiceId`, `dueDate` |
| **Financial** | `amount`, `paidAmount` → Decimal128 |
| **Date fields** | `dueDate`, `paidAt?`, timestamps |
| **MongoDB** | **Embed** under Invoice (bounded list) |
| **Migration** | `legacyId` |

**Relations:** invoice **Cascade**.

---

## 39. Notification

| | |
| --- | --- |
| **Purpose** | User notification / multi-channel message state |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `[userId, status]`, `createdAt` |
| **Date fields** | `readAt?`, `sentAt?`, `createdAt` |
| **MongoDB** | Reference `notifications` |
| **Migration** | `legacyId`; polymorphic `entityType`/`entityId` strings |

**Relations:** user? **Cascade**.

---

## 40. Message

| | |
| --- | --- |
| **Purpose** | Internal messaging (optionally patient-scoped) |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `receiverId`, `patientId` |
| **Date fields** | `readAt?`, `createdAt` |
| **MongoDB** | Reference `messages` |
| **Migration** | `legacyId` |

**Relations:** sender / receiver → User? **Restrict**; patient? **Restrict**.

---

## 41. Service

| | |
| --- | --- |
| **Purpose** | Catalog of clinic services / default price & duration |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `code` |
| **Financial** | `defaultPrice` → Decimal128 |
| **MongoDB** | Reference `services` |
| **Migration** | `legacyId`; upsert by `code` |

**Relations:** DoctorService[], Appointment[], AppointmentRequest[].

---

## 42. DoctorService

| | |
| --- | --- |
| **Purpose** | Doctor-specific service overrides |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `@@unique([doctorId, serviceId])` |
| **Financial** | `customPrice?` → Decimal128 |
| **MongoDB** | Embed on Doctor or junction collection |
| **Migration** | `legacyId` |

**Relations:** doctor **Cascade**; service **Cascade**.

---

## 43. WorkingHour

| | |
| --- | --- |
| **Purpose** | Recurring weekly shift hours per doctor |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `@@unique([doctorId, dayOfWeek, shift])` |
| **Indexes** | `doctorId` |
| **MongoDB** | **Embed** workingHours[] on Doctor |
| **Migration** | `legacyId` |

| Field | Type | Notes |
| --- | --- | --- |
| dayOfWeek | DayOfWeek | |
| shift | String | MORNING \| EVENING |
| startTime / endTime | String | HH:mm |
| isActive | Boolean | default true |

**Relations:** doctor **Cascade**.

---

## 44. DoctorScheduleException

| | |
| --- | --- |
| **Purpose** | One-off schedule exceptions / blocks |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `[doctorId, startAt]` |
| **Date fields** | `startAt`, `endAt`, `createdAt` |
| **MongoDB** | Reference (query by date range) or embed recent windows |
| **Migration** | `legacyId`; `createdById` **no FK** |

**Relations:** doctor **Cascade**.

---

## 45. Holiday

| | |
| --- | --- |
| **Purpose** | Clinic-wide holiday calendar |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `date` (`@db.Date` — date-only) |
| **MongoDB** | Reference `holidays`; store as date (no time) or UTC midnight consistently |
| **Migration** | `legacyId` |

| Field | Type | Notes |
| --- | --- | --- |
| nameAr | String | required |
| date | DateTime `@db.Date` | unique |
| isRecurring | Boolean | default false |
| createdAt | DateTime | |

---

## 46. Referral

| | |
| --- | --- |
| **Purpose** | Doctor-to-doctor patient referral |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `patientId`, `toDoctorId` |
| **MongoDB** | Reference `referrals` |
| **Migration** | `legacyId` |

| Field | Type | Req/Opt | Notes |
| --- | --- | --- | --- |
| patientId | String | required | |
| fromDoctorId / toDoctorId | String | required | |
| reason | String | required | |
| notes | String? | optional | |
| **status** | **String** | required | **Free string**, default `"PENDING"` — **not an enum** |
| createdAt / updatedAt | DateTime | required | |

**Relations:** patient **Cascade**; fromDoctor / toDoctor **Restrict**.

---

## 47. AuditLog

| | |
| --- | --- |
| **Purpose** | Append-only change audit with JSON payloads |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `userId`, `[entityType, entityId]`, `createdAt`, `action` |
| **MongoDB** | Append-only `audit_logs`; never update/delete in app |
| **Migration** | `legacyId`; preserve `oldValue`/`newValue` JSON |

| Field | Type | Notes |
| --- | --- | --- |
| userId | String? | SetNull on user delete |
| roleCode / action / entityType | String | action/entityType required |
| entityId | String? | |
| oldValue / newValue | Json? | |
| reason / ipAddress / deviceInfo | String? | |
| createdAt | DateTime | |

**Relations:** user? **SetNull**.

---

## 48. ClinicSetting

| | |
| --- | --- |
| **Purpose** | Key/value clinic configuration JSON |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `key` |
| **MongoDB** | Reference `clinic_settings` or single settings doc |
| **Migration** | `legacyId`; upsert by `key` |

| Field | Type |
| --- | --- |
| key | String unique |
| value | Json |
| createdAt / updatedAt | DateTime |

---

## 49. FileAttachment

| | |
| --- | --- |
| **Purpose** | Polymorphic file metadata (`entityType` + `entityId`) |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Indexes** | `[entityType, entityId]` |
| **Soft-delete** | `deletedAt` |
| **MongoDB** | Reference `file_attachments` |
| **Migration** | `legacyId` |

**Relations:** uploadedBy → User? **Restrict**.

---

## 50. NotificationTemplate

| | |
| --- | --- |
| **Purpose** | Reusable notification title/body templates |
| **PK** | `id` |
| **Record Count** | not queried (read-only audit; DB access not executed in this phase) |
| **Unique** | `code` |
| **MongoDB** | Reference `notification_templates` |
| **Migration** | `legacyId`; upsert by `code` |

| Field | Type | Default |
| --- | --- | --- |
| code | String unique | |
| titleAr / bodyAr | String | |
| channel | NotificationChannel | `IN_APP` |
| isActive | Boolean | `true` |
| createdAt / updatedAt | DateTime | |

---

# Cascade / Restrict / SetNull matrix (explicit vs implicit)

| onDelete | Occurrences (high level) |
| --- | --- |
| **Cascade** | Auth joins; tokens; sessions (user); doctor/secretary/patientAccount on user; clinical children of patient; chart teeth; plan stages; ortho sessions; surgery ops/follow-ups; Rx items; installments; doctor schedule/service rows; referral on patient; notifications on user |
| **SetNull** | `LoginHistory.user`, `AuditLog.user` |
| **Restrict (implicit)** | Most clinical FKs to Doctor/Patient/Appointment/Invoice/Service; Payment→Invoice; Message actors; Referral doctors; etc. |

Migrate **Cascade** as NestJS transaction deletes (or application rules). Migrate **Restrict** as pre-delete guards. Migrate **SetNull** as optional FK clears.

---

# Cross-cutting MongoDB & migration strategy

| Topic | Strategy |
| --- | --- |
| Primary keys | New `_id` ObjectId + unique `legacyId` = Prisma cuid |
| Load order | Roles/Permissions → Users → Doctor/Secretary/Patient → catalogs (Service, Holiday, Settings) → workflow/clinical/finance children |
| ID maps | Persistent `legacyId → ObjectId` map table/collection before child ETL |
| Money | Decimal128 only; reject Number/float migration paths |
| Dates | Preserve UTC; special-case `Holiday.date` as date-only |
| Soft-delete | Keep `deletedAt`; query filters must exclude soft-deleted where legacy did |
| JSON | `AuditLog.oldValue/newValue`, `ClinicSetting.value` → BSON documents |
| Free strings | Preserve `Referral.status`, secretary `shiftCode`/`workDays`, ProstheticCase.type, etc. |
| Non-FK strings | `Patient.primaryDoctorId`, `TreatmentPlanStage.assignedDoctorId`, `Invoice.doctorId`/`createdById`, `PatientAccount.activatedById`/`requestedById`, `MedicalRecord.createdById`, recurrence ids, `Appointment.createdById` — store as strings; optional post-migrate repair scripts |
| 2FA | Migrate columns; no runtime enablement |
| Record counts | **not queried (read-only audit; DB access not executed in this phase)** for every model |

---

# Model checklist (50 / 50)

| # | Model | Soft-delete | Money Decimal(12,2) | Embed candidate |
| --- | --- | --- | --- | --- |
| 1 | User | yes | | no |
| 2 | Role | | | no |
| 3 | Permission | | | no |
| 4 | RolePermission | | | embed on Role |
| 5 | UserPermission | | | embed on User |
| 6 | Session | | | no |
| 7 | LoginHistory | | | no |
| 8 | PasswordResetToken | | | no |
| 9 | ActivationToken | | | no |
| 10 | Doctor | | | no |
| 11 | SecretaryProfile | | | embed on User |
| 12 | Patient | yes | | hub |
| 13 | PatientAccount | | | maybe |
| 14 | AppointmentRequest | | | no |
| 15 | Appointment | yes | | no |
| 16 | AppointmentStatusHistory | | | maybe |
| 17 | WaitingRoomEntry | | | embed 1:1 Appt |
| 18 | MedicalHistory | | | embed Patient |
| 19 | MedicalRecord | | | no |
| 20 | DentalChart | | | embed Patient |
| 21 | DentalToothState | | | embed Chart |
| 22 | Diagnosis | | | no |
| 23 | TreatmentPlan | | yes | no |
| 24 | TreatmentPlanStage | | yes | embed Plan |
| 25 | TreatmentSession | | | maybe |
| 26 | OrthodonticCase | | yes | no |
| 27 | OrthodonticSession | | | embed Case |
| 28 | SurgeryCase | | yes | no |
| 29 | Operation | | yes | embed Case |
| 30 | PostOperationFollowUp | | | embed Case |
| 31 | ProstheticCase | | yes | no |
| 32 | Prescription | | | no |
| 33 | PrescriptionItem | | | embed Rx |
| 34 | MedicalDocument | yes | | no |
| 35 | PatientConsent | | | maybe |
| 36 | Invoice | | yes | no |
| 37 | Payment | | yes | maybe |
| 38 | Installment | | yes | embed Invoice |
| 39 | Notification | | | no |
| 40 | Message | | | no |
| 41 | Service | | yes | no |
| 42 | DoctorService | | yes | embed Doctor |
| 43 | WorkingHour | | | embed Doctor |
| 44 | DoctorScheduleException | | | maybe |
| 45 | Holiday | | | no |
| 46 | Referral | | | no |
| 47 | AuditLog | | | no |
| 48 | ClinicSetting | | | no |
| 49 | FileAttachment | yes | | no |
| 50 | NotificationTemplate | | | no |

---

*Generated from static read of `prisma/schema.prisma`. No database queries executed in this phase.*
