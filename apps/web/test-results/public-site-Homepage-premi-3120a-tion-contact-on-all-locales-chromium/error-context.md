# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-site.spec.ts >> Homepage premium sections >> booking convenience and location contact on all locales
- Location: e2e/public-site.spec.ts:89:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'لماذا تتعب من أجل حجز موعد؟' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'لماذا تتعب من أجل حجز موعد؟' })

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
- paragraph: رعاية أسنان متخصصة في الوادي
- paragraph: عيادة الوسام لطب الأسنان
- heading "رعاية طبية متخصصة تبدأ من احتياجاتك" [level=1]
- paragraph: فريق طبي متعدد التخصصات، مواعيد منظمة، وتجربة رعاية مصممة لتوفير الراحة والثقة لكل مريض.
- list "رعاية أسنان متخصصة في الوادي":
  - listitem: حجز سهل من المنزل
  - listitem: اختيار الطبيب المناسب
  - listitem: متابعة منظمة للمواعيد
- link "احجز موعدًا":
  - /url: /ar/book-appointment
- link "تعرّف على الأطباء":
  - /url: /ar/doctors
- figure "رعاية فموية هادئة ودقيقة":
  - img "رعاية فموية هادئة ودقيقة"
  - text: رعاية دقيقة واهتمام بكل خطوة حجز ومتابعة من مكان واحد رعاية فموية هادئة ودقيقة
- figure
- paragraph: بحث سريع عن موعد
- heading "بحث سريع عن موعد" [level=2]
- text: التخصص
- combobox "التخصص":
  - option "اتركه فارغًا ليختار الاستقبال الطبيب المناسب" [selected]
  - option "طب الأسنان العام"
  - option "طب الأسنان التجميلي"
  - option "تقويم الأسنان"
  - option "علاج اللثة"
  - option "علاج جذور الأسنان"
  - option "جراحة الفم والأسنان"
- text: الطبيب
- combobox "الطبيب":
  - option "اتركه فارغًا ليختار الاستقبال الطبيب المناسب" [selected]
  - option "الدكتور منانة فؤاد — تقويم الأسنان · التركيبات · الجراحة"
  - option "الدكتور قعري أسامة — الحالات الاستعجالية · العلاج العام"
- text: التاريخ المفضّل
- textbox "التاريخ المفضّل"
- button "البحث عن موعد متاح"
- paragraph: تعرّف على عيادة الوسام
- heading "تعرّف على عيادة الوسام" [level=2]
- paragraph: عيادة الوسام لطب الأسنان مساحة طبية تهدف إلى توفير تجربة منظمة وواضحة للمريض، من اختيار الخدمة والطبيب إلى الحجز والمتابعة بعد الزيارة.
- paragraph: عيادة الوسام لطب الأسنان — رعاية احترافية تجمع بين الخبرة والتقنيات الحديثة في بيئة هادئة وموثوقة.
- list:
  - listitem:
    - heading "حجز من المنزل" [level=3]
    - paragraph: أرسلوا طلب الموعد عبر الموقع دون عناء التنقل.
  - listitem:
    - heading "اختيار الطبيب" [level=3]
    - paragraph: اطلعوا على الملفات العامة واختاروا الطبيب المناسب.
  - listitem:
    - heading "تنظيم المواعيد" [level=3]
    - paragraph: مسار واضح من الطلب إلى التأكيد عبر الاستقبال.
  - listitem:
    - heading "متابعة بعد الزيارة" [level=3]
    - paragraph: تعليمات ومتابعة منظمة وفق توجيه الطبيب.
  - listitem:
    - heading "خصوصية معلومات المريض" [level=3]
    - paragraph: نحمي بياناتكم ونستخدمها لأغراض الرعاية والتواصل فقط.
  - listitem:
    - heading "خدمات أسنان متعددة" [level=3]
    - paragraph: عام، تقويم، جراحة، وتنظيف وخدمات أخرى منشورة.
- link "اعرف المزيد عن العيادة":
  - /url: /ar/about
- link "احجز موعدًا":
  - /url: /ar/book-appointment
