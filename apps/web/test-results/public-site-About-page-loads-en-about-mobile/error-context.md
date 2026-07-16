# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-site.spec.ts >> About page >> loads /en/about
- Location: e2e/public-site.spec.ts:180:9

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e2]: Internal Server Error
```

# Test source

```ts
  82  |     ).toBeVisible();
  83  |     await expect(page.locator(".clinic-intro-feature")).toHaveCount(6);
  84  |     await expect(
  85  |       page.getByRole("link", { name: "ابدأ رحلتك واحجز موعدك" }),
  86  |     ).toBeVisible();
  87  |   });
  88  | 
  89  |   test("booking convenience and location contact on all locales", async ({
  90  |     page,
  91  |   }) => {
  92  |     await page.goto("/ar");
  93  |     await expect(
  94  |       page.getByRole("heading", { name: "لماذا تتعب من أجل حجز موعد؟" }),
  95  |     ).toBeVisible();
  96  |     await expect(
  97  |       page.getByRole("heading", { name: "الموقع والتواصل" }),
  98  |     ).toBeVisible();
  99  |     await expect(page.getByText(/حي الأمير عبد القادر/).first()).toBeVisible();
  100 |     await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
  101 |     await expect(page.locator(".wa-float")).toBeVisible();
  102 |     await expect(page.locator(".wa-float")).toHaveAttribute(
  103 |       "href",
  104 |       /wa\.me\/213663098208\?text=/,
  105 |     );
  106 | 
  107 |     await page.goto("/en");
  108 |     await expect(
  109 |       page.getByRole("heading", {
  110 |         name: "Why travel just to book an appointment?",
  111 |       }),
  112 |     ).toBeVisible();
  113 |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  114 |     await expect(page.locator(".wa-float")).toBeVisible();
  115 |     const enBox = await page.locator(".wa-float").boundingBox();
  116 |     expect(enBox).toBeTruthy();
  117 |     if (enBox) {
  118 |       expect(enBox.x + enBox.width).toBeGreaterThan(700);
  119 |     }
  120 | 
  121 |     await page.goto("/ar");
  122 |     const arBox = await page.locator(".wa-float").boundingBox();
  123 |     expect(arBox).toBeTruthy();
  124 |     if (arBox) {
  125 |       // RTL: floating WhatsApp sits on the inline-start (physical left) edge.
  126 |       // Allow a small inset; if layout falls back to LTR placement, still require
  127 |       // the button is near a horizontal edge (not centered).
  128 |       const nearStart = arBox.x < 96;
  129 |       const nearEnd = arBox.x > 700;
  130 |       expect(nearStart || nearEnd).toBeTruthy();
  131 |       if (nearEnd) {
  132 |         // Prefer inline-start in RTL when styles apply.
  133 |         expect(arBox.x + arBox.width).toBeGreaterThan(700);
  134 |       }
  135 |     }
  136 | 
  137 |     await page.goto("/fr");
  138 |     await expect(
  139 |       page.getByRole("heading", {
  140 |         name: /Pourquoi vous déplacer uniquement pour prendre rendez-vous/,
  141 |       }),
  142 |     ).toBeVisible();
  143 |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  144 |   });
  145 | 
  146 |   test("WhatsApp button is absent from owner dashboard shell", async ({
  147 |     page,
  148 |   }) => {
  149 |     await page.goto("/ar/doctor/specialist/dashboard");
  150 |     await expect(page.locator(".wa-float")).toHaveCount(0);
  151 |   });
  152 | 
  153 |   test("contact and Facebook links are functional", async ({ page }) => {
  154 |     await page.goto("/ar/contact");
  155 |     await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
  156 |     await expect(
  157 |       page.locator('a[href="mailto:clinic.elwissam@gmail.com"]').first(),
  158 |     ).toBeVisible();
  159 |     await expect(
  160 |       page
  161 |         .locator('a[href="https://web.facebook.com/Clinic.ElWissam"]')
  162 |         .first(),
  163 |     ).toBeVisible();
  164 |     await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  165 |   });
  166 | 
  167 |   test("specialties section includes dentistry without href='#'", async ({
  168 |     page,
  169 |   }) => {
  170 |     await page.goto("/ar");
  171 |     await expect(page.getByRole("heading", { name: /تخصصاتنا الطبية/ })).toBeVisible();
  172 |     const specialtyHeadings = page.locator(".specialty-card h3, .specialty-card h2");
  173 |     expect(await specialtyHeadings.count()).toBeGreaterThan(0);
  174 |     await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  175 |   });
  176 | });
  177 | 
  178 | test.describe("About page", () => {
  179 |   for (const path of ["/ar/about", "/en/about", "/fr/about"]) {
  180 |     test(`loads ${path}`, async ({ page }) => {
  181 |       const res = await page.goto(path);
> 182 |       expect(res?.ok()).toBeTruthy();
      |                         ^ Error: expect(received).toBeTruthy()
  183 |       await expect(page.locator(".public-header")).toBeVisible();
  184 |     });
  185 |   }
  186 | 
  187 |   test("about includes mission vision values team", async ({ page }) => {
  188 |     await page.goto("/ar/about");
  189 |     await expect(page.getByRole("heading", { name: /رسالتنا|رؤيتنا/ }).first()).toBeVisible();
  190 |     await expect(page.getByRole("heading", { name: /قيم العيادة/ })).toBeVisible();
  191 |     await expect(page.locator(".pub-doctor")).toHaveCount(
  192 |       Math.min(3, await page.locator(".pub-doctor").count()),
  193 |     );
  194 |   });
  195 | });
  196 | 
  197 | test.describe("Contact page", () => {
  198 |   test("Arabic contact page structure", async ({ page }) => {
  199 |     await page.goto("/ar/contact");
  200 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  201 |     await expect(page.getByRole("heading", { name: /إرسال استفسار/ })).toBeVisible();
  202 |     await expect(page.getByRole("heading", { name: /حجز موعد مع طبيب/ })).toBeVisible();
  203 |     await expect(page.locator("#email")).toHaveCount(0);
  204 |   });
  205 | 
  206 |   test("contact form validates missing name", async ({ page }) => {
  207 |     await page.goto("/ar/contact");
  208 |     await page.getByLabel(/رقم الهاتف/).fill("0123456789");
  209 |     await page.getByLabel(/موضوع/).fill("استفسار تجربة");
  210 |     await page.getByLabel(/تفاصيل/).fill("تفاصيل كافية للاختبار هنا");
  211 |     await page.getByRole("button", { name: /إرسال الاستفسار/ }).click();
  212 |     await expect(page.locator(".field-error, .alert-error").first()).toBeVisible();
  213 |   });
  214 | 
  215 |   test("phone accepts digits only", async ({ page }) => {
  216 |     await page.goto("/ar/contact");
  217 |     const phone = page.locator("#phone");
  218 |     await phone.fill("abc0123x456");
  219 |     await expect(phone).toHaveValue("0123456");
  220 |   });
  221 | 
  222 |   test("booking section shows wizard", async ({ page }) => {
  223 |     await page.goto("/ar/contact");
  224 |     await expect(page.locator(".appointment-wizard")).toBeVisible();
  225 |   });
  226 | 
  227 |   for (const path of ["/en/contact", "/ar/contact", "/fr/contact"]) {
  228 |     test(`loads ${path}`, async ({ page }) => {
  229 |       const res = await page.goto(path);
  230 |       expect(res?.ok()).toBeTruthy();
  231 |     });
  232 |   }
  233 | });
  234 | 
  235 | test.describe("Core public routes", () => {
  236 |   const paths = [
  237 |     "/ar/services",
  238 |     "/ar/specialties",
  239 |     "/ar/doctors",
  240 |     "/ar/reviews",
  241 |     "/ar/faq",
  242 |     "/ar/privacy",
  243 |     "/ar/refund-policy",
  244 |     "/ar/cancellation-policy",
  245 |     "/ar/terms",
  246 |   ];
  247 | 
  248 |   for (const path of paths) {
  249 |     test(`loads ${path}`, async ({ page }) => {
  250 |       const res = await page.goto(path);
  251 |       expect(res?.ok()).toBeTruthy();
  252 |       await expect(page.locator(".public-header")).toBeVisible();
  253 |     });
  254 |   }
  255 | });
  256 | 
```