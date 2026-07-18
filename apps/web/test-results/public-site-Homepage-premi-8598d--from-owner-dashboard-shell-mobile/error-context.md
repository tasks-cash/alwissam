# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-site.spec.ts >> Homepage premium sections >> WhatsApp button is absent from owner dashboard shell
- Location: e2e/public-site.spec.ts:146:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.wa-float')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.wa-float')
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "عيادة الوسام لطب الأسنان منصة إدارة طب الأسنان" [ref=e4] [cursor=pointer]:
        - /url: /ar
        - generic [ref=e5]:
          - img [ref=e6]
          - generic [ref=e10]: عيادة الوسام لطب الأسنان
        - generic [ref=e11]:
          - strong [ref=e12]: عيادة الوسام لطب الأسنان
          - generic [ref=e13]: منصة إدارة طب الأسنان
      - generic [ref=e14]:
        - link "احجز موعدًا" [ref=e15] [cursor=pointer]:
          - /url: /ar/book-appointment
        - button "القائمة" [ref=e16] [cursor=pointer]
    - generic [ref=e19]:
      - form "تسجيل الدخول إلى حسابك" [ref=e20]:
        - banner [ref=e21]:
          - heading "تسجيل الدخول إلى حسابك" [level=1] [ref=e22]
          - paragraph [ref=e23]: ادخل إلى حسابك لمتابعة مواعيدك والوصول إلى المساحة المخصصة لك داخل عيادة الوسام.
          - paragraph [ref=e24]: يمكن للمريض والطبيب والسكرتارية وإدارة العيادة تسجيل الدخول من هذه الصفحة.
        - generic [ref=e25]:
          - generic [ref=e26]: رقم الهاتف أو البريد الإلكتروني *
          - textbox "رقم الهاتف أو البريد الإلكتروني *" [ref=e27]
        - generic [ref=e28]:
          - generic [ref=e29]: كلمة المرور *
          - generic [ref=e31]:
            - textbox "كلمة المرور *" [ref=e32]
            - button "إظهار كلمة المرور" [ref=e33] [cursor=pointer]: إظهار
        - generic [ref=e34]:
          - generic [ref=e35]:
            - checkbox "تذكرني" [ref=e36]
            - generic [ref=e37]: تذكرني
          - link "نسيت كلمة المرور؟" [ref=e38] [cursor=pointer]:
            - /url: /ar/auth/forgot-password
        - button "تسجيل الدخول" [ref=e39] [cursor=pointer]
        - paragraph [ref=e40]:
          - link "إنشاء حساب جديد" [ref=e41] [cursor=pointer]:
            - /url: /ar/auth/register
        - paragraph [ref=e42]:
          - link "العودة إلى الصفحة الرئيسية" [ref=e43] [cursor=pointer]:
            - /url: /ar
      - complementary "ماذا يوفّر لك حسابك؟" [ref=e44]:
        - img "مريض يسجّل الدخول لمتابعة مواعيده في عيادة الوسام" [ref=e45]
        - generic [ref=e46]:
          - paragraph [ref=e47]: مساحتك الخاصة لمتابعة مواعيدك وخدمات العيادة
          - heading "ماذا يوفّر لك حسابك؟" [level=2] [ref=e48]
          - list [ref=e49]:
            - listitem [ref=e50]: الوصول إلى لوحة التحكم المخصصة لحسابك
            - listitem [ref=e51]: متابعة المواعيد والحجوزات
            - listitem [ref=e52]: الوصول الآمن إلى معلوماتك المصرح بها
            - listitem [ref=e53]: تجربة موحدة للمريض وطاقم العيادة
          - paragraph [ref=e54]: دخول آمن بتشفير وحماية للجلسة
    - contentinfo [ref=e55]:
      - generic [ref=e56]:
        - generic [ref=e57]:
          - heading "العيادة" [level=2] [ref=e58]
          - paragraph [ref=e59]: منصة إدارة طب الأسنان
          - link "احجز موعدًا" [ref=e60] [cursor=pointer]:
            - /url: /ar/book-appointment
        - generic [ref=e61]:
          - heading "روابط سريعة" [level=2] [ref=e62]
          - list [ref=e63]:
            - listitem [ref=e64]:
              - link "الرئيسية" [ref=e65] [cursor=pointer]:
                - /url: /ar
            - listitem [ref=e66]:
              - link "من نحن" [ref=e67] [cursor=pointer]:
                - /url: /ar/about
            - listitem [ref=e68]:
              - link "الخدمات" [ref=e69] [cursor=pointer]:
                - /url: /ar/services
            - listitem [ref=e70]:
              - link "التخصصات" [ref=e71] [cursor=pointer]:
                - /url: /ar/specialties
            - listitem [ref=e72]:
              - link "الأطباء" [ref=e73] [cursor=pointer]:
                - /url: /ar/doctors
            - listitem [ref=e74]:
              - link "التقييمات" [ref=e75] [cursor=pointer]:
                - /url: /ar/reviews
            - listitem [ref=e76]:
              - link "الأسئلة" [ref=e77] [cursor=pointer]:
                - /url: /ar/faq
            - listitem [ref=e78]:
              - link "تواصل" [ref=e79] [cursor=pointer]:
                - /url: /ar/contact
        - generic [ref=e80]:
          - heading "للمرضى" [level=2] [ref=e81]
          - list [ref=e82]:
            - listitem [ref=e83]:
              - link "معلومات المريض" [ref=e84] [cursor=pointer]:
                - /url: /ar/patient-information
            - listitem [ref=e85]:
              - link "قبل زيارتك" [ref=e86] [cursor=pointer]:
                - /url: /ar/before-your-visit
            - listitem [ref=e87]:
              - link "بعد زيارتك" [ref=e88] [cursor=pointer]:
                - /url: /ar/after-your-visit
            - listitem [ref=e89]:
              - link "الدعم" [ref=e90] [cursor=pointer]:
                - /url: /ar/support
            - listitem [ref=e91]:
              - link "سياسة الاسترداد" [ref=e92] [cursor=pointer]:
                - /url: /ar/refund-policy
            - listitem [ref=e93]:
              - link "سياسة الإلغاء" [ref=e94] [cursor=pointer]:
                - /url: /ar/cancellation-policy
        - generic [ref=e95]:
          - heading "قانوني" [level=2] [ref=e96]
          - list [ref=e97]:
            - listitem [ref=e98]:
              - link "الخصوصية" [ref=e99] [cursor=pointer]:
                - /url: /ar/privacy
            - listitem [ref=e100]:
              - link "الشروط" [ref=e101] [cursor=pointer]:
                - /url: /ar/terms
            - listitem [ref=e102]:
              - link "ملفات الارتباط" [ref=e103] [cursor=pointer]:
                - /url: /ar/cookies
            - listitem [ref=e104]:
              - link "إمكانية الوصول" [ref=e105] [cursor=pointer]:
                - /url: /ar/accessibility
            - listitem [ref=e106]:
              - link "إخلاء طبي" [ref=e107] [cursor=pointer]:
                - /url: /ar/medical-disclaimer
        - generic [ref=e108]:
          - heading "التواصل" [level=2] [ref=e109]
          - list [ref=e110]:
            - listitem [ref=e111]:
              - link "0663 09 82 08" [ref=e112] [cursor=pointer]:
                - /url: tel:+213663098208
            - listitem [ref=e113]:
              - link "clinic.elwissam@gmail.com" [ref=e114] [cursor=pointer]:
                - /url: mailto:clinic.elwissam@gmail.com
            - listitem [ref=e115]: حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009
            - listitem [ref=e116]: "من السبت إلى الخميس من الساعة 08:00 إلى الساعة 17:00 الجمعة: مغلق"
            - listitem [ref=e117]:
              - link "تواصل عبر واتساب" [ref=e118] [cursor=pointer]:
                - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
            - listitem [ref=e119]:
              - link "زيارة صفحة عيادة الوسام على فيسبوك" [ref=e120] [cursor=pointer]:
                - /url: https://web.facebook.com/Clinic.ElWissam
                - text: صفحتنا على فيسبوك
            - listitem [ref=e121]:
              - link "تواصل" [ref=e122] [cursor=pointer]:
                - /url: /ar/contact
      - generic [ref=e123]:
        - generic [ref=e124]: © 2026 عيادة الوسام لطب الأسنان
        - generic [ref=e125]:
          - link "الخصوصية" [ref=e126] [cursor=pointer]:
            - /url: /ar/privacy
          - link "الشروط" [ref=e127] [cursor=pointer]:
            - /url: /ar/terms
    - link "فتح محادثة واتساب مع عيادة الوسام لطب الأسنان" [ref=e128] [cursor=pointer]:
      - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
      - img [ref=e130]
      - generic [ref=e132]: تواصل معنا عبر واتساب
  - alert [ref=e133]
