# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-site.spec.ts >> Homepage premium sections >> specialties section includes dentistry without href='#'
- Location: e2e/public-site.spec.ts:137:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'طب الأسنان', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'طب الأسنان', exact: true })

```

```yaml
- banner:
  - link "عيادة الوسام لطب الأسنان منصة إدارة طب الأسنان":
    - /url: /ar
    - strong: عيادة الوسام لطب الأسنان
    - text: منصة إدارة طب الأسنان
  - link "احجز موعدًا":
    - /url: /ar/book-appointment
  - button "القائمة"
- paragraph: عيادة الوسام لطب الأسنان
- heading "رعاية طبية متخصصة تبدأ من احتياجاتك" [level=1]
- paragraph: فريق طبي متعدد التخصصات، مواعيد منظمة، وتجربة رعاية مصممة لتوفير الراحة والثقة لكل مريض.
- link "احجز موعدًا":
  - /url: /ar/book-appointment
- link "تعرّف على الأطباء":
  - /url: /ar/doctors
- paragraph: بحث سريع عن موعد
- heading "بحث سريع عن موعد" [level=2]
- text: التخصص
- combobox "التخصص":
  - option "أي طبيب متاح" [selected]
  - option "طب الأسنان العام"
  - option "طب الأسنان التجميلي"
  - option "تقويم الأسنان"
  - option "علاج اللثة"
  - option "علاج جذور الأسنان"
  - option "جراحة الفم والأسنان"
- text: الطبيب
- combobox "الطبيب":
  - option "أي طبيب متاح" [selected]
  - option "الدكتور منانة فؤاد — تقويم الأسنان · التركيبات · الجراحة"
  - option "الدكتور قعري أسامة — الحالات الاستعجالية · العلاج العام"
- text: التاريخ المفضّل
- textbox "التاريخ المفضّل"
- button "البحث عن موعد متاح"
- paragraph: تعريف بالعيادة
- heading "تعريف بالعيادة" [level=2]
- paragraph: عيادة الوسام لطب الأسنان — رعاية احترافية تجمع بين الخبرة والتقنيات الحديثة في بيئة هادئة وموثوقة.
- link "اعرف المزيد عنّا":
  - /url: /ar/about
- link "احجز موعدًا":
  - /url: /ar/book-appointment
- img "رعاية فموية هادئة ودقيقة"
- paragraph: تخصصاتنا الطبية
- heading "تخصصاتنا الطبية" [level=2]
- paragraph: مجموعة من تخصصات طب الأسنان لتوفير التشخيص والعلاج المناسب لكل حالة.
- link "عرض جميع التخصصات":
  - /url: /ar/specialties
- article:
  - heading "طب الأسنان العام" [level=3]
  - paragraph: تشخيص وعلاج مشكلات الأسنان الشائعة، والمحافظة على صحة الفم والأسنان من خلال الفحوصات والعلاجات الوقائية والترميمية.
  - paragraph: 8 خدمة متاحة
  - link "عرض التخصص":
    - /url: /ar/specialties/general-dentistry
  - link "معلومات الخدمة":
    - /url: /ar/specialties/general-dentistry
- article:
  - heading "طب الأسنان التجميلي" [level=3]
  - paragraph: علاجات تهدف إلى تحسين مظهر الأسنان والابتسامة مع المحافظة على صحة ووظيفة الأسنان.
  - paragraph: 3 خدمة متاحة
  - link "عرض التخصص":
    - /url: /ar/specialties/cosmetic-dentistry
  - link "معلومات الخدمة":
    - /url: /ar/specialties/cosmetic-dentistry
- article:
  - heading "تقويم الأسنان" [level=3]
  - paragraph: تشخيص وعلاج عدم انتظام الأسنان والفكين باستخدام أجهزة وتقنيات تقويم مناسبة لكل حالة.
  - paragraph: 3 خدمة متاحة
  - link "عرض التخصص":
    - /url: /ar/specialties/orthodontics
  - link "معلومات الخدمة":
    - /url: /ar/specialties/orthodontics
- article:
  - heading "علاج اللثة" [level=3]
  - paragraph: الوقاية من أمراض اللثة وتشخيصها وعلاج الالتهابات ومشكلات الأنسجة الداعمة للأسنان.
  - paragraph: 2 خدمة متاحة
  - link "عرض التخصص":
    - /url: /ar/specialties/periodontics
  - link "معلومات الخدمة":
    - /url: /ar/specialties/periodontics
