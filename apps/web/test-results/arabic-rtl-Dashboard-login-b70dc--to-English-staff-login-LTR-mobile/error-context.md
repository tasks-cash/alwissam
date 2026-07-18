# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: arabic-rtl.spec.ts >> Dashboard login redirect preserves locale dir >> English secretary route redirects to English staff login LTR
- Location: e2e/arabic-rtl.spec.ts:157:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/en\/staff\/login/
Received string:  "http://localhost:3004/en/auth/login?next=%2Fen%2Fsecretary%2Fdashboard"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:3004/en/auth/login?next=%2Fen%2Fsecretary%2Fdashboard"

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
- form "Sign in to your account":
  - banner:
    - heading "Sign in to your account" [level=1]
    - paragraph: Sign in to follow your appointments and open the workspace reserved for you at Al-Wisam Clinic.
    - paragraph: Patients, doctors, secretaries, and clinic management can sign in from this page.
  - text: Phone or email *
  - textbox "Phone or email *"
  - text: Password *
  - textbox "Password *"
  - button "إظهار كلمة المرور": إظهار
  - checkbox "Remember me"
  - text: Remember me
  - link "Forgot password?":
    - /url: /en/auth/forgot-password
  - button "Sign in"
  - paragraph:
    - link "Create account":
      - /url: /en/auth/register
  - paragraph:
    - link "Back to homepage":
      - /url: /en
- complementary "What your account includes":
  - img "Signing in to follow appointments at Al Wissam Dental Clinic"
  - paragraph: Your private space for appointments and clinic services
  - heading "What your account includes" [level=2]
  - list:
    - listitem: Access the dashboard for your account
    - listitem: Follow appointments and bookings
    - listitem: Secure access to information you are allowed to see
    - listitem: One login experience for patients and clinic staff
  - paragraph: Secure sign-in with encrypted session protection
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
  61  | test.describe("Arabic public pages RTL shell", () => {
  62  |   for (const path of publicPaths) {
  63  |     test(`Arabic ${path || "/"} has rtl html + header/footer`, async ({
  64  |       page,
  65  |     }) => {
  66  |       await page.goto(`/ar${path}`, { waitUntil: "domcontentloaded" });
  67  |       await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  68  |       await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  69  |       await expect(page.locator(".public-header")).toBeVisible();
  70  |       await expect(page.locator(".public-footer-xl")).toBeVisible();
  71  |     });
  72  |   }
  73  | 
  74  |   test("English homepage stays LTR", async ({ page }) => {
  75  |     await page.goto("/en");
  76  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  77  |     await expect(page.locator(".public-header")).toBeVisible();
  78  |   });
  79  | 
  80  |   test("French homepage stays LTR", async ({ page }) => {
  81  |     await page.goto("/fr");
  82  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  83  |     await expect(page.locator(".public-header")).toBeVisible();
  84  |   });
  85  | });
  86  | 
  87  | test.describe("Arabic header + mobile menu", () => {
  88  |   test("mobile menu opens from inline-start (RTL right)", async ({ page }) => {
  89  |     await page.setViewportSize({ width: 390, height: 844 });
  90  |     await page.goto("/ar");
  91  |     await page.getByRole("button", { name: "القائمة" }).click();
  92  |     const drawer = page.locator("#public-mobile-nav");
  93  |     await expect(drawer).toBeVisible();
  94  |     const nav = drawer.locator(".public-mobile-nav");
  95  |     const box = await nav.boundingBox();
  96  |     expect(box).toBeTruthy();
  97  |     if (box) {
  98  |       // Right-aligned in RTL: trailing edge meets the viewport (wide panel may start < mid)
  99  |       expect(box.x + box.width).toBeGreaterThan(390 - 8);
  100 |     }
  101 |     await page.keyboard.press("Escape");
  102 |     await expect(drawer).toHaveCount(0);
  103 |   });
  104 | 
  105 |   test("English mobile menu opens from the left", async ({ page }) => {
  106 |     await page.setViewportSize({ width: 390, height: 844 });
  107 |     await page.goto("/en");
  108 |     await page.getByRole("button", { name: "Menu" }).click();
  109 |     const nav = page.locator(".public-mobile-nav");
  110 |     await expect(nav).toBeVisible();
  111 |     const box = await nav.boundingBox();
  112 |     expect(box).toBeTruthy();
  113 |     if (box) {
  114 |       // Left-aligned in LTR
  115 |       expect(box.x).toBeLessThan(8);
  116 |     }
  117 |   });
  118 | });
  119 | 
  120 | test.describe("Arabic bidi fields", () => {
  121 |   test("contact phone input remains LTR", async ({ page }) => {
  122 |     await page.goto("/ar/contact");
  123 |     const phone = page.locator("#phone");
  124 |     await expect(phone).toHaveAttribute("dir", "ltr");
  125 |     await phone.fill("0123456789");
  126 |     await expect(phone).toHaveValue("0123456789");
  127 |   });
  128 | 
  129 |   test("staff login password field is LTR", async ({ page }) => {
  130 |     await page.goto("/ar/staff/login");
  131 |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  132 |     const password = page.locator('input[name="password"], #password').first();
  133 |     await expect(password).toHaveAttribute("dir", "ltr");
  134 |   });
  135 | });
  136 | 
  137 | test.describe("Arabic auth pages RTL", () => {
  138 |   for (const path of authPaths) {
  139 |     test(`${path} is RTL`, async ({ page }) => {
  140 |       const res = await page.goto(`/ar${path}`);
  141 |       expect(res?.ok()).toBeTruthy();
  142 |       await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  143 |       await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  144 |     });
  145 |   }
  146 | });
  147 | 
  148 | test.describe("Dashboard login redirect preserves locale dir", () => {
  149 |   test("Arabic secretary route redirects to Arabic staff login RTL", async ({
  150 |     page,
  151 |   }) => {
  152 |     await page.goto("/ar/secretary/dashboard");
  153 |     await expect(page).toHaveURL(/\/ar\/staff\/login/);
  154 |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  155 |   });
  156 | 
  157 |   test("English secretary route redirects to English staff login LTR", async ({
  158 |     page,
  159 |   }) => {
  160 |     await page.goto("/en/secretary/dashboard");
> 161 |     await expect(page).toHaveURL(/\/en\/staff\/login/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  162 |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  163 |   });
  164 | });
  165 | 
```