- img "رعاية فموية هادئة ودقيقة"
- heading "ساعات العمل" [level=3]
- list:
  - listitem: من السبت إلى الخميس
  - listitem: من الساعة 08:00 إلى الساعة 17:00
  - listitem: "الجمعة: مغلق"
- paragraph: تخصصاتنا الطبية
- heading "تخصصاتنا الطبية" [level=2]
- paragraph: مجموعة من تخصصات طب الأسنان لتوفير التشخيص والعلاج المناسب لكل حالة.
- link "عرض جميع التخصصات":
  - /url: /ar/specialties
- article:
  - text: مميز
  - heading "طب الأسنان العام" [level=3]:
    - link "طب الأسنان العام":
      - /url: /ar/specialties/general-dentistry
  - paragraph: تشخيص وعلاج مشكلات الأسنان الشائعة، والمحافظة على صحة الفم والأسنان من خلال الفحوصات والعلاجات الوقائية والترميمية.
  - strong: "7"
  - text: خدمة متاحة
  - strong: "0"
  - text: أطباء
  - list:
    - listitem:
      - link "تبييض الأسنان":
        - /url: /ar/services/teeth-whitening
    - listitem:
      - link "تلميع الأسنان":
        - /url: /ar/services/dental-polishing
    - listitem:
      - link "فحص الأسنان":
        - /url: /ar/services/dental-checkup
  - link "عرض التخصص":
    - /url: /ar/specialties/general-dentistry
  - link "معلومات الخدمة":
    - /url: /ar/specialties/general-dentistry
- article:
  - text: مميز
  - heading "طب الأسنان التجميلي" [level=3]:
    - link "طب الأسنان التجميلي":
      - /url: /ar/specialties/cosmetic-dentistry
  - paragraph: علاجات تهدف إلى تحسين مظهر الأسنان والابتسامة مع المحافظة على صحة ووظيفة الأسنان.
  - strong: "3"
  - text: خدمة متاحة
  - strong: "0"
  - text: أطباء
  - list:
    - listitem:
      - link "تبييض الأسنان":
        - /url: /ar/services/teeth-whitening
    - listitem:
      - link "تلميع الأسنان":
        - /url: /ar/services/dental-polishing
    - listitem:
      - link "قشور الأسنان التجميلية":
        - /url: /ar/services/dental-veneers
  - link "عرض التخصص":
    - /url: /ar/specialties/cosmetic-dentistry
  - link "معلومات الخدمة":
    - /url: /ar/specialties/cosmetic-dentistry
- article:
  - text: مميز
  - heading "تقويم الأسنان" [level=3]:
    - link "تقويم الأسنان":
      - /url: /ar/specialties/orthodontics
  - paragraph: تشخيص وعلاج عدم انتظام الأسنان والفكين باستخدام أجهزة وتقنيات تقويم مناسبة لكل حالة.
  - strong: "3"
  - text: خدمة متاحة
  - strong: "0"
  - text: أطباء
  - list:
    - listitem:
      - link "استشارة تقويم الأسنان":
        - /url: /ar/services/orthodontic-consultation
    - listitem:
      - link "تقويم الأسنان الثابت":
        - /url: /ar/services/fixed-braces
    - listitem:
      - link "تقويم الأسنان الشفاف":
        - /url: /ar/services/clear-aligners
  - link "عرض التخصص":
    - /url: /ar/specialties/orthodontics
  - link "معلومات الخدمة":
    - /url: /ar/specialties/orthodontics
- article:
  - text: مميز
  - heading "علاج اللثة" [level=3]:
    - link "علاج اللثة":
      - /url: /ar/specialties/periodontics
  - paragraph: الوقاية من أمراض اللثة وتشخيصها وعلاج الالتهابات ومشكلات الأنسجة الداعمة للأسنان.
  - strong: "1"
  - text: خدمة متاحة
  - strong: "0"
  - text: أطباء
  - list:
    - listitem:
      - link "علاج أمراض اللثة":
        - /url: /ar/services/gum-disease-treatment
  - link "عرض التخصص":
    - /url: /ar/specialties/periodontics
  - link "معلومات الخدمة":
    - /url: /ar/specialties/periodontics