```

# Test source

```ts
  50  | test.describe("Homepage premium sections", () => {
  51  |   test("Arabic home shows why, journey, hours, and max 3 doctors", async ({
  52  |     page,
  53  |   }) => {
  54  |     await page.goto("/ar");
  55  |     await expect(page.getByRole("heading", { name: /لماذا عيادتنا/ })).toBeVisible();
  56  |     await expect(page.locator(".why-card")).toHaveCount(8);
  57  |     await expect(
  58  |       page.getByRole("heading", { name: /رحلة المريض في عيادة الوسام/ }),
  59  |     ).toBeVisible();
  60  |     await expect(page.locator(".journey-node")).toHaveCount(7);
  61  |     await expect(
  62  |       page.locator(".working-hours-list").getByText("الجمعة: مغلق", { exact: true }).first(),
  63  |     ).toBeVisible();
  64  |     await expect(
  65  |       page.locator(".working-hours-list").getByText(/08:00/).first(),
  66  |     ).toBeVisible();
  67  |     const cards = page.locator(".pub-doctor-grid .pub-doctor");
  68  |     const count = await cards.count();
  69  |     expect(count).toBeLessThanOrEqual(3);
  70  |   });
  71  | 
  72  |   test("homepage hero flow and doctors section copy", async ({ page }) => {
  73  |     await page.goto("/ar");
  74  |     await expect(page.locator(".hero-flow")).toBeVisible();
  75  |     await expect(page.locator(".hero-flow-main img")).toBeVisible();
  76  |     await expect(page.getByRole("heading", { name: "أطباؤنا" })).toBeVisible();
  77  |     await expect(
  78  |       page.getByText("تعرّف على فريق عيادة الوسام واختر الطبيب المناسب لحجز موعدك."),
  79  |     ).toBeVisible();
  80  |     await expect(
  81  |       page.getByRole("heading", { name: "تعرّف على عيادة الوسام" }),
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
> 150 |     await expect(page.locator(".wa-float")).toHaveCount(0);
      |                                             ^ Error: expect(locator).toHaveCount(expected) failed
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
  182 |       expect(res?.ok()).toBeTruthy();
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
```