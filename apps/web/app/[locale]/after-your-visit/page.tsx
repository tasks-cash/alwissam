import { ContentPage } from "../../../components/public/ContentPage";

export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ContentPage params={params} kind="after-your-visit" />;
}
