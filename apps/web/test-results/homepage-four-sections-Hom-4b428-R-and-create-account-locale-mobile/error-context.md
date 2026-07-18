# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage-four-sections.spec.ts >> Homepage four sections + navbar create account >> English and French homepage preserve LTR and create-account locale
- Location: e2e/homepage-four-sections.spec.ts:75:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.public-header-actions a.public-register-btn[href=\'/en/patient/register\']')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.public-header-actions a.public-register-btn[href=\'/en/patient/register\']')

```

```yaml
- banner:
  - link "Al Wissam Dental Clinic Dental clinic management platform":
    - /url: /en
    - strong: Al Wissam Dental Clinic
    - text: Dental clinic management platform
  - link "Book appointment":
    - /url: /en/book-appointment
  - button "Menu"
- paragraph: Specialized dental care in El Oued
- paragraph: Al Wissam Dental Clinic
- heading "Specialized care that starts with your needs" [level=1]
- paragraph: Al Wissam Dental Clinic — professional care combining expertise and modern techniques in a calm, trustworthy setting.
- list "Specialized dental care in El Oued":
  - listitem: Easy booking from home
  - listitem: Choose the right doctor
  - listitem: Organized appointment follow-up
- link "Book appointment":
  - /url: /en/book-appointment
- link "Meet our doctors":
  - /url: /en/doctors
- figure "Calm, precise oral care":
  - img "Calm, precise oral care"
  - text: Precise care at every step Calm, precise oral care
- paragraph: Quick appointment search
- heading "Quick appointment search" [level=2]
- text: Specialty
- combobox "Specialty":
  - option "Any available doctor" [selected]
  - option "General Dentistry"
  - option "Cosmetic Dentistry"
  - option "Orthodontics"
  - option "Periodontics"
  - option "Endodontics"
  - option "Oral Surgery"
- text: Doctor
- combobox "Doctor":
  - option "Any available doctor" [selected]
  - option "الدكتور منانة فؤاد — Orthodontics · Prosthetics · Surgery"
  - option "الدكتور قعري أسامة — Emergency care · General dentistry"
- text: Preferred date
- textbox "Preferred date"
- button "Continue booking"
- paragraph: Discover Al-Wisam Clinic
- heading "Discover Al-Wisam Clinic" [level=2]
- paragraph: Al-Wisam Dental Clinic is a medical space designed to give patients a clear, organized experience—from choosing a service and doctor to booking and post-visit follow-up.
- paragraph: Al Wissam Dental Clinic — professional care combining expertise and modern techniques in a calm, trustworthy setting.
- list:
  - listitem:
    - heading "Book from home" [level=3]
    - paragraph: Send your appointment request online without unnecessary travel.
  - listitem:
    - heading "Choose your doctor" [level=3]
    - paragraph: Browse public profiles and select the clinician who fits your needs.
  - listitem:
    - heading "Organized scheduling" [level=3]
    - paragraph: A clear path from request to confirmation with reception.
  - listitem:
    - heading "Follow-up after the visit" [level=3]
    - paragraph: Aftercare guidance and organized follow-up when needed.
  - listitem:
    - heading "Patient privacy" [level=3]
    - paragraph: We protect your information and use it only for care and coordination.
  - listitem:
    - heading "Multiple dental services" [level=3]
    - paragraph: General care, orthodontics, surgery, cleaning, and more published services.
- link "Learn more about the clinic":
  - /url: /en/about
- link "Book appointment":
  - /url: /en/book-appointment
- img "Calm, precise oral care"
- heading "Working hours" [level=3]
- list:
  - listitem: Saturday to Thursday
  - listitem: 08:00–17:00
  - listitem: "Friday: Closed"
- paragraph: Our Medical Specialties
- heading "Our Medical Specialties" [level=2]
- paragraph: A range of dental specialties to support accurate diagnosis and appropriate care for each case.
- link "All specialties":
  - /url: /en/specialties