- article:
  - heading "علاج جذور الأسنان" [level=3]
  - paragraph: تشخيص وعلاج التهابات وأمراض لب الأسنان والجذور بهدف الحفاظ على السن الطبيعي قدر الإمكان.
  - paragraph: 2 خدمة متاحة
  - link "عرض التخصص":
    - /url: /ar/specialties/endodontics
  - link "معلومات الخدمة":
    - /url: /ar/specialties/endodontics
- article:
  - heading "جراحة الفم والأسنان" [level=3]
  - paragraph: إجراءات جراحية متخصصة لعلاج مشكلات الفم والأسنان مثل الخلع الجراحي وضروس العقل وبعض الحالات المعقدة.
  - paragraph: 3 خدمة متاحة
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
  - heading "تبييض الأسنان" [level=3]
  - paragraph: تحسين لون الأسنان بعد تقييم مناسب.
  - paragraph: "التخصص: طب الأسنان التجميلي"
  - paragraph: يتطلب استشارة مسبقة
  - link "تفاصيل الخدمة":
    - /url: /ar/services/teeth-whitening
  - link "معلومات الخدمة":
    - /url: /ar/services/teeth-whitening
- article:
  - heading "تنظيف الأسنان واللثة" [level=3]
  - paragraph: إزالة الجير والترسبات حول الأسنان واللثة.
  - paragraph: "التخصص: علاج اللثة"
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-scaling-gum-cleaning
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-scaling-gum-cleaning
- article:
  - heading "تلميع الأسنان" [level=3]
  - paragraph: تلميع سطح الأسنان بعد التنظيف عند الحاجة.
  - paragraph: "التخصص: طب الأسنان العام"
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-polishing
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-polishing
- article:
  - heading "فحص الأسنان" [level=3]
  - paragraph: فحص شامل لصحة الفم والأسنان.
  - paragraph: "التخصص: طب الأسنان العام"
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-checkup
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-checkup
- article:
  - heading "حشوات الأسنان" [level=3]
  - paragraph: ترميم الأسنان المتضررة بالحشوات المناسبة.
  - paragraph: "التخصص: ترميم الأسنان"
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-fillings
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-fillings
- article:
  - heading "علاج عصب وجذور الأسنان" [level=3]
  - paragraph: علاج لب السن والجذور عند الالتهاب أو العدوى.
  - paragraph: "التخصص: علاج جذور الأسنان"
  - paragraph: يتطلب استشارة مسبقة
  - link "تفاصيل الخدمة":
    - /url: /ar/services/root-canal-treatment
  - link "معلومات الخدمة":
    - /url: /ar/services/root-canal-treatment
- article:
  - heading "خلع الأسنان" [level=3]
  - paragraph: خلع السن عند الحاجة وفق تقييم الطبيب.
  - paragraph: "التخصص: جراحة الفم والأسنان"
  - paragraph: يتطلب استشارة مسبقة
  - link "تفاصيل الخدمة":
    - /url: /ar/services/tooth-extraction
  - link "معلومات الخدمة":
    - /url: /ar/services/tooth-extraction
- article:
  - heading "زراعة الأسنان" [level=3]
  - paragraph: تعويض الأسنان المفقودة بغرسات سنية.
  - paragraph: "التخصص: زراعة الأسنان"
  - paragraph: يتطلب استشارة مسبقة
  - link "تفاصيل الخدمة":
    - /url: /ar/services/dental-implants
  - link "معلومات الخدمة":
    - /url: /ar/services/dental-implants
- region "لماذا تتعب من أجل حجز موعد؟":
  - paragraph: حجز من المنزل
  - heading "لماذا تتعب من أجل حجز موعد؟" [level=2]
  - paragraph: هل سئمت من إضاعة الوقت والمال في التنقل، أو استئجار سيارة فقط من أجل البحث عن موعد؟
  - paragraph: مع عيادتنا، يمكنك اختيار التخصص والطبيب والموعد المناسب لك، وإرسال طلب الحجز من منزلك بكل سهولة، دون عناء التنقل أو الانتظار.
  - paragraph: احجز موعدك من بيتك، واترك لنا مهمة تنظيم زيارتك.
  - list:
    - listitem: الحجز من المنزل
    - listitem: اختيار الطبيب المناسب
    - listitem: عرض المواعيد المتاحة
    - listitem: تأكيد من فريق العيادة
  - link "احجز موعدك الآن":
    - /url: /ar/book-appointment
  - link "تعرّف على أطبائنا":
    - /url: /ar/doctors
  - paragraph: اختر الطبيب والموعد المناسب، ثم انتظر تأكيد الحجز من فريق العيادة.
  - img "حجز موعد طبي من المنزل"
