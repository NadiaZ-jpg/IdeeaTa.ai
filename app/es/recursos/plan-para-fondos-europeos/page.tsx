import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("es", "eu-funds");

export default function Page() {
  return <ResourceArticlePage locale="es" slug="eu-funds" />;
}
