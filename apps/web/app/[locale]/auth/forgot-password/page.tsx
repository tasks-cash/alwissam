import { redirect } from "next/navigation";
import { isLocale } from "../../../../lib/i18n/config";

export default async function AuthForgotPasswordRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  redirect(`/${locale}/forgot-password`);
}
