# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-site.spec.ts >> Core public routes >> loads /ar/privacy
- Location: e2e/public-site.spec.ts:217:9

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active]:
  - generic [ref=e5] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e6]:
      - img [ref=e7]
    - generic [ref=e10]:
      - button "Open issues overlay" [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: "0"
          - generic [ref=e14]: "1"
        - generic [ref=e15]: Issue
      - button "Collapse issues badge" [ref=e16]:
        - img [ref=e17]
  - alert [ref=e19]
```

# Test source

```ts
  119 |     await page.goto("/ar/doctor/specialist/dashboard");
  120 |     await expect(page.locator(".wa-float")).toHaveCount(0);
  121 |   });
  122 | 
  123 |   test("contact and Facebook links are functional", async ({ page }) => {
  124 |     await page.goto("/ar/contact");
  125 |     await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
  126 |     await expect(
  127 |       page.locator('a[href="mailto:clinic.elwissam@gmail.com"]').first(),
  128 |     ).toBeVisible();
  129 |     await expect(
  130 |       page
  131 |         .locator('a[href="https://web.facebook.com/Clinic.ElWissam"]')
  132 |         .first(),
  133 |     ).toBeVisible();
  134 |     await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  135 |   });
  136 | 
  137 |   test("specialties section includes dentistry without href='#'", async ({
  138 |     page,
  139 |   }) => {
  140 |     await page.goto("/ar");
  141 |     await expect(page.getByRole("heading", { name: "طب الأسنان", exact: true })).toBeVisible();
  142 |     await expect(page.locator(".public-shell a[href='#']")).toHaveCount(0);
  143 |   });
  144 | });
  145 | 
  146 | test.describe("About page", () => {
  147 |   for (const path of ["/ar/about", "/en/about", "/fr/about"]) {
  148 |     test(`loads ${path}`, async ({ page }) => {
  149 |       const res = await page.goto(path);
  150 |       expect(res?.ok()).toBeTruthy();
  151 |       await expect(page.locator(".public-header")).toBeVisible();
  152 |     });
  153 |   }
  154 | 
  155 |   test("about includes mission vision values team", async ({ page }) => {
  156 |     await page.goto("/ar/about");
  157 |     await expect(page.getByRole("heading", { name: /رسالتنا|رؤيتنا/ }).first()).toBeVisible();
  158 |     await expect(page.getByRole("heading", { name: /قيم العيادة/ })).toBeVisible();
  159 |     await expect(page.locator(".pub-doctor")).toHaveCount(
  160 |       Math.min(3, await page.locator(".pub-doctor").count()),
  161 |     );
  162 |   });
  163 | });
  164 | 
  165 | test.describe("Contact page", () => {
  166 |   test("Arabic contact page structure", async ({ page }) => {
  167 |     await page.goto("/ar/contact");
  168 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  169 |     await expect(page.getByRole("heading", { name: /إرسال استفسار/ })).toBeVisible();
  170 |     await expect(page.getByRole("heading", { name: /حجز موعد مع طبيب/ })).toBeVisible();
  171 |     await expect(page.locator("#email")).toHaveCount(0);
  172 |   });
  173 | 
  174 |   test("contact form validates missing name", async ({ page }) => {
  175 |     await page.goto("/ar/contact");
  176 |     await page.getByLabel(/رقم الهاتف/).fill("0123456789");
  177 |     await page.getByLabel(/موضوع/).fill("استفسار تجربة");
  178 |     await page.getByLabel(/تفاصيل/).fill("تفاصيل كافية للاختبار هنا");
  179 |     await page.getByRole("button", { name: /إرسال الاستفسار/ }).click();
  180 |     await expect(page.locator(".field-error, .alert-error").first()).toBeVisible();
  181 |   });
  182 | 
  183 |   test("phone accepts digits only", async ({ page }) => {
  184 |     await page.goto("/ar/contact");
  185 |     const phone = page.locator("#phone");
  186 |     await phone.fill("abc0123x456");
  187 |     await expect(phone).toHaveValue("0123456");
  188 |   });
  189 | 
  190 |   test("booking section shows wizard", async ({ page }) => {
  191 |     await page.goto("/ar/contact");
  192 |     await expect(page.locator(".appointment-wizard")).toBeVisible();
  193 |   });
  194 | 
  195 |   for (const path of ["/en/contact", "/ar/contact", "/fr/contact"]) {
  196 |     test(`loads ${path}`, async ({ page }) => {
  197 |       const res = await page.goto(path);
  198 |       expect(res?.ok()).toBeTruthy();
  199 |     });
  200 |   }
  201 | });
  202 | 
  203 | test.describe("Core public routes", () => {
  204 |   const paths = [
  205 |     "/ar/services",
  206 |     "/ar/specialties",
  207 |     "/ar/doctors",
  208 |     "/ar/reviews",
  209 |     "/ar/faq",
  210 |     "/ar/privacy",
  211 |     "/ar/refund-policy",
  212 |     "/ar/cancellation-policy",
  213 |     "/ar/terms",
  214 |   ];
  215 | 
  216 |   for (const path of paths) {
  217 |     test(`loads ${path}`, async ({ page }) => {
  218 |       const res = await page.goto(path);
> 219 |       expect(res?.ok()).toBeTruthy();
      |                         ^ Error: expect(received).toBeTruthy()
  220 |       await expect(page.locator(".public-header")).toBeVisible();
  221 |     });
  222 |   }
  223 | });
  224 | 
```