# Public Page Redesign Matrix

| Requirement | Home | About | Contact | Status |
|-------------|------|-------|---------|--------|
| Shared localized template | HomePageContent | AboutPageContent | ContactPageContent | Done |
| Premium hero + CTAs | Yes | Yes | Yes | Done |
| Quick appointment search | QuickBookPanel + real slots | — | AppointmentWizard | Done |
| Why Choose Clinic (8 items) | Yes | Yes | — | Done |
| Patient Journey (7 steps) | Yes | — | — | Done |
| 3 real doctors | DoctorsSection limit 3 | Same | Used in wizard | Done |
| All active specialties + dentistry | SpecialtiesSection | Same | Wizard specialties | Done |
| FAQ from Mongo/settings | Preview + /faq | — | — | Expanded defaults |
| Working hours Sat–Thu / Fri closed | ClinicLocation | Same | Same + footer | Done (single clinic_info source) |
| Location / contact strip | Yes | Yes | Yes | Done |
| Inquiry form (no email) | — | — | ContactForm | Done |
| Booking wizard | — | — | ContactWorkspace | Done |
| Staff Login hidden | Nav/footer | Same | Same | Done |
| Change link absent | Nav/footer/mobile | Same | Same | Confirmed absent |
| RTL ar / LTR en fr | Yes | Yes | Yes | Server HtmlLangDir |
| Images (Next Image) | SVG illustrations | SVG | SVG | Done (no private patient photos) |

## Exact routes

| Visitor URL | Locale behavior |
|-------------|-----------------|
| `/`, `/about`, `/contact` | Middleware → default locale (`ar`) prefix |
| `/ar`, `/en`, `/fr` | Homepage |
| `/ar/about`, `/en/about`, `/fr/about` | About |
| `/ar/contact`, `/en/contact`, `/fr/contact` | Contact |

Language switcher keeps path suffix (`/about`, `/contact`).
