# Dialog and Feedback Matrix

**Audited:** 2026-07-14

## Feedback pattern inventory

| Pattern ID | Pattern | Where used | Issues | Target behavior |
| --- | --- | --- | --- | --- |
| FB-001 | Inline red text `setError` | Most forms | Inconsistent placement; lost on remount | Field-level + form-level Arabic errors |
| FB-002 | Inline green success / success card | `PublicRegisterForm` | Rare elsewhere | Standardized success banner |
| FB-003 | `window.confirm` | delete doctor/secretary, remove waiting, deactivate patient | Native UI breaks RTL/brand | Accessible confirm dialog component |
| FB-004 | `alert` | Rare / legacy | Avoid | Ban in production paths |
| FB-005 | Silent failure | Some delete buttons ignore non-OK without message | Bad UX | Always surface error text |
| FB-006 | Redirect on success | login, activate, some creates via `router.refresh` | OK | Preserve with toast/banner optional |
| FB-007 | No loading disable | Some expand panels | Double-submit risk | Disable submit + spinner |
| FB-008 | Caps Lock warning | Absent | Required by product brief | Add on password fields when practical |
| FB-009 | Show/hide password | Staff login only | Missing elsewhere | Required on all password fields |
| FB-010 | No toast system | — | Ad-hoc only | Lightweight status region or toast |

## Dialog / modal inventory

| Dialog ID | Surface | Type | Inputs | Confirm? | Status |
| --- | --- | --- | --- | --- | --- |
| DLG-001 | `DoctorExamPanel` overlay | Custom modal | covered, amount, note | Start/complete actions | WORKS_IN_LEGACY / MISSING_IN_TARGET |
| DLG-002 | `EditDoctorLoginForm` expand panel | Inline panel | email, phone, newPassword | Save | Not a true dialog |
| DLG-003 | `SecretaryHoursBar` expand | Inline panel | login / hours | Instant / save | Not a true dialog |
| DLG-004 | `SecretaryWalkInForm` expand | Inline panel | walk-in fields | Submit | Not a true dialog |
| DLG-005 | `SecretaryRequestBar` expand | Inline panel | doctor select | Direct / remove + confirm | Mixed |
| DLG-006 | `DoctorPatientCard` panels | Inline panels | info / account / schedule | confirm on delete/deactivate | Complex multi-form |
| DLG-007 | Native `confirm()` deletes | Browser dialog | — | Yes | Replace |

## Accessibility / UX gaps

| Gap | Forms | Priority |
| --- | --- | --- |
| Missing `aria-invalid` / `aria-describedby` on errors | Nearly all | High |
| Password fields missing `autocomplete` correctness | Mixed | High |
| Confirm dialogs not focus-trapped | DLG-001 partial | High |
| No empty-state guidance on stub pages | 25 stubs | Medium (STEP 10) |
| Amount/age with `type=number` | FORM-022/023/028/031 | High (replace for phones; use text+inputMode for amounts if needed) |

## Target feedback components (STEP 11 design system)

| Component | Responsibility |
| --- | --- |
| `FormField` | label, required marker, hint, error |
| `PasswordField` | show/hide, autocomplete, caps-lock, min hint |
| `PhoneField` | digits-only filter, `type=tel`, `inputMode=numeric` |
| `ConfirmDialog` | RTL, focus trap, destructive variant |
| `FormAlert` | success / error / info banners |
| `SubmitButton` | loading / disabled state |
