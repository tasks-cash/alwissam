import type { Locale } from "./config";

export type Dictionary = {
  brand: string;
  brandSubtitle: string;
  homeTitle: string;
  homeLead: string;
  staffLogin: string;
  patientLogin: string;
  forgotPassword: string;
  language: string;
  staffLoginTitle: string;
  staffLoginAside: string;
  staffLoginAsideLead: string;
  emailOrPhone: string;
  password: string;
  rememberMe: string;
  signIn: string;
  signingIn: string;
  patientPortalLink: string;
  dashboardTitle: string;
  dashboardWelcome: string;
  dashboardLead: string;
  manageDoctors: string;
  manageSecretaries: string;
  logout: string;
  loading: string;
  role: string;
  permissions: string;
  status: string;
  doctorsCount: string;
  secretariesCount: string;
  openDoctors: string;
  openSecretaries: string;
  accountActive: string;
  unauthorized: string;
  connectionError: string;
  footerRights: string;
  navOwnerDashboard: string;
  navSecretaryDashboard: string;
  navDoctorDashboard: string;
  navToday: string;
  navWaiting: string;
  navPatients: string;
  navAppointments: string;
  navDoctors: string;
  navSecretaries: string;
  navPatientDashboard: string;
  navPayments: string;
  navSettings: string;
  navPatientExperiences: string;
  navBeforeAfter: string;
  navSpecialtiesAdmin: string;
  navServicesAdmin: string;
  navAuditLogs: string;
  patientsTotal: string;
  patientsToday: string;
  patientsWeek: string;
  patientsMonth: string;
  doctorsActive: string;
  doctorsUnavailable: string;
  appointmentsToday: string;
  appointmentsCompleted: string;
  appointmentsCancelled: string;
  appointmentsNoShow: string;
  waitingNow: string;
  inTreatment: string;
  recentActivity: string;
  quickActions: string;
  createPatient: string;
  createAppointment: string;
  viewWaiting: string;
  emptyState: string;
  search: string;
  fullName: string;
  phone: string;
  email: string;
  save: string;
  saving: string;
  cancel: string;
  checkIn: string;
  startConsult: string;
  complete: string;
  noShow: string;
  doctor: string;
  patient: string;
  appointmentType: string;
  startAt: string;
  notes: string;
  actions: string;
  gender: string;
  city: string;
  address: string;
  registerPatient: string;
  scheduleAppointment: string;
  refresh: string;
  secretaryDashboardLead: string;
  doctorDashboardLead: string;
  patientDashboardLead: string;
  upcomingAppointments: string;
  waitingQueue: string;
  confirmedToday: string;
  male: string;
  female: string;
  successSaved: string;
  durationMinutes: string;
  emergency: string;
};