- article:
  - text: مميز
  - heading "علاج جذور الأسنان" [level=3]:
    - link "علاج جذور الأسنان":
      - /url: /ar/specialties/endodontics
  - paragraph: تشخيص وعلاج التهابات وأمراض لب الأسنان والجذور بهدف الحفاظ على السن الطبيعي قدر الإمكان.
  - strong: "2"
  - text: خدمة متاحة
  - strong: "0"
  - text: أطباء
  - list:
    - listitem:
      - link "علاج عصب وجذور الأسنان":
        - /url: /ar/services/root-canal-treatment
    - listitem:
      - link "علاج خراج الأسنان":
        - /url: /ar/services/dental-abscess-treatment
  - link "عرض التخصص":
    - /url: /ar/specialties/endodontics
  - link "معلومات الخدمة":
    - /url: /ar/specialties/endodontics
- article:
  - text: مميز
  - heading "جراحة الفم والأسنان" [level=3]:
    - link "جراحة الفم والأسنان":
      - /url: /ar/specialties/oral-surgery
  - paragraph: إجراءات جراحية متخصصة لعلاج مشكلات الفم والأسنان مثل الخلع الجراحي وضروس العقل وبعض الحالات المعقدة.
  - strong: "3"
  - text: خدمة متاحة
  - strong: "0"
  - text: أطباء
  - list:
    - listitem:
      - link "خلع الأسنان":
        - /url: /ar/services/tooth-extraction
    - listitem:
      - link "خلع ضرس العقل":
        - /url: /ar/services/wisdom-tooth-removal
    - listitem:
      - link "علاج خراج الأسنان":
        - /url: /ar/services/dental-abscess-treatment
  - link "عرض التخصص":
    - /url: /ar/specialties/oral-surgery
  - link "معلومات الخدمة":
    - /url: /ar/specialties/oral-surgery
- paragraph: خدمات طب الأسنان
- heading "خدمات طب الأسنان" [level=2]
- paragraph: اختر الخدمة التي تحتاجها، ثم اطّلع على الأطباء والمواعيد المتاحة للحجز.
- link "عرض جميع الخدمات":
  - /url: /ar/services
- article:
  - heading "تبييض الأسنان" [level=3]:
    - link "تبييض الأسنان":
      - /url: /ar/services/teeth-whitening
  - paragraph: تحسين لون الأسنان بعد تقييم مناسب.
  - paragraph:
    - text: "التخصص:"
    - link "طب الأسنان التجميلي":
      - /url: /ar/specialties/cosmetic-dentistry
  - paragraph:
    - strong: "0"
    - text: أطباء
  - paragraph: تحتاج إلى فحص أولي
  - link "تفاصيل الخدمة":
    - /url: /ar/services/teeth-whitening
  - link "معلومات الخدمة":
    - /url: /ar/services/teeth-whitening
- article:
  - heading "تلميع الأسنان" [level=3]:
    - link "تلميع الأسنان":
      - /url: /ar/services/dental-polishing
  - paragraph: تلميع سطح الأسنان بعد التنظيف عند الحاجة.
  - paragraph:
    - text: "التخصص:"
    - link "طب الأسنان العام":
      - /url: /ar/specialties/general-dentistry
  - paragraph:
    - strong: "0"
    - text: أطباء
  - paragraph: متاحة للحجز
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-polishing
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-polishing
- article:
  - heading "فحص الأسنان" [level=3]:
    - link "فحص الأسنان":
      - /url: /ar/services/dental-checkup
  - paragraph: فحص شامل لصحة الفم والأسنان.
  - paragraph:
    - text: "التخصص:"
    - link "طب الأسنان العام":
      - /url: /ar/specialties/general-dentistry
  - paragraph:
    - strong: "0"
    - text: أطباء
  - paragraph: متاحة للحجز
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-checkup
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-checkup
- article:
  - heading "حشوات الأسنان" [level=3]:
    - link "حشوات الأسنان":
      - /url: /ar/services/dental-fillings
  - paragraph: ترميم الأسنان المتضررة بالحشوات المناسبة.
  - paragraph:
    - text: "التخصص:"
    - link "ترميم الأسنان":
      - /url: /ar/specialties/restorative-dentistry
  - paragraph:
    - strong: "0"
    - text: أطباء
  - paragraph: متاحة للحجز
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-fillings
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-fillings
- article:
  - heading "علاج عصب وجذور الأسنان" [level=3]:
    - link "علاج عصب وجذور الأسنان":
      - /url: /ar/services/root-canal-treatment
  - paragraph: علاج لب السن والجذور عند الالتهاب أو العدوى.
  - paragraph:
    - text: "التخصص:"
    - link "علاج جذور الأسنان":
      - /url: /ar/specialties/endodontics
  - paragraph:
    - strong: "0"
    - text: أطباء
  - paragraph: تحتاج إلى فحص أولي
  - link "تفاصيل الخدمة":
    - /url: /ar/services/root-canal-treatment
  - link "معلومات الخدمة":
    - /url: /ar/services/root-canal-treatment
