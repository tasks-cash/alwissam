import { redirect } from "next/navigation";
import { isLocale } from "../../../../lib/i18n/config";

/** Legacy staff login → unified auth login. */
export default async function StaffLoginRedirect({
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
  redirect(`/${locale}/auth/login${qs}`);
}
