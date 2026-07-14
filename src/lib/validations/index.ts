import { z } from "zod";

export const loginSchema = z
  .object({
    email: z.string().min(3, "يرجى إدخال البريد الإلكتروني أو رقم الهاتف").optional(),
    identifier: z
      .string()
      .min(3, "يرجى إدخال البريد الإلكتروني أو رقم الهاتف")
      .optional(),
    password: z.string().min(6, "كلمة المرور قصيرة جدًا"),
    rememberMe: z.boolean().optional().default(false),
    portal: z.enum(["staff", "patient"]).optional(),
  })
  .transform((data) => {
    const email = (data.email ?? data.identifier ?? "").trim();
    return {
      email,
      password: data.password,
      rememberMe: data.rememberMe ?? false,
      portal: data.portal,
    };
  })
  .refine((data) => data.email.length >= 3, {
    message: "يرجى إدخال البريد الإلكتروني أو رقم الهاتف",
    path: ["email"],
  });

export const bookAppointmentSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  phone: z
    .string()
    .min(8, "رقم الهاتف مطلوب")
    .transform((v) => v.trim()),
  age: z.coerce.number().int().min(1).max(120).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  city: z.string().optional(),
  reason: z.string().optional().default(""),
  appointmentType: z.enum([
    "GENERAL_EXAM",
    "EMERGENCY",
    "TOOTHACHE",
    "CLEANING",
    "FILLING",
    "EXTRACTION",
    "ROOT_CANAL",
    "ORTHO_CONSULT",
    "ORTHO_FOLLOWUP",
    "PROSTHETICS",
    "SURGERY_CONSULT",
    "SURGERY",
    "POST_OP_FOLLOWUP",
    "OTHER",
  ]),
  isEmergency: z.boolean().default(false),
  preferredDoctorId: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  isPreviousPatient: z.boolean().default(false),
  hasOrthodontics: z.boolean().default(false),
  previousSurgery: z.boolean().default(false),
  additionalNotes: z.string().optional(),
  consentAccepted: z.boolean().refine((v) => v === true, {
    message: "يجب الموافقة على الشروط",
  }),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "OTHER"]),
  notes: z.string().optional(),
});

export const patientCreateSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  phone: z.string().min(8, "رقم الهاتف غير صالح"),
  email: z.string().email("البريد غير صالح").optional().or(z.literal("")),
  age: z.coerce.number().int().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});
