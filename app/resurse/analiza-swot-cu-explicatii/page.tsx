import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("ro", "swot");

export default function Page() {
  return <ResourceArticlePage locale="ro" slug="swot" />;
}