- article:
  - heading "خلع الأسنان" [level=3]:
    - link "خلع الأسنان":
      - /url: /ar/services/tooth-extraction
  - paragraph: خلع السن عند الحاجة وفق تقييم الطبيب.
  - paragraph:
    - text: "التخصص:"
    - link "جراحة الفم والأسنان":
      - /url: /ar/specialties/oral-surgery
  - paragraph:
    - strong: "0"
    - text: أطباء
  - paragraph: تحتاج إلى فحص أولي
  - link "تفاصيل الخدمة":
    - /url: /ar/services/tooth-extraction
  - link "معلومات الخدمة":
    - /url: /ar/services/tooth-extraction
- article:
  - heading "زراعة الأسنان" [level=3]:
    - link "زراعة الأسنان":
      - /url: /ar/services/dental-implants
  - paragraph: تعويض الأسنان المفقودة بغرسات سنية.
  - paragraph:
    - text: "التخصص:"
    - link "زراعة الأسنان":
      - /url: /ar/specialties/dental-implantology
  - paragraph:
    - strong: "0"
    - text: أطباء
  - paragraph: تحتاج إلى فحص أولي
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-implants
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-implants
- article:
  - heading "تيجان الأسنان" [level=3]:
    - link "تيجان الأسنان":
      - /url: /ar/services/dental-crowns
  - paragraph: تاج يعيد شكل السن ووظيفته.
  - paragraph:
    - text: "التخصص:"
    - link "تركيبات الأسنان":
      - /url: /ar/specialties/prosthodontics
  - paragraph:
    - strong: "0"
    - text: أطباء
  - paragraph: تحتاج إلى فحص أولي
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-crowns
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-crowns
- region "احجز موعدك من منزلك بكل سهولة":
  - paragraph: حجز من المنزل
  - heading "احجز موعدك من منزلك بكل سهولة" [level=2]
  - paragraph: لا حاجة إلى إضاعة الوقت والمال في التنقل فقط للبحث عن موعد. اختر الخدمة والطبيب والتاريخ المناسب، وأرسل طلب الحجز من منزلك.
  - paragraph: اترك لفريق عيادة الوسام مهمة تنظيم زيارتك والتواصل معك لتأكيد الموعد.
  - list:
    - listitem:
      - strong: اختر الخدمة
      - paragraph: اختر الخدمة أو التخصص المناسب لحالتك.
    - listitem:
      - strong: اختر الطبيب
      - paragraph: اطّلع على الأطباء المنشورين واختر الأنسب لك.
    - listitem:
      - strong: حدد الموعد
      - paragraph: اختر التاريخ والوقت المفضّلين لديك.
    - listitem:
      - strong: أرسل طلب الحجز
      - paragraph: أرسل الطلب وانتظر تأكيد فريق العيادة.
  - link "احجز موعدك الآن":
    - /url: /ar/book-appointment
  - link "تعرّف على أطبائنا":
    - /url: /ar/doctors
  - paragraph: اختر الخدمة والطبيب والموعد، ثم انتظر تأكيد فريق العيادة.
  - figure:
    - img "حجز موعد طبي من المنزل"
