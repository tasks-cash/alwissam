# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage-four-sections.spec.ts >> Homepage four sections + navbar create account >> Create Account appears once in desktop header and once in mobile drawer
- Location: e2e/homepage-four-sections.spec.ts:52:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.public-header-actions a.public-register-btn[href=\'/ar/patient/register\']')
Expected: 1
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.public-header-actions a.public-register-btn[href=\'/ar/patient/register\']')
    14 × locator resolved to 0 elements
       - unexpected value "0"

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
      - navigation "Primary" [ref=e14]:
        - link "الرئيسية" [ref=e15] [cursor=pointer]:
          - /url: /ar
        - link "من نحن" [ref=e16] [cursor=pointer]:
          - /url: /ar/about
        - link "الخدمات" [ref=e17] [cursor=pointer]:
          - /url: /ar/services
        - link "التخصصات" [ref=e18] [cursor=pointer]:
          - /url: /ar/specialties
        - link "الأطباء" [ref=e19] [cursor=pointer]:
          - /url: /ar/doctors
        - link "التقييمات" [ref=e20] [cursor=pointer]:
          - /url: /ar/reviews
        - link "الأسئلة" [ref=e21] [cursor=pointer]:
          - /url: /ar/faq
        - link "تواصل" [ref=e22] [cursor=pointer]:
          - /url: /ar/contact
      - generic [ref=e23]:
        - link "تسجيل الدخول" [ref=e24] [cursor=pointer]:
          - /url: /ar/auth/login
        - link "إنشاء حساب جديد" [ref=e25] [cursor=pointer]:
          - /url: /ar/auth/register
          - img [ref=e27]
          - text: إنشاء حساب جديد
        - link "احجز موعدًا" [ref=e31] [cursor=pointer]:
          - /url: /ar/book-appointment
    - generic [ref=e32]:
      - generic [ref=e35]:
        - generic [ref=e36]:
          - paragraph [ref=e37]: رعاية أسنان متخصصة في الوادي
          - paragraph [ref=e38]: عيادة الوسام لطب الأسنان
          - heading "رعاية طبية متخصصة تبدأ من احتياجاتك" [level=1] [ref=e39]
          - paragraph [ref=e40]: فريق طبي متعدد التخصصات، مواعيد منظمة، وتجربة رعاية مصممة لتوفير الراحة والثقة لكل مريض.
          - list "رعاية أسنان متخصصة في الوادي" [ref=e41]:
            - listitem [ref=e42]: حجز سهل من المنزل
            - listitem [ref=e43]: اختيار الطبيب المناسب
            - listitem [ref=e44]: متابعة منظمة للمواعيد
          - generic [ref=e45]:
            - link "احجز موعدًا" [ref=e46] [cursor=pointer]:
              - /url: /ar/book-appointment
            - link "تعرّف على الأطباء" [ref=e47] [cursor=pointer]:
              - /url: /ar/doctors
        - generic [ref=e48]:
          - figure "رعاية فموية هادئة ودقيقة" [ref=e49]:
            - img "رعاية فموية هادئة ودقيقة" [ref=e50]
            - generic [ref=e51]: رعاية دقيقة واهتمام بكل خطوة
            - generic [ref=e52]: حجز ومتابعة من مكان واحد
            - generic [ref=e53]: رعاية فموية هادئة ودقيقة
          - figure [ref=e54]:
            - generic [ref=e55]: بيئة طبية منظمة ومريحة
      - generic [ref=e59]:
        - generic [ref=e60]:
          - paragraph [ref=e61]: بحث سريع عن موعد
          - heading "بحث سريع عن موعد" [level=2] [ref=e62]
        - generic [ref=e63]:
          - generic [ref=e64]:
            - generic [ref=e65]: التخصص
            - combobox "التخصص" [ref=e66]:
              - option "اتركه فارغًا ليختار الاستقبال الطبيب المناسب" [selected]
              - option "طب الأسنان العام"
              - option "طب الأسنان التجميلي"
              - option "تقويم الأسنان"
              - option "علاج اللثة"
              - option "علاج جذور الأسنان"
              - option "جراحة الفم والأسنان"
          - generic [ref=e67]:
            - generic [ref=e68]: الطبيب
            - combobox "الطبيب" [ref=e69]:
              - option "اتركه فارغًا ليختار الاستقبال الطبيب المناسب" [selected]
              - option "الدكتور منانة فؤاد — تقويم الأسنان · التركيبات · الجراحة"
              - option "الدكتور قعري أسامة — الحالات الاستعجالية · العلاج العام"
          - generic [ref=e70]:
            - generic [ref=e71]: التاريخ المفضّل
            - textbox "التاريخ المفضّل" [ref=e72]
          - button "البحث عن موعد متاح" [ref=e73] [cursor=pointer]
      - generic [ref=e77]:
        - generic [ref=e78]:
          - paragraph [ref=e79]: تعرّف على عيادة الوسام
          - heading "تعرّف على عيادة الوسام" [level=2] [ref=e80]
          - paragraph [ref=e81]: عيادة الوسام لطب الأسنان مساحة طبية تهدف إلى توفير تجربة منظمة وواضحة للمريض، من اختيار الخدمة والطبيب إلى الحجز والمتابعة بعد الزيارة.
          - paragraph [ref=e82]: عيادة الوسام لطب الأسنان — رعاية احترافية تجمع بين الخبرة والتقنيات الحديثة في بيئة هادئة وموثوقة.
          - list [ref=e83]:
            - listitem [ref=e84]:
              - generic [ref=e86]:
                - heading "حجز من المنزل" [level=3] [ref=e87]
                - paragraph [ref=e88]: أرسلوا طلب الموعد عبر الموقع دون عناء التنقل.
            - listitem [ref=e89]:
              - generic [ref=e91]:
                - heading "اختيار الطبيب" [level=3] [ref=e92]
                - paragraph [ref=e93]: اطلعوا على الملفات العامة واختاروا الطبيب المناسب.
            - listitem [ref=e94]:
              - generic [ref=e96]:
                - heading "تنظيم المواعيد" [level=3] [ref=e97]
                - paragraph [ref=e98]: مسار واضح من الطلب إلى التأكيد عبر الاستقبال.
            - listitem [ref=e99]:
              - generic [ref=e101]:
                - heading "متابعة بعد الزيارة" [level=3] [ref=e102]
                - paragraph [ref=e103]: تعليمات ومتابعة منظمة وفق توجيه الطبيب.
            - listitem [ref=e104]:
              - generic [ref=e106]:
                - heading "خصوصية معلومات المريض" [level=3] [ref=e107]
                - paragraph [ref=e108]: نحمي بياناتكم ونستخدمها لأغراض الرعاية والتواصل فقط.
            - listitem [ref=e109]:
              - generic [ref=e111]:
                - heading "خدمات أسنان متعددة" [level=3] [ref=e112]
                - paragraph [ref=e113]: عام، تقويم، جراحة، وتنظيف وخدمات أخرى منشورة.
          - generic [ref=e114]:
            - link "اعرف المزيد عن العيادة" [ref=e115] [cursor=pointer]:
              - /url: /ar/about
            - link "احجز موعدًا" [ref=e116] [cursor=pointer]:
              - /url: /ar/book-appointment
        - generic [ref=e117]:
          - img "رعاية فموية هادئة ودقيقة" [ref=e120]
          - generic [ref=e122]:
            - heading "ساعات العمل" [level=3] [ref=e123]
            - list [ref=e124]:
              - listitem [ref=e125]: من السبت إلى الخميس
              - listitem [ref=e126]: من الساعة 08:00 إلى الساعة 17:00
              - listitem [ref=e127]: "الجمعة: مغلق"
      - generic [ref=e130]:
        - generic [ref=e131]:
          - generic [ref=e132]:
            - paragraph [ref=e133]: تخصصاتنا الطبية
            - heading "تخصصاتنا الطبية" [level=2] [ref=e134]
            - paragraph [ref=e135]: مجموعة من تخصصات طب الأسنان لتوفير التشخيص والعلاج المناسب لكل حالة.
          - link "عرض جميع التخصصات" [ref=e136] [cursor=pointer]:
            - /url: /ar/specialties
        - generic [ref=e137]:
          - article [ref=e138]:
            - generic [ref=e139]:
              - img [ref=e141]
              - generic [ref=e143]: مميز
            - generic [ref=e144]:
              - heading "طب الأسنان العام" [level=3] [ref=e145]:
                - link "طب الأسنان العام" [ref=e146] [cursor=pointer]:
                  - /url: /ar/specialties/general-dentistry
              - paragraph [ref=e147]: تشخيص وعلاج مشكلات الأسنان الشائعة، والمحافظة على صحة الفم والأسنان من خلال الفحوصات والعلاجات الوقائية والترميمية.
              - generic "إحصاءات التخصص" [ref=e148]:
                - generic [ref=e149]:
                  - strong [ref=e150]: "7"
                  - text: خدمة متاحة
                - generic [ref=e151]:
                  - strong [ref=e152]: "0"
                  - text: أطباء
              - list [ref=e153]:
                - listitem [ref=e154]:
                  - link "تبييض الأسنان" [ref=e155] [cursor=pointer]:
                    - /url: /ar/services/teeth-whitening
                - listitem [ref=e156]:
                  - link "تلميع الأسنان" [ref=e157] [cursor=pointer]:
                    - /url: /ar/services/dental-polishing
                - listitem [ref=e158]:
                  - link "فحص الأسنان" [ref=e159] [cursor=pointer]:
                    - /url: /ar/services/dental-checkup
              - generic [ref=e160]:
                - link "عرض التخصص" [ref=e161] [cursor=pointer]:
                  - /url: /ar/specialties/general-dentistry
                - link "معلومات الخدمة" [ref=e162] [cursor=pointer]:
                  - /url: /ar/specialties/general-dentistry
          - article [ref=e163]:
            - generic [ref=e164]:
              - img [ref=e166]
              - generic [ref=e169]: مميز
            - generic [ref=e170]:
              - heading "طب الأسنان التجميلي" [level=3] [ref=e171]:
                - link "طب الأسنان التجميلي" [ref=e172] [cursor=pointer]:
                  - /url: /ar/specialties/cosmetic-dentistry
              - paragraph [ref=e173]: علاجات تهدف إلى تحسين مظهر الأسنان والابتسامة مع المحافظة على صحة ووظيفة الأسنان.
              - generic "إحصاءات التخصص" [ref=e174]:
                - generic [ref=e175]:
                  - strong [ref=e176]: "3"
                  - text: خدمة متاحة
                - generic [ref=e177]:
                  - strong [ref=e178]: "0"
                  - text: أطباء
              - list [ref=e179]:
                - listitem [ref=e180]:
                  - link "تبييض الأسنان" [ref=e181] [cursor=pointer]:
                    - /url: /ar/services/teeth-whitening
                - listitem [ref=e182]:
                  - link "تلميع الأسنان" [ref=e183] [cursor=pointer]:
                    - /url: /ar/services/dental-polishing
                - listitem [ref=e184]:
                  - link "قشور الأسنان التجميلية" [ref=e185] [cursor=pointer]:
                    - /url: /ar/services/dental-veneers
              - generic [ref=e186]:
                - link "عرض التخصص" [ref=e187] [cursor=pointer]:
                  - /url: /ar/specialties/cosmetic-dentistry
                - link "معلومات الخدمة" [ref=e188] [cursor=pointer]:
                  - /url: /ar/specialties/cosmetic-dentistry
          - article [ref=e189]:
            - generic [ref=e190]:
              - img [ref=e192]
              - generic [ref=e197]: مميز
            - generic [ref=e198]:
              - heading "تقويم الأسنان" [level=3] [ref=e199]:
                - link "تقويم الأسنان" [ref=e200] [cursor=pointer]:
                  - /url: /ar/specialties/orthodontics
              - paragraph [ref=e201]: تشخيص وعلاج عدم انتظام الأسنان والفكين باستخدام أجهزة وتقنيات تقويم مناسبة لكل حالة.
              - generic "إحصاءات التخصص" [ref=e202]:
                - generic [ref=e203]:
                  - strong [ref=e204]: "3"
                  - text: خدمة متاحة
                - generic [ref=e205]:
                  - strong [ref=e206]: "0"
                  - text: أطباء
              - list [ref=e207]:
                - listitem [ref=e208]:
                  - link "استشارة تقويم الأسنان" [ref=e209] [cursor=pointer]:
                    - /url: /ar/services/orthodontic-consultation
                - listitem [ref=e210]:
                  - link "تقويم الأسنان الثابت" [ref=e211] [cursor=pointer]:
                    - /url: /ar/services/fixed-braces
                - listitem [ref=e212]:
                  - link "تقويم الأسنان الشفاف" [ref=e213] [cursor=pointer]:
                    - /url: /ar/services/clear-aligners
              - generic [ref=e214]:
                - link "عرض التخصص" [ref=e215] [cursor=pointer]:
                  - /url: /ar/specialties/orthodontics
                - link "معلومات الخدمة" [ref=e216] [cursor=pointer]:
                  - /url: /ar/specialties/orthodontics
          - article [ref=e217]:
            - generic [ref=e218]:
              - img [ref=e220]
              - generic [ref=e223]: مميز
            - generic [ref=e224]:
              - heading "علاج اللثة" [level=3] [ref=e225]:
                - link "علاج اللثة" [ref=e226] [cursor=pointer]:
                  - /url: /ar/specialties/periodontics
              - paragraph [ref=e227]: الوقاية من أمراض اللثة وتشخيصها وعلاج الالتهابات ومشكلات الأنسجة الداعمة للأسنان.
              - generic "إحصاءات التخصص" [ref=e228]:
                - generic [ref=e229]:
                  - strong [ref=e230]: "1"
                  - text: خدمة متاحة
                - generic [ref=e231]:
                  - strong [ref=e232]: "0"
                  - text: أطباء
              - list [ref=e233]:
                - listitem [ref=e234]:
                  - link "علاج أمراض اللثة" [ref=e235] [cursor=pointer]:
                    - /url: /ar/services/gum-disease-treatment
              - generic [ref=e236]:
                - link "عرض التخصص" [ref=e237] [cursor=pointer]:
                  - /url: /ar/specialties/periodontics
                - link "معلومات الخدمة" [ref=e238] [cursor=pointer]:
                  - /url: /ar/specialties/periodontics
          - article [ref=e239]:
            - generic [ref=e240]:
              - img [ref=e242]
              - generic [ref=e244]: مميز
            - generic [ref=e245]:
              - heading "علاج جذور الأسنان" [level=3] [ref=e246]:
                - link "علاج جذور الأسنان" [ref=e247] [cursor=pointer]:
                  - /url: /ar/specialties/endodontics
              - paragraph [ref=e248]: تشخيص وعلاج التهابات وأمراض لب الأسنان والجذور بهدف الحفاظ على السن الطبيعي قدر الإمكان.
              - generic "إحصاءات التخصص" [ref=e249]:
                - generic [ref=e250]:
                  - strong [ref=e251]: "2"
                  - text: خدمة متاحة
                - generic [ref=e252]:
                  - strong [ref=e253]: "0"
                  - text: أطباء
              - list [ref=e254]:
                - listitem [ref=e255]:
                  - link "علاج عصب وجذور الأسنان" [ref=e256] [cursor=pointer]:
                    - /url: /ar/services/root-canal-treatment
                - listitem [ref=e257]:
                  - link "علاج خراج الأسنان" [ref=e258] [cursor=pointer]:
                    - /url: /ar/services/dental-abscess-treatment
              - generic [ref=e259]:
                - link "عرض التخصص" [ref=e260] [cursor=pointer]:
                  - /url: /ar/specialties/endodontics
                - link "معلومات الخدمة" [ref=e261] [cursor=pointer]:
                  - /url: /ar/specialties/endodontics
          - article [ref=e262]:
            - generic [ref=e263]:
              - img [ref=e265]
              - generic [ref=e267]: مميز
            - generic [ref=e268]:
              - heading "جراحة الفم والأسنان" [level=3] [ref=e269]:
                - link "جراحة الفم والأسنان" [ref=e270] [cursor=pointer]:
                  - /url: /ar/specialties/oral-surgery
              - paragraph [ref=e271]: إجراءات جراحية متخصصة لعلاج مشكلات الفم والأسنان مثل الخلع الجراحي وضروس العقل وبعض الحالات المعقدة.
              - generic "إحصاءات التخصص" [ref=e272]:
                - generic [ref=e273]:
                  - strong [ref=e274]: "3"
                  - text: خدمة متاحة
                - generic [ref=e275]:
                  - strong [ref=e276]: "0"
                  - text: أطباء
              - list [ref=e277]:
                - listitem [ref=e278]:
                  - link "خلع الأسنان" [ref=e279] [cursor=pointer]:
                    - /url: /ar/services/tooth-extraction
                - listitem [ref=e280]:
                  - link "خلع ضرس العقل" [ref=e281] [cursor=pointer]:
                    - /url: /ar/services/wisdom-tooth-removal
                - listitem [ref=e282]:
                  - link "علاج خراج الأسنان" [ref=e283] [cursor=pointer]:
                    - /url: /ar/services/dental-abscess-treatment
              - generic [ref=e284]:
                - link "عرض التخصص" [ref=e285] [cursor=pointer]:
                  - /url: /ar/specialties/oral-surgery
                - link "معلومات الخدمة" [ref=e286] [cursor=pointer]:
                  - /url: /ar/specialties/oral-surgery
      - generic [ref=e289]:
        - generic [ref=e290]:
          - generic [ref=e291]:
            - paragraph [ref=e292]: خدمات طب الأسنان
            - heading "خدمات طب الأسنان" [level=2] [ref=e293]
            - paragraph [ref=e294]: اختر الخدمة التي تحتاجها، ثم اطّلع على الأطباء والمواعيد المتاحة للحجز.
          - link "عرض جميع الخدمات" [ref=e295] [cursor=pointer]:
            - /url: /ar/services
        - generic [ref=e296]:
          - article [ref=e297]:
            - img [ref=e301]
            - generic [ref=e304]:
              - heading "تبييض الأسنان" [level=3] [ref=e305]:
                - link "تبييض الأسنان" [ref=e306] [cursor=pointer]:
                  - /url: /ar/services/teeth-whitening
              - paragraph [ref=e307]: تحسين لون الأسنان بعد تقييم مناسب.
              - generic [ref=e308]:
                - paragraph [ref=e309]:
                  - generic [ref=e310]: "التخصص:"
                  - link "طب الأسنان التجميلي" [ref=e311] [cursor=pointer]:
                    - /url: /ar/specialties/cosmetic-dentistry
                - paragraph [ref=e312]:
                  - strong [ref=e313]: "0"
                  - text: أطباء
                - paragraph [ref=e314]: تحتاج إلى فحص أولي
              - generic [ref=e315]:
                - link "تفاصيل الخدمة" [ref=e316] [cursor=pointer]:
                  - /url: /ar/services/teeth-whitening
                - link "معلومات الخدمة" [ref=e317] [cursor=pointer]:
                  - /url: /ar/services/teeth-whitening
          - article [ref=e318]:
            - img [ref=e322]
            - generic [ref=e324]:
              - heading "تلميع الأسنان" [level=3] [ref=e325]:
                - link "تلميع الأسنان" [ref=e326] [cursor=pointer]:
                  - /url: /ar/services/dental-polishing
              - paragraph [ref=e327]: تلميع سطح الأسنان بعد التنظيف عند الحاجة.
              - generic [ref=e328]:
                - paragraph [ref=e329]:
                  - generic [ref=e330]: "التخصص:"
                  - link "طب الأسنان العام" [ref=e331] [cursor=pointer]:
                    - /url: /ar/specialties/general-dentistry
                - paragraph [ref=e332]:
                  - strong [ref=e333]: "0"
                  - text: أطباء
                - paragraph [ref=e334]: متاحة للحجز
              - generic [ref=e335]:
                - link "تفاصيل الخدمة" [ref=e336] [cursor=pointer]:
                  - /url: /ar/services/dental-polishing
                - link "معلومات الخدمة" [ref=e337] [cursor=pointer]:
                  - /url: /ar/services/dental-polishing
          - article [ref=e338]:
            - img [ref=e342]
            - generic [ref=e344]:
              - heading "فحص الأسنان" [level=3] [ref=e345]:
                - link "فحص الأسنان" [ref=e346] [cursor=pointer]:
                  - /url: /ar/services/dental-checkup
              - paragraph [ref=e347]: فحص شامل لصحة الفم والأسنان.
              - generic [ref=e348]:
                - paragraph [ref=e349]:
                  - generic [ref=e350]: "التخصص:"
                  - link "طب الأسنان العام" [ref=e351] [cursor=pointer]:
                    - /url: /ar/specialties/general-dentistry
                - paragraph [ref=e352]:
                  - strong [ref=e353]: "0"
                  - text: أطباء
                - paragraph [ref=e354]: متاحة للحجز
              - generic [ref=e355]:
                - link "تفاصيل الخدمة" [ref=e356] [cursor=pointer]:
                  - /url: /ar/services/dental-checkup
                - link "معلومات الخدمة" [ref=e357] [cursor=pointer]:
                  - /url: /ar/services/dental-checkup
          - article [ref=e358]:
            - img [ref=e362]
            - generic [ref=e364]:
              - heading "حشوات الأسنان" [level=3] [ref=e365]:
                - link "حشوات الأسنان" [ref=e366] [cursor=pointer]:
                  - /url: /ar/services/dental-fillings
              - paragraph [ref=e367]: ترميم الأسنان المتضررة بالحشوات المناسبة.
              - generic [ref=e368]:
                - paragraph [ref=e369]:
                  - generic [ref=e370]: "التخصص:"
                  - link "ترميم الأسنان" [ref=e371] [cursor=pointer]:
                    - /url: /ar/specialties/restorative-dentistry
                - paragraph [ref=e372]:
                  - strong [ref=e373]: "0"
                  - text: أطباء
                - paragraph [ref=e374]: متاحة للحجز
              - generic [ref=e375]:
                - link "تفاصيل الخدمة" [ref=e376] [cursor=pointer]:
                  - /url: /ar/services/dental-fillings
                - link "معلومات الخدمة" [ref=e377] [cursor=pointer]:
                  - /url: /ar/services/dental-fillings
          - article [ref=e378]:
            - img [ref=e382]
            - generic [ref=e384]:
              - heading "علاج عصب وجذور الأسنان" [level=3] [ref=e385]:
                - link "علاج عصب وجذور الأسنان" [ref=e386] [cursor=pointer]:
                  - /url: /ar/services/root-canal-treatment
              - paragraph [ref=e387]: علاج لب السن والجذور عند الالتهاب أو العدوى.
              - generic [ref=e388]:
                - paragraph [ref=e389]:
                  - generic [ref=e390]: "التخصص:"
                  - link "علاج جذور الأسنان" [ref=e391] [cursor=pointer]:
                    - /url: /ar/specialties/endodontics
                - paragraph [ref=e392]:
                  - strong [ref=e393]: "0"
                  - text: أطباء
                - paragraph [ref=e394]: تحتاج إلى فحص أولي
              - generic [ref=e395]:
                - link "تفاصيل الخدمة" [ref=e396] [cursor=pointer]:
                  - /url: /ar/services/root-canal-treatment
                - link "معلومات الخدمة" [ref=e397] [cursor=pointer]:
                  - /url: /ar/services/root-canal-treatment
          - article [ref=e398]:
            - img [ref=e402]
            - generic [ref=e404]:
              - heading "خلع الأسنان" [level=3] [ref=e405]:
                - link "خلع الأسنان" [ref=e406] [cursor=pointer]:
                  - /url: /ar/services/tooth-extraction
              - paragraph [ref=e407]: خلع السن عند الحاجة وفق تقييم الطبيب.
              - generic [ref=e408]:
                - paragraph [ref=e409]:
                  - generic [ref=e410]: "التخصص:"
                  - link "جراحة الفم والأسنان" [ref=e411] [cursor=pointer]:
                    - /url: /ar/specialties/oral-surgery
                - paragraph [ref=e412]:
                  - strong [ref=e413]: "0"
                  - text: أطباء
                - paragraph [ref=e414]: تحتاج إلى فحص أولي
              - generic [ref=e415]:
                - link "تفاصيل الخدمة" [ref=e416] [cursor=pointer]:
                  - /url: /ar/services/tooth-extraction
                - link "معلومات الخدمة" [ref=e417] [cursor=pointer]:
                  - /url: /ar/services/tooth-extraction
          - article [ref=e418]:
            - img [ref=e422]
            - generic [ref=e424]:
              - heading "زراعة الأسنان" [level=3] [ref=e425]:
                - link "زراعة الأسنان" [ref=e426] [cursor=pointer]:
                  - /url: /ar/services/dental-implants
              - paragraph [ref=e427]: تعويض الأسنان المفقودة بغرسات سنية.
              - generic [ref=e428]:
                - paragraph [ref=e429]:
                  - generic [ref=e430]: "التخصص:"
                  - link "زراعة الأسنان" [ref=e431] [cursor=pointer]:
                    - /url: /ar/specialties/dental-implantology
                - paragraph [ref=e432]:
                  - strong [ref=e433]: "0"
                  - text: أطباء
                - paragraph [ref=e434]: تحتاج إلى فحص أولي
              - generic [ref=e435]:
                - link "تفاصيل الخدمة" [ref=e436] [cursor=pointer]:
                  - /url: /ar/services/dental-implants
                - link "معلومات الخدمة" [ref=e437] [cursor=pointer]:
                  - /url: /ar/services/dental-implants
          - article [ref=e438]:
            - img [ref=e442]
            - generic [ref=e444]:
              - heading "تيجان الأسنان" [level=3] [ref=e445]:
                - link "تيجان الأسنان" [ref=e446] [cursor=pointer]:
                  - /url: /ar/services/dental-crowns
              - paragraph [ref=e447]: تاج يعيد شكل السن ووظيفته.
              - generic [ref=e448]:
                - paragraph [ref=e449]:
                  - generic [ref=e450]: "التخصص:"
                  - link "تركيبات الأسنان" [ref=e451] [cursor=pointer]:
                    - /url: /ar/specialties/prosthodontics
                - paragraph [ref=e452]:
                  - strong [ref=e453]: "0"
                  - text: أطباء
                - paragraph [ref=e454]: تحتاج إلى فحص أولي
              - generic [ref=e455]:
                - link "تفاصيل الخدمة" [ref=e456] [cursor=pointer]:
                  - /url: /ar/services/dental-crowns
                - link "معلومات الخدمة" [ref=e457] [cursor=pointer]:
                  - /url: /ar/services/dental-crowns
      - region "احجز موعدك من منزلك بكل سهولة" [ref=e459]:
        - generic [ref=e460]:
          - generic [ref=e461]:
            - paragraph [ref=e462]: حجز من المنزل
            - heading "احجز موعدك من منزلك بكل سهولة" [level=2] [ref=e463]
            - paragraph [ref=e464]: لا حاجة إلى إضاعة الوقت والمال في التنقل فقط للبحث عن موعد. اختر الخدمة والطبيب والتاريخ المناسب، وأرسل طلب الحجز من منزلك.
            - paragraph [ref=e465]: اترك لفريق عيادة الوسام مهمة تنظيم زيارتك والتواصل معك لتأكيد الموعد.
            - list [ref=e466]:
              - listitem [ref=e467]:
                - generic [ref=e468]: "1"
                - img [ref=e470]
                - generic [ref=e472]:
                  - strong [ref=e473]: اختر الخدمة
                  - paragraph [ref=e474]: اختر الخدمة أو التخصص المناسب لحالتك.
              - listitem [ref=e475]:
                - generic [ref=e476]: "2"
                - img [ref=e478]
                - generic [ref=e481]:
                  - strong [ref=e482]: اختر الطبيب
                  - paragraph [ref=e483]: اطّلع على الأطباء المنشورين واختر الأنسب لك.
              - listitem [ref=e484]:
                - generic [ref=e485]: "3"
                - img [ref=e487]
                - generic [ref=e490]:
                  - strong [ref=e491]: حدد الموعد
                  - paragraph [ref=e492]: اختر التاريخ والوقت المفضّلين لديك.
              - listitem [ref=e493]:
                - generic [ref=e494]: "4"
                - img [ref=e496]
                - generic [ref=e498]:
                  - strong [ref=e499]: أرسل طلب الحجز
                  - paragraph [ref=e500]: أرسل الطلب وانتظر تأكيد فريق العيادة.
            - generic [ref=e501]:
              - link "احجز موعدك الآن" [ref=e502] [cursor=pointer]:
                - /url: /ar/book-appointment
              - link "تعرّف على أطبائنا" [ref=e503] [cursor=pointer]:
                - /url: /ar/doctors
            - paragraph [ref=e504]: اختر الخدمة والطبيب والموعد، ثم انتظر تأكيد فريق العيادة.
          - generic [ref=e506]:
            - figure [ref=e507]:
              - img "حجز موعد طبي من المنزل" [ref=e508]
            - generic: طلب حجز
            - generic: التقويم
            - generic: بانتظار التأكيد
      - generic [ref=e511]:
        - generic [ref=e513]:
          - paragraph [ref=e514]: أطباؤنا
          - heading "أطباؤنا" [level=2] [ref=e515]
          - paragraph [ref=e516]: فريق طبي متخصص لمساعدتك في اختيار الرعاية المناسبة وحجز موعدك بسهولة.
        - generic [ref=e517]:
          - article [ref=e518]:
            - generic [ref=e519]:
              - generic [ref=e521]: ا
              - paragraph [ref=e522]: تقويم الأسنان · التركيبات · الجراحة
            - generic [ref=e523]:
              - heading "الدكتور منانة فؤاد" [level=3] [ref=e524]
              - paragraph [ref=e525]: طبيبة أسنان أخصائية
              - paragraph [ref=e526]: صاحبة العيادة — تقويم الأسنان والتركيبات والجراحة والحالات متعددة الحصص.
              - paragraph [ref=e527]: "اللغات: ar · fr"
              - generic [ref=e528]:
                - paragraph [ref=e529]: "أيام العمل: من السبت إلى الخميس · 08:00–17:00"
                - paragraph [ref=e530]: "التوفّر: السبت–الخميس 08:00–17:00"
              - generic [ref=e531]:
                - link "عرض ملف الطبيب الدكتور منانة فؤاد" [ref=e532] [cursor=pointer]:
                  - /url: /ar/doctors/6a5710779eb02f6e53d8a4ff
                  - text: عرض ملف الطبيب
                - link "حجز موعد مع الطبيب الدكتور منانة فؤاد" [ref=e533] [cursor=pointer]:
                  - /url: /ar/book-appointment?doctor=6a5710779eb02f6e53d8a4ff
                  - text: احجز موعدًا
          - article [ref=e534]:
            - generic [ref=e535]:
              - generic [ref=e537]: ا
              - paragraph [ref=e538]: الحالات الاستعجالية · العلاج العام
            - generic [ref=e539]:
              - heading "الدكتور قعري أسامة" [level=3] [ref=e540]
              - paragraph [ref=e541]: طبيب أسنان عام
              - paragraph [ref=e542]: طبيب عام للحالات الاستعجالية والعلاج الروتيني والخلع البسيط.
              - paragraph [ref=e543]: "اللغات: ar · fr"
              - generic [ref=e544]:
                - paragraph [ref=e545]: "أيام العمل: من السبت إلى الخميس · 08:00–17:00"
                - paragraph [ref=e546]: "التوفّر: السبت–الخميس 08:00–17:00"
              - generic [ref=e547]:
                - link "عرض ملف الطبيب الدكتور قعري أسامة" [ref=e548] [cursor=pointer]:
                  - /url: /ar/doctors/6a5710779eb02f6e53d8a500
                  - text: عرض ملف الطبيب
                - link "حجز موعد مع الطبيب الدكتور قعري أسامة" [ref=e549] [cursor=pointer]:
                  - /url: /ar/book-appointment?doctor=6a5710779eb02f6e53d8a500
                  - text: احجز موعدًا
        - link "عرض جميع الأطباء" [ref=e551] [cursor=pointer]:
          - /url: /ar/doctors
      - generic [ref=e554]:
        - paragraph [ref=e555]: لماذا عيادتنا؟
        - heading "لماذا عيادتنا؟" [level=2] [ref=e556]
        - list [ref=e557]:
          - listitem [ref=e558]:
            - img [ref=e560]
            - heading "فريق طبي متعدد التخصصات" [level=3] [ref=e562]
            - paragraph [ref=e563]: أطباء باختصاصات واضحة تساعدكم على الوصول للرعاية المناسبة بسرعة.
          - listitem [ref=e564]:
            - img [ref=e566]
            - heading "سهولة اختيار الطبيب المناسب" [level=3] [ref=e568]
            - paragraph [ref=e569]: تصفّحوا الملفات العامة واختاروا الطبيب وفق التخصص والتوفر.
          - listitem [ref=e570]:
            - img [ref=e572]
            - heading "تنظيم واضح ومرن للمواعيد" [level=3] [ref=e574]
            - paragraph [ref=e575]: طلب حجز منظّم عبر الموقع مع تأكيد من الاستقبال حسب الجدول الفعلي.
          - listitem [ref=e576]:
            - img [ref=e578]
            - heading "احترام خصوصية المريض" [level=3] [ref=e580]
            - paragraph [ref=e581]: نتعامل مع بياناتكم للتواصل والرعاية فقط، بحدود واضحة.
          - listitem [ref=e582]:
            - img [ref=e584]
            - heading "متابعة منظمة بعد الزيارة" [level=3] [ref=e586]
            - paragraph [ref=e587]: يمكن تنظيم مواعيد المتابعة وفق توجيه الطبيب عبر الاستقبال.
          - listitem [ref=e588]:
            - img [ref=e590]
            - heading "معلومات واضحة قبل الزيارة وبعدها" [level=3] [ref=e592]
            - paragraph [ref=e593]: صفحات جاهزة توضّح ما يُفضَّل إحضاره وكيف تتم المتابعة.
          - listitem [ref=e594]:
            - img [ref=e596]
            - heading "ساعات عمل مناسبة" [level=3] [ref=e598]
            - paragraph [ref=e599]: من السبت إلى الخميس 08:00–17:00، والجمعة مغلق.
          - listitem [ref=e600]:
            - img [ref=e602]
            - heading "تجربة مريحة من الحجز إلى المتابعة" [level=3] [ref=e604]
            - paragraph [ref=e605]: "مسار واضح: تخصص، طبيب، موعد، تأكيد، زيارة، ثم متابعة."
      - generic [ref=e608]:
        - paragraph [ref=e609]: رحلة المريض في عيادة الوسام
        - heading "رحلة المريض في عيادة الوسام" [level=2] [ref=e610]
        - generic [ref=e611]:
          - paragraph [ref=e612]: خطوات واضحة تبدأ من اختيار الخدمة وتنتهي بالمتابعة بعد الزيارة.
          - list "رحلة المريض في عيادة الوسام" [ref=e613]:
            - listitem [ref=e614]:
              - generic [ref=e615]:
                - generic [ref=e616]: "1"
                - img [ref=e618]
              - generic [ref=e620]:
                - heading "1. اختيار الخدمة أو التخصص" [level=3] [ref=e621]:
                  - generic [ref=e622]: "1."
                  - text: اختيار الخدمة أو التخصص
                - paragraph [ref=e623]: حددوا الخدمة أو التخصص الأنسب لسبب الزيارة.
            - listitem [ref=e624]:
              - generic [ref=e625]:
                - generic [ref=e626]: "2"
                - img [ref=e628]
              - generic [ref=e632]:
                - heading "2. اختيار الطبيب أو ترك الاختيار للاستقبال" [level=3] [ref=e633]:
                  - generic [ref=e634]: "2."
                  - text: اختيار الطبيب أو ترك الاختيار للاستقبال
                - paragraph [ref=e635]: اختاروا طبيبًا منشورًا، أو اتركوا لفريق الاستقبال توجيه الطلب.
            - listitem [ref=e636]:
              - generic [ref=e637]:
                - generic [ref=e638]: "3"
                - img [ref=e640]
              - generic [ref=e644]:
                - heading "3. اختيار التاريخ والوقت المناسب" [level=3] [ref=e645]:
                  - generic [ref=e646]: "3."
                  - text: اختيار التاريخ والوقت المناسب
                - paragraph [ref=e647]: اختاروا التاريخ والوقت المفضّلين ضمن ساعات عمل العيادة.
            - listitem [ref=e648]:
              - generic [ref=e649]:
                - generic [ref=e650]: "4"
                - img [ref=e652]
              - generic [ref=e655]:
                - heading "4. إرسال طلب الحجز" [level=3] [ref=e656]:
                  - generic [ref=e657]: "4."
                  - text: إرسال طلب الحجز
                - paragraph [ref=e658]: أرسلوا بياناتكم وسبب الزيارة عبر نموذج الحجز الآمن.
            - listitem [ref=e659]:
              - generic [ref=e660]:
                - generic [ref=e661]: "5"
                - img [ref=e663]
              - generic [ref=e666]:
                - heading "5. مراجعة وتأكيد الموعد" [level=3] [ref=e667]:
                  - generic [ref=e668]: "5."
                  - text: مراجعة وتأكيد الموعد
                - paragraph [ref=e669]: يراجع الاستقبال الطلب ويؤكّد الموعد النهائي معكم.
            - listitem [ref=e670]:
              - generic [ref=e671]:
                - generic [ref=e672]: "6"
                - img [ref=e674]
              - generic [ref=e677]:
                - heading "6. زيارة العيادة" [level=3] [ref=e678]:
                  - generic [ref=e679]: "6."
                  - text: زيارة العيادة
                - paragraph [ref=e680]: عند الوصول يسجّل الاستقبال حضوركم ويوجّهكم للطبيب.
            - listitem [ref=e681]:
              - generic [ref=e682]:
                - generic [ref=e683]: "7"
                - img [ref=e685]
              - generic [ref=e689]:
                - heading "7. استلام التعليمات والمتابعة" [level=3] [ref=e690]:
                  - generic [ref=e691]: "7."
                  - text: استلام التعليمات والمتابعة
                - paragraph [ref=e692]: تستلمون التعليمات بعد الزيارة وتحجزون المتابعة عند الحاجة.
          - link "ابدأ رحلتك واحجز موعدك" [ref=e694] [cursor=pointer]:
            - /url: /ar/book-appointment
      - generic [ref=e697]:
        - generic [ref=e699]:
          - paragraph [ref=e700]: نتائج قبل وبعد العلاج
          - heading "نتائج قبل وبعد العلاج" [level=2] [ref=e701]
          - paragraph [ref=e702]: حالات علاجية منشورة بعد مراجعتها والحصول على الموافقات المطلوبة.
        - paragraph [ref=e704]: لا توجد حالات قبل وبعد منشورة حاليًا.
        - paragraph [ref=e705]: تختلف النتائج من حالة إلى أخرى، وتحدد الخطة العلاجية بعد الفحص والتقييم من طرف الطبيب.
        - paragraph [ref=e706]: الصور منشورة بعد الحصول على الموافقات المطلوبة، ولا تمثل ضمانًا للحصول على النتيجة نفسها.
      - generic [ref=e709]:
        - generic [ref=e711]:
          - paragraph [ref=e712]: تجارب مرضانا
          - heading "تجارب مرضانا" [level=2] [ref=e713]
          - paragraph [ref=e714]: آراء وتجارب منشورة بعد مراجعتها واعتمادها من عيادة الوسام.
        - paragraph [ref=e716]: لا توجد تجارب مرضى منشورة حاليًا.
      - generic [ref=e720]:
        - generic [ref=e721]:
          - paragraph [ref=e722]: حساب المريض
          - heading "كل تفاصيل حالتك العلاجية في حساب واحد" [level=2] [ref=e723]
          - paragraph [ref=e724]: أنشئ حساب مريض لمتابعة مواعيدك وزياراتك السابقة وصورك وتقاريرك وتعليمات طبيبك من لوحة تحكم خاصة وآمنة.
          - list [ref=e725]:
            - listitem [ref=e726]: متابعة جميع المواعيد
            - listitem [ref=e727]: معرفة حالة كل حجز
            - listitem [ref=e728]: عرض الزيارات السابقة
            - listitem [ref=e729]: الاطلاع على الصور والتقارير الخاصة بك
            - listitem [ref=e730]: مراجعة تعليمات الطبيب
            - listitem [ref=e731]: استلام تذكيرات المتابعة
            - listitem [ref=e732]: تحديث معلوماتك الشخصية
            - listitem [ref=e733]: التواصل بخصوص الزيارات المكتملة
          - generic [ref=e734]:
            - link "إنشاء حساب جديد" [ref=e735] [cursor=pointer]:
              - /url: /ar/patient/register
            - link "تسجيل الدخول" [ref=e736] [cursor=pointer]:
              - /url: /ar/patient/login
        - generic "معاينة توضيحية للوحة التحكم (بيانات وهمية)" [ref=e737]:
          - figure [ref=e738]:
            - img "بيئة رعاية أسنان احترافية للمرضى" [ref=e739]
          - generic:
            - generic: معاينة توضيحية للوحة التحكم (بيانات وهمية)
          - generic: موعد قادم
          - generic: متابعة العلاج
          - generic: تذكير
          - generic: ملف طبي
          - generic: خصوصية محسّنة
      - generic [ref=e742]:
        - generic [ref=e743]:
          - generic [ref=e744]:
            - paragraph [ref=e745]: أسئلة شائعة
            - heading "أسئلة شائعة" [level=2] [ref=e746]
          - link "الأسئلة" [ref=e747] [cursor=pointer]:
            - /url: /ar/faq
        - generic [ref=e748]:
          - group [ref=e749]:
            - generic "كيف يمكنني حجز موعد؟" [ref=e750] [cursor=pointer]
          - group [ref=e751]:
            - generic "كيف أسجّل عند الوصول؟" [ref=e752] [cursor=pointer]
          - group [ref=e753]:
            - generic "هل أحتاج حسابًا للزيارة؟" [ref=e754] [cursor=pointer]
          - group [ref=e755]:
            - generic "ما هي مواعيد العيادة؟" [ref=e756] [cursor=pointer]
          - group [ref=e757]:
            - generic "هل يمكنني اختيار طبيب محدد؟" [ref=e758] [cursor=pointer]
          - group [ref=e759]:
            - generic "كيف أعرف المواعيد المتاحة للطبيب؟" [ref=e760] [cursor=pointer]
      - generic [ref=e764]:
        - generic [ref=e765]:
          - img [ref=e767]
          - figure [ref=e770]:
            - img "موقع عيادة الوسام ومعلومات التواصل" [ref=e771]
        - generic [ref=e773]:
          - paragraph [ref=e774]: الموقع والتواصل
          - heading "الموقع والتواصل" [level=2] [ref=e775]
          - paragraph [ref=e776]: تواصل معنا أو افتح اتجاهات الوصول إلى عيادة الوسام قبل زيارتك.
          - generic [ref=e777]:
            - article [ref=e778]:
              - heading "عيادة الوسام لطب الأسنان" [level=3] [ref=e779]
              - paragraph [ref=e780]: حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009
              - paragraph [ref=e781]:
                - link "0663 09 82 08" [ref=e782] [cursor=pointer]:
                  - /url: tel:+213663098208
              - paragraph [ref=e783]:
                - link "clinic.elwissam@gmail.com" [ref=e784] [cursor=pointer]:
                  - /url: mailto:clinic.elwissam@gmail.com
              - paragraph [ref=e785]:
                - link "زيارة صفحة عيادة الوسام على فيسبوك" [ref=e786] [cursor=pointer]:
                  - /url: https://web.facebook.com/Clinic.ElWissam
                  - text: Clinic.ElWissam
            - article [ref=e787]:
              - generic [ref=e788]:
                - heading "ساعات العمل" [level=3] [ref=e789]
                - list [ref=e790]:
                  - listitem [ref=e791]: من السبت إلى الخميس
                  - listitem [ref=e792]: من الساعة 08:00 إلى الساعة 17:00
                  - listitem [ref=e793]: "الجمعة: مغلق"
          - generic [ref=e794]:
            - link "احجز موعدًا" [ref=e795] [cursor=pointer]:
              - /url: /ar/book-appointment
            - link "إرسال استفسار" [ref=e796] [cursor=pointer]:
              - /url: /ar/contact
            - link "اتصل بالعيادة" [ref=e797] [cursor=pointer]:
              - /url: tel:+213663098208
            - link "تواصل عبر واتساب" [ref=e798] [cursor=pointer]:
              - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
            - link "عرض الاتجاهات" [ref=e799] [cursor=pointer]:
              - /url: https://maps.app.goo.gl/1KtpHq8VWw98enw8A
      - generic [ref=e804]:
        - generic [ref=e805]:
          - generic [ref=e806]: ساعات العمل
          - heading "خطوتك الأولى نحو ابتسامة أكثر صحة" [level=2] [ref=e807]
          - paragraph [ref=e808]: احجز موعدك من المنزل، واختر الطبيب والوقت المناسب لك، أو تواصل معنا لمساعدتك في تنظيم زيارتك.
          - list [ref=e809]:
            - listitem [ref=e810]: من السبت إلى الخميس
            - listitem [ref=e811]: من الساعة 08:00 إلى الساعة 17:00
            - listitem [ref=e812]: 0663 09 82 08
            - listitem [ref=e813]: حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009
        - generic [ref=e818]:
          - link "احجز موعدًا" [ref=e819] [cursor=pointer]:
            - /url: /ar/book-appointment
          - link "تواصل معنا" [ref=e820] [cursor=pointer]:
            - /url: /ar/contact
          - link "تواصل عبر واتساب" [ref=e821] [cursor=pointer]:
            - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
    - contentinfo [ref=e822]:
      - generic [ref=e823]:
        - generic [ref=e824]:
          - heading "العيادة" [level=2] [ref=e825]
          - paragraph [ref=e826]: منصة إدارة طب الأسنان
          - link "احجز موعدًا" [ref=e827] [cursor=pointer]:
            - /url: /ar/book-appointment
        - generic [ref=e828]:
          - heading "روابط سريعة" [level=2] [ref=e829]
          - list [ref=e830]:
            - listitem [ref=e831]:
              - link "الرئيسية" [ref=e832] [cursor=pointer]:
                - /url: /ar
            - listitem [ref=e833]:
              - link "من نحن" [ref=e834] [cursor=pointer]:
                - /url: /ar/about
            - listitem [ref=e835]:
              - link "الخدمات" [ref=e836] [cursor=pointer]:
                - /url: /ar/services
            - listitem [ref=e837]:
              - link "التخصصات" [ref=e838] [cursor=pointer]:
                - /url: /ar/specialties
            - listitem [ref=e839]:
              - link "الأطباء" [ref=e840] [cursor=pointer]:
                - /url: /ar/doctors
            - listitem [ref=e841]:
              - link "التقييمات" [ref=e842] [cursor=pointer]:
                - /url: /ar/reviews
            - listitem [ref=e843]:
              - link "الأسئلة" [ref=e844] [cursor=pointer]:
                - /url: /ar/faq
            - listitem [ref=e845]:
              - link "تواصل" [ref=e846] [cursor=pointer]:
                - /url: /ar/contact
        - generic [ref=e847]:
          - heading "للمرضى" [level=2] [ref=e848]
          - list [ref=e849]:
            - listitem [ref=e850]:
              - link "معلومات المريض" [ref=e851] [cursor=pointer]:
                - /url: /ar/patient-information
            - listitem [ref=e852]:
              - link "قبل زيارتك" [ref=e853] [cursor=pointer]:
                - /url: /ar/before-your-visit
            - listitem [ref=e854]:
              - link "بعد زيارتك" [ref=e855] [cursor=pointer]:
                - /url: /ar/after-your-visit
            - listitem [ref=e856]:
              - link "الدعم" [ref=e857] [cursor=pointer]:
                - /url: /ar/support
            - listitem [ref=e858]:
              - link "سياسة الاسترداد" [ref=e859] [cursor=pointer]:
                - /url: /ar/refund-policy
            - listitem [ref=e860]:
              - link "سياسة الإلغاء" [ref=e861] [cursor=pointer]:
                - /url: /ar/cancellation-policy
        - generic [ref=e862]:
          - heading "قانوني" [level=2] [ref=e863]
          - list [ref=e864]:
            - listitem [ref=e865]:
              - link "الخصوصية" [ref=e866] [cursor=pointer]:
                - /url: /ar/privacy
            - listitem [ref=e867]:
              - link "الشروط" [ref=e868] [cursor=pointer]:
                - /url: /ar/terms
            - listitem [ref=e869]:
              - link "ملفات الارتباط" [ref=e870] [cursor=pointer]:
                - /url: /ar/cookies
            - listitem [ref=e871]:
              - link "إمكانية الوصول" [ref=e872] [cursor=pointer]:
                - /url: /ar/accessibility
            - listitem [ref=e873]:
              - link "إخلاء طبي" [ref=e874] [cursor=pointer]:
                - /url: /ar/medical-disclaimer
        - generic [ref=e875]:
          - heading "التواصل" [level=2] [ref=e876]
          - list [ref=e877]:
            - listitem [ref=e878]:
              - link "0663 09 82 08" [ref=e879] [cursor=pointer]:
                - /url: tel:+213663098208
            - listitem [ref=e880]:
              - link "clinic.elwissam@gmail.com" [ref=e881] [cursor=pointer]:
                - /url: mailto:clinic.elwissam@gmail.com
            - listitem [ref=e882]: حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009
            - listitem [ref=e883]: "من السبت إلى الخميس من الساعة 08:00 إلى الساعة 17:00 الجمعة: مغلق"
            - listitem [ref=e884]:
              - link "تواصل عبر واتساب" [ref=e885] [cursor=pointer]:
                - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
            - listitem [ref=e886]:
              - link "زيارة صفحة عيادة الوسام على فيسبوك" [ref=e887] [cursor=pointer]:
                - /url: https://web.facebook.com/Clinic.ElWissam
                - text: صفحتنا على فيسبوك
            - listitem [ref=e888]:
              - link "تواصل" [ref=e889] [cursor=pointer]:
                - /url: /ar/contact
      - generic [ref=e890]:
        - generic [ref=e891]: © 2026 عيادة الوسام لطب الأسنان
        - generic [ref=e892]:
          - link "الخصوصية" [ref=e893] [cursor=pointer]:
            - /url: /ar/privacy
          - link "الشروط" [ref=e894] [cursor=pointer]:
            - /url: /ar/terms
    - link "فتح محادثة واتساب مع عيادة الوسام لطب الأسنان" [ref=e895] [cursor=pointer]:
      - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
      - img [ref=e897]
      - generic [ref=e899]: تواصل معنا عبر واتساب
  - alert [ref=e900]
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
> 60  |     await expect(desktopRegister).toHaveCount(1);
      |                                   ^ Error: expect(locator).toHaveCount(expected) failed
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
  84  |     ).toBeVisible();
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