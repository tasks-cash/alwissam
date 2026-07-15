import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

/** Patient-facing consents page removed — keep records; redirect bookmarks to privacy. */
export default async function ConsentsRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/patient/privacy`);
}
