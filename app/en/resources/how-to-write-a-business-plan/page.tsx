import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("en", "guide");

export default function Page() {
  return <ResourceArticlePage locale="en" slug="guide" />;
}
