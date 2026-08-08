import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("ro", "guide");

export default function Page() {
  return <ResourceArticlePage locale="ro" slug="guide" />;
}
