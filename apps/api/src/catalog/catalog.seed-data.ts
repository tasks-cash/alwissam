/**
 * Canonical specialty + dental service catalog (trilingual).
 * Used by idempotent seed — not imported by React components.
 */

export type CatalogSpecialtySeed = {
  slug: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionFr: string;
  icon: string;
  isFeatured: boolean;
  displayOrder: number;
  aliases?: string[];
};

export type CatalogServiceSeed = {
  slug: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionFr: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  shortDescriptionFr: string;
  specialtySlugs: string[];
  icon: string;
  isFeatured: boolean;
  displayOrder: number;
  requiresConsultation?: boolean;
  aliases?: string[];
};

export const SPECIALTY_SEEDS: CatalogSpecialtySeed[] = [
  {
    slug: "general-dentistry",
    nameAr: "طب الأسنان العام",
    nameEn: "General Dentistry",
    nameFr: "Dentisterie générale",
    descriptionAr:
      "تشخيص وعلاج مشكلات الأسنان الشائعة، والمحافظة على صحة الفم والأسنان من خلال الفحوصات والعلاجات الوقائية والترميمية.",
    descriptionEn:
      "Diagnosis and treatment of common dental problems, supporting oral health through checkups and preventive and restorative care.",
    descriptionFr:
      "Diagnostic et traitement des problèmes dentaires courants, avec examens et soins préventifs et restaurateurs.",
    icon: "tooth",
    isFeatured: true,
    displayOrder: 10,
    aliases: ["dentistry", "general", "طب الأسنان"],
  },
  {
    slug: "cosmetic-dentistry",
    nameAr: "طب الأسنان التجميلي",
    nameEn: "Cosmetic Dentistry",
    nameFr: "Dentisterie esthétique",
    descriptionAr:
      "علاجات تهدف إلى تحسين مظهر الأسنان والابتسامة مع المحافظة على صحة ووظيفة الأسنان.",
    descriptionEn:
      "Treatments aimed at improving the appearance of teeth and smile while preserving oral health and function.",
    descriptionFr:
      "Soins visant à améliorer l’apparence des dents et du sourire tout en préservant la santé et la fonction.",
    icon: "sparkle",
    isFeatured: true,
    displayOrder: 20,
  },
  {
    slug: "orthodontics",
    nameAr: "تقويم الأسنان",
    nameEn: "Orthodontics",
    nameFr: "Orthodontie",
    descriptionAr:
      "تشخيص وعلاج عدم انتظام الأسنان والفكين باستخدام أجهزة وتقنيات تقويم مناسبة لكل حالة.",
    descriptionEn:
      "Diagnosis and correction of teeth and jaw alignment using appliances suited to each case.",
    descriptionFr:
      "Diagnostic et correction des dents et des mâchoires par des appareils adaptés à chaque cas.",
    icon: "braces",
    isFeatured: true,
    displayOrder: 30,
    aliases: ["ortho", "التقويم"],
  },
  {
    slug: "periodontics",
    nameAr: "علاج اللثة",
    nameEn: "Periodontics",
    nameFr: "Parodontologie",
    descriptionAr:
      "الوقاية من أمراض اللثة وتشخيصها وعلاج الالتهابات ومشكلات الأنسجة الداعمة للأسنان.",
    descriptionEn:
      "Prevention, diagnosis, and treatment of gum disease and supporting periodontal tissues.",
    descriptionFr:
      "Prévention, diagnostic et traitement des maladies des gencives et des tissus de soutien.",
    icon: "gums",
    isFeatured: true,
    displayOrder: 40,
  },
  {
    slug: "endodontics",
    nameAr: "علاج جذور الأسنان",
    nameEn: "Endodontics",
    nameFr: "Endodontie",
    descriptionAr:
      "تشخيص وعلاج التهابات وأمراض لب الأسنان والجذور بهدف الحفاظ على السن الطبيعي قدر الإمكان.",
    descriptionEn:
      "Diagnosis and treatment of pulp and root conditions to help preserve the natural tooth when possible.",
    descriptionFr:
      "Diagnostic et traitement des affections pulpaires et radiculaires pour préserver la dent naturelle lorsque c’est possible.",
    icon: "root",
    isFeatured: true,
    displayOrder: 50,
  },
  {
    slug: "oral-surgery",
    nameAr: "جراحة الفم والأسنان",
    nameEn: "Oral Surgery",
    nameFr: "Chirurgie orale",
    descriptionAr:
      "إجراءات جراحية متخصصة لعلاج مشكلات الفم والأسنان مثل الخلع الجراحي وضروس العقل وبعض الحالات المعقدة.",
    descriptionEn:
      "Specialized surgical procedures for oral conditions including complex extractions and wisdom teeth.",
    descriptionFr:
      "Interventions chirurgicales spécialisées, notamment extractions complexes et dents de sagesse.",
    icon: "surgery",
    isFeatured: true,
    displayOrder: 60,
    aliases: ["surgery", "الجراحة"],
  },
  {
    slug: "dental-implantology",
    nameAr: "زراعة الأسنان",
    nameEn: "Dental Implantology",
    nameFr: "Implantologie dentaire",
    descriptionAr:
      "تعويض الأسنان المفقودة باستخدام غرسات سنية بعد التقييم الطبي ودراسة حالة العظام واللثة.",
    descriptionEn:
      "Replacement of missing teeth with implants after clinical assessment of bone and gum health.",
    descriptionFr:
      "Remplacement des dents manquantes par implants après évaluation osseuse et gingivale.",
    icon: "implant",
    isFeatured: false,
    displayOrder: 70,
  },
  {
    slug: "prosthodontics",
    nameAr: "تركيبات الأسنان",
    nameEn: "Prosthodontics",
    nameFr: "Prothèse dentaire",
    descriptionAr:
      "تعويض الأسنان المفقودة أو المتضررة باستخدام التيجان والجسور والأطقم والتركيبات المناسبة.",
    descriptionEn:
      "Restoration of missing or damaged teeth with crowns, bridges, dentures, and related prosthetics.",
    descriptionFr:
      "Remplacement des dents absentes ou endommagées par couronnes, bridges et prothèses adaptées.",
    icon: "crown",
    isFeatured: false,
    displayOrder: 80,
  },
  {
    slug: "pediatric-dentistry",
    nameAr: "طب أسنان الأطفال",
    nameEn: "Pediatric Dentistry",
    nameFr: "Dentisterie pédiatrique",
    descriptionAr:
      "رعاية صحة فم وأسنان الأطفال، والوقاية من التسوس وعلاج المشكلات السنية بأسلوب مناسب لأعمارهم.",
    descriptionEn:
      "Children’s oral care focused on prevention and age-appropriate dental treatment.",
    descriptionFr:
      "Soins bucco-dentaires pour enfants, prévention des caries et traitements adaptés à l’âge.",
    icon: "child",
    isFeatured: false,
    displayOrder: 90,
  },
  {
    slug: "restorative-dentistry",
    nameAr: "ترميم الأسنان",
    nameEn: "Restorative Dentistry",
    nameFr: "Dentisterie restauratrice",
    descriptionAr:
      "إصلاح الأسنان المتضررة واستعادة شكلها ووظيفتها باستخدام الحشوات والترميمات المناسبة.",
    descriptionEn:
      "Repair of damaged teeth to restore form and function with appropriate restorative materials.",
    descriptionFr:
      "Réparation des dents endommagées pour rétablir forme et fonction avec des matériaux adaptés.",
    icon: "fill",
    isFeatured: false,
    displayOrder: 100,
  },
  {
    slug: "dental-emergency",
    nameAr: "طوارئ الأسنان",
    nameEn: "Dental Emergency",
    nameFr: "Urgences dentaires",
    descriptionAr:
      "التعامل مع آلام الأسنان الحادة، والالتهابات، والكسور، والحالات السنية التي تحتاج إلى تقييم سريع.",
    descriptionEn:
      "Care for acute dental pain, inflammation, trauma, and cases needing prompt assessment.",
    descriptionFr:
      "Prise en charge des douleurs aiguës, inflammations, traumatismes et urgences dentaires.",
    icon: "alert",
    isFeatured: false,
    displayOrder: 110,
  },
];

