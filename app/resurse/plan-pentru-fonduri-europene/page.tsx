import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("ro", "eu-funds");

export default function Page() {
  return <ResourceArticlePage locale="ro" slug="eu-funds" />;
}
