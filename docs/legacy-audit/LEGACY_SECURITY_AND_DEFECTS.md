# Legacy Security and Defects

## Critical / High

| ID | Severity | Finding | Evidence |
| --- | --- | --- | --- |
| LSEC-01 | High | `/api/files/upload` any authenticated role without patient ownership | `src/app/api/files/upload/route.ts` |
| LSEC-02 | High | `/api/realtime/stream` exposes clinic counts to any session including PATIENT | `src/app/api/realtime/stream/route.ts` |
| LSEC-03 | High | DB Permission / UserPermission not enforced; role hardcoding only | `permissions.ts`; `requirePermission` unused |
| LSEC-04 | High | Middleware authenticates pages by cookie presence only | `middleware.ts` |
| LSEC-05 | Medium–High | `waiting-room/[id]` status updates lack doctor ownership check (unlike exam) | secretary waiting-room route |

## Medium

| ID | Finding |
| --- | --- |
| LSEC-06 | Compose documents `SESSION_SECRET` / `CSRF_SECRET` / `SIGNED_URL_SECRET` but `src/` does not use them; CSRF is session token |
| LSEC-07 | Secretary shift restriction at login only — APIs remain callable if session exists off-shift |
| LSEC-08 | QR `PatientAccount.qrAccessToken` passwordless login if leaked |
| LSEC-09 | Staff chat voice stores `data:` audio in Postgres (`Message.audioUrl`) — size/DoS risk |
| LSEC-10 | ADMIN without doctor profile may act on any waiting entry in exam route |

## Low / Informational

| ID | Finding |
| --- | --- |
| LSEC-11 | Dead parent route `/doctor/specialist/workday` |
| LSEC-12 | Dead component `DoctorDashboardView` |
| LSEC-13 | Stub specialty pages present but EmptyState — not false “working” APIs |
| LSEC-14 | Screenshot FAB looks like WhatsApp but is staff chat |
| LSEC-15 | No `.env.example` in snapshot; README still references it |
| LSEC-16 | `jose` dependency unused in `src/` (static) |
| LSEC-17 | Dual WR status paths (exam vs waiting-room) can desync Appointment |

## Injection / XSS

- Prisma parameterized queries — no `$queryRaw` found under `src/` in audit passes.  
- Exam UI renders patient strings in React text nodes — standard React escaping; still treat HTML in notes carefully if ever `dangerouslySetInnerHTML` added (not found in panel).

## Authn weaknesses checklist

- [x] Passwords hashed (bcrypt 12)  
- [x] Session tokens hashed at rest  
- [x] CSRF on mutating staff APIs  
- [ ] API middleware auth  
- [ ] Dynamic permission enforcement  
- [ ] Upload ownership  
- [ ] Consistent queue ownership  

## Do not copy blindly into Nest/Mongo

Anything under LSEC-01…05 should be redesigned under JWT + permission guards + ownership checks, not ported 1:1.
