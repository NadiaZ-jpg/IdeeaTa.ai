import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("en", "faq");

export default function Page() {
  return <ResourceArticlePage locale="en" slug="faq" />;
}
