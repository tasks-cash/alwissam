# Role Dashboard Matrix

**Updated:** 2026-07-14

| Role | Dashboard path (target) | Status | Primary widgets (required) | Quick actions | Nav groups |
| --- | --- | --- | --- | --- | --- |
| Owner (ADMIN + specialist) | `/{locale}/doctor/specialist/dashboard` | EXISTING_PARTIAL | doctors, secretaries, patients, today’s appointments, waiting, pending requests, audit feed, financial if data | create doctor/secretary/patient/appointment, waiting, payments, roles, settings | Overview, Appointments, Patients, Staff, Clinical, Finance, Content, Reports, System |
| ADMIN (standalone) | same as owner when clinic-owner rules apply | EXISTING_PARTIAL | same | same | same |
| SECRETARY | `/{locale}/secretary/dashboard` | REQUIRED_MISSING | today, waiting, pending requests, doctors working | register patient, walk-in, check-in, payments | Today, Queue, Appointments, Patients, Payments, Profile |
| DOCTOR_SPECIALIST | dashboards + clinical | REQUIRED_MISSING (exam) / PARTIAL (owner shell) | waiting, current patient, today schedule | open exam, notes, follow-up | Today, Patients, Clinical, Schedule, Profile |
| DOCTOR_GENERAL | `/{locale}/doctor/general/dashboard` | REQUIRED_MISSING | waiting for self, today | exam start/complete | Today, Patients, Profile |
| PATIENT | `/{locale}/patient/dashboard` | REQUIRED_MISSING | next appointment, history | request change, profile | Appointments, Profile |
| Custom roles | dynamic via permissions | REQUIRED_MISSING | filtered by permissions | filtered | filtered |

## Access rules (must implement)

- Secretary cannot create Owner / assign Owner / manage system secrets.
- Doctor sees only permitted patients.
- Patient sees only own records.
- Owner retains highest protected access; last Owner cannot be deleted.
- Backend must enforce independently of UI.

## Current redirects after login (`roleDashboardPath`)

| Role | Target |
| --- | --- |
| ADMIN / OWNER / SUPER_ADMIN / DOCTOR_SPECIALIST | `/doctor/specialist/dashboard` |
| DOCTOR_GENERAL | `/doctor/general/dashboard` |
| SECRETARY | `/secretary/dashboard` |
| PATIENT | `/patient/dashboard` |

Locale prefix must be applied by the web client on redirect.