export const SERVICE_SEEDS: CatalogServiceSeed[] = [
  {
    slug: "teeth-whitening",
    nameAr: "تبييض الأسنان",
    nameEn: "Teeth Whitening",
    nameFr: "Blanchiment dentaire",
    shortDescriptionAr: "تحسين لون الأسنان بعد تقييم مناسب.",
    shortDescriptionEn: "Improve tooth shade after a clinical assessment.",
    shortDescriptionFr: "Améliorer la teinte des dents après évaluation.",
    descriptionAr:
      "إجراء تجميلي يهدف إلى تحسين لون الأسنان بعد تقييم حالة الأسنان واللثة واختيار التقنية المناسبة.",
    descriptionEn:
      "A cosmetic procedure to improve tooth color after assessing teeth and gums and selecting a suitable technique.",
    descriptionFr:
      "Procédure esthétique visant à améliorer la couleur des dents après évaluation des dents et des gencives.",
    specialtySlugs: ["cosmetic-dentistry", "general-dentistry"],
    icon: "whitening",
    isFeatured: true,
    displayOrder: 10,
    requiresConsultation: true,
  },
  {
    slug: "dental-scaling-gum-cleaning",
    nameAr: "تنظيف الأسنان واللثة",
    nameEn: "Dental Scaling and Gum Cleaning",
    nameFr: "Détartrage et nettoyage des gencives",
    shortDescriptionAr: "إزالة الجير والترسبات حول الأسنان واللثة.",
    shortDescriptionEn: "Remove tartar and deposits around teeth and gums.",
    shortDescriptionFr: "Éliminer tartre et dépôts autour des dents et gencives.",
    descriptionAr:
      "إزالة الجير والترسبات المتراكمة حول الأسنان واللثة للمساعدة في المحافظة على صحة الفم وتقليل الالتهابات.",
    descriptionEn:
      "Removal of tartar and plaque around teeth and gums to support oral health and reduce inflammation.",
    descriptionFr:
      "Élimination du tartre et des dépôts pour soutenir la santé buccale et réduire l’inflammation.",
    specialtySlugs: ["periodontics", "general-dentistry"],
    icon: "scaling",
    isFeatured: true,
    displayOrder: 20,
    aliases: ["cleaning", "dental-cleaning"],
  },
  {
    slug: "dental-polishing",
    nameAr: "تلميع الأسنان",
    nameEn: "Dental Polishing",
    nameFr: "Polissage dentaire",
    shortDescriptionAr: "تلميع سطح الأسنان بعد التنظيف عند الحاجة.",
    shortDescriptionEn: "Polish tooth surfaces after cleaning when indicated.",
    shortDescriptionFr: "Polissage des surfaces dentaires après nettoyage si indiqué.",
    descriptionAr:
      "تلميع أسطح الأسنان للمساعدة في إزالة البقع السطحية وتحسين الشعور بنظافة الأسنان بعد التقييم.",
    descriptionEn:
      "Polishing tooth surfaces to help address surface stains and improve cleanliness after assessment.",
    descriptionFr:
      "Polissage des surfaces dentaires pour aider à réduire les taches superficielles après évaluation.",
    specialtySlugs: ["general-dentistry", "cosmetic-dentistry"],
    icon: "polish",
    isFeatured: true,
    displayOrder: 30,
  },
  {
    slug: "dental-checkup",
    nameAr: "فحص الأسنان",
    nameEn: "Dental Checkup",
    nameFr: "Examen dentaire",
    shortDescriptionAr: "فحص شامل لصحة الفم والأسنان.",
    shortDescriptionEn: "A thorough oral and dental examination.",
    shortDescriptionFr: "Examen buccal et dentaire complet.",
    descriptionAr:
      "تقييم سريري لصحة الفم والأسنان لتحديد الاحتياجات الوقائية أو العلاجية المناسبة.",
    descriptionEn:
      "Clinical assessment of oral health to identify appropriate preventive or treatment needs.",
    descriptionFr:
      "Évaluation clinique de la santé buccale pour définir les besoins préventifs ou thérapeutiques.",
    specialtySlugs: ["general-dentistry"],
    icon: "checkup",
    isFeatured: true,
    displayOrder: 40,
    aliases: ["general-exam"],
  },
  {
    slug: "dental-fillings",
    nameAr: "حشوات الأسنان",
    nameEn: "Dental Fillings",
    nameFr: "Obturations dentaires",
    shortDescriptionAr: "ترميم الأسنان المتضررة بالحشوات المناسبة.",
    shortDescriptionEn: "Restore damaged teeth with suitable fillings.",
    shortDescriptionFr: "Restaurer les dents endommagées avec des obturations adaptées.",
    descriptionAr:
      "علاج ترميمي لإصلاح الأسنان المتضررة واستعادة شكلها ووظيفتها بعد التشخيص السريري.",
    descriptionEn:
      "Restorative treatment to repair damaged teeth and restore form and function after diagnosis.",
    descriptionFr:
      "Traitement restaurateur pour réparer les dents endommagées après diagnostic.",
    specialtySlugs: ["restorative-dentistry", "general-dentistry"],
    icon: "fill",
    isFeatured: true,
    displayOrder: 50,
  },
  {
    slug: "root-canal-treatment",
    nameAr: "علاج عصب وجذور الأسنان",
    nameEn: "Root Canal Treatment",
    nameFr: "Traitement canalaire",
    shortDescriptionAr: "علاج لب السن والجذور عند الالتهاب أو العدوى.",
    shortDescriptionEn: "Treat pulp and root canals when inflamed or infected.",
    shortDescriptionFr: "Traiter la pulpe et les canaux en cas d’inflammation ou d’infection.",
    descriptionAr:
      "علاج لب الأسنان والجذور بهدف تخفيف الألم والحفاظ على السن الطبيعي قدر الإمكان بعد التقييم.",
    descriptionEn:
      "Treatment of dental pulp and canals aimed at relieving symptoms and preserving the natural tooth when possible.",
    descriptionFr:
      "Traitement de la pulpe et des canaux pour soulager les symptômes et préserver la dent naturelle si possible.",
    specialtySlugs: ["endodontics"],
    icon: "root",
    isFeatured: true,
    displayOrder: 60,
    requiresConsultation: true,
  },
  {
    slug: "tooth-extraction",
    nameAr: "خلع الأسنان",
    nameEn: "Tooth Extraction",
    nameFr: "Extraction dentaire",
    shortDescriptionAr: "خلع السن عند الحاجة وفق تقييم الطبيب.",
    shortDescriptionEn: "Tooth removal when clinically indicated.",
    shortDescriptionFr: "Extraction dentaire lorsque cliniquement indiquée.",
    descriptionAr:
      "إجراء لإزالة سنّ أو ضرس غير قابل للعلاج أو وفق خطة علاجية يحددها الطبيب بعد الفحص.",
    descriptionEn:
      "Removal of a tooth when repair is not appropriate or as part of a plan decided after examination.",
    descriptionFr:
      "Extraction d’une dent lorsque la conservation n’est pas appropriée, après examen clinique.",
    specialtySlugs: ["oral-surgery", "general-dentistry"],
    icon: "extract",
    isFeatured: true,
    displayOrder: 70,
    requiresConsultation: true,
  },
  {
    slug: "wisdom-tooth-removal",
    nameAr: "خلع ضرس العقل",
    nameEn: "Wisdom Tooth Removal",
    nameFr: "Extraction des dents de sagesse",
    shortDescriptionAr: "خلع ضروس العقل وفق التقييم الجراحي.",
    shortDescriptionEn: "Wisdom tooth removal based on surgical assessment.",
    shortDescriptionFr: "Extraction des dents de sagesse selon évaluation chirurgicale.",
    descriptionAr:
      "خلع ضرس العقل عند وجود ألم أو التهاب أو نمو غير مكتمل أو ضرورة علاجية يحددها الطبيب.",
    descriptionEn:
      "Removal of wisdom teeth when pain, inflammation, incomplete eruption, or clinical need is identified.",
    descriptionFr:
      "Extraction des dents de sagesse en cas de douleur, inflammation, éruption incomplète ou besoin clinique.",
    specialtySlugs: ["oral-surgery"],
    icon: "wisdom",
    isFeatured: false,
    displayOrder: 80,
    requiresConsultation: true,
  },
  {
    slug: "dental-implants",
    nameAr: "زراعة الأسنان",
    nameEn: "Dental Implants",
    nameFr: "Implants dentaires",
    shortDescriptionAr: "تعويض الأسنان المفقودة بغرسات سنية.",
    shortDescriptionEn: "Replace missing teeth with dental implants.",
    shortDescriptionFr: "Remplacer les dents manquantes par des implants.",
    descriptionAr:
      "تعويض الأسنان المفقودة باستخدام غرسات بعد تقييم العظام واللثة وخطة علاجية شخصية.",
    descriptionEn:
      "Replacement of missing teeth with implants after bone and gum assessment and a personalized plan.",
    descriptionFr:
      "Remplacement des dents manquantes par implants après évaluation osseuse et gingivale.",
    specialtySlugs: ["dental-implantology"],
    icon: "implant",
    isFeatured: true,
    displayOrder: 90,
    requiresConsultation: true,
  },
  {
    slug: "dental-crowns",
    nameAr: "تيجان الأسنان",
    nameEn: "Dental Crowns",
    nameFr: "Couronnes dentaires",
    shortDescriptionAr: "تاج يعيد شكل السن ووظيفته.",
    shortDescriptionEn: "A crown to restore tooth form and function.",
    shortDescriptionFr: "Couronne pour restaurer forme et fonction.",
    descriptionAr:
      "تركيب تاج سني لحماية سن متضرر أو مستعاد وظيفته بعد التقييم السريري.",
    descriptionEn:
      "Placement of a dental crown to protect or restore a damaged tooth after clinical assessment.",
    descriptionFr:
      "Pose d’une couronne pour protéger ou restaurer une dent endommagée après évaluation.",
    specialtySlugs: ["prosthodontics", "restorative-dentistry"],
    icon: "crown",
    isFeatured: true,
    displayOrder: 100,
    requiresConsultation: true,
  },
  {
    slug: "dental-bridges",
    nameAr: "جسور الأسنان",
    nameEn: "Dental Bridges",
    nameFr: "Bridges dentaires",
    shortDescriptionAr: "جسر لتعويض سنّ مفقود أو أكثر.",
    shortDescriptionEn: "A bridge to replace one or more missing teeth.",
    shortDescriptionFr: "Bridge pour remplacer une ou plusieurs dents manquantes.",
    descriptionAr:
      "تعويض فراغات الأسنان بجسر ثابت وفق تقييم الأسنان الداعمة والخطة العلاجية.",
    descriptionEn:
      "Fixed bridge replacement for missing teeth based on abutment assessment and treatment planning.",
    descriptionFr:
      "Bridge fixe pour remplacer des dents manquantes selon l’évaluation des piliers.",
    specialtySlugs: ["prosthodontics"],
    icon: "bridge",
    isFeatured: false,
    displayOrder: 110,
    requiresConsultation: true,
  },
  {
    slug: "removable-dentures",
    nameAr: "أطقم الأسنان المتحركة",
    nameEn: "Removable Dentures",
    nameFr: "Prothèses dentaires amovibles",
    shortDescriptionAr: "أطقم متحركة لتعويض الأسنان المفقودة.",
    shortDescriptionEn: "Removable prosthetics for missing teeth.",
    shortDescriptionFr: "Prothèses amovibles pour dents manquantes.",
    descriptionAr:
      "حلول تعويضية متحركة لاستعادة الوظائف والمظهر بعد تقييم الفم والخطة العلاجية.",
    descriptionEn:
      "Removable prosthetic solutions to support function and appearance after clinical planning.",
    descriptionFr:
      "Solutions prothétiques amovibles pour la fonction et l’esthétique après planification clinique.",
    specialtySlugs: ["prosthodontics"],
    icon: "denture",
    isFeatured: false,
    displayOrder: 120,
    requiresConsultation: true,
  },
  {
    slug: "dental-veneers",
    nameAr: "قشور الأسنان التجميلية",
    nameEn: "Dental Veneers",
    nameFr: "Facettes dentaires",
    shortDescriptionAr: "قشور تجميلية لتحسين مظهر الأسنان.",
    shortDescriptionEn: "Cosmetic veneers to improve tooth appearance.",
    shortDescriptionFr: "Facettes esthétiques pour améliorer l’apparence.",
    descriptionAr:
      "قشور رقيقة لتحسين مظهر الأسنان الأمامية بعد التقييم وتحديد الملاءمة السريرية.",
    descriptionEn:
      "Thin veneers to improve the appearance of front teeth after suitability assessment.",
    descriptionFr:
      "Facettes fines pour améliorer l’apparence des dents antérieures après évaluation.",
    specialtySlugs: ["cosmetic-dentistry"],
    icon: "veneer",
    isFeatured: false,
    displayOrder: 130,
    requiresConsultation: true,
  },
  {
    slug: "orthodontic-consultation",
    nameAr: "استشارة تقويم الأسنان",
    nameEn: "Orthodontic Consultation",
    nameFr: "Consultation orthodontique",
    shortDescriptionAr: "تقييم أولي لحاجة التقويم والخيارات المتاحة.",
    shortDescriptionEn: "Initial assessment of orthodontic needs and options.",
    shortDescriptionFr: "Évaluation initiale des besoins et options orthodontiques.",
    descriptionAr:
      "استشارة لتقييم اصطفاف الأسنان والفكين ومناقشة خيارات التقويم المناسبة إن وُجدت.",
    descriptionEn:
      "Consultation to assess alignment and discuss suitable orthodontic options when indicated.",
    descriptionFr:
      "Consultation pour évaluer l’alignement et discuter des options orthodontiques indiquées.",
    specialtySlugs: ["orthodontics"],
    icon: "braces",
    isFeatured: true,
    displayOrder: 140,
    aliases: ["orthodontics"],
  },
  {
    slug: "fixed-braces",
    nameAr: "تقويم الأسنان الثابت",
    nameEn: "Fixed Braces",
    nameFr: "Appareil orthodontique fixe",
    shortDescriptionAr: "تقويم ثابت وفق خطة علاجية شخصية.",
    shortDescriptionEn: "Fixed braces according to a personalized plan.",
    shortDescriptionFr: "Appareil fixe selon un plan personnalisé.",
    descriptionAr:
      "علاج تقويمي بأجهزة ثابتة لتحسين اصطفاف الأسنان وفق خطة يحددها طبيب التقويم.",
    descriptionEn:
      "Orthodontic treatment with fixed appliances to improve alignment per an orthodontist-led plan.",
    descriptionFr:
      "Traitement orthodontique par appareil fixe selon un plan personnalisé.",
    specialtySlugs: ["orthodontics"],
    icon: "braces",
    isFeatured: false,
    displayOrder: 150,
    requiresConsultation: true,
  },
  {
    slug: "clear-aligners",
    nameAr: "تقويم الأسنان الشفاف",
    nameEn: "Clear Aligners",
    nameFr: "Aligneurs transparents",
    shortDescriptionAr: "تقويم شفاف للحالات المناسبة بعد التقييم.",
    shortDescriptionEn: "Clear aligners when clinically suitable.",
    shortDescriptionFr: "Aligneurs transparents si cliniquement adaptés.",
    descriptionAr:
      "أجهزة تقويم شفافة قابلة للإزالة في الحالات المناسبة بعد تقييم الطبيب.",
    descriptionEn:
      "Removable clear aligners for suitable cases after orthodontic assessment.",
    descriptionFr:
      "Aligneurs amovibles transparents pour les cas adaptés après évaluation.",
    specialtySlugs: ["orthodontics"],
    icon: "aligner",
    isFeatured: false,
    displayOrder: 160,
    requiresConsultation: true,
  },
  {
    slug: "pediatric-dental-checkup",
    nameAr: "فحص أسنان الأطفال",
    nameEn: "Pediatric Dental Checkup",
    nameFr: "Examen dentaire pédiatrique",
    shortDescriptionAr: "فحص وقائي لأسنان الأطفال.",
    shortDescriptionEn: "Preventive dental checkup for children.",
    shortDescriptionFr: "Examen dentaire préventif pour enfants.",
    descriptionAr:
      "فحص لأسنان الأطفال مع إرشادات وقائية بأسلوب يناسب أعمارهم.",
    descriptionEn:
      "Children’s dental examination with preventive guidance suited to their age.",
    descriptionFr:
      "Examen dentaire pour enfants avec conseils préventifs adaptés à l’âge.",
    specialtySlugs: ["pediatric-dentistry"],
    icon: "child",
    isFeatured: true,
    displayOrder: 170,
  },
  {
    slug: "pediatric-dental-fillings",
    nameAr: "حشوات أسنان الأطفال",
    nameEn: "Pediatric Dental Fillings",
    nameFr: "Obturations dentaires pédiatriques",
    shortDescriptionAr: "حشوات مناسبة لأسنان الأطفال عند الحاجة.",
    shortDescriptionEn: "Age-appropriate fillings for children when needed.",
    shortDescriptionFr: "Obturations adaptées aux enfants si nécessaire.",
    descriptionAr:
      "ترميم أسنان الأطفال المتضررة بمواد وتقنيات مناسبة بعد الفحص.",
    descriptionEn:
      "Restoring children’s damaged teeth with suitable materials after examination.",
    descriptionFr:
      "Restauration des dents d’enfants avec matériaux adaptés après examen.",
    specialtySlugs: ["pediatric-dentistry"],
    icon: "fill",
    isFeatured: false,
    displayOrder: 180,
  },
  {
    slug: "fluoride-treatment",
    nameAr: "علاج الأسنان بالفلورايد",
    nameEn: "Fluoride Treatment",
    nameFr: "Traitement au fluor",
    shortDescriptionAr: "وقاية بالفلورايد عند الحاجة السريرية.",
    shortDescriptionEn: "Fluoride prevention when clinically indicated.",
    shortDescriptionFr: "Prévention au fluor lorsque cliniquement indiquée.",
    descriptionAr:
      "تطبيق فلورايد للمساعدة في تقوية الأسنان والوقاية من التسوس وفق توصية الطبيب.",
    descriptionEn:
      "Fluoride application to help strengthen teeth and prevent decay when recommended.",
    descriptionFr:
      "Application de fluor pour renforcer les dents et prévenir les caries lorsque recommandé.",
    specialtySlugs: ["pediatric-dentistry", "general-dentistry"],
    icon: "fluoride",
    isFeatured: false,
    displayOrder: 190,
  },
  {
    slug: "dental-pain-consultation",
    nameAr: "فحص آلام الأسنان",
    nameEn: "Dental Pain Consultation",
    nameFr: "Consultation pour douleur dentaire",
    shortDescriptionAr: "تقييم سريع لآلام الأسنان الحادة.",
    shortDescriptionEn: "Prompt assessment of acute dental pain.",
    shortDescriptionFr: "Évaluation rapide d’une douleur dentaire aiguë.",
    descriptionAr:
      "استشارة لتقييم آلام الأسنان وتحديد الخطوات العلاجية المناسبة بعد الفحص.",
    descriptionEn:
      "Consultation to assess dental pain and determine suitable next steps after examination.",
    descriptionFr:
      "Consultation pour évaluer une douleur dentaire et définir les prochaines étapes.",
    specialtySlugs: ["dental-emergency", "general-dentistry"],
    icon: "alert",
    isFeatured: true,
    displayOrder: 200,
  },
  {
    slug: "gum-disease-treatment",
    nameAr: "علاج أمراض اللثة",
    nameEn: "Gum Disease Treatment",
    nameFr: "Traitement des maladies des gencives",
    shortDescriptionAr: "علاج التهاب وأمراض اللثة وفق التشخيص.",
    shortDescriptionEn: "Treatment of gum disease based on diagnosis.",
    shortDescriptionFr: "Traitement des maladies gingivales selon le diagnostic.",
    descriptionAr:
      "خطة علاجية لأمراض اللثة تشمل التنظيف العميق أو المتابعة وفق حالة الأنسجة الداعمة.",
    descriptionEn:
      "A treatment plan for gum disease that may include deep cleaning or follow-up based on periodontal status.",
    descriptionFr:
      "Plan de traitement des maladies gingivales pouvant inclure un nettoyage profond selon l’état parodontal.",
    specialtySlugs: ["periodontics"],
    icon: "gums",
    isFeatured: true,
    displayOrder: 210,
    requiresConsultation: true,
  },
  {
    slug: "dental-abscess-treatment",
    nameAr: "علاج خراج الأسنان",
    nameEn: "Dental Abscess Treatment",
    nameFr: "Traitement des abcès dentaires",
    shortDescriptionAr: "تقييم وعلاج خراج الأسنان عند الحاجة.",
    shortDescriptionEn: "Assessment and care for dental abscess when needed.",
    shortDescriptionFr: "Évaluation et prise en charge d’un abcès dentaire.",
    descriptionAr:
      "تقييم حالات خراج الأسنان ووضع خطة مناسبة قد تشمل علاج الجذور أو إجراءات أخرى حسب الحالة.",
    descriptionEn:
      "Assessment of dental abscess with a plan that may include root canal therapy or other steps as indicated.",
    descriptionFr:
      "Évaluation d’un abcès dentaire avec un plan pouvant inclure un traitement canalaire ou d’autres gestes indiqués.",
    specialtySlugs: ["dental-emergency", "endodontics", "oral-surgery"],
    icon: "alert",
    isFeatured: false,
    displayOrder: 220,
    requiresConsultation: true,
  },
];