const ar: Dictionary = {
  brand: "عيادة الوسام لطب الأسنان",
  brandSubtitle: "منصة إدارة طب الأسنان",
  homeTitle: "رعاية طبية متخصصة تبدأ من احتياجاتك",
  homeLead:
    "فريق طبي متعدد التخصصات، مواعيد منظمة، وتجربة رعاية مصممة لتوفير الراحة والثقة لكل مريض.",
  staffLogin: "دخول الطاقم",
  patientLogin: "دخول المريض",
  forgotPassword: "استعادة كلمة المرور",
  language: "اللغة",
  staffLoginTitle: "تسجيل دخول الطاقم",
  staffLoginAside: "بوابة الطاقم الطبي",
  staffLoginAsideLead: "دخول السكرتارية والأطباء وصاحبة العيادة.",
  emailOrPhone: "البريد أو الهاتف",
  password: "كلمة المرور",
  rememberMe: "تذكرني",
  signIn: "دخول",
  signingIn: "جارٍ الدخول...",
  patientPortalLink: "بوابة المريض",
  dashboardTitle: "لوحة الإدارة",
  dashboardWelcome: "مرحبًا",
  dashboardLead:
    "لوحة المالك — إحصائيات حقيقية من MongoDB وعمليات العيادة اليومية.",
  manageDoctors: "إدارة الأطباء",
  manageSecretaries: "إدارة السكرتارية",
  logout: "تسجيل الخروج",
  loading: "جارٍ التحميل...",
  role: "الدور",
  permissions: "الصلاحيات",
  status: "الحالة",
  doctorsCount: "الأطباء",
  secretariesCount: "السكرتارية",
  openDoctors: "فتح قائمة الأطباء",
  openSecretaries: "فتح قائمة السكرتارية",
  accountActive: "نشط",
  unauthorized: "يلزم تسجيل الدخول",
  connectionError: "تعذر الاتصال بالخادم حاليًا. يرجى المحاولة مرة أخرى.",
  footerRights: "© عيادة الوسام لطب الأسنان",
  navOwnerDashboard: "لوحة المالك",
  navSecretaryDashboard: "لوحة السكرتارية",
  navDoctorDashboard: "لوحة الطبيب",
  navToday: "مواعيد اليوم",
  navWaiting: "قاعة الانتظار",
  navPatients: "المرضى",
  navAppointments: "المواعيد",
  navDoctors: "الأطباء",
  navSecretaries: "السكرتارية",
  navPatientDashboard: "حسابي",
  navPayments: "المدفوعات",
  navSettings: "إعدادات العيادة",
  navPatientExperiences: "تجارب المرضى",
  navBeforeAfter: "قبل وبعد العلاج",
  navSpecialtiesAdmin: "إدارة التخصصات",
  navServicesAdmin: "إدارة الخدمات",
  navAuditLogs: "سجل التدقيق",
  patientsTotal: "إجمالي المرضى",
  patientsToday: "مرضى جدد اليوم",
  patientsWeek: "مرضى هذا الأسبوع",
  patientsMonth: "مرضى هذا الشهر",
  doctorsActive: "أطباء نشطون",
  doctorsUnavailable: "أطباء غير متاحين",
  appointmentsToday: "مواعيد اليوم",
  appointmentsCompleted: "مكتملة اليوم",
  appointmentsCancelled: "ملغاة اليوم",
  appointmentsNoShow: "عدم حضور",
  waitingNow: "في الانتظار",
  inTreatment: "قيد المعاينة",
  recentActivity: "آخر النشاطات",
  quickActions: "إجراءات سريعة",
  createPatient: "تسجيل مريض",
  createAppointment: "إنشاء موعد",
  viewWaiting: "قاعة الانتظار",
  emptyState: "لا توجد بيانات لعرضها حاليًا.",
  search: "بحث",
  fullName: "الاسم الكامل",
  phone: "الهاتف",
  email: "البريد",
  save: "حفظ",
  saving: "جارٍ الحفظ...",
  cancel: "إلغاء",
  checkIn: "تسجيل وصول",
  startConsult: "بدء المعاينة",
  complete: "إنهاء",
  noShow: "لم يحضر",
  doctor: "الطبيب",
  patient: "المريض",
  appointmentType: "نوع الموعد",
  startAt: "وقت البدء",
  notes: "ملاحظات",
  actions: "إجراءات",
  gender: "الجنس",
  city: "المدينة",
  address: "العنوان",
  registerPatient: "تسجيل مريض جديد",
  scheduleAppointment: "جدولة موعد",
  refresh: "تحديث",
  secretaryDashboardLead: "عمليات الاستقبال اليومية — مواعيد وانتظار وتسجيل.",
  doctorDashboardLead: "جدولك اليومي وقائمة الانتظار والسجلات السريرية.",
  patientDashboardLead: "مواعيدك وملفك الشخصي في العيادة.",
  upcomingAppointments: "المواعيد",
  waitingQueue: "قائمة الانتظار",
  confirmedToday: "مؤكدة اليوم",
  male: "ذكر",
  female: "أنثى",
  successSaved: "تم الحفظ بنجاح.",
  durationMinutes: "المدة (دقيقة)",
  emergency: "حالة طارئة",
};

