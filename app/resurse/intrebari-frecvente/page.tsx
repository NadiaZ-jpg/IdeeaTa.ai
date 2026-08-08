import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("ro", "faq");

export default function Page() {
  return <ResourceArticlePage locale="ro" slug="faq" />;
}
