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
};

const ar: Dictionary = {
  brand: "عيادة الوسام",
  brandSubtitle: "منصة إدارة طب الأسنان",
  homeTitle: "منصة عيادات احترافية",
  homeLead:
    "إدارة المواعيد والطاقم والمرضى عبر واجهة NestJS وMongoDB مع مصادقة JWT.",
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
    "لوحة المالك الإدارية المتصلة بـ MongoDB — إدارة الأطباء والسكرتارية والصلاحيات.",
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
};

const en: Dictionary = {
  brand: "Al-Wisam Clinic",
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
    "Owner console connected to MongoDB — manage doctors, secretaries, and permissions.",
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
  footerRights: "© Al-Wisam Dental Clinic",
};

const fr: Dictionary = {
  brand: "Clinique Al-Wisam",
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
    "Console propriétaire connectée à MongoDB — médecins, secrétaires et permissions.",
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
  footerRights: "© Clinique Dentaire Al-Wisam",
};

const dictionaries: Record<Locale, Dictionary> = { ar, en, fr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
