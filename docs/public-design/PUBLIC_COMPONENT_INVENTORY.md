# Public Component Inventory

## Chrome

| Component | Path | Notes |
|-----------|------|-------|
| PublicChrome | `apps/web/components/public/PublicChrome.tsx` | Sticky header, mobile drawer, footer. No Change / Staff Login links. |
| LanguageSwitcher | `apps/web/components/i18n/LanguageSwitcher.tsx` | Preserves path when switching locale. |

## Layout / primitives

| Component | Path |
|-----------|------|
| PublicSection | `apps/web/components/public/PublicSection.tsx` |
| PageHero | `apps/web/components/public/PageHero.tsx` |
| WorkingHours | `apps/web/components/public/WorkingHours.tsx` |
| ClinicLocation | `apps/web/components/public/ClinicLocation.tsx` |
| ClinicIntroduction | `apps/web/components/public/ClinicIntroduction.tsx` |
| WhyChooseClinic | `apps/web/components/public/WhyChooseClinic.tsx` |
| PatientJourney | `apps/web/components/public/PatientJourney.tsx` |
| DoctorCard | `apps/web/components/public/DoctorCard.tsx` |
| DoctorsSection | `apps/web/components/public/DoctorsSection.tsx` |
| SpecialtyCard | `apps/web/components/public/SpecialtyCard.tsx` |
| SpecialtiesSection | `apps/web/components/public/SpecialtiesSection.tsx` |
| QuickBookPanel | `apps/web/components/public/QuickBookPanel.tsx` |
| FaqAccordion | `apps/web/components/public/FaqAccordion.tsx` |
| ContactForm | `apps/web/components/public/ContactForm.tsx` |
| ContactWorkspace | `apps/web/components/public/ContactWorkspace.tsx` |
| AppointmentWizard | `apps/web/components/public/AppointmentWizard.tsx` |
| PhoneField | `apps/web/components/ui/PhoneField.tsx` |

## Shared page templates

| Component | Path | Routes |
|-----------|------|--------|
| HomePageContent | `components/public/pages/HomePageContent.tsx` | `/[locale]` |
| AboutPageContent | `components/public/pages/AboutPageContent.tsx` | `/[locale]/about` |
| ContactPageContent | `components/public/pages/ContactPageContent.tsx` | `/[locale]/contact` |

## Public APIs used

- `GET /api/public/site` — clinic + content (hours, FAQ, specialties, about, mission)
- `GET /api/public/doctors` — active public doctors
- `GET /api/public/reviews` — approved reviews
- `POST /api/public/contact` — inquiry (name, phone, subject, message)
- `GET /api/public/appointments/available-times`
- `POST /api/public/appointments`

## Assets

- `apps/web/public/images/hero-clinic.svg`
- `apps/web/public/images/about-team.svg`
- `apps/web/public/images/contact-clinic.svg`
