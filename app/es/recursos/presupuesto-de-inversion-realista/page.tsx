import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("es", "budget");

export default function Page() {
  return <ResourceArticlePage locale="es" slug="budget" />;
}