- article:
  - text: Featured
  - heading "General Dentistry" [level=3]:
    - link "General Dentistry":
      - /url: /en/specialties/general-dentistry
  - paragraph: Diagnosis and treatment of common dental problems, supporting oral health through checkups and preventive and restorative care.
  - strong: "7"
  - text: available services
  - strong: "0"
  - text: doctors
  - list:
    - listitem:
      - link "Teeth Whitening":
        - /url: /en/services/teeth-whitening
    - listitem:
      - link "Dental Polishing":
        - /url: /en/services/dental-polishing
    - listitem:
      - link "Dental Checkup":
        - /url: /en/services/dental-checkup
  - link "View specialty":
    - /url: /en/specialties/general-dentistry
  - link "Service information":
    - /url: /en/specialties/general-dentistry
- article:
  - text: Featured
  - heading "Cosmetic Dentistry" [level=3]:
    - link "Cosmetic Dentistry":
      - /url: /en/specialties/cosmetic-dentistry
  - paragraph: Treatments aimed at improving the appearance of teeth and smile while preserving oral health and function.
  - strong: "3"
  - text: available services
  - strong: "0"
  - text: doctors
  - list:
    - listitem:
      - link "Teeth Whitening":
        - /url: /en/services/teeth-whitening
    - listitem:
      - link "Dental Polishing":
        - /url: /en/services/dental-polishing
    - listitem:
      - link "Dental Veneers":
        - /url: /en/services/dental-veneers
  - link "View specialty":
    - /url: /en/specialties/cosmetic-dentistry
  - link "Service information":
    - /url: /en/specialties/cosmetic-dentistry
- article:
  - text: Featured
  - heading "Orthodontics" [level=3]:
    - link "Orthodontics":
      - /url: /en/specialties/orthodontics
  - paragraph: Diagnosis and correction of teeth and jaw alignment using appliances suited to each case.
  - strong: "3"
  - text: available services
  - strong: "0"
  - text: doctors
  - list:
    - listitem:
      - link "Orthodontic Consultation":
        - /url: /en/services/orthodontic-consultation
    - listitem:
      - link "Fixed Braces":
        - /url: /en/services/fixed-braces
    - listitem:
      - link "Clear Aligners":
        - /url: /en/services/clear-aligners
  - link "View specialty":
    - /url: /en/specialties/orthodontics
  - link "Service information":
    - /url: /en/specialties/orthodontics
- article:
  - text: Featured
  - heading "Periodontics" [level=3]:
    - link "Periodontics":
      - /url: /en/specialties/periodontics
  - paragraph: Prevention, diagnosis, and treatment of gum disease and supporting periodontal tissues.
  - strong: "1"
  - text: available services
  - strong: "0"
  - text: doctors
  - list:
    - listitem:
      - link "Gum Disease Treatment":
        - /url: /en/services/gum-disease-treatment
  - link "View specialty":
    - /url: /en/specialties/periodontics
  - link "Service information":
    - /url: /en/specialties/periodontics
- article:
  - text: Featured
  - heading "Endodontics" [level=3]:
    - link "Endodontics":
      - /url: /en/specialties/endodontics
  - paragraph: Diagnosis and treatment of pulp and root conditions to help preserve the natural tooth when possible.
  - strong: "2"
  - text: available services
  - strong: "0"
  - text: doctors
  - list:
    - listitem:
      - link "Root Canal Treatment":
        - /url: /en/services/root-canal-treatment
    - listitem:
      - link "Dental Abscess Treatment":
        - /url: /en/services/dental-abscess-treatment
  - link "View specialty":
    - /url: /en/specialties/endodontics
  - link "Service information":
    - /url: /en/specialties/endodontics
- article:
  - text: Featured
  - heading "Oral Surgery" [level=3]:
    - link "Oral Surgery":
      - /url: /en/specialties/oral-surgery
  - paragraph: Specialized surgical procedures for oral conditions including complex extractions and wisdom teeth.
  - strong: "3"
  - text: available services
  - strong: "0"
  - text: doctors
  - list:
    - listitem:
      - link "Tooth Extraction":
        - /url: /en/services/tooth-extraction
    - listitem:
      - link "Wisdom Tooth Removal":
        - /url: /en/services/wisdom-tooth-removal
    - listitem:
      - link "Dental Abscess Treatment":
        - /url: /en/services/dental-abscess-treatment
  - link "View specialty":
    - /url: /en/specialties/oral-surgery
  - link "Service information":
    - /url: /en/specialties/oral-surgery
