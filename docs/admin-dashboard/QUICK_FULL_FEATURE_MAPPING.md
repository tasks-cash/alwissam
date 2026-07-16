# Quick / Full Feature Mapping

**Updated:** 2026-07-15  
**Formula:**

- `QUICK MODE` = every **completed** feature required by `ALWISSAM_COMPLETE_DASHBOARD_SPECIFICATION.md` that has a full Next → Nest → Mongo chain
- `FULL MODE` = Quick ∪ additional completed Nest project features (CMS, doctor–patient messages)

Incomplete features stay **hidden** from both modes.

Legend for **Implementation status**: `complete` | `partial` | `missing` | `hidden`

---

## Staff Chat (priority — completed this pass)

| Field | Value |
|-------|--------|
| Feature name | Staff Chat (text + voice + realtime) |
| Specification status | Documented §20 (`StaffChatWidget`, `/secretary/messages`, `/api/staff/chat*`) — legacy used Base64 voice + polling; rebuild uses private disk + WebSocket |
| Current implementation status | **complete** |
| Quick mode visibility | Yes |
| Full mode visibility | Yes |
| Next.js route | `/[locale]/secretary/messages` + FAB in `DashboardShell` |
| NestJS endpoint | `GET/POST/DELETE /api/staff/chat`, `GET /api/staff/chat/thread/:peerId`, `POST /api/staff/chat/voice`, `GET /api/staff/chat/audio/:messageId`, WS `/staff-chat` |
| Mongoose model | `StaffMessage` (`staff_messages`) |
| Required role | ADMIN / OWNER / DOCTOR_* / SECRETARY (not PATIENT) |
| Required permission | Role gate via `RolesGuard` (staff chat roles) |
| Missing work | None for shipping chain; optional: richer conversation documents |
| Final verification result | Unit rules tests pass; typecheck pass; chain wired end-to-end |

### Staff Chat capability checklist

| Capability | Status |
|------------|--------|
| Conversation creation (implicit peer threads) | Done |
| Doctor ↔ assigned Secretary | Done (`assignedDoctorIds` filter) |
| Admin ↔ Staff | Done |
| Text messages | Done |
| Voice recording / upload | Done (multipart ≤2MB) |
| Private audio storage | Done (`PRIVATE_UPLOAD_DIR` / `private-uploads/staff-chat`) |
| Authorized audio playback | Done (JWT + party check, `Cache-Control: private`) |
| Read / unread + badges | Done |
| Message pagination | Done (`GET .../thread/:peerId?before=&limit=`) |
| Message deletion | Done + WS `staff:deleted` |
| Typing indicator | Done |
| Online status | Done |
| WebSocket auth | Done (cookie / Bearer) |
| Authorized rooms | Done (`staff:{userId}`) |
| Reconnection | Done (socket.io client + HTTP poll fallback 8s) |
| Mobile + desktop drawer | Done (responsive CSS) |
| Secretary working-hours gate | Done |
| Assignment validation | Done |
| Patient rejection | Done (roles + widget gate) |
| Mongo persistence | Done |
| Guards + DTO validation | Done |
| Loading / empty / error UI | Done |
| Automated tests | Done (`staff-chat.rules.spec.ts`) |

---

## Quick-mode features (visible)

