# Legacy Database Models

**Technology:** PostgreSQL via Prisma 7  
**Schema:** `old project/alwissam-main/prisma/schema.prisma`  
**Models counted:** 50 (`^model `)  
**Enums counted:** 20  

**Migrations present:**

- `20260710121057_init`
- `20260714153000_secretary_shift_fields`
- `20260714180000_staff_chat_voice` (Message.kind / audioUrl)
- `20260714210000_laser_whitening_reception_fields` (`LASER_WHITENING` enum + `AppointmentRequest.chronicIllnesses`)

**Connection env name:** `DATABASE_URL` (adapter pool in `src/lib/db/prisma.ts`)

## Doctor-dashboard critical models

| Model | Purpose for specialist UI |
| --- | --- |
| User | Auth identity, roleId, fullName |
| Role / RoleCode | ADMIN, SECRETARY, DOCTOR_*, PATIENT |
| Session | Cookie session + csrfToken |
| Doctor | Profile linked userId; used as WR.doctorId |
| WaitingRoomEntry | Exam queue rows |
| Appointment | Linked visit; status machine |
| AppointmentStatusHistory | Audit of status changes |
| AppointmentRequest | Public/secretary intake; supplies card fields |
| Patient | Demographics shown on card |
| PatientAccount | hasAccount flag |
| Invoice | Created on exam complete (charge) |
| AuditLog | EXAM_STARTED / EXAM_COMPLETED_CHARGE |
| ClinicSetting | JSON settings (contact, public pages) |
| WorkingHour | Doctor schedules |
| SecretaryProfile | Staff CRUD |
| Message | Staff chat FAB |
| Permission / RolePermission / UserPermission | Seeded; **not runtime-enforced** |

## AppointmentStatus (enum)

`NEW_REQUEST`, `UNDER_SECRETARY_REVIEW`, `DOCTOR_ASSIGNED`, `WAITING_DOCTOR_APPROVAL`, `CONFIRMED`, `REMINDER_SENT`, `PATIENT_ARRIVED`, `WAITING_ROOM`, `IN_TREATMENT`, `COMPLETED`, `FOLLOW_UP_REQUIRED`, `RESCHEDULED`, `CANCELLED_BY_PATIENT`, `CANCELLED_BY_CLINIC`, `NO_SHOW`, `EMERGENCY`, `REFERRED_TO_OTHER_DOCTOR`

## WaitingRoomStatus (enum)

`ARRIVED`, `WAITING`, `WITH_DOCTOR`, `SESSION_DONE`, `NEEDS_FOLLOWUP`, `LEFT`

## AppointmentType (includes migration addition)

… + `LASER_WHITENING`

## Broader clinical models (schema exists; specialist nav stubs often unused)

TreatmentPlan*, Orthodontic*, Surgery*, Operation, Prescription*, DentalChart*, Diagnosis, MedicalDocument, Referral, Payment, Installment, Notification*, Service, DoctorService, Holiday, DoctorScheduleException, FileAttachment, ProstheticCase, MedicalHistory, MedicalRecord, PatientConsent, LoginHistory, PasswordResetToken, ActivationToken

## Soft delete

`deletedAt` on User, Patient, Appointment (and related patterns). Dashboard WR query does **not** filter soft-deleted patients explicitly beyond relation integrity.

## Money

`Decimal(12,2)` on Invoice/Payment/Treatment costs — Prisma Decimal; exam complete uses `Prisma.Decimal`.

## Indexes (examples)

WaitingRoomEntry: status, doctorId  
Appointment: doctorId+startAt, patientId, status, startAt  
Session: userId, expiresAt, tokenHash unique  

## What was queried for معاينة

`waitingRoomEntry.findMany({ doctorId, status in WAITING|WITH_DOCTOR, include patient.account, appointment.request })` — verified in dashboard page.
