# Legacy Authorization Matrix

## Roles (`RoleCode` enum)

`ADMIN`, `SECRETARY`, `DOCTOR_GENERAL`, `DOCTOR_SPECIALIST`, `PATIENT`

**Clinic owner pattern (verified):** seeded specialist doctor whose `User.role` is `ADMIN` (and doctor profile). `isClinicOwner()` / `requireUser` special-case allows ADMIN with specialist doctor profile on specialist routes.

## Authentication mechanisms

| Mechanism | Details |
| --- | --- |
| Session cookie | `alwisam_session` httpOnly; token hashed SHA-256 in Session |
| Password | bcrypt 12 |
| CSRF | Per-session `csrfToken`; header `x-csrf-token` on writes |
| Middleware | Cookie presence only on UI routes |
| API | Per-handler session validation |

## Permission system split

| Store | Used at runtime? |
| --- | --- |
| Prisma Permission / RolePermission / UserPermission | Seeded for ADMIN — **not read by APIs** |
| `src/lib/auth/permissions.ts` ROLE_PERMISSIONS map | Used only if `requirePermission` called |
| `requirePermission(...)` | **Defined but never called** |

**Verdict:** Authorization is **hardcoded RoleCode arrays**, not dynamic DB permissions.

## Specialist sidebar routes × roles

| Route | Allowed (page) | Backend for mutations |
| --- | --- | --- |
| dashboard معاينة | DOCTOR_SPECIALIST, ADMIN | exam: DOCTOR_*, ADMIN + ownership |
| today | same | mostly read |
| patients | same | doctor patient APIs owner-gated |
| doctors / secretaries | ADMIN, DOCTOR_SPECIALIST | `/api/admin/*` **isClinicOwner** |
| settings/* | ADMIN, DOCTOR_SPECIALIST | clinic-settings `isClinicOwner` |

## Frontend-only vs backend

| Check | Location | Backend equivalent |
| --- | --- | --- |
| Hide nav by role | Different nav arrays per portal | Pages also call `requireUser` |
| Exam ownership | — | **Enforced** in exam route |
| Waiting-room status API | — | **Incomplete ownership** for doctors |
| File upload | — | Authenticated only — **no patient ownership** |

## IDOR notes (doctor patients)

- Exam entry: rejects if `entry.doctorId !== doctor.id` (non-ADMIN).  
- `/patients/[id]` shared record: staff roles may open patient by ID — verify page-level checks in that file before assuming isolation.  
- Changing entryId to another doctor’s WR: blocked by exam ownership.

## Secretary shift

`isWithinSecretaryShift` enforced at **login**, not on subsequent secretary APIs.
