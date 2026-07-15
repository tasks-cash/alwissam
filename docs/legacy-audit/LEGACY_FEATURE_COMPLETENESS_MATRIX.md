# Legacy Feature Completeness Matrix

Legend: Y = Found & wired · P = Partial · N = Not found / stub · ? = Static only (no runtime)

| Feature | UI | API | DB | Auth | Validation | Tests | Runtime | Migration value | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Doctor specialist dashboard | Y | Y* | Y | Y | P | N | ? | High | *SSR Prisma; exam API for actions |
| يوم العمل (as entity) | P | N | N | — | — | N | ? | Low | Nav group only |
| المعاينة | Y | Y | Y | Y | P | N | ? | Critical | |
| لوحة اليوم | Y | Y* | Y | Y | P | N | ? | High | *SSR |
| Patient preview card | Y | Y* | Y | Y | P | N | ? | Critical | |
| معاينة button | Y | Y | Y | Y | Y amount | N | ? | Critical | |
| مرضاي | Y | Y* | Y | Y | P | N | ? | High | loadDoctorPatients |
| Patient details `/patients/[id]` | Y | mixed | Y | Y | P | N | ? | High | |
| الأطباء CRUD | Y | Y | Y | owner | Y | N | ? | High | |
| السكرتارية CRUD | Y | Y | Y | owner | Y | N | ? | High | |
| تواصل معنا | Y | Y | ClinicSetting | owner | P | N | ? | Medium | |
| مواعيد العمل | Y | Y | WorkingHour | owner | P | N | ? | High | |
| صفحات الموقع | Y | Y | ClinicSetting | owner | P | N | ? | Medium | |
| عرض الأطباء | Y | Y | Doctor fields | owner | P | N | ? | Medium | |
| Logout | Y | Y | Session | Y | — | N | ? | High | |
| WhatsApp FAB | N | N | N | — | — | N | ? | N/A | FAB is staff chat |
| Staff chat | Y | Y | Message | Y | P | N | ? | Medium | |
| Appointment queue (WR) | Y | Y | Y | Y | P | N | ? | Critical | |
| Consultation session | Y | Y | Y | Y | P | N | ? | Critical | |
| Dental chart | P | Y | Y | role | P | N | ? | Medium | via medical API / patient page |
| Prescriptions UI (specialist nav) | N | N/P | Y | — | — | N | ? | Low | schema without nav page |
| Orthodontics / surgery pages | STUB | some APIs | Y | — | — | N | ? | Rewrite if needed | |
| Notifications | N/P | N | Y | — | — | N | ? | Low | models exist |
| Audit logs UI | STUB admin | write path Y | Y | — | — | N | ? | Medium | |
| Payments (secretary) | Y | Y | Y | role | P | N | ? | High | post-exam handoff |
| Reports | STUB | N | — | — | — | N | ? | Rebuild | |
| Realtime waiting UI | N | SSE exists | Y | weak | — | N | ? | Optional | |
| Dynamic permissions UI | STUB | N | Y | N | — | N | ? | Rebuild carefully | |

\*Server Component direct Prisma = “data API” without separate HTTP round-trip.