const en: Dictionary = {
  brand: "Al Wissam Dental Clinic",
  brandSubtitle: "Dental clinic management platform",
  homeTitle: "Professional clinic platform",
  homeLead:
    "Manage appointments, staff, and patients with NestJS, MongoDB, and JWT authentication.",
  staffLogin: "Staff login",
  patientLogin: "Patient login",
  forgotPassword: "Forgot password",
  language: "Language",
  staffLoginTitle: "Staff sign in",
  staffLoginAside: "Clinical staff portal",
  staffLoginAsideLead: "Access for secretaries, doctors, and clinic owners.",
  emailOrPhone: "Email or phone",
  password: "Password",
  rememberMe: "Remember me",
  signIn: "Sign in",
  signingIn: "Signing in...",
  patientPortalLink: "Patient portal",
  dashboardTitle: "Admin dashboard",
  dashboardWelcome: "Welcome",
  dashboardLead:
    "Owner console — live MongoDB operational metrics for the clinic.",
  manageDoctors: "Manage doctors",
  manageSecretaries: "Manage secretaries",
  logout: "Log out",
  loading: "Loading...",
  role: "Role",
  permissions: "Permissions",
  status: "Status",
  doctorsCount: "Doctors",
  secretariesCount: "Secretaries",
  openDoctors: "Open doctors list",
  openSecretaries: "Open secretaries list",
  accountActive: "Active",
  unauthorized: "Authentication required",
  connectionError: "Unable to reach the server. Please try again.",
  footerRights: "© Al Wissam Dental Clinic",
  navOwnerDashboard: "Owner dashboard",
  navSecretaryDashboard: "Reception dashboard",
  navDoctorDashboard: "Doctor dashboard",
  navToday: "Today",
  navWaiting: "Waiting queue",
  navPatients: "Patients",
  navAppointments: "Appointments",
  navDoctors: "Doctors",
  navSecretaries: "Secretaries",
  navPatientDashboard: "My account",
  navPayments: "Payments",
  navSettings: "Clinic settings",
  navPatientExperiences: "Patient experiences",
  navBeforeAfter: "Before & after",
  navSpecialtiesAdmin: "Specialties",
  navServicesAdmin: "Services",
  navAuditLogs: "Audit logs",
  patientsTotal: "Active patients",
  patientsToday: "New patients today",
  patientsWeek: "New this week",
  patientsMonth: "New this month",
  doctorsActive: "Active doctors",
  doctorsUnavailable: "Unavailable doctors",
  appointmentsToday: "Appointments today",
  appointmentsCompleted: "Completed today",
  appointmentsCancelled: "Cancelled today",
  appointmentsNoShow: "No-shows",
  waitingNow: "Waiting now",
  inTreatment: "In consultation",
  recentActivity: "Recent activity",
  quickActions: "Quick actions",
  createPatient: "Register patient",
  createAppointment: "Create appointment",
  viewWaiting: "Waiting queue",
  emptyState: "Nothing to show yet.",
  search: "Search",
  fullName: "Full name",
  phone: "Phone",
  email: "Email",
  save: "Save",
  saving: "Saving...",
  cancel: "Cancel",
  checkIn: "Check in",
  startConsult: "Start consultation",
  complete: "Complete",
  noShow: "No-show",
  doctor: "Doctor",
  patient: "Patient",
  appointmentType: "Appointment type",
  startAt: "Start time",
  notes: "Notes",
  actions: "Actions",
  gender: "Gender",
  city: "City",
  address: "Address",
  registerPatient: "Register new patient",
  scheduleAppointment: "Schedule appointment",
  refresh: "Refresh",
  secretaryDashboardLead:
    "Daily reception operations — appointments, waiting, and registration.",
  doctorDashboardLead: "Your schedule, waiting queue, and clinical work.",
  patientDashboardLead: "Your appointments and clinic profile.",
  upcomingAppointments: "Appointments",
  waitingQueue: "Waiting queue",
  confirmedToday: "Confirmed today",
  male: "Male",
  female: "Female",
  successSaved: "Saved successfully.",
  durationMinutes: "Duration (min)",
  emergency: "Emergency",
};

