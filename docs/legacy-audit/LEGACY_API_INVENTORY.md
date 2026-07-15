# Legacy API Inventory

**Base:** `old project/alwissam-main/src/app/api`  
**Handlers found:** 32 `route.ts` files  

Auth pattern unless noted: handler-level `getCurrentUser` + role allowlist; mutating routes compare `x-csrf-token` to session CSRF. Middleware does **not** protect `/api/*`.

## Authentication

| Method | Path | Auth | Side effects | Status |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/login` | Public + rate limit | Session create, lockout, secretary shift gate | Functional |
| POST | `/api/auth/logout` | Optional session | Revoke session / clear cookie | Functional |
| POST | `/api/auth/activate` | Public token | Activate patient account | Functional |
| POST/PUT | `/api/auth/password-reset` | Public + rate limit | Token create / consume | Functional (delivery channel may be limited) |

## Public

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/public/appointments` | Creates `AppointmentRequest`; rate-limited |

## Doctor

| Method | Path | Roles | Mutations |
| --- | --- | --- | --- |
| POST | `/api/doctor/exam` | DOCTOR_*, ADMIN | WR + Appointment ± Invoice |
| GET | `/api/doctor/availability` | DOCTOR_*, ADMIN, SECRETARY | Read |
| POST | `/api/doctor/ortho-approval` | DOCTOR_SPECIALIST, ADMIN | Ortho case |
| POST | `/api/doctor/refer-to-general` | DOCTOR_SPECIALIST, ADMIN | Referral |
| PATCH/DELETE | `/api/doctor/patient` | DOCTOR_SPECIALIST, ADMIN (+ owner) | Patient |
| POST/PATCH | `/api/doctor/schedule-appointment` | DOCTOR_SPECIALIST, ADMIN | Appointment |
| POST | `/api/doctor/create-patient-account` | DOCTOR_SPECIALIST, ADMIN | PatientAccount + User |

## Medical / files / realtime

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/medical/dental-chart` | Doctors + ADMIN |
| POST | `/api/files/upload` | **Any authenticated user** — ownership gap |
| GET | `/api/realtime/stream` | **Any authenticated user** — clinic counters SSE |

## Secretary

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/secretary/patients` | Create patient |
| POST | `/api/secretary/walk-in` | Walk-in → WR |
| POST | `/api/secretary/scheduled-check-in` | Check-in → WR |
| POST | `/api/secretary/appointments/[id]` | update/reject/remove/**direct** |
| POST | `/api/secretary/appointments/[id]/arrive` | Arrive flow |
| POST | `/api/secretary/waiting-room/[id]` | Status / remove |
| POST | `/api/secretary/invoices` | Invoices |
| POST | `/api/secretary/payments` | Payments |
| POST | `/api/secretary/collect-charge` | Collect post-exam |
| POST | `/api/secretary/checkout` | Checkout |
| POST/PATCH | `/api/secretary/schedule-appointment` | **Always 403** (intentional disable) |

## Admin (clinic owner)

| Method | Path | Gate |
| --- | --- | --- |
| POST/PATCH/DELETE | `/api/admin/doctors` | `isClinicOwner` |
| POST/PATCH/DELETE | `/api/admin/secretaries` | `isClinicOwner` |
| PUT | `/api/admin/clinic-settings` | `isClinicOwner` |

## Staff

| Method | Path | Notes |
| --- | --- | --- |
| PATCH | `/api/staff/profile` | SECRETARY, ADMIN |
| GET/POST/DELETE | `/api/staff/chat` | Internal staff chat |
| POST | `/api/staff/chat/voice` | Voice message (base64 in DB) |

## Dead / stub / unused by specialist UI

| Endpoint | Classification |
| --- | --- |
| `/api/secretary/schedule-appointment` | Stub 403 |
| `/api/realtime/stream` | API exists; **not used** by specialist dashboard |
| Permission DB APIs | **No** CRUD routes for Permission tables |

## Validation

Primarily Zod schemas in `src/lib/validations` + ad-hoc body parsing in handlers. Exam route validates amount when `covered` is false.

## Error shape

Typical JSON `{ error: string }` with HTTP 4xx — **not** a uniform Nest-style error envelope.
