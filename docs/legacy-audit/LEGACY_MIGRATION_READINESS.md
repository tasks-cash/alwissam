# Legacy Migration Readiness

**Scope limit:** This folder is the legacy source of truth for Doctor/Specialist dashboard parity. Assessment of the **new** Nest/Next/Mongo app is limited to readiness guidance — **no edits** were made to either application tree beyond `docs/legacy-audit/`.

## Features suitable for migration (behavior parity)

| Feature | Why |
| --- | --- |
| Session / login role landing → specialist dashboard | Clear `roleDashboardPath` behavior |
| Waiting queue list for current doctor | Clear Prisma query semantics |
| Exam start / complete + invoice handoff | Complete API contract |
| Today board sectioning | Clear `sectionOf` rules |
| Direct-from-request / check-in → WR | `appointments.ts` services |
| Owner doctors/secretaries CRUD | Admin APIs |
| ClinicSetting-backed contact & public pages | JSON settings pattern |
| Working hours | WorkingHour model |
| Audit log writes on exam | Immutable-ish audit pattern |
| CSRF or equivalent write protection | Keep security property under JWT |

## Must recreate safely (do not copy security flaws)

| Item | Rewrite requirement |
| --- | --- |
| Auth | JWT access/refresh as target stack already requires; map sessions carefully |
| Permissions | Enforce DB or explicit permission keys on Nest guards |
| File uploads | Ownership + MIME + storage ACL |
| Waiting-room PATCH | Same ownership as exam |
| Middleware | Validate token, not cookie presence alone |
| Realtime | Only if product needs; prefer authenticated filtered channels |

## Incomplete / stub — do not fake in target

Specialist: referrals, reports, follow-ups, operations, surgeries pages (EmptyState).  
Patient portal stubs.  
Admin roles/permissions/users/backups stubs.  
Secretary schedule-appointment **403** endpoint.

## Unsafe / obsolete to copy as-is

- Decorative Permission tables without enforcement  
- Staff chat voice base64-in-DB (rethink storage)  
- Unused `DoctorDashboardView`  
- Depend on Redis pub without UI subscribers  

## Already likely exists / partial in target (guidance only)

Prior workspace work identified Nest modules for auth, doctors, secretaries, patients, appointments, dashboard. Treat as **parity checklist**, not verified byte-equality in this audit pass.

## Recommended migration order (Doctor portal)

1. WaitingRoom + Appointment status enums parity  
2. `POST .../exam` start/complete semantics + invoice optional  
3. Specialist dashboard SSR/CSR list fed by Nest  
4. Today board aggregation  
5. `loadDoctorPatients` equivalent  
6. Settings (ClinicSetting)  
7. Staff chat (optional)  
8. Harden uploads / permissions  

## Do not migrate yet

Per user instruction: audit complete first. Implementation starts only after acceptance of these reports.
