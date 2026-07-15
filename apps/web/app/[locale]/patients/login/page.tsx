import { redirect } from "next/navigation";
import { isLocale } from "../../../../lib/i18n/config";

function redirectWithQuery(
  locale: string,
  targetPath: string,
  q: Record<string, string | string[] | undefined>,
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (typeof v === "string") sp.set(k, v);
  }
  const qs = sp.toString() ? `?${sp.toString()}` : "";
  redirect(`/${locale}${targetPath}${qs}`);
}

/** Legacy plural path → unified auth login. */
export default async function PatientsLoginRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  redirectWithQuery(locale, "/auth/login", await searchParams);
}
