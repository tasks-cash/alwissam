# Validation Matrix

**Audited:** 2026-07-14  
**Goal:** Frontend (Zod / RHF) and Backend (NestJS `class-validator`) must accept/reject the same payloads.

## Global validation architecture (target)

| Layer | Technology | Location (planned / current) |
| --- | --- | --- |
| Shared constraints | constants + Zod helpers | `packages/shared-validation` (currently login placeholder only) |
| Frontend forms | React Hook Form + Zod | `apps/web` (not wired yet); legacy uses HTML + sparse Zod |
| Backend DTOs | `class-validator` + `class-transformer` | `apps/api` — global ValidationPipe already: `whitelist`, `transform`, `forbidNonWhitelisted` |
| Messages | Arabic RTL | Must remain Arabic for user-visible errors |

## Shared constraint targets (to centralize in STEP 3)

| Constraint ID | Rule | Current FE | Current Nest | Current Legacy API | Parity |
| --- | --- | --- | --- | --- | --- |
| VAL-PASS-MIN | Password min length | shared-validation `min(1)`; login pages HTML vary; create HTML `minLength=8`; reset HTML `minLength=8` | LoginDto `MinLength(6)` | login zod `min(6)`; create doctors/secretaries imperative ≥8 | **FAIL** |
| VAL-PASS-CREATE-REQ | Password required on account create | HTML required on create doctor/secretary | No Create*Dto | Imperative required | Nest missing |
| VAL-PASS-UPDATE-OPT | Password optional on update; empty ignored | Edit forms leave blank | No Update*Dto | Implemented in Prisma admin routes | Nest missing |
| VAL-PASS-CONFIRM | Confirm password match (create/reset) | Mostly absent | N/A (confirm not persisted) | Absent | **FAIL** |
| VAL-ID-MIN | Login identifier min 3 | HTML / zod | LoginDto `MinLength(3)` | zod min 3 | OK for login |
| VAL-PHONE-DIGITS | Phone digits only | Text/tel; little strip/normalize | none | min length only; allows non-digits | **FAIL** |
| VAL-PHONE-LEN | Phone length 8–15 digits (target) | often `minLength=8` only | none | `min(8)` | Partial |
| VAL-NAME-MIN | Full name min 2 | Mixed HTML | none | patient/booking zod min 2 | Nest missing |
| VAL-EMAIL | Email format when provided | HTML email / optional | none beyond login string | Mixed | Nest missing |
| VAL-AMOUNT | Positive money | `type=number` in UI | none | paymentSchema positive | Nest missing |
| VAL-ROLE | Allowed RoleCode enum | selects | User.roleCode enum in schema | Prisma enums | Nest DTOs incomplete |
| VAL-PORTAL | staff \| patient | login body | LoginDto `@IsIn` | loginSchema | OK |
| VAL-FILE-TYPE | Allowed MIME | upload route | none | hardcoded in route | Nest missing |
| VAL-FILE-SIZE | Max upload MB | env | none | env `MAX_UPLOAD_SIZE_MB` | Nest missing |

## Login contract comparison

| Field | Legacy zod (`src/lib/validations`) | Nest `LoginDto` | shared-validation `loginSchema` | Required parity action |
| --- | --- | --- | --- | --- |
| Identifier | `email` or `identifier` → normalized `email` | `email` or `identifier` → `loginId` | `identifier` only | Align shared schema to support both aliases |
| Password min | 6 | 6 | 1 | Raise shared min to product rule (propose **8** for create/reset; login keep legacy **6** or unify) |
| rememberMe | optional boolean | optional boolean | absent | Add to shared |
| portal | optional enum | optional enum | absent | Add to shared |
| Arabic errors | Yes | Service returns Arabic; DTO defaults English | English | Localize DTO / shared messages to Arabic |

**Decision needed in STEP 3 (proposed default):**

- **Login password minimum:** keep **6** for backward compatibility with existing seed accounts.
- **Account creation / reset / change password minimum:** **8**.
- Document both constants as `PASSWORD_MIN_LOGIN` and `PASSWORD_MIN_CREATE`.

## Form → validation coverage

| Form ID | FE validation | BE validation today | Target Nest DTO | Parity status |
| --- | --- | --- | --- | --- |
| FORM-001 / 002 | HTML + API zod | Nest LoginDto (if Nest) / legacy zod | LoginDto | Partial — web not on Nest yet |
| FORM-003 / 004 / 005 | HTML only (length) | Prisma route checks | PasswordReset*, Activate* | Missing Nest |
| FORM-007 | HTML + bookAppointmentSchema | Prisma route | CreateAppointmentRequestDto | Missing Nest |
| FORM-009 | HTML | Imperative | CreateDoctorDto | Missing Nest |
| FORM-010 | HTML partial | Imperative | UpdateDoctorDto | Missing Nest |
| FORM-013 | HTML | Imperative | CreateSecretaryDto | Missing Nest |
| FORM-014 | weak HTML | Imperative ≥8 if set | UpdateSecretaryDto | Missing Nest |
| FORM-017–019 | almost none | light server checks | ClinicSettingsDto sections | Missing Nest |
| FORM-022–027 | mixed | imperative / zod some | CreatePatientDto, WalkInDto, ScheduleDto, CollectChargeDto | Missing Nest |
| FORM-031–032 | mixed | imperative | ExamDto, UpdatePatientDto, CreatePatientAccountDto | Missing Nest |

## ValidationPipe (Nest) — current

Configured in `apps/api/src/main.ts`:

- `whitelist: true`
- `transform: true`
- `forbidNonWhitelisted: true`

Exception filter for Arabic field errors: **not yet implemented**.

## Parity tests required (STEP 3 / later)

For each shared schema / DTO pair:

1. Valid payload accepted by Zod and Nest.
2. Missing required field rejected by both.
3. Password too short rejected consistently per rule set.
4. Phone with letters rejected by both.
5. Confirm password mismatch rejected on FE; BE never requires confirm field.
6. Update with empty password does not change `passwordHash`.
