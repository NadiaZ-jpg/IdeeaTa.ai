import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("en", "budget");

export default function Page() {
  return <ResourceArticlePage locale="en" slug="budget" />;
}