- paragraph: Dental Services
- heading "Dental Services" [level=2]
- paragraph: Choose the service you need, then review available doctors and appointment times to book.
- link "All services":
  - /url: /en/services
- article:
  - heading "Teeth Whitening" [level=3]:
    - link "Teeth Whitening":
      - /url: /en/services/teeth-whitening
  - paragraph: Improve tooth shade after a clinical assessment.
  - paragraph:
    - text: "Specialty:"
    - link "Cosmetic Dentistry":
      - /url: /en/specialties/cosmetic-dentistry
  - paragraph:
    - strong: "0"
    - text: doctors
  - paragraph: Initial exam required
  - link "Service details":
    - /url: /en/services/teeth-whitening
  - link "Service information":
    - /url: /en/services/teeth-whitening
- article:
  - heading "Dental Polishing" [level=3]:
    - link "Dental Polishing":
      - /url: /en/services/dental-polishing
  - paragraph: Polish tooth surfaces after cleaning when indicated.
  - paragraph:
    - text: "Specialty:"
    - link "General Dentistry":
      - /url: /en/specialties/general-dentistry
  - paragraph:
    - strong: "0"
    - text: doctors
  - paragraph: Available to book
  - link "Service details":
    - /url: /en/services/dental-polishing
  - link "Service information":
    - /url: /en/services/dental-polishing
- article:
  - heading "Dental Checkup" [level=3]:
    - link "Dental Checkup":
      - /url: /en/services/dental-checkup
  - paragraph: A thorough oral and dental examination.
  - paragraph:
    - text: "Specialty:"
    - link "General Dentistry":
      - /url: /en/specialties/general-dentistry
  - paragraph:
    - strong: "0"
    - text: doctors
  - paragraph: Available to book
  - link "Service details":
    - /url: /en/services/dental-checkup
  - link "Service information":
    - /url: /en/services/dental-checkup
- article:
  - heading "Dental Fillings" [level=3]:
    - link "Dental Fillings":
      - /url: /en/services/dental-fillings
  - paragraph: Restore damaged teeth with suitable fillings.
  - paragraph:
    - text: "Specialty:"
    - link "Restorative Dentistry":
      - /url: /en/specialties/restorative-dentistry
  - paragraph:
    - strong: "0"
    - text: doctors
  - paragraph: Available to book
  - link "Service details":
    - /url: /en/services/dental-fillings
  - link "Service information":
    - /url: /en/services/dental-fillings
- article:
  - heading "Root Canal Treatment" [level=3]:
    - link "Root Canal Treatment":
      - /url: /en/services/root-canal-treatment
  - paragraph: Treat pulp and root canals when inflamed or infected.
  - paragraph:
    - text: "Specialty:"
    - link "Endodontics":
      - /url: /en/specialties/endodontics
  - paragraph:
    - strong: "0"
    - text: doctors
  - paragraph: Initial exam required
  - link "Service details":
    - /url: /en/services/root-canal-treatment
  - link "Service information":
    - /url: /en/services/root-canal-treatment
- article:
  - heading "Tooth Extraction" [level=3]:
    - link "Tooth Extraction":
      - /url: /en/services/tooth-extraction
  - paragraph: Tooth removal when clinically indicated.
  - paragraph:
    - text: "Specialty:"
    - link "Oral Surgery":
      - /url: /en/specialties/oral-surgery
  - paragraph:
    - strong: "0"
    - text: doctors
  - paragraph: Initial exam required
  - link "Service details":
    - /url: /en/services/tooth-extraction
  - link "Service information":
    - /url: /en/services/tooth-extraction
- article:
  - heading "Dental Implants" [level=3]:
    - link "Dental Implants":
      - /url: /en/services/dental-implants
  - paragraph: Replace missing teeth with dental implants.
  - paragraph:
    - text: "Specialty:"
    - link "Dental Implantology":
      - /url: /en/specialties/dental-implantology
  - paragraph:
    - strong: "0"
    - text: doctors
  - paragraph: Initial exam required
  - link "Service details":
    - /url: /en/services/dental-implants
  - link "Service information":
    - /url: /en/services/dental-implants
