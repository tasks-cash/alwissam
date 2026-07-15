import { redirect } from "next/navigation";
import { isLocale } from "../../../../lib/i18n/config";

/** Invitation deep-link alias → unified register. */
export default async function AuthInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; invitation?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const q = await searchParams;
  const token = q.invitation || q.token || "";
  const qs = token ? `?invitation=${encodeURIComponent(token)}` : "";
  redirect(`/${locale}/auth/register${qs}`);
}
