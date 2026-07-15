import { redirect } from "next/navigation";
import { isLocale } from "../../../../lib/i18n/config";

/** Legacy patient register → unified auth register (preserve invitation/query). */
export default async function PatientRegisterRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const q = await searchParams;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (typeof v === "string") sp.set(k, v);
  }
  const qs = sp.toString() ? `?${sp.toString()}` : "";
  redirect(`/${locale}/auth/register${qs}`);
}