- paragraph: الأطباء
- heading "الأطباء" [level=2]
- link "عرض جميع الأطباء":
  - /url: /ar/doctors
- article:
  - heading "الدكتور منانة فؤاد" [level=3]
  - paragraph: تقويم الأسنان · التركيبات · الجراحة
  - paragraph: SPECIALIST
  - paragraph: صاحبة العيادة — تقويم الأسنان والتركيبات والجراحة والحالات متعددة الحصص.
  - paragraph: "التوفّر: السبت–الخميس 08:00–17:00"
  - link "عرض ملف الطبيب":
    - /url: /ar/doctors/6a5710779eb02f6e53d8a4ff
  - link "احجز موعدًا":
    - /url: /ar/book-appointment?doctor=6a5710779eb02f6e53d8a4ff
- article:
  - heading "الدكتور قعري أسامة" [level=3]
  - paragraph: الحالات الاستعجالية · العلاج العام
  - paragraph: GENERAL
  - paragraph: طبيب عام للحالات الاستعجالية والعلاج الروتيني والخلع البسيط.
  - paragraph: "التوفّر: السبت–الخميس 08:00–17:00"
  - link "عرض ملف الطبيب":
    - /url: /ar/doctors/6a5710779eb02f6e53d8a500
  - link "احجز موعدًا":
    - /url: /ar/book-appointment?doctor=6a5710779eb02f6e53d8a500
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
- paragraph: رحلة المريض
- heading "رحلة المريض" [level=2]
- list:
  - listitem:
    - heading "اختيار التخصص" [level=3]
    - paragraph: حدّدوا التخصص الأقرب لسبب الزيارة.
  - listitem:
    - heading "اختيار الطبيب" [level=3]
    - paragraph: اختاروا طبيبًا عامًا منشورًا أو اتركوا التوجيه للاستقبال.
  - listitem:
    - heading "اختيار التاريخ والوقت" [level=3]
    - paragraph: اختاروا من الأوقات المتاحة فعليًا في النظام.
  - listitem:
    - heading "إرسال طلب الحجز" [level=3]
    - paragraph: أرسلوا بياناتكم وسبب الزيارة عبر النموذج.
  - listitem:
    - heading "استلام تأكيد الموعد" [level=3]
    - paragraph: يؤكّد الاستقبال الموعد النهائي ويبلغكم.
  - listitem:
    - heading "زيارة العيادة" [level=3]
    - paragraph: التسجيل عند الوصول ثم موعدكم مع الطبيب.
  - listitem:
    - heading "المتابعة بعد الزيارة" [level=3]
    - paragraph: اتبعوا التعليمات واحجزوا المتابعة عند الحاجة.
- link "احجز موعدًا":
  - /url: /ar/book-appointment
- paragraph: نتائج قبل وبعد العلاج
- heading "نتائج قبل وبعد العلاج" [level=2]
- paragraph: نماذج موثقة لحالات علاجية منشورة بعد الحصول على الموافقة اللازمة.
- paragraph: لا توجد حالات معتمدة للعرض حاليًا.
- paragraph: النتائج تختلف من حالة إلى أخرى، والصور المعروضة لأغراض توضيحية وبعد الحصول على موافقة النشر.
- paragraph: تجارب مرضانا
- heading "تجارب مرضانا" [level=2]
- paragraph: آراء وتجارب حقيقية يشاركها مرضانا بعد تلقي خدمات العيادة.
- paragraph: لا توجد تجارب معتمدة للعرض حاليًا.
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
- paragraph: الموقع والتواصل
- heading "الموقع والتواصل" [level=2]
- paragraph: يمكنك الوصول إلى عيادة الوسام بسهولة، أو التواصل معنا للاستفسار وحجز موعدك قبل الحضور.
- term: تعريف بالعيادة
- definition: عيادة الوسام لطب الأسنان
- term: عنوان العيادة
- definition: حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009
- term: رقم الهاتف
- definition:
  - link "0663 09 82 08":
    - /url: tel:+213663098208
- term: البريد الإلكتروني
- definition:
  - link "clinic.elwissam@gmail.com":
    - /url: mailto:clinic.elwissam@gmail.com