- article:
  - heading "Dental Crowns" [level=3]:
    - link "Dental Crowns":
      - /url: /en/services/dental-crowns
  - paragraph: A crown to restore tooth form and function.
  - paragraph:
    - text: "Specialty:"
    - link "Prosthodontics":
      - /url: /en/specialties/prosthodontics
  - paragraph:
    - strong: "0"
    - text: doctors
  - paragraph: Initial exam required
  - link "Service details":
    - /url: /en/services/dental-crowns
  - link "Service information":
    - /url: /en/services/dental-crowns
- region "Book your appointment from home with ease":
  - paragraph: Book from home
  - heading "Book your appointment from home with ease" [level=2]
  - paragraph: No need to waste time and money travelling just to look for an appointment. Choose the service, doctor, and date that suit you, then send your booking request from home.
  - paragraph: Leave visit coordination and confirmation to the Al-Wisam clinic team.
  - list:
    - listitem:
      - strong: Choose the service
      - paragraph: Select the service or specialty that fits your needs.
    - listitem:
      - strong: Choose the doctor
      - paragraph: Browse published doctors and pick the right clinician.
    - listitem:
      - strong: Pick a time
      - paragraph: Choose your preferred date and time.
    - listitem:
      - strong: Send the booking request
      - paragraph: Submit your request and wait for clinic confirmation.
  - link "Book your appointment now":
    - /url: /en/book-appointment
  - link "Meet our doctors":
    - /url: /en/doctors
  - paragraph: Choose the service, doctor, and time, then wait for confirmation from the clinic team.
  - figure:
    - img "Booking a medical appointment from home"
- paragraph: Doctors
- heading "Doctors" [level=2]
- paragraph: A specialized medical team to help you choose the right care and book with ease.
- article:
  - paragraph: Orthodontics · Prosthetics · Surgery
  - heading "الدكتور منانة فؤاد" [level=3]
  - paragraph: Specialist Dentist
  - paragraph: Clinic principal — orthodontics, prosthetics, surgery, and multi-visit care.
  - paragraph: "Languages: ar · fr"
  - paragraph: "Working days: Saturday to Thursday · 08:00–17:00"
  - paragraph: "Availability: Sat–Thu 08:00–17:00"
  - link "View profile for Doctor الدكتور منانة فؤاد":
    - /url: /en/doctors/6a5710779eb02f6e53d8a4ff
    - text: View doctor profile
  - link "Book an appointment with Doctor الدكتور منانة فؤاد":
    - /url: /en/book-appointment?doctor=6a5710779eb02f6e53d8a4ff
    - text: Book an appointment
- article:
  - paragraph: Emergency care · General dentistry
  - heading "الدكتور قعري أسامة" [level=3]
  - paragraph: General Dentist
  - paragraph: General dentist for urgent cases, routine care, and simple extractions.
  - paragraph: "Languages: ar · fr"
  - paragraph: "Working days: Saturday to Thursday · 08:00–17:00"
  - paragraph: "Availability: Sat–Thu 08:00–17:00"
  - link "View profile for Doctor الدكتور قعري أسامة":
    - /url: /en/doctors/6a5710779eb02f6e53d8a500
    - text: View doctor profile
  - link "Book an appointment with Doctor الدكتور قعري أسامة":
    - /url: /en/book-appointment?doctor=6a5710779eb02f6e53d8a500
    - text: Book an appointment
- link "All doctors":
  - /url: /en/doctors
- paragraph: Why our clinic
- heading "Why our clinic" [level=2]
- list:
  - listitem:
    - heading "Multidisciplinary clinical team" [level=3]
    - paragraph: Clear specialties help you reach the right care efficiently.
  - listitem:
    - heading "Easy doctor selection" [level=3]
    - paragraph: Browse public profiles and choose by specialty and availability.
  - listitem:
    - heading "Clear, flexible scheduling" [level=3]
    - paragraph: Online requests with reception confirmation against the live schedule.
  - listitem:
    - heading "Patient privacy respected" [level=3]
    - paragraph: We use your details for care and coordination only, with clear boundaries.
  - listitem:
    - heading "Organized post-visit follow-up" [level=3]
    - paragraph: Follow-up visits can be arranged through reception per your clinician’s plan.
  - listitem:
    - heading "Clear information before and after visits" [level=3]
    - paragraph: Patient pages explain what to bring and how follow-up works.
  - listitem:
    - heading "Convenient working hours" [level=3]
    - paragraph: Saturday to Thursday 08:00–17:00; Friday closed.
  - listitem:
    - heading "A calm path from booking to follow-up" [level=3]
    - paragraph: Specialty → doctor → time → confirmation → visit → follow-up.
