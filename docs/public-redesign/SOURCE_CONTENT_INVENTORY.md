# Source Content Inventory

| Key | Source | Target |
| --- | --- | --- |
| Clinic name | Hardcoded «عيادة الوسام لطب الأسنان» | Mongo `clinic_info` + defaults AR/EN/FR |
| About | `public_pages.aboutAr` | `aboutAr/En/Fr` + mission |
| Services | CMS list (AR names) | Multilingual services[] with slugs |
| FAQs | CMS walk-in / account FAQs | Multilingual faqs[] (source FAQs merged into defaults) |
| Surgery/Ortho | Hardcoded marketing pages | Specialties + services |
| Contact | clinic_info + env | Public site API + contact messages |
| Policies | Not present as pages | Added multilingual policy defaults |

Fake statistics/testimonials were **not** present in source and were **not** invented.
