import { ResourceArticlePage, resourceMetadata } from "@/components/ResourcePage";

export const metadata = resourceMetadata("es", "swot");

export default function Page() {
  return <ResourceArticlePage locale="es" slug="swot" />;
}