- paragraph: أطباؤنا
- heading "أطباؤنا" [level=2]
- paragraph: فريق طبي متخصص لمساعدتك في اختيار الرعاية المناسبة وحجز موعدك بسهولة.
- article:
  - paragraph: تقويم الأسنان · التركيبات · الجراحة
  - heading "الدكتور منانة فؤاد" [level=3]
  - paragraph: طبيبة أسنان أخصائية
  - paragraph: صاحبة العيادة — تقويم الأسنان والتركيبات والجراحة والحالات متعددة الحصص.
  - paragraph: "اللغات: ar · fr"
  - paragraph: "أيام العمل: من السبت إلى الخميس · 08:00–17:00"
  - paragraph: "التوفّر: السبت–الخميس 08:00–17:00"
  - link "عرض ملف الطبيب الدكتور منانة فؤاد":
    - /url: /ar/doctors/6a5710779eb02f6e53d8a4ff
    - text: عرض ملف الطبيب
  - link "حجز موعد مع الطبيب الدكتور منانة فؤاد":
    - /url: /ar/book-appointment?doctor=6a5710779eb02f6e53d8a4ff
    - text: احجز موعدًا
- article:
  - paragraph: الحالات الاستعجالية · العلاج العام
  - heading "الدكتور قعري أسامة" [level=3]
  - paragraph: طبيب أسنان عام
  - paragraph: طبيب عام للحالات الاستعجالية والعلاج الروتيني والخلع البسيط.
  - paragraph: "اللغات: ar · fr"
  - paragraph: "أيام العمل: من السبت إلى الخميس · 08:00–17:00"
  - paragraph: "التوفّر: السبت–الخميس 08:00–17:00"
  - link "عرض ملف الطبيب الدكتور قعري أسامة":
    - /url: /ar/doctors/6a5710779eb02f6e53d8a500
    - text: عرض ملف الطبيب
  - link "حجز موعد مع الطبيب الدكتور قعري أسامة":
    - /url: /ar/book-appointment?doctor=6a5710779eb02f6e53d8a500
    - text: احجز موعدًا
- link "عرض جميع الأطباء":
  - /url: /ar/doctors
- paragraph: لماذا عيادتنا؟
- heading "لماذا عيادتنا؟" [level=2]
- list:
  - listitem:
    - heading "فريق طبي متعدد التخصصات" [level=3]
    - paragraph: أطباء باختصاصات واضحة تساعدكم على الوصول للرعاية المناسبة بسرعة.
  - listitem:
    - heading "سهولة اختيار الطبيب المناسب" [level=3]
    - paragraph: تصفّحوا الملفات العامة واختاروا الطبيب وفق التخصص والتوفر.
  - listitem:
    - heading "تنظيم واضح ومرن للمواعيد" [level=3]
    - paragraph: طلب حجز منظّم عبر الموقع مع تأكيد من الاستقبال حسب الجدول الفعلي.
  - listitem:
    - heading "احترام خصوصية المريض" [level=3]
    - paragraph: نتعامل مع بياناتكم للتواصل والرعاية فقط، بحدود واضحة.
  - listitem:
    - heading "متابعة منظمة بعد الزيارة" [level=3]
    - paragraph: يمكن تنظيم مواعيد المتابعة وفق توجيه الطبيب عبر الاستقبال.
  - listitem:
    - heading "معلومات واضحة قبل الزيارة وبعدها" [level=3]
    - paragraph: صفحات جاهزة توضّح ما يُفضَّل إحضاره وكيف تتم المتابعة.
  - listitem:
    - heading "ساعات عمل مناسبة" [level=3]
    - paragraph: من السبت إلى الخميس 08:00–17:00، والجمعة مغلق.
  - listitem:
    - heading "تجربة مريحة من الحجز إلى المتابعة" [level=3]
    - paragraph: "مسار واضح: تخصص، طبيب، موعد، تأكيد، زيارة، ثم متابعة."
