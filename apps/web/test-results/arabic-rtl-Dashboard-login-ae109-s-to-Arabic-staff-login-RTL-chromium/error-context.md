# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: arabic-rtl.spec.ts >> Dashboard login redirect preserves locale dir >> Arabic secretary route redirects to Arabic staff login RTL
- Location: e2e/arabic-rtl.spec.ts:149:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/ar\/staff\/login/
Received string:  "http://localhost:3004/ar/auth/login?next=%2Far%2Fsecretary%2Fdashboard"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:3004/ar/auth/login?next=%2Far%2Fsecretary%2Fdashboard"

```

```yaml
- banner:
  - link "عيادة الوسام لطب الأسنان منصة إدارة طب الأسنان":
    - /url: /ar
    - strong: عيادة الوسام لطب الأسنان
    - text: منصة إدارة طب الأسنان
  - navigation "Primary":
    - link "الرئيسية":
      - /url: /ar
    - link "من نحن":
      - /url: /ar/about
    - link "الخدمات":
      - /url: /ar/services
    - link "التخصصات":
      - /url: /ar/specialties
    - link "الأطباء":
      - /url: /ar/doctors
    - link "التقييمات":
      - /url: /ar/reviews
    - link "الأسئلة":
      - /url: /ar/faq
    - link "تواصل":
      - /url: /ar/contact
  - link "تسجيل الدخول":
    - /url: /ar/auth/login
  - link "إنشاء حساب جديد":
    - /url: /ar/auth/register
  - link "احجز موعدًا":
    - /url: /ar/book-appointment
- form "تسجيل الدخول إلى حسابك":
  - banner:
    - heading "تسجيل الدخول إلى حسابك" [level=1]
    - paragraph: ادخل إلى حسابك لمتابعة مواعيدك والوصول إلى المساحة المخصصة لك داخل عيادة الوسام.
    - paragraph: يمكن للمريض والطبيب والسكرتارية وإدارة العيادة تسجيل الدخول من هذه الصفحة.
  - text: رقم الهاتف أو البريد الإلكتروني *
  - textbox "رقم الهاتف أو البريد الإلكتروني *"
  - text: كلمة المرور *
  - textbox "كلمة المرور *"
  - button "إظهار كلمة المرور": إظهار
  - checkbox "تذكرني"
  - text: تذكرني
  - link "نسيت كلمة المرور؟":
    - /url: /ar/auth/forgot-password
  - button "تسجيل الدخول"
  - paragraph:
    - link "إنشاء حساب جديد":
      - /url: /ar/auth/register
  - paragraph:
    - link "العودة إلى الصفحة الرئيسية":
      - /url: /ar
- complementary "ماذا يوفّر لك حسابك؟":
  - img "مريض يسجّل الدخول لمتابعة مواعيده في عيادة الوسام"
  - paragraph: مساحتك الخاصة لمتابعة مواعيدك وخدمات العيادة
  - heading "ماذا يوفّر لك حسابك؟" [level=2]
  - list:
    - listitem: الوصول إلى لوحة التحكم المخصصة لحسابك
    - listitem: متابعة المواعيد والحجوزات
    - listitem: الوصول الآمن إلى معلوماتك المصرح بها
    - listitem: تجربة موحدة للمريض وطاقم العيادة
  - paragraph: دخول آمن بتشفير وحماية للجلسة
- contentinfo:
  - heading "العيادة" [level=2]
  - paragraph: منصة إدارة طب الأسنان
  - link "احجز موعدًا":
    - /url: /ar/book-appointment
  - heading "روابط سريعة" [level=2]
  - list:
    - listitem:
      - link "الرئيسية":
        - /url: /ar
    - listitem:
      - link "من نحن":
        - /url: /ar/about
    - listitem:
      - link "الخدمات":
        - /url: /ar/services
    - listitem:
      - link "التخصصات":
        - /url: /ar/specialties
    - listitem:
      - link "الأطباء":
        - /url: /ar/doctors
    - listitem:
      - link "التقييمات":
        - /url: /ar/reviews
    - listitem:
      - link "الأسئلة":
        - /url: /ar/faq
    - listitem:
      - link "تواصل":
        - /url: /ar/contact
  - heading "للمرضى" [level=2]
  - list:
    - listitem:
      - link "معلومات المريض":
        - /url: /ar/patient-information
    - listitem:
      - link "قبل زيارتك":
        - /url: /ar/before-your-visit
    - listitem:
      - link "بعد زيارتك":
        - /url: /ar/after-your-visit
    - listitem:
      - link "الدعم":
        - /url: /ar/support
    - listitem:
      - link "سياسة الاسترداد":
        - /url: /ar/refund-policy
    - listitem:
      - link "سياسة الإلغاء":
        - /url: /ar/cancellation-policy
  - heading "قانوني" [level=2]
  - list:
    - listitem:
      - link "الخصوصية":
        - /url: /ar/privacy
    - listitem:
      - link "الشروط":
        - /url: /ar/terms
    - listitem:
      - link "ملفات الارتباط":
        - /url: /ar/cookies
    - listitem:
      - link "إمكانية الوصول":
        - /url: /ar/accessibility
    - listitem:
      - link "إخلاء طبي":
        - /url: /ar/medical-disclaimer
  - heading "التواصل" [level=2]
  - list:
    - listitem:
      - link "0663 09 82 08":
        - /url: tel:+213663098208
    - listitem:
      - link "clinic.elwissam@gmail.com":
        - /url: mailto:clinic.elwissam@gmail.com
    - listitem: حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009
    - listitem: "من السبت إلى الخميس من الساعة 08:00 إلى الساعة 17:00 الجمعة: مغلق"
    - listitem:
      - link "تواصل عبر واتساب":
        - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
    - listitem:
      - link "زيارة صفحة عيادة الوسام على فيسبوك":
        - /url: https://web.facebook.com/Clinic.ElWissam
        - text: صفحتنا على فيسبوك
    - listitem:
      - link "تواصل":
        - /url: /ar/contact
  - text: © 2026 عيادة الوسام لطب الأسنان
  - link "الخصوصية":
    - /url: /ar/privacy
  - link "الشروط":
    - /url: /ar/terms
- link "فتح محادثة واتساب مع عيادة الوسام لطب الأسنان":
  - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
  - text: تواصل معنا عبر واتساب
- alert
```

# Test source

```ts
  53  |     await page.goto("/en");
  54  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  55  |     await page.goto("/ar");
  56  |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  57  |     await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  58  |   });
  59  | });
  60  | 
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
> 153 |     await expect(page).toHaveURL(/\/ar\/staff\/login/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  154 |     await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  155 |   });
  156 | 
  157 |   test("English secretary route redirects to English staff login LTR", async ({
  158 |     page,
  159 |   }) => {
  160 |     await page.goto("/en/secretary/dashboard");
  161 |     await expect(page).toHaveURL(/\/en\/staff\/login/);
  162 |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  163 |   });
  164 | });
  165 | 
```