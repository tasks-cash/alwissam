# Specialty & Service Image Asset Sources

Date: 2026-07-15

Public Specialty/Service cards prefer MongoDB `image` fields when present.
When empty, premium UI falls back to DentalIcon illustrations or local clinic art.

| Specialty/Service | Source page | Original image URL | Author | License note | Local path | Arabic alt | English alt | French alt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Specialty/Service hero fallback | Public marketing | local asset | Project | Project-owned SVG | `apps/web/public/images/hero-clinic.svg` | تخصصات طب الأسنان في عيادة الوسام | Dental specialties at Al Wissam Dental Clinic | Spécialités dentaires de la Clinique Dentaire El Wissam |
| Contact/team decorative (not used here) | Public | local | Project | Project-owned SVG | `apps/web/public/images/about-team.svg` | — | — | — |
| Contact clinic decorative | Public | local | Project | Project-owned SVG | `apps/web/public/images/contact-clinic.svg` | — | — | — |

Specialty/Service Mongo `image` values (when uploaded via admin public-content) remain canonical and are rendered with `next/image` (`unoptimized` for dynamic CMS URLs).

No third-party clinic photos or before/after patient images were introduced in this redesign.
