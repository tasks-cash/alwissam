# Data Migration Plan

## Goals

Migrate PostgreSQL/Prisma data into MongoDB for the NestJS API **without** destroying PostgreSQL, without resetting Prisma, and without switching production until parity verification passes.

## Source

- Provider: PostgreSQL 16
- ORM: Prisma 7 (`prisma/schema.prisma`) — **50 models**, **20 enums**
- Single init migration: `prisma/migrations/20260710121057_init`
- IDs: string CUID primary keys (generally portable as `legacyId` + new ObjectId)

## Target

- MongoDB via `@nestjs/mongoose`
- Every document stores: `legacyId` (unique), `legacySource: "postgresql"`, `migratedAt`, `migrationVersion`
- Money: `Decimal(12,2)` → **Decimal128** (never IEEE float)
- Timestamps: preserve exact UTC instants from Postgres

## Collection strategy (summary)

| Strategy | Models / pattern |
| --- | --- |
| Top-level referenced collections | User, Role, Permission, Patient, Doctor, Appointment, AppointmentRequest, Invoice, Payment, Service, AuditLog, Notification, ClinicSetting, MedicalDocument, FileAttachment, Holiday, Referral, … |
| Embed in parent | RolePermission→Role or separate join collection (prefer join for flexible RBAC); PrescriptionItem→Prescription; TreatmentPlanStage→TreatmentPlan; DentalToothState→DentalChart (array with indexes) |
| Join / mapping collections | Session (or re-issue sessions on cutover), UserPermission, DoctorService, WorkingHour |
| Cutover decision: sessions | Prefer **invalidate legacy sessions** at cutover and force re-login unless cookie compatibility proven |

Detailed per-model mapping: `DATABASE_INVENTORY.md`.

## ID mapping

Persist mappings in `scripts/migration/id-maps/` or Mongo collection `migration_id_maps`:

```ts
{ entity: "User", legacyId: "...", mongoId: "...", migrationVersion: "v1" }
```

Deterministic upserts on `(entity, legacyId)`.

## Script layout (to implement in later phase)

```text
scripts/migration/
  config/
  extract/
  transform/
  load/
  verify/
  reports/
  id-maps/
  dry-run.ts
  execute.ts
  verify.ts
```

Root scripts (target workspace): `pnpm migration:dry-run` | `migration:execute` | `migration:verify`.

### Dry-run

- Connect Postgres **read-only**
- Count + transform in memory/temp
- Detect orphans, duplicate uniques, bad enums, decimal issues
- Write reports under `scripts/migration/reports/`
- **Write nothing** to production Mongo

### Execute

- Require `MIGRATION_CONFIRM_EXECUTION=YES`
- Batch upserts by `legacyId`
- Checkpoint progress
- Continue/stop rules: stop if FK graph corruption risk

### Verify

Compare counts, status distributions, money totals, orphan counts, sample equality.

## Order of load (dependency-aware)

1. Role, Permission, RolePermission, UserPermission  
2. User (+ passwordHash unchanged)  
3. Doctor, SecretaryProfile, Service, DoctorService, WorkingHour, Holiday, ClinicSetting  
4. Patient, PatientAccount, MedicalHistory  
5. AppointmentRequest, Appointment, AppointmentStatusHistory, WaitingRoomEntry  
6. Clinical trees (charts, diagnoses, plans, ortho, surgery, prescriptions)  
7. Invoice, Payment, Installment  
8. Notifications, Messages, AuditLog, documents/attachments metadata  
9. Sessions / tokens — prefer migrate or drop with forced logout  

## File migration

- Copy `UPLOAD_DIR` bytes preserving relative `storagePath`
- Verify each `MedicalDocument.storagePath` / `FileAttachment.storagePath`
- Report missing files; do not invent placeholders

## Cutover outline

1. Postgres logical backup verified  
2. Uploads backup  
3. Mongo indexes created  
4. Dry-run + review  
5. Initial migrate + verify  
6. Delta / maintenance window  
7. Switch API `MONGODB_URI`  
8. Keep Postgres **read-only** retention window  
9. Rollback = point DNS/config back to legacy Next monolith + Postgres  

## Rollback

Documented rollback is **configuration rollback** to the existing Next.js + Prisma application. Do not drop Mongo to “rollback”; do not drop Postgres.

## Non-goals (this phase)

- No execute against production Mongo yet  
- No deletion of Prisma schema/migrations  
- No password resets for users if bcrypt hashes migrate intact  

## Risks

- `Patient.primaryDoctorId` lacks FK → orphan risk  
- Soft-delete inconsistently filtered in app → migrate deleted rows with `deletedAt`  
- Stub features may still have empty collections after migrate — expected  
- Financial aggregate mismatches must block acceptance  