const fr: Dictionary = {
  brand: "Clinique Dentaire El Wissam",
  brandSubtitle: "Plateforme de gestion dentaire",
  homeTitle: "Plateforme clinique professionnelle",
  homeLead:
    "Gérez rendez-vous, personnel et patients avec NestJS, MongoDB et l’authentification JWT.",
  staffLogin: "Connexion du personnel",
  patientLogin: "Connexion patient",
  forgotPassword: "Mot de passe oublié",
  language: "Langue",
  staffLoginTitle: "Connexion du personnel",
  staffLoginAside: "Portail du personnel clinique",
  staffLoginAsideLead:
    "Accès pour secrétaires, médecins et propriétaires de clinique.",
  emailOrPhone: "E-mail ou téléphone",
  password: "Mot de passe",
  rememberMe: "Se souvenir de moi",
  signIn: "Se connecter",
  signingIn: "Connexion...",
  patientPortalLink: "Portail patient",
  dashboardTitle: "Tableau de bord",
  dashboardWelcome: "Bienvenue",
  dashboardLead:
    "Console propriétaire — indicateurs opérationnels MongoDB en direct.",
  manageDoctors: "Gérer les médecins",
  manageSecretaries: "Gérer les secrétaires",
  logout: "Déconnexion",
  loading: "Chargement...",
  role: "Rôle",
  permissions: "Permissions",
  status: "Statut",
  doctorsCount: "Médecins",
  secretariesCount: "Secrétaires",
  openDoctors: "Ouvrir la liste des médecins",
  openSecretaries: "Ouvrir la liste des secrétaires",
  accountActive: "Actif",
  unauthorized: "Authentification requise",
  connectionError: "Impossible de joindre le serveur. Réessayez.",
  footerRights: "© Clinique Dentaire El Wissam",
  navOwnerDashboard: "Tableau propriétaire",
  navSecretaryDashboard: "Tableau réception",
  navDoctorDashboard: "Tableau médecin",
  navToday: "Aujourd’hui",
  navWaiting: "Salle d’attente",
  navPatients: "Patients",
  navAppointments: "Rendez-vous",
  navDoctors: "Médecins",
  navSecretaries: "Secrétaires",
  navPatientDashboard: "Mon compte",
  navPayments: "Paiements",
  navSettings: "Paramètres clinique",
  navPatientExperiences: "Expériences patients",
  navBeforeAfter: "Avant / après",
  navSpecialtiesAdmin: "Spécialités",
  navServicesAdmin: "Services",
  navAuditLogs: "Journal d’audit",
  patientsTotal: "Patients actifs",
  patientsToday: "Nouveaux aujourd’hui",
  patientsWeek: "Nouveaux cette semaine",
  patientsMonth: "Nouveaux ce mois",
  doctorsActive: "Médecins actifs",
  doctorsUnavailable: "Médecins indisponibles",
  appointmentsToday: "RDV aujourd’hui",
  appointmentsCompleted: "Terminés aujourd’hui",
  appointmentsCancelled: "Annulés aujourd’hui",
  appointmentsNoShow: "Absences",
  waitingNow: "En attente",
  inTreatment: "En consultation",
  recentActivity: "Activité récente",
  quickActions: "Actions rapides",
  createPatient: "Enregistrer un patient",
  createAppointment: "Créer un rendez-vous",
  viewWaiting: "Salle d’attente",
  emptyState: "Aucune donnée pour le moment.",
  search: "Rechercher",
  fullName: "Nom complet",
  phone: "Téléphone",
  email: "E-mail",
  save: "Enregistrer",
  saving: "Enregistrement...",
  cancel: "Annuler",
  checkIn: "Enregistrement",
  startConsult: "Démarrer",
  complete: "Terminer",
  noShow: "Absent",
  doctor: "Médecin",
  patient: "Patient",
  appointmentType: "Type de rendez-vous",
  startAt: "Heure de début",
  notes: "Notes",
  actions: "Actions",
  gender: "Genre",
  city: "Ville",
  address: "Adresse",
  registerPatient: "Nouveau patient",
  scheduleAppointment: "Planifier un rendez-vous",
  refresh: "Actualiser",
  secretaryDashboardLead:
    "Opérations de réception — rendez-vous, attente et inscriptions.",
  doctorDashboardLead: "Votre planning, salle d’attente et travail clinique.",
  patientDashboardLead: "Vos rendez-vous et votre profil clinique.",
  upcomingAppointments: "Rendez-vous",
  waitingQueue: "File d’attente",
  confirmedToday: "Confirmés aujourd’hui",
  male: "Homme",
  female: "Femme",
  successSaved: "Enregistré avec succès.",
  durationMinutes: "Durée (min)",
  emergency: "Urgence",
};

const dictionaries: Record<Locale, Dictionary> = { ar, en, fr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
