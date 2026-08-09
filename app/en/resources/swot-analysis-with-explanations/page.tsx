import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("en", "swot");

export default function Page() {
  return <ResourceArticlePage locale="en" slug="swot" />;
}