- term: تواصل عبر واتساب
- definition:
  - link "0663 09 82 08":
    - /url: https://wa.me/213663098208?text=%D9%85%D8%B1%D8%AD%D8%A8%D9%8B%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D9%88%D8%B3%D8%A7%D9%85%20%D9%84%D8%B7%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF.
- term: صفحتنا على فيسبوك
- definition:
  - link "زيارة صفحة عيادة الوسام على فيسبوك":
    - /url: https://web.facebook.com/Clinic.ElWissam
    - text: Clinic.ElWissam
- heading "ساعات العمل" [level=3]
- list:
  - listitem: من السبت إلى الخميس
  - listitem: 08:00–17:00
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
- img "موقع العيادة ومعلومات التواصل"
- heading "احجز موعدًا" [level=2]
- paragraph: من السبت إلى الخميس · 0663098208 · حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009
- link "احجز موعدًا":
  - /url: /ar/book-appointment
- link "تواصل":
  - /url: /ar/contact
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
    - listitem: "من السبت إلى الخميس 08:00–17:00 الجمعة: مغلق"
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
  57  |     await expect(page.getByRole("heading", { name: /رحلة المريض/ })).toBeVisible();
  58  |     await expect(page.locator(".journey-step")).toHaveCount(7);
  59  |     await expect(
  60  |       page.locator(".working-hours-list").getByText("الجمعة: مغلق", { exact: true }),
  61  |     ).toBeVisible();
  62  |     await expect(page.locator(".working-hours-list").getByText(/08:00/)).toBeVisible();
  63  |     const cards = page.locator(".pub-doctor-grid .pub-doctor");
  64  |     const count = await cards.count();
  65  |     expect(count).toBeLessThanOrEqual(3);
  66  |   });
  67  | 
  68  |   test("booking convenience and location contact on all locales", async ({
  69  |     page,
  70  |   }) => {
  71  |     await page.goto("/ar");
  72  |     await expect(
  73  |       page.getByRole("heading", { name: "لماذا تتعب من أجل حجز موعد؟" }),
  74  |     ).toBeVisible();
  75  |     await expect(
  76  |       page.getByRole("heading", { name: "الموقع والتواصل" }),
  77  |     ).toBeVisible();
  78  |     await expect(page.getByText(/حي الأمير عبد القادر/).first()).toBeVisible();
  79  |     await expect(page.locator('a[href="tel:+213663098208"]').first()).toBeVisible();
  80  |     await expect(page.locator(".wa-float")).toBeVisible();
  81  |     await expect(page.locator(".wa-float")).toHaveAttribute(
  82  |       "href",
  83  |       /wa\.me\/213663098208\?text=/,
  84  |     );
  85  | 
  86  |     await page.goto("/en");
  87  |     await expect(
  88  |       page.getByRole("heading", {
  89  |         name: "Why travel just to book an appointment?",
  90  |       }),
  91  |     ).toBeVisible();
  92  |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  93  |     await expect(page.locator(".wa-float")).toBeVisible();
  94  |     const enBox = await page.locator(".wa-float").boundingBox();
  95  |     expect(enBox).toBeTruthy();
  96  |     if (enBox) {
  97  |       expect(enBox.x + enBox.width).toBeGreaterThan(700);
  98  |     }
  99  | 
  100 |     await page.goto("/ar");
  101 |     const arBox = await page.locator(".wa-float").boundingBox();
  102 |     expect(arBox).toBeTruthy();
  103 |     if (arBox) {
  104 |       expect(arBox.x).toBeLessThan(80);
  105 |     }
  106 | 
  107 |     await page.goto("/fr");
  108 |     await expect(
  109 |       page.getByRole("heading", {
  110 |         name: /Pourquoi vous déplacer uniquement pour prendre rendez-vous/,
  111 |       }),
  112 |     ).toBeVisible();
  113 |     await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  114 |   });
  115 | 
  116 |   test("WhatsApp button is absent from owner dashboard shell", async ({
  117 |     page,
  118 |   }) => {
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
> 141 |     await expect(page.getByRole("heading", { name: "طب الأسنان", exact: true })).toBeVisible();
      |                                                                                  ^ Error: expect(locator).toBeVisible() failed
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
  219 |       expect(res?.ok()).toBeTruthy();
  220 |       await expect(page.locator(".public-header")).toBeVisible();
  221 |     });
  222 |   }
  223 | });
  224 | 
```