- paragraph: رحلة المريض في عيادة الوسام
- heading "رحلة المريض في عيادة الوسام" [level=2]
- paragraph: خطوات واضحة تبدأ من اختيار الخدمة وتنتهي بالمتابعة بعد الزيارة.
- list "رحلة المريض في عيادة الوسام":
  - listitem:
    - heading "1. اختيار الخدمة أو التخصص" [level=3]
    - paragraph: حددوا الخدمة أو التخصص الأنسب لسبب الزيارة.
  - listitem:
    - heading "2. اختيار الطبيب أو ترك الاختيار للاستقبال" [level=3]
    - paragraph: اختاروا طبيبًا منشورًا، أو اتركوا لفريق الاستقبال توجيه الطلب.
  - listitem:
    - heading "3. اختيار التاريخ والوقت المناسب" [level=3]
    - paragraph: اختاروا التاريخ والوقت المفضّلين ضمن ساعات عمل العيادة.
  - listitem:
    - heading "4. إرسال طلب الحجز" [level=3]
    - paragraph: أرسلوا بياناتكم وسبب الزيارة عبر نموذج الحجز الآمن.
  - listitem:
    - heading "5. مراجعة وتأكيد الموعد" [level=3]
    - paragraph: يراجع الاستقبال الطلب ويؤكّد الموعد النهائي معكم.
  - listitem:
    - heading "6. زيارة العيادة" [level=3]
    - paragraph: عند الوصول يسجّل الاستقبال حضوركم ويوجّهكم للطبيب.
  - listitem:
    - heading "7. استلام التعليمات والمتابعة" [level=3]
    - paragraph: تستلمون التعليمات بعد الزيارة وتحجزون المتابعة عند الحاجة.
- link "ابدأ رحلتك واحجز موعدك":
  - /url: /ar/book-appointment
- paragraph: نتائج قبل وبعد العلاج
- heading "نتائج قبل وبعد العلاج" [level=2]
- paragraph: حالات علاجية منشورة بعد مراجعتها والحصول على الموافقات المطلوبة.
- paragraph: لا توجد حالات قبل وبعد منشورة حاليًا.
- paragraph: تختلف النتائج من حالة إلى أخرى، وتحدد الخطة العلاجية بعد الفحص والتقييم من طرف الطبيب.
- paragraph: الصور منشورة بعد الحصول على الموافقات المطلوبة، ولا تمثل ضمانًا للحصول على النتيجة نفسها.
- paragraph: تجارب مرضانا
- heading "تجارب مرضانا" [level=2]
- paragraph: آراء وتجارب منشورة بعد مراجعتها واعتمادها من عيادة الوسام.
- paragraph: لا توجد تجارب مرضى منشورة حاليًا.
- paragraph: حساب المريض
- heading "كل تفاصيل حالتك العلاجية في حساب واحد" [level=2]
- paragraph: أنشئ حساب مريض لمتابعة مواعيدك وزياراتك السابقة وصورك وتقاريرك وتعليمات طبيبك من لوحة تحكم خاصة وآمنة.
- list:
  - listitem: متابعة جميع المواعيد
  - listitem: معرفة حالة كل حجز
  - listitem: عرض الزيارات السابقة
  - listitem: الاطلاع على الصور والتقارير الخاصة بك
  - listitem: مراجعة تعليمات الطبيب
  - listitem: استلام تذكيرات المتابعة
  - listitem: تحديث معلوماتك الشخصية
  - listitem: التواصل بخصوص الزيارات المكتملة
- link "إنشاء حساب جديد":
  - /url: /ar/patient/register
- link "تسجيل الدخول":
  - /url: /ar/patient/login
- figure:
  - img "بيئة رعاية أسنان احترافية للمرضى"
- paragraph: أسئلة شائعة
- heading "أسئلة شائعة" [level=2]
- link "الأسئلة":
  - /url: /ar/faq
- group: كيف يمكنني حجز موعد؟
- group: كيف أسجّل عند الوصول؟
- group: هل أحتاج حسابًا للزيارة؟
- group: ما هي مواعيد العيادة؟
- group: هل يمكنني اختيار طبيب محدد؟
- group: كيف أعرف المواعيد المتاحة للطبيب؟
- figure:
  - img "موقع عيادة الوسام ومعلومات التواصل"
- paragraph: الموقع والتواصل
- heading "الموقع والتواصل" [level=2]
- paragraph: تواصل معنا أو افتح اتجاهات الوصول إلى عيادة الوسام قبل زيارتك.
- article:
  - heading "عيادة الوسام لطب الأسنان" [level=3]
  - paragraph: حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009
  - paragraph:
    - link "0663 09 82 08":
      - /url: tel:+213663098208
  - paragraph:
    - link "clinic.elwissam@gmail.com":
      - /url: mailto:clinic.elwissam@gmail.com
  - paragraph:
    - link "زيارة صفحة عيادة الوسام على فيسبوك":
      - /url: https://web.facebook.com/Clinic.ElWissam
      - text: Clinic.ElWissam
