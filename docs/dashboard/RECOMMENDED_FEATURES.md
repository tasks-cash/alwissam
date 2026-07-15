# Recommended Features

**Updated:** 2026-07-14  
These must not block P0 operational workflows.

| ID | Recommendation | Rationale | Dependencies |
| --- | --- | --- | --- |
| REC-001 | Global search dialog (⌘K) | Speeds reception/owner navigation | Indexes on patient phone/name, appointment number |
| REC-002 | In-app notifications center | Surface queue events without email | notifications collection |
| REC-003 | Appointment calendar heat/day views | Legacy calendar parity with better UX | appointments APIs |
| REC-004 | Dashboard widget preferences | Owner personalization | user_preferences collection |
| REC-005 | Mongo report suite | Replace legacy stubs with real aggregates | stable domain data |
| REC-006 | SSE waiting-room refresh | Legacy SSE parity | Redis optional; polling acceptable first |
| REC-007 | Duplicate patient review | Data quality | patient uniqueness rules |
| REC-008 | Refund workflow | Finance completeness | payments module + policy CMS |
| REC-009 | Medical record versioning | Clinical safety | clinical modules |
| REC-010 | Branch/multi-clinic | Only if product expands | tenancy design |

Do not ship UI for REC-* without backend persistence and tests.