- paragraph: Your journey at Al-Wisam Clinic
- heading "Your journey at Al-Wisam Clinic" [level=2]
- paragraph: Clear steps from choosing a service through post-visit follow-up.
- list "Your journey at Al-Wisam Clinic":
  - listitem:
    - heading "1. Choose a service or specialty" [level=3]
    - paragraph: Select the service or specialty that best matches your visit reason.
  - listitem:
    - heading "2. Choose a doctor or leave it to reception" [level=3]
    - paragraph: Pick a published clinician, or let reception assign the right doctor.
  - listitem:
    - heading "3. Choose a suitable date and time" [level=3]
    - paragraph: Select preferred slots within the clinic’s working hours.
  - listitem:
    - heading "4. Submit the booking request" [level=3]
    - paragraph: Send your details and visit reason through the secure form.
  - listitem:
    - heading "5. Review and confirm the appointment" [level=3]
    - paragraph: Reception reviews the request and confirms the final time with you.
  - listitem:
    - heading "6. Visit the clinic" [level=3]
    - paragraph: On arrival, reception checks you in and guides you to your clinician.
  - listitem:
    - heading "7. Receive instructions and follow-up" [level=3]
    - paragraph: You receive aftercare guidance and can book follow-up when needed.
- link "Start your journey and book":
  - /url: /en/book-appointment
- paragraph: Before and After Treatment
- heading "Before and After Treatment" [level=2]
- paragraph: Treatment cases published after review and the required consents.
- paragraph: No published before-and-after cases are available yet.
- paragraph: Results vary from one case to another. The treatment plan is determined after examination and assessment by the dentist.
- paragraph: Images are published after obtaining the required consents and do not guarantee the same outcome.
- paragraph: Patient Experiences
- heading "Patient Experiences" [level=2]
- paragraph: Opinions and experiences published after review and approval by Al-Wisam Clinic.
- paragraph: No published patient experiences are available yet.
- paragraph: Patient account
- heading "All your care details in one secure account" [level=2]
- paragraph: Create a patient account to follow appointments, past visits, images and reports, and doctor instructions from a private, secure dashboard.
- list:
  - listitem: Follow all appointments
  - listitem: Know each booking status
  - listitem: View past visits
  - listitem: Access your private images and reports
  - listitem: Review doctor instructions
  - listitem: Receive follow-up reminders
  - listitem: Update your personal details
  - listitem: Message about completed visits
- link "Create an account":
  - /url: /en/patient/register
- link "Sign in":
  - /url: /en/patient/login
- figure:
  - img "Professional dental care environment for patients"
- paragraph: FAQ
- heading "FAQ" [level=2]
- link "FAQ":
  - /url: /en/faq
- group: How can I book an appointment?
- group: How do I check in when I arrive?
- group: Do I need an account to visit?
- group: What are the clinic hours?
- group: Can I choose a specific doctor?
- group: How do I know a doctor’s available times?
- figure:
  - img "Clinic location and contact information"
- paragraph: Location and Contact
- heading "Location and Contact" [level=2]
- paragraph: Contact us or open directions to Al-Wisam Clinic before your visit.
- article:
  - heading "Al Wissam Dental Clinic" [level=3]
  - paragraph: Emir Abdelkader District, next to Zakour Farhat Essaghir Primary School, El Oued 39009, Algeria
  - paragraph:
    - link "0663 09 82 08":
      - /url: tel:+213663098208
  - paragraph:
    - link "clinic.elwissam@gmail.com":
      - /url: mailto:clinic.elwissam@gmail.com
  - paragraph:
    - link "Visit Al Wissam Dental Clinic on Facebook":
      - /url: https://web.facebook.com/Clinic.ElWissam
      - text: Clinic.ElWissam
- article:
  - heading "Working hours" [level=3]
  - list:
    - listitem: Saturday to Thursday
    - listitem: 08:00–17:00
    - listitem: "Friday: Closed"
- link "Book appointment":
  - /url: /en/book-appointment
- link "Send an Inquiry":
  - /url: /en/contact
- link "Call the Clinic":
  - /url: tel:+213663098208
- link "Contact via WhatsApp":
  - /url: https://wa.me/213663098208?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20Al%20Wissam%20Dental%20Clinic%20services%20and%20book%20an%20appointment.
- link "Get Directions":
  - /url: https://maps.app.goo.gl/1KtpHq8VWw98enw8A
- text: Clinic hours
- heading "Your first step toward a healthier smile" [level=2]
- paragraph: Book from home, choose your doctor and time, or contact us to organize your visit.
- list:
  - listitem: Saturday to Thursday
  - listitem: 08:00–17:00
  - listitem: 0663 09 82 08
  - listitem: Emir Abdelkader District, next to Zakour Farhat Essaghir Primary School, El Oued 39009, Algeria
- link "Book appointment":
  - /url: /en/book-appointment
- link "Contact us":
  - /url: /en/contact
- link "WhatsApp":
  - /url: https://wa.me/213663098208?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20Al%20Wissam%20Dental%20Clinic%20services%20and%20book%20an%20appointment.
- contentinfo:
  - heading "Clinic" [level=2]
  - paragraph: Dental clinic management platform
  - link "Book appointment":
    - /url: /en/book-appointment
  - heading "Quick links" [level=2]
  - list:
    - listitem:
      - link "Home":
        - /url: /en
    - listitem:
      - link "About":
        - /url: /en/about
    - listitem:
      - link "Services":
        - /url: /en/services
    - listitem:
      - link "Specialties":
        - /url: /en/specialties
    - listitem:
      - link "Doctors":
        - /url: /en/doctors
    - listitem:
      - link "Reviews":
        - /url: /en/reviews
    - listitem:
      - link "FAQ":
        - /url: /en/faq
    - listitem:
      - link "Contact":
        - /url: /en/contact
  - heading "Patients" [level=2]
  - list:
    - listitem:
      - link "Patient information":
        - /url: /en/patient-information
    - listitem:
      - link "Before your visit":
        - /url: /en/before-your-visit
    - listitem:
      - link "After your visit":
        - /url: /en/after-your-visit
    - listitem:
      - link "Support":
        - /url: /en/support
    - listitem:
      - link "Refund policy":
        - /url: /en/refund-policy
    - listitem:
      - link "Cancellation policy":
        - /url: /en/cancellation-policy
  - heading "Legal" [level=2]
  - list:
    - listitem:
      - link "Privacy":
        - /url: /en/privacy
    - listitem:
      - link "Terms":
        - /url: /en/terms
    - listitem:
      - link "Cookies":
        - /url: /en/cookies
    - listitem:
      - link "Accessibility":
        - /url: /en/accessibility
    - listitem:
      - link "Medical disclaimer":
        - /url: /en/medical-disclaimer
  - heading "Contact" [level=2]
  - list:
    - listitem:
      - link "0663 09 82 08":
        - /url: tel:+213663098208
    - listitem:
      - link "clinic.elwissam@gmail.com":
        - /url: mailto:clinic.elwissam@gmail.com
    - listitem: Emir Abdelkader District, next to Zakour Farhat Essaghir Primary School, El Oued 39009, Algeria
    - listitem: "Saturday to Thursday 08:00–17:00 Friday: Closed"
    - listitem:
      - link "Contact via WhatsApp":
        - /url: https://wa.me/213663098208?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20Al%20Wissam%20Dental%20Clinic%20services%20and%20book%20an%20appointment.
    - listitem:
      - link "Visit Al Wissam Dental Clinic on Facebook":
        - /url: https://web.facebook.com/Clinic.ElWissam
        - text: Facebook Page
    - listitem:
      - link "Contact":
        - /url: /en/contact
  - text: © 2026 Al Wissam Dental Clinic
  - link "Privacy":
    - /url: /en/privacy
  - link "Terms":
    - /url: /en/terms
- link "Open a WhatsApp conversation with Al Wissam Dental Clinic":
  - /url: https://wa.me/213663098208?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20Al%20Wissam%20Dental%20Clinic%20services%20and%20book%20an%20appointment.
  - text: Contact us on WhatsApp
