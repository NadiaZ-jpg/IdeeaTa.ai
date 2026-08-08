import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("en", "eu-funds");

export default function Page() {
  return <ResourceArticlePage locale="en" slug="eu-funds" />;
}
