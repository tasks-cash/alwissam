import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function SupportRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/patient/help`);
}