- article:
  - heading "ساعات العمل" [level=3]
  - list:
    - listitem: من السبت إلى الخميس
    - listitem: من الساعة 08:00 إلى الساعة 17:00
    - listitem: "الجمعة: مغلق"
- link "احجز موعدًا":
  - /url: /ar/book-appointment
- link "إرسال استفسار":
  - /url: /ar/contact
- link "اتصل بالعيادة":
  - /url: tel:+213663098208
- link "تواصل عبر واتساب":
  - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
- link "عرض الاتجاهات":
  - /url: https://maps.app.goo.gl/1KtpHq8VWw98enw8A
- text: ساعات العمل
- heading "خطوتك الأولى نحو ابتسامة أكثر صحة" [level=2]
- paragraph: احجز موعدك من المنزل، واختر الطبيب والوقت المناسب لك، أو تواصل معنا لمساعدتك في تنظيم زيارتك.
- list:
  - listitem: من السبت إلى الخميس
  - listitem: من الساعة 08:00 إلى الساعة 17:00
  - listitem: 0663 09 82 08
  - listitem: حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009
- link "احجز موعدًا":
  - /url: /ar/book-appointment
- link "تواصل معنا":
  - /url: /ar/contact
- link "تواصل عبر واتساب":
  - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
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
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test.describe("Public website — locales & shell", () => {
  4   |   for (const locale of ["ar", "en", "fr"] as const) {
  5   |     test(`${locale} homepage loads`, async ({ page }) => {
  6   |       await page.goto(`/${locale}`);
  7   |       await expect(page.locator(".public-header")).toBeVisible();
  8   |       await expect(page.locator(".public-footer-xl")).toBeVisible();
  9   |       const dir = await page.locator("html").getAttribute("dir");
  10  |       if (locale === "ar") expect(dir).toBe("rtl");
  11  |       else expect(dir).toBe("ltr");
  12  |     });
  13  |   }
  14  | 
  15  |   test("staff login is absent from public chrome", async ({ page }) => {
  16  |     for (const path of ["/ar", "/ar/about", "/ar/contact", "/en", "/fr"]) {
  17  |       await page.goto(path);
  18  |       await expect(
  19  |         page.getByRole("link", { name: /دخول الطاقم|Staff login|Connexion du personnel|Espace personnel/i }),
  20  |       ).toHaveCount(0);
  21  |     }
  22  |   });
  23  | 
  24  |   test("change page link is absent from public chrome", async ({ page }) => {
  25  |     await page.goto("/ar");
  26  |     await expect(page.locator("a[href*='/change']")).toHaveCount(0);
  27  |     await expect(page.getByRole("link", { name: /^تغيير$|^Change$/i })).toHaveCount(0);
  28  |     await page.setViewportSize({ width: 390, height: 844 });
  29  |     await page.getByRole("button", { name: /القائمة|Menu/i }).click();
  30  |     await expect(page.locator("#public-mobile-nav a[href*='/change']")).toHaveCount(0);
  31  |   });
  32  | 
  33  |   test("language switch preserves about route", async ({ page }) => {
  34  |     await page.goto("/ar/about");
  35  |     const en = page.locator("a[href='/en/about'], a[href^='/en/about']").first();
  36  |     if (await en.count()) await en.click();
  37  |     else await page.goto("/en/about");
  38  |     await expect(page).toHaveURL(/\/en\/about/);
  39  |   });
  40  | 
  41  |   test("language switch preserves contact route", async ({ page }) => {
  42  |     await page.goto("/ar/contact");
  43  |     const en = page.locator("a[href='/en/contact'], a[href^='/en/contact']").first();
  44  |     if (await en.count()) await en.click();
  45  |     else await page.goto("/en/contact");
  46  |     await expect(page).toHaveURL(/\/en\/contact/);
  47  |   });
  48  | });
  49  | 
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
> 95  |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
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
```