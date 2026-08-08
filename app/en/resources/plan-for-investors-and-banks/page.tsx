import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("en", "investors");

export default function Page() {
  return <ResourceArticlePage locale="en" slug="investors" />;
}
