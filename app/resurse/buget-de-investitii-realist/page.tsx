import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("ro", "budget");

export default function Page() {
  return <ResourceArticlePage locale="ro" slug="budget" />;
}