| Feature | Spec | Impl | Quick | Full | Next route | Nest API | Model | Role | Permission | Missing | Verify |
|---------|------|------|-------|------|------------|----------|-------|------|------------|---------|--------|
| Owner specialist dashboard | Live | complete | Y | Y | `/doctor/specialist/dashboard` | `/api/admin/owner-summary` etc. | User, Appointment… | ADMIN/SPECIALIST | owner | — | OK |
| Doctors CRUD | Live | complete | Y | Y | `/doctor/specialist/doctors` | `/api/admin/doctors` | User | ADMIN | manage doctors | — | OK |
| Secretaries CRUD | Live | partial→usable | Y | Y | `/doctor/specialist/secretaries` | `/api/admin/secretaries` | User | ADMIN | manage staff | post-create hours UI polish | OK for Quick |
| Specialist patients list | Live | partial | Y | Y | `/doctor/specialist/patients` | `/api/patients` | Patient | ADMIN/DOCTOR | patients | deep tabs hidden | List OK |
| Invitations | Live | complete | Y | Y | `/doctor/specialist/invitations` | `/api/admin/invitations` | Invitation | ADMIN | invites | — | OK |
| Clinic settings | Live | complete (collapsed) | Y | Y | `/doctor/specialist/settings` | `/api/settings` | Setting | ADMIN | settings | nested legacy routes absent | OK |
| Audit logs | Live | complete | Y | Y | `/doctor/specialist/audit-logs` | `/api/admin/audit-logs` | AuditLog | ADMIN | audit | — | OK |
| Staff activity | Live | complete | Y | Y | deep link | audit `?userId=` | AuditLog | ADMIN | audit | — | OK |
| General doctor dashboard | Live | partial | Y | Y | `/doctor/general/dashboard` | queue/appointments | Appointment | DOCTOR_GENERAL | exam | clinical depth hidden | Thin OK |
| Secretary hub | Live | complete | Y | Y | `/secretary/dashboard` | hub APIs | mixed | SECRETARY | reception | — | OK |
| Today / directed / patients | Live | complete | Y | Y | `/secretary/*` | reception APIs | Appointment/Patient | SECRETARY | reception | — | OK |
| Appointments | Live | complete | Y | Y | `/secretary/appointments` | appointments | Appointment | SECRETARY | appointments | — | OK |
| Assignment queue | Live | complete | Y | Y | `/secretary/assignment-queue` | assignment | Appointment | SECRETARY | queue | — | OK |
| Payments | Live | complete | Y | Y | `/secretary/payments` | payments | Payment | SECRETARY | payments | — | OK |
| **Staff Chat** | Live §20 | **complete** | **Y** | **Y** | `/secretary/messages` + FAB | `/api/staff/chat*` + WS | StaffMessage | staff | role | — | **OK** |
| Admin mode preference | Product rule | complete | Y | Y | shell switcher | `GET/PATCH /api/admin/preferences` | User.adminDashboardMode | ADMIN | preferences | — | OK |

---

## Full-mode extras (Quick ∪)

| Feature | Spec | Impl | Quick | Full | Next route | Nest API | Model | Role | Missing | Verify |
|---------|------|------|-------|------|------------|----------|-------|------|---------|--------|
| Patient experiences CMS | NOT FOUND legacy | complete | N | Y | `.../public-content/patient-experiences` | CMS APIs | Experience | ADMIN | — | OK |
| Before/after CMS | NOT FOUND | complete | N | Y | `.../before-after` | CMS | BeforeAfter | ADMIN | — | OK |
| Specialties CMS | NOT FOUND | complete | N | Y | `.../specialties` | CMS | Specialty | ADMIN | — | OK |
| Services CMS | NOT FOUND | complete | N | Y | `.../services` | CMS | Service | ADMIN | — | OK |
| FAQs CMS | NOT FOUND | complete | N | Y | `.../faqs` | CMS | Faq | ADMIN | — | OK |
| Reviews CMS | NOT FOUND | complete | N | Y | `.../reviews` | CMS | Review | ADMIN | — | OK |
| Doctor↔patient messages | Patient portal / Full | complete | N | Y | `/doctor/specialist/messages` | `/api/doctor/messages` | Message | DOCTOR | — | OK |

---

## Hidden (spec-documented but incomplete)

| Feature | Spec | Impl | Why hidden | Missing work |
|---------|------|------|------------|--------------|
| QR patient login | §4 | missing | No Nest QR auth | QR issue/consume APIs + UI |
| Dental chart | Clinical | missing | No Nest chart module | Schema + API + UI + tests |
| Clinical exam notes / charge on complete | Doctor | missing | Thin queue only | Exam notes + charge flow |
| Ortho workflows | Clinical | missing | Not ported | Full ortho module |
| Nested settings routes | Owner | missing | Single settings page | Split routes if required |
| Specialist patient QR/account/schedule tabs | Patients | missing | List only | Tabbed patient board |
| Classic `/admin/*` stubs | Spec | obsolete | Wrong stack | Keep hidden |

---

## Mode switcher rules (verified in code)

| Rule | Status |
|------|--------|
| Same pages/APIs/DB/permissions for both modes | Yes — filter is nav visibility only |
| Mode switch without full app reload | Yes — client state in `DashboardShell` |
| Mode persisted in MongoDB | Yes — `User.adminDashboardMode` via `/api/admin/preferences` |
| Incomplete features not shown in either mode | Yes — not in `ADMIN_QUICK_HREFS` / `ADMIN_FULL_EXTRA_HREFS` |

---

## Notes

- Spec §20 voice stored Base64 in Mongo — **rejected** in rebuild; files on private disk only.
- Spec realtime was HTTP polling — rebuild adds Socket.IO **and** keeps poll as fallback.
- Patient chat is a separate module; staff chat never uses `patientId`.