- alert
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test.describe("Homepage four sections + navbar create account", () => {
  4   |   test("Arabic homepage shows booking, doctors, patient account, location", async ({
  5   |     page,
  6   |   }) => {
  7   |     await page.goto("/ar");
  8   |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  9   | 
  10  |     await expect(
  11  |       page.getByRole("heading", {
  12  |         name: /احجز موعدك من منزلك بكل سهولة/,
  13  |       }),
  14  |     ).toBeVisible();
  15  |     await expect(page.locator(".booking-home-steps li")).toHaveCount(4);
  16  |     await expect(
  17  |       page.locator(".booking-convenience a[href='/ar/book-appointment']").first(),
  18  |     ).toBeVisible();
  19  |     await expect(
  20  |       page.locator(".booking-convenience a[href='/ar/doctors']").first(),
  21  |     ).toBeVisible();
  22  | 
  23  |     await expect(
  24  |       page.locator(".home-doctors-section").getByRole("heading", { name: /أطباؤنا/ }),
  25  |     ).toBeVisible();
  26  |     await expect(
  27  |       page.locator(".home-doctors-section .pub-doctor-premium"),
  28  |     ).toHaveCount(await page.locator(".home-doctors-section .pub-doctor-premium").count());
  29  | 
  30  |     await expect(
  31  |       page.getByRole("heading", {
  32  |         name: /كل تفاصيل حالتك العلاجية في حساب واحد/,
  33  |       }),
  34  |     ).toBeVisible();
  35  |     await expect(
  36  |       page.locator(
  37  |         ".patient-account-section a[href='/ar/patient/register']",
  38  |       ),
  39  |     ).toBeVisible();
  40  |     await expect(
  41  |       page.locator(".patient-account-section a[href='/ar/patient/login']"),
  42  |     ).toBeVisible();
  43  |     await expect(page.locator(".patient-dash-visual")).toBeVisible();
  44  | 
  45  |     await expect(
  46  |       page.locator(".clinic-location-premium--home").getByRole("heading", {
  47  |         name: /الموقع والتواصل/,
  48  |       }),
  49  |     ).toBeVisible();
  50  |   });
  51  | 
  52  |   test("Create Account appears once in desktop header and once in mobile drawer", async ({
  53  |     page,
  54  |   }) => {
  55  |     await page.setViewportSize({ width: 1366, height: 900 });
  56  |     await page.goto("/ar");
  57  |     const desktopRegister = page.locator(
  58  |       ".public-header-actions a.public-register-btn[href='/ar/patient/register']",
  59  |     );
  60  |     await expect(desktopRegister).toHaveCount(1);
  61  |     await expect(
  62  |       page.locator(".public-header-actions a.public-book-btn[href='/ar/book-appointment']"),
  63  |     ).toHaveCount(1);
  64  | 
  65  |     await page.setViewportSize({ width: 390, height: 844 });
  66  |     await page.getByRole("button", { name: /القائمة|Menu/i }).click();
  67  |     await expect(
  68  |       page.locator("#public-mobile-nav a[href='/ar/patient/register']"),
  69  |     ).toHaveCount(1);
  70  |     await expect(
  71  |       page.locator("#public-mobile-nav a[href='/ar/book-appointment']"),
  72  |     ).toHaveCount(1);
  73  |   });
  74  | 
  75  |   test("English and French homepage preserve LTR and create-account locale", async ({
  76  |     page,
  77  |   }) => {
  78  |     await page.goto("/en");
  79  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  80  |     await expect(
  81  |       page.locator(
  82  |         ".public-header-actions a.public-register-btn[href='/en/patient/register']",
  83  |       ),
> 84  |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
  85  |     await expect(
  86  |       page.getByRole("heading", {
  87  |         name: /Book your appointment from home with ease/i,
  88  |       }),
  89  |     ).toBeVisible();
  90  | 
  91  |     await page.goto("/fr");
  92  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  93  |     await expect(
  94  |       page.locator(
  95  |         ".public-header-actions a.public-register-btn[href='/fr/patient/register']",
  96  |       ),
  97  |     ).toBeVisible();
  98  |     await expect(
  99  |       page.getByRole("heading", {
  100 |         name: /Réservez votre rendez-vous depuis chez vous/i,
  101 |       }),
  102 |     ).toBeVisible();
  103 |   });
  104 | });
  105 | 